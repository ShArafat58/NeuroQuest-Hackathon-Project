import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase';

// Helper to reliably return English/Bangla numbers
const toBnNum = (num: number) => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(n => bnDigits[parseInt(n)] || n).join('');
};

export async function GET() {
  const fallbackResponse = {
    stats: { total_xp: 0, current_streak: 0, longest_streak: 0 },
    concept_breakdown: { strong: 0, developing: 0, weak: 0 },
    quests_completed: 0,
    score_trend: [],
  };

  try {
    // 1. Auth: verify the user
    const cookieStore = await cookies();
    const token = cookieStore.get('neuroquest_session')?.value;

    if (!token) {
      return NextResponse.json(fallbackResponse, { status: 200 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(fallbackResponse, { status: 200 });
    }

    const userId = decoded.userId;

    // Run queries in parallel for performance
    const [
      userRes,
      conceptsRes,
      storyCountRes,
      diagRes
    ] = await Promise.all([
      // Fetch user stats
      supabaseServer
        .from('users')
        .select('total_xp, current_streak, longest_streak')
        .eq('id', userId)
        .single(),

      // Fetch concept proficiency
      supabaseServer
        .from('concept_proficiency')
        .select('mastery_level')
        .eq('user_id', userId),

      // Fetch completed story sessions count
      supabaseServer
        .from('story_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed'),

      // Fetch diagnostic session trend
      supabaseServer
        .from('diagnostic_sessions')
        .select('overall_score, completed_at')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: true })
        .limit(10)
    ]);

    // Format User Stats
    const stats = {
      total_xp: userRes.data?.total_xp || 0,
      current_streak: userRes.data?.current_streak || 0,
      longest_streak: userRes.data?.longest_streak || 0,
    };

    // Format Concept Breakdown
    const concept_breakdown = { strong: 0, developing: 0, weak: 0 };
    if (conceptsRes.data) {
      conceptsRes.data.forEach((row) => {
        if (row.mastery_level === 'strong') concept_breakdown.strong++;
        else if (row.mastery_level === 'developing') concept_breakdown.developing++;
        else if (row.mastery_level === 'weak') concept_breakdown.weak++;
      });
    }

    // Format Quests Completed
    const quests_completed = storyCountRes.count || 0;

    // Format Score Trend
    const score_trend = (diagRes.data || []).map((session, index) => ({
      label: `কুইজ ${toBnNum(index + 1)}`,
      score: session.overall_score || 0,
      date: session.completed_at || new Date().toISOString(),
    }));

    return NextResponse.json({
      stats,
      concept_breakdown,
      quests_completed,
      score_trend
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch user progress:', error);
    // Return gracefully so the UI never crashes
    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}
