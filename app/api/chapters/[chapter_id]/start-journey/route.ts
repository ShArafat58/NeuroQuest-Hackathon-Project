import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { verifyJWTEdge } from '@/lib/jwt-edge';

export async function POST(
  request: Request,
  { params }: { params: { chapter_id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('neuroquest_session')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyJWTEdge(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { chapter_id } = params;

    // Check if there is an active session WITH questions
    const { data: activeSession } = await supabaseServer
      .from('diagnostic_sessions')
      .select('id')
      .eq('user_id', payload.userId)
      .eq('chapter_id', chapter_id)
      .eq('status', 'active')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeSession) {
      // Verify questions actually exist for this session
      const { count: questionCount } = await supabaseServer
        .from('diagnostic_questions')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', activeSession.id);

      if (questionCount && questionCount > 0) {
        // Valid session with questions - resume
        console.log(`[start-journey] Resuming session ${activeSession.id} with ${questionCount} questions`);
        return NextResponse.json({ session_id: activeSession.id, status: 'resume' });
      } else {
        // Broken session - mark as abandoned and create new
        console.log(`[start-journey] Found broken session ${activeSession.id} with 0 questions, abandoning it`);
        await supabaseServer
          .from('diagnostic_sessions')
          .update({ status: 'abandoned' })
          .eq('id', activeSession.id);
      }
    }

    console.log(`[start-journey] Creating new session for chapter ${chapter_id}`);

    // Call start API internally to create fresh session
    const startRes = await fetch(new URL('/api/quiz/start', request.url).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `neuroquest_session=${token}`
      },
      body: JSON.stringify({ chapter_id })
    });

    if (!startRes.ok) {
      const err = await startRes.json();
      console.error('[start-journey] /api/quiz/start failed:', err);
      return NextResponse.json(err, { status: startRes.status });
    }

    const { session_id } = await startRes.json();
    console.log(`[start-journey] New session created: ${session_id}`);
    return NextResponse.json({ session_id, status: 'new' });

  } catch (error: unknown) {
    if (error instanceof Error) console.error('Start journey error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}