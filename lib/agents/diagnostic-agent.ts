import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseServer } from '@/lib/supabase';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface GeneratedQuestion {
  concept_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'a' | 'b' | 'c' | 'd';
  explanation: string;
  difficulty: number;
}

export async function generateDiagnosticQuestions(
  chapterId: string,
  version: 'bangla' | 'english'
): Promise<GeneratedQuestion[]> {
  console.log(`[diagnostic-agent] Starting generation for chapter ${chapterId}, version ${version}`);

  const { data: chapter } = await supabaseServer
    .from('chapters')
    .select('*, subjects(*)')
    .eq('id', chapterId)
    .single();

  const { data: concepts } = await supabaseServer
    .from('concepts')
    .select('*')
    .eq('chapter_id', chapterId)
    .order('display_order');

  if (!chapter || !concepts || concepts.length === 0) {
    throw new Error('Chapter or concepts not found');
  }

  console.log(`[diagnostic-agent] Found ${concepts.length} concepts for chapter`);

  const conceptsContext = concepts.map((c, i) =>
    `${i + 1}. Concept ID: ${c.id}
   Name (BN): ${c.name_bn}
   Name (EN): ${c.name_en}
   Description (BN): ${c.description_bn}
   Description (EN): ${c.description_en}`
  ).join('\n\n');

   const langInstruction = version === 'bangla'
     ? 'Generate questions in pure Bangla. Use Bangla numerals (০-৯) in answer options, but not in question framing. Focus on Bangladeshi context for subject matter, not scenario-based questions.'
     : 'Generate questions in clear English. Focus on Bangladeshi context for subject matter, not scenario-based questions.';

   const prompt = `You are an expert NCTB curriculum-aware educator for Bangladesh Class 9-10 (SSC) students.

CHAPTER: ${chapter.title_en} (${chapter.title_bn})
SUBJECT: ${chapter.subjects.title_en}
VERSION: ${version}

CONCEPTS TO TEST (you MUST cover at least 5 of these):
${conceptsContext}

YOUR TASK:
Generate EXACTLY 6 multiple-choice questions for a diagnostic assessment.
- Each question must be ONE SHORT LINE (under 15 words).
- Focus on FACTUAL recall, definitions, formulas, or unit-based questions.
- AVOID scenarios, character names, or village context.
- Mix question types: 2x Definition, 2x Formula/Unit, 1x True/False or Identification, 1x Direct calculation (very simple).
- ${langInstruction}
- Each question links to ONE concept (use the Concept ID)
- 2 easy (difficulty 1-2), 2 medium (3), 2 hard (4-5)
- 4 options (a, b, c, d), only ONE correct
- Include brief explanation (1-2 sentences)
- Make distractors plausible (not obviously wrong)

OUTPUT FORMAT (strict JSON, no markdown, no extra text):
{
  "questions": [
    {
      "concept_id": "uuid-here",
      "question_text": "...",
      "option_a": "...",
      "option_b": "...",
      "option_c": "...",
      "option_d": "...",
      "correct_answer": "a",
      "explanation": "...",
      "difficulty": 2
    }
  ]
}`;

  // Models confirmed available in your API key
  const modelsToTry = [
    'gemini-2.0-flash',           // Fast, reliable, primary choice
    'gemini-2.0-flash-001',       // Stable version
    'gemini-flash-latest',        // Latest flash variant
    'gemini-2.5-flash',           // Backup (might be overloaded)
    'gemini-2.0-flash-lite',      // Lite version, fastest
  ];

  let lastError: Error | null = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[diagnostic-agent] Trying model: ${modelName}`);

      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      console.log(`[diagnostic-agent] Got response from ${modelName}, length: ${responseText.length}`);

      const parsed = JSON.parse(responseText);

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid AI response format');
      }

      if (parsed.questions.length === 0) {
        throw new Error('AI returned 0 questions');
      }

      console.log(`[diagnostic-agent] SUCCESS with ${modelName}: ${parsed.questions.length} questions`);
      return parsed.questions;

    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.log(`[diagnostic-agent] Model ${modelName} failed: ${lastError.message}`);
      continue;
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError?.message}`);
}

export async function computeProficiency(
  sessionId: string,
  userId: string
): Promise<{ overall_score: number; concept_scores: Record<string, number>; insight: string }> {
  const { data: questions } = await supabaseServer
    .from('diagnostic_questions')
    .select('id, concept_id, correct_answer')
    .eq('session_id', sessionId);

  const { data: answers } = await supabaseServer
    .from('diagnostic_answers')
    .select('question_id, selected_answer, is_correct')
    .eq('session_id', sessionId);

  if (!questions || !answers) {
    throw new Error('Session data not found');
  }

  const conceptScores: Record<string, { correct: number; total: number }> = {};

  for (const q of questions) {
    if (!q.concept_id) continue;
    if (!conceptScores[q.concept_id]) {
      conceptScores[q.concept_id] = { correct: 0, total: 0 };
    }
    conceptScores[q.concept_id].total++;

    const ans = answers.find(a => a.question_id === q.id);
    if (ans?.is_correct) {
      conceptScores[q.concept_id].correct++;
    }
  }

  const conceptPercentages: Record<string, number> = {};
  let totalCorrect = 0;
  let totalQuestions = 0;

  for (const [conceptId, scores] of Object.entries(conceptScores)) {
    const pct = scores.total > 0 ? Math.round((scores.correct / scores.total) * 100) : 0;
    conceptPercentages[conceptId] = pct;
    totalCorrect += scores.correct;
    totalQuestions += scores.total;

    const masteryLevel = pct < 40 ? 'weak' : pct < 70 ? 'developing' : 'strong';

    await supabaseServer
      .from('concept_proficiency')
      .upsert({
        user_id: userId,
        concept_id: conceptId,
        diagnostic_session_id: sessionId,
        proficiency_score: pct,
        mastery_level: masteryLevel,
        last_assessed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,concept_id' });
  }

  const overallScore = totalQuestions > 0
    ? Math.round((totalCorrect / totalQuestions) * 100)
    : 0;

  let insight = '';
  if (overallScore >= 70) {
    insight = 'Excellent grasp! Your story quest will reinforce mastery.';
  } else if (overallScore >= 40) {
    insight = 'Good foundation. The story will strengthen weaker areas.';
  } else {
    insight = 'Strong opportunity to learn. Story will build core understanding.';
  }

  return {
    overall_score: overallScore,
    concept_scores: conceptPercentages,
    insight,
  };
}