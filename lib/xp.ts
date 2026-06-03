import { supabaseServer } from './supabase';

export async function awardXp(userId: string, amount: number) {
  try {
    // We can use an RPC call if we have one, but if not we must read and write, 
    // or just execute a direct update if possible. Since we don't have an RPC
    // defined in the prompt, let's do a select and then update, or see if 
    // Supabase allows incrementing directly. Wait, we can just do:
    const { data: user } = await supabaseServer
      .from('users')
      .select('total_xp')
      .eq('id', userId)
      .single();
      
    if (user) {
      await supabaseServer
        .from('users')
        .update({ total_xp: (user.total_xp || 0) + amount })
        .eq('id', userId);
    }
  } catch (error) {
    console.error('Failed to award XP:', error);
  }
}

export async function updateStreakAndDailyBonus(userId: string) {
  try {
    const { data: user } = await supabaseServer
      .from('users')
      .select('total_xp, current_streak, longest_streak, last_active_date')
      .eq('id', userId)
      .single();

    if (!user) return null;

    let { total_xp, current_streak, longest_streak, last_active_date } = user;
    total_xp = total_xp || 0;
    current_streak = current_streak || 0;
    longest_streak = longest_streak || 0;

    // Compute today's date in YYYY-MM-DD (server date)
    const now = new Date();
    // Use ISO string to get standard YYYY-MM-DD
    const todayStr = now.toISOString().split('T')[0];
    
    if (last_active_date === todayStr) {
      // Already active today, no streak change or bonus
      return { total_xp, current_streak, longest_streak };
    }

    // Determine the gap
    let newStreak = current_streak;
    if (!last_active_date) {
      newStreak = 1;
    } else {
      const lastDate = new Date(last_active_date);
      const diffTime = Math.abs(now.getTime() - lastDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // We also should rely on the actual calendar days difference
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (last_active_date === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    const newLongestStreak = Math.max(longest_streak, newStreak);
    const newTotalXp = total_xp + 10; // +10 daily bonus

    // Update DB
    await supabaseServer
      .from('users')
      .update({
        last_active_date: todayStr,
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        total_xp: newTotalXp
      })
      .eq('id', userId);

    return {
      total_xp: newTotalXp,
      current_streak: newStreak,
      longest_streak: newLongestStreak
    };
  } catch (error) {
    console.error('Failed to update streak and daily bonus:', error);
    return null;
  }
}
