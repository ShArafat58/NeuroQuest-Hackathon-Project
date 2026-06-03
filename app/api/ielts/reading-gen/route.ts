// app/api/ielts/reading-gen/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic'; // always generate a fresh passage

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const modelsToTry = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
];

const systemPrompt = `You are an IELTS Reading content writer. Write ONE original academic-style reading passage of about 250-280 words on a randomly chosen topic (science, environment, history, technology, or society). Then write 6 questions about it: exactly 3 of type 'tfng' (answer is one of 'True','False','Not Given') and exactly 3 of type 'mcq' (four options, one correct). Respond with ONLY valid JSON, no preamble, no markdown fences, in exactly this shape:
{
  "title": string,
  "passage": string,
  "questions": [
    { "type": "tfng", "question": string, "answer": "True" | "False" | "Not Given", "explanation": string, "skill": string },
    { "type": "mcq", "question": string, "options": [string, string, string, string], "answer": string, "explanation": string, "skill": string }
  ]
}
For mcq, "answer" must exactly match one of the options. "skill" = the sub-skill tested (e.g. 'main idea','detail','inference','vocabulary in context').`;

export async function GET() {
  let lastError: Error | null = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json', temperature: 0.9 },
      });
      const result = await model.generateContent(systemPrompt);
      let text = result.response.text();
      text = text.replace(/```json\s*/i, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      return new Response(JSON.stringify(parsed), { status: 200 });
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      console.error(`[reading-gen] model ${modelName} failed:`, lastError.message);
      continue;
    }
  }

  return new Response(
    JSON.stringify({ error: 'All models failed', detail: lastError?.message }),
    { status: 500 }
  );
}