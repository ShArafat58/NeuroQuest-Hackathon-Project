import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { verifyJWTEdge } from '@/lib/jwt-edge';

export async function GET(
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

    const { data: session } = await supabaseServer
      .from('diagnostic_sessions')
      .select('*')
      .eq('id', session_id)
      .eq('user_id', payload.userId)
      .single();

    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    const { data: question } = await supabaseServer
      .from('diagnostic_questions')
      .select('*, concepts(name_bn, name_en)')
      .eq('session_id', session_id)
      .eq('question_index', session.current_question_index)
      .single();

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Don't send correct answer to client
    const { correct_answer, explanation, ...safeQuestion } = question;

    return NextResponse.json({ question: safeQuestion, session });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching question:', error.message);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
