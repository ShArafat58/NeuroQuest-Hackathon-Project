import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { verifyJWTEdge } from '@/lib/jwt-edge';
import { computeProficiency } from '@/lib/agents/diagnostic-agent';

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

    // Verify session
    const { data: session } = await supabaseServer
      .from('diagnostic_sessions')
      .select('*')
      .eq('id', session_id)
      .eq('user_id', payload.userId)
      .single();

    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    if (session.status === 'completed') {
      return NextResponse.json({ error: 'Session already completed' }, { status: 400 });
    }

    // Compute proficiency
    const { overall_score, concept_scores, insight } = await computeProficiency(session_id, payload.userId);

    // Update session
    await supabaseServer
      .from('diagnostic_sessions')
      .update({
        status: 'completed',
        overall_score,
        ai_insight: insight,
        completed_at: new Date().toISOString()
      })
      .eq('id', session_id);

    // --- XP LOGIC ---
    try {
      const { awardXp } = require('@/lib/xp');
      
      // We need to know how many correct answers there were. We can count from diagnostic_answers.
      const { data: answers } = await supabaseServer
        .from('diagnostic_answers')
        .select('is_correct')
        .eq('session_id', session_id)
        .eq('is_correct', true);
        
      const correctAnswersCount = answers ? answers.length : 0;
      const totalXpEarned = 30 + (correctAnswersCount * 10);
      
      await awardXp(payload.userId, totalXpEarned);
    } catch (xpError) {
      console.error('Failed to award XP for quiz completion:', xpError);
    }
    // ----------------

    return NextResponse.json({ overall_score, concept_scores, insight });

  } catch (error: unknown) {
    if (error instanceof Error) console.error('Quiz complete error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
