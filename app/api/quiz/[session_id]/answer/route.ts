import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { verifyJWTEdge } from '@/lib/jwt-edge';
import { z } from 'zod';

const answerSchema = z.object({
  question_id: z.string().uuid(),
  selected_answer: z.enum(['a', 'b', 'c', 'd']),
  time_taken_seconds: z.number().min(0),
});

export async function POST(
  request: Request,
  { params }: { params: { session_id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('neuroquest_session')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyJWTEdge(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { session_id } = params;
    const body = await request.json();
    const validationResult = answerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.issues[0].message }, { status: 400 });
    }

    const { question_id, selected_answer, time_taken_seconds } = validationResult.data;

    // Verify session belongs to user
    const { data: session } = await supabaseServer
      .from('diagnostic_sessions')
      .select('*')
      .eq('id', session_id)
      .eq('user_id', payload.userId)
      .single();

    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    // Verify question
    const { data: question } = await supabaseServer
      .from('diagnostic_questions')
      .select('correct_answer, question_index')
      .eq('id', question_id)
      .eq('session_id', session_id)
      .single();

    if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

    const is_correct = question.correct_answer === selected_answer;

    // Save answer
    await supabaseServer
      .from('diagnostic_answers')
      .insert({
        question_id,
        session_id,
        selected_answer,
        is_correct,
        time_taken_seconds
      });

    const nextIndex = session.current_question_index + 1;
    const isComplete = nextIndex >= session.total_questions;

    // Update session
    await supabaseServer
      .from('diagnostic_sessions')
      .update({ 
        current_question_index: nextIndex,
        correct_count: session.correct_count + (is_correct ? 1 : 0)
      })
      .eq('id', session_id);

    return NextResponse.json({ 
      is_correct, 
      is_complete: isComplete,
      next_question: !isComplete
    });

  } catch (error: unknown) {
    if (error instanceof Error) console.error('Answer submission error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
