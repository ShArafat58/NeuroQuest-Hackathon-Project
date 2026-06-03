// app/api/ielts/writing-eval/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { NextRequest } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const modelsToTry = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
];

const systemPrompt = `You are an experienced IELTS Writing examiner. Assess the candidate's Task 2 essay against the four official IELTS criteria: Task Response, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy. Give each a band from 4.0 to 9.0 in 0.5 steps. The overall band is the average of the four, rounded to the nearest 0.5. Be fair but honest, like a real examiner. Respond with ONLY valid JSON, no preamble, no markdown fences, in exactly this shape:
{
  "overall_band": number,
  "criteria": [{ "name": string, "band": number, "comment": string }],
  "strengths": [string],
  "improvements": [string],
  "corrections": [{ "original": string, "suggestion": string, "reason": string }],
  "model_paragraph": string
}`;

export async function POST(req: NextRequest) {
  try {
    const { question, essay } = await req.json();
    if (!question || !essay) {
      return new Response(JSON.stringify({ error: 'Missing question or essay' }), { status: 400 });
    }

    const userPrompt = `Question: ${question}\nEssay: ${essay}`;
    let lastError: Error | null = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          // FIX: 'text' is invalid. Use 'application/json' so Gemini returns clean JSON.
          generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
        });
        const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
        let text = result.response.text();
        // Safety: strip any accidental markdown fences before parsing
        text = text.replace(/```json\s*/i, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(text);
        return new Response(JSON.stringify(parsed), { status: 200 });
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        console.error(`[writing-eval] model ${modelName} failed:`, lastError.message);
        continue;
      }
    }

    return new Response(
      JSON.stringify({ error: 'All models failed', detail: lastError?.message }),
      { status: 500 }
    );
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error('[writing-eval] server error:', err.message);
    return new Response(JSON.stringify({ error: 'Server error', detail: err.message }), { status: 500 });
  }
}