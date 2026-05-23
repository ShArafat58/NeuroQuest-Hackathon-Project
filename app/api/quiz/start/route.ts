import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { verifyJWTEdge } from '@/lib/jwt-edge';
import { z } from 'zod';
import { generateDiagnosticQuestions } from '@/lib/agents/diagnostic-agent';

const startQuizSchema = z.object({
  chapter_id: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('neuroquest_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWTEdge(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = startQuizSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { chapter_id } = validationResult.data;

    // Get user version
    const { data: user } = await supabaseServer
      .from('users')
      .select('version')
      .eq('id', payload.userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const version = user.version as 'bangla' | 'english';

    // Create session
    const { data: session, error: sessionError } = await supabaseServer
      .from('diagnostic_sessions')
      .insert({
        user_id: payload.userId,
        chapter_id,
        version,
        status: 'active',
        total_questions: 6,
      })
      .select()
      .single();

    if (sessionError || !session) {
      console.error(sessionError);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    // Generate questions
    try {
      const generatedQuestions = await generateDiagnosticQuestions(chapter_id, version);
      
      const questionsToInsert = generatedQuestions.map((q, index) => ({
        session_id: session.id,
        concept_id: q.concept_id,
        question_index: index,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        difficulty: q.difficulty,
      }));

      const { error: insertError } = await supabaseServer
        .from('diagnostic_questions')
        .insert(questionsToInsert);

      if (insertError) {
        console.error('Error inserting questions:', insertError);
        return NextResponse.json({ error: 'Failed to save questions' }, { status: 500 });
      }

    } catch (genError) {
      console.error('Error generating questions:', genError);
      return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
    }

    return NextResponse.json({ session_id: session.id });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Quiz start error:', error.message);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
