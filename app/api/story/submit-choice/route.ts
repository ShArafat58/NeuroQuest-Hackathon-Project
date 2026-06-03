import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { verifyJWTEdge } from '@/lib/jwt-edge';
import { z } from 'zod';

// Zod Schema for validation
// ইনপুট ভ্যালিডেশন স্কিমা
const submitChoiceSchema = z.object({
  session_id: z.string().uuid({
    message: 'Invalid session ID format / সেশন আইডি ফরম্যাট অবৈধ',
  }),
  scene_id: z.string().uuid({
    message: 'Invalid scene ID format / দৃশ্যপট আইডি ফরম্যাট অবৈধ',
  }),
  selected_option: z.enum(['a', 'b', 'c'], {
    message: 'Option must be a, b, or c / অপশনটি অবশ্যই a, b, অথবা c হতে হবে',
  }),
});

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    // ১. ইউজার অথেন্টিকেশন
    const cookieStore = await cookies();
    const token = cookieStore.get('neuroquest_session')?.value;

    if (!token) {
      return NextResponse.json(
        {
          error: 'অননুমোদিত অ্যাক্সেস',
          error_en: 'Unauthorized access',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    const payload = await verifyJWTEdge(token);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        {
          error: 'অবৈধ সেশন টোকেন',
          error_en: 'Invalid session token',
          code: 'INVALID_TOKEN',
        },
        { status: 401 }
      );
    }

    // 2. Validate request body
    // ২. ইনপুট ভ্যালিডেশন
    const body = await request.json();
    const validationResult = submitChoiceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: validationResult.error.issues[0].message,
          error_en: validationResult.error.issues[0].message,
          code: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    const { session_id, scene_id, selected_option } = validationResult.data;

    // 3. Fetch session to verify ownership & status === 'active'
    // ৩. সেশনটির মালিকানা এবং সেশনটি সক্রিয় (active) কিনা তা যাচাই করা
    const { data: session, error: sessionError } = await supabaseServer
      .from('story_sessions')
      .select('*')
      .eq('id', session_id)
      .eq('user_id', payload.userId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        {
          error: 'সেশনটি খুঁজে পাওয়া যায়নি',
          error_en: 'Session not found',
          code: 'SESSION_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    if (session.status !== 'active') {
      return NextResponse.json(
        {
          error: 'সেশনটি আর সক্রিয় নেই',
          error_en: 'Session is no longer active',
          code: 'SESSION_INACTIVE',
        },
        { status: 400 }
      );
    }

    // 4. Fetch the scene to verify correct option, explanation, index and chapter
    // ৪. দৃশ্যপট থেকে সঠিক অপশন, ব্যাখ্যা ও অধ্যায়ের মিল যাচাই করা
    const { data: scene, error: sceneError } = await supabaseServer
      .from('story_scenes')
      .select('*')
      .eq('id', scene_id)
      .eq('chapter_id', session.chapter_id)
      .single();

    if (sceneError || !scene) {
      return NextResponse.json(
        {
          error: 'দৃশ্যপট খুঁজে পাওয়া যায়নি',
          error_en: 'Scene not found',
          code: 'SCENE_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // 5. Compute if selected answer is correct
    // ৫. উত্তর সঠিক হয়েছে কিনা তা নির্ধারণ করা
    const is_correct = selected_option === scene.correct_option;

    // 6. Save response into story_progress (conforming to the real 003 schema using completed_at)
    // ৬. রিয়েল 003 স্কিমা অনুযায়ী প্রোগ্রেস সেভ করা (এখানে completed_at ব্যবহৃত হবে)
    const { error: progressError } = await supabaseServer
      .from('story_progress')
      .insert({
        session_id,
        scene_id,
        selected_option,
        is_correct,
        completed_at: new Date().toISOString(),
      });

    if (progressError) {
      console.error('Failed to log story progress:', progressError.message);
      return NextResponse.json(
        {
          error: 'প্রোগ্রেস সংরক্ষণ করতে ব্যর্থ হয়েছে',
          error_en: 'Failed to log progress',
          code: 'DATABASE_ERROR',
        },
        { status: 500 }
      );
    }

    // 7. Session state transition
    // ৭. সেশন স্টেইট পরিবর্তন করা
    const isSessionComplete = scene.scene_index === 5;
    const nextSceneIndex = isSessionComplete ? null : scene.scene_index + 1;

    let updateData: Record<string, unknown> = {
      scenes_completed: (session.scenes_completed || 0) + 1,
      correct_choices: (session.correct_choices || 0) + (is_correct ? 1 : 0),
    };

    if (isSessionComplete) {
      // If completed: mark status, fill completed_at timestamp
      // ৫ নম্বর দৃশ্য সম্পূর্ণ হলে সেশনটি সম্পন্ন করা
      updateData.status = 'completed';
      updateData.completed_at = new Date().toISOString();
      updateData.current_scene_index = 5; // keep it at 5
    } else {
      // Else: update target scene index
      // পরবর্তী দৃশ্যে যাওয়ার জন্য সূচক হালনাগাদ করা
      updateData.current_scene_index = nextSceneIndex;
    }

    const { error: updateError } = await supabaseServer
      .from('story_sessions')
      .update(updateData)
      .eq('id', session_id);

    if (updateError) {
      console.error('Failed to update session progress:', updateError.message);
      return NextResponse.json(
        {
          error: 'সেশন আপডেট করতে ব্যর্থ হয়েছে',
          error_en: 'Failed to update session data',
          code: 'DATABASE_ERROR',
        },
        { status: 500 }
      );
    }

    // --- XP LOGIC ---
    try {
      const { awardXp } = require('@/lib/xp');
      
      // Award 15 XP for completing the scene successfully
      await awardXp(payload.userId, 15);
      
      if (isSessionComplete) {
        // Award extra 50 XP for completing the whole quest
        await awardXp(payload.userId, 50);
      }
    } catch (xpError) {
      console.error('Failed to award XP for story choice:', xpError);
    }
    // ----------------

    // 8. Return response
    // ৮. রেসপন্স ফেরত পাঠানো
    return NextResponse.json({
      is_correct,
      correct_option: scene.correct_option,
      explanation_bn: scene.explanation_bn,
      explanation_en: scene.explanation_en,
      is_session_complete: isSessionComplete,
      next_scene_index: nextSceneIndex,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Submit choice error:', error.message);
    }
    return NextResponse.json(
      {
        error: 'অভ্যন্তরীণ সার্ভার ত্রুটি',
        error_en: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
