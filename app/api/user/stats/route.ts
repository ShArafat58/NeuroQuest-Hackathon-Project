import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import { updateStreakAndDailyBonus } from '@/lib/xp';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('neuroquest_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify and decode the JWT session token
    const decoded = await verifyJWT(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decoded.userId;

    // Call updateStreakAndDailyBonus to handle daily login bonus and return stats
    const stats = await updateStreakAndDailyBonus(userId);

    if (!stats) {
      return NextResponse.json({ error: 'User not found or failed to update stats' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      total_xp: stats.total_xp,
      current_streak: stats.current_streak,
      longest_streak: stats.longest_streak,
    });
  } catch (error) {
    console.error('Unexpected error in /api/user/stats endpoint:', error);
    return NextResponse.json(
      { error: 'An unexpected system error occurred' },
      { status: 500 }
    );
  }
}
