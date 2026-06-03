// app/api/ielts/listening-gen/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic'; // always generate a fresh recording

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const modelsToTry = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-001',
    'gemini-flash-latest',
    'gemini-2.5-flash',
    'gemini-2.0-flash-lite',
];

const systemPrompt = `You are an IELTS Listening content writer. Write ONE original spoken-style transcript of about 160-200 words — like a short talk, announcement, lecture excerpt, or guided tour that a person would actually say aloud (natural spoken English, presenter or first-person style). Then write 6 questions about it: exactly 3 of type 'tfng' (answer is one of 'True','False','Not Given') and exactly 3 of type 'mcq' (four options, one correct). Respond with ONLY valid JSON, no preamble, no markdown fences, in exactly this shape:
{
  "title": string,
  "passage": string,
  "questions": [
    { "type": "tfng", "question": string, "answer": "True" | "False" | "Not Given", "explanation": string, "skill": string },
    { "type": "mcq", "question": string, "options": [string, string, string, string], "answer": string, "explanation": string, "skill": string }
  ]
}
"title" = a short neutral label (e.g. "Library Induction Talk") that does NOT reveal answers. "passage" = the spoken transcript to be read aloud. For mcq, "answer" must exactly match one option. "skill" = the sub-skill tested (e.g. 'specific detail','gist/main idea','inference','number/name').`;

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
            console.error(`[listening-gen] model ${modelName} failed:`, lastError.message);
            continue;
        }
    }

    return new Response(
        JSON.stringify({ error: 'All models failed', detail: lastError?.message }),
        { status: 500 }
    );
}