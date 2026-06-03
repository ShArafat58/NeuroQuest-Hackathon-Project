// app/api/medical/case-gen/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic'; // always generate a fresh case

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const modelsToTry = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-001',
    'gemini-flash-latest',
    'gemini-2.5-flash',
    'gemini-2.0-flash-lite',
];

const systemPrompt = `You are a medical educator creating an ORIGINAL clinical case for an undergraduate (MBBS) medical student studying "Metabolic response to injury" (Surgery, Basic Principles). Do NOT copy any textbook; generate original content.

Create one original clinical case of a trauma or major-surgery patient set in a Bangladeshi hospital context (e.g. Dhaka Medical College, Chittagong Medical College). Follow the patient through the phases of the metabolic response to injury over time. Write 6 multiple-choice questions; each presents a SHORT clinical snippet advancing the case in time and tests the student's APPLICATION of ONE of these concepts:
- Ebb phase (early catabolic/shock): hypovolaemia, decreased basal metabolic rate, reduced cardiac output, hypothermia, lactic acidosis; conserves volume and energy
- Flow phase (hypermetabolic / SIRS): hypermetabolism, raised cardiac output, pyrexia, leukocytosis, increased gluconeogenesis, oedema
- Neuroendocrine response: CRF to ACTH to cortisol, catecholamines (adrenaline), glucagon — the counter-regulatory hormones
- Inflammatory mediators: DAMPs, pro-inflammatory cytokines (IL-1, IL-6, TNF-alpha), SIRS, and the counter anti-inflammatory response (CARS)
- Catabolism and body composition: skeletal muscle protein breakdown, urinary nitrogen loss, insulin resistance, hyperglycaemia, acute-phase proteins (CRP rises, albumin falls)
- Minimising the response: avoidable factors (hypothermia, uncontrolled pain, starvation, immobility) and ERAS principles

Each question has 4 options (A-D), exactly one correct. Respond with ONLY valid JSON, no preamble, no markdown fences, exactly:
{
  "title": string,
  "patient": string,
  "questions": [
    { "phase": string, "scenario": string, "question": string, "options": [string, string, string, string], "answer": string, "explanation": string, "concept": string }
  ],
  "key_points": [string, string, string, string]
}
"patient" = 1-2 sentence patient introduction. "scenario" = 1-2 sentence clinical snippet advancing the case in time. "answer" must exactly match one of the options. "explanation" links the concept to THIS patient's situation. "concept" = which concept from the list above. "key_points" = 4 concise take-home facts to remember.`;

export async function GET() {
    let lastError: Error | null = null;

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: { responseMimeType: 'application/json', temperature: 0.85 },
            });
            const result = await model.generateContent(systemPrompt);
            let text = result.response.text();
            text = text.replace(/```json\s*/i, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(text);
            return new Response(JSON.stringify(parsed), { status: 200 });
        } catch (e) {
            lastError = e instanceof Error ? e : new Error(String(e));
            console.error(`[medical case-gen] model ${modelName} failed:`, lastError.message);
            continue;
        }
    }

    return new Response(
        JSON.stringify({ error: 'All models failed', detail: lastError?.message }),
        { status: 500 }
    );
}