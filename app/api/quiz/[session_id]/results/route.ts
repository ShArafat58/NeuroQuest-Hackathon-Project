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

    // Get session with chapter info
    const { data: session } = await supabaseServer
      .from('diagnostic_sessions')
      .select('*, chapters(id, title_bn, title_en)')
      .eq('id', session_id)
      .eq('user_id', payload.userId)
      .single();

    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    // Get proficiencies for this session
    const { data: proficiencies } = await supabaseServer
      .from('concept_proficiency')
      .select('proficiency_score, mastery_level, concepts(id, name_bn, name_en)')
      .eq('diagnostic_session_id', session_id)
      .eq('user_id', payload.userId);

    return NextResponse.json({ 
      session, 
      proficiencies 
    });

  } catch (error: unknown) {
    if (error instanceof Error) console.error('Results fetch error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
