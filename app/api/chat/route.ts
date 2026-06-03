import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const modelsToTry = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
];

export async function POST(request: Request) {
  try {
    // 1. Auth: verify the user via the existing JWT/cookie pattern
    const cookieStore = await cookies();
    const token = cookieStore.get('neuroquest_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decoded.userId;

    // 2. Input body
    const body = await request.json();
    const messages = body.messages || [];
    const language = body.language || 'bn';

    // 3. Context injection — fetch the user's WEAK concepts
    const { data: weakProficiencies } = await supabaseServer
      .from('concept_proficiency')
      .select('concept_id, concepts:concept_id(name_bn, name_en)')
      .eq('user_id', userId)
      .eq('mastery_level', 'weak')
      .limit(5);

    let weakConceptsContext = "The student has no flagged weak concepts yet.";
    if (weakProficiencies && weakProficiencies.length > 0) {
      const names = weakProficiencies
        .map(p => {
          const c = Array.isArray(p.concepts) ? p.concepts[0] : p.concepts;
          return c ? `${c.name_bn} (${c.name_en})` : '';
        })
        .filter(n => n.trim() !== '')
        .join(', ');
      
      if (names.length > 0) {
        weakConceptsContext = `এই ছাত্রের দুর্বল কনসেপ্ট: ${names}`;
      }
    }

    // 4. System prompt
    const systemInstruction = `You are NeuroQuest-এর AI study assistant — a friendly tutor for Bangladeshi SSC/HSC science students, fully aligned to the NCTB curriculum.
Bilingual: reply in Bangla if the user writes in Bangla, English if English. Match the user's language.

Site awareness — you know the platform layout and can guide users where to go:
- Dashboard = home, shows streak/XP/rank.
- "বিষয় নির্বাচন করুন" / Select Subject -> pick a subject, then a chapter.
- Diagnostic Quiz = AI-generated 6-question test that maps weak/strong concepts.
- Story Quest = learn concepts through interactive Bangladeshi narrative scenes.
- Retention Tracker = (coming soon) spaced revision.
- Settings = change class (SSC/HSC/IELTS/Medical) and NCTB version (Bangla/English).
If a user can't find something, guide them to the right page.

Use the student's weak-concept context to personalize: gently suggest they focus there.
CONTEXT: ${weakConceptsContext}

HARD GUARDRAIL: You must NEVER reveal the direct answer to a diagnostic quiz question or a story-quest choice. If a student asks "which option is correct" or pastes a quiz question asking for the answer, DO NOT give the letter/answer. Instead, explain the underlying concept and guide them to reason it out themselves. You teach understanding, not answers.
Keep replies concise and encouraging.`;

    // 5. Call Gemini with the system prompt + conversation history
    // Reformat messages for Gemini
    let geminiHistory = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // TRIM leading "model" turns to ensure it starts with a "user" turn
    while (geminiHistory.length > 0 && geminiHistory[0].role === 'model') {
      geminiHistory.shift();
    }

    if (geminiHistory.length === 0) {
      return NextResponse.json({ reply: "আপনার প্রশ্নটি লিখুন, আমি সাহায্য করার জন্য প্রস্তুত!" });
    }

    let lastError: Error | null = null;
    let replyText = "";

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction,
          generationConfig: {
            temperature: 0.7,
          },
        });

        // Start chat with history excluding the last message
        const chatHistory = geminiHistory.slice(0, -1);
        const lastMessage = geminiHistory[geminiHistory.length - 1];

        const chat = model.startChat({
          history: chatHistory
        });

        const result = await chat.sendMessage(lastMessage.parts[0].text);
        replyText = result.response.text();
        break; // Success, exit loop
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.error(`[chat-route] Model ${modelName} failed: ${lastError.message}`);
        continue;
      }
    }

    if (!replyText) {
      throw new Error(`All Gemini models failed. Last error: ${lastError?.message}`);
    }

    // 6. Return JSON
    return NextResponse.json({ reply: replyText });

  } catch (error) {
    console.error('Chat API Error:', error);
    // Return graceful fallback so the UI never crashes
    return NextResponse.json({ 
      reply: "দুঃখিত, এই মুহূর্তে উত্তর দিতে পারছি না। একটু পরে চেষ্টা করুন।" 
    }, { status: 200 });
  }
}
