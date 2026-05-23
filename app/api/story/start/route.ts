import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { verifyJWTEdge } from '@/lib/jwt-edge';
import { z } from 'zod';

// Zod Schema for validation
// ইনপুট ভ্যালিডেশন স্কিমা
const startStorySchema = z.object({
  chapter_id: z.string().uuid({
    message: 'Invalid chapter ID format / অধ্যায় আইডি ফরম্যাট অবৈধ',
  }),
});

export async function POST(request: Request) {
  try {
    // 1. Authenticate user (mirror quiz pattern)
    // ১. ইউজার অথেন্টিকেশন (কুইজ প্যাটার্ন অনুসরণ)
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

    // 2. Validate input request body
    // ২. ইনপুট রিকোয়েস্ট বডি ভ্যালিডেশন
    const body = await request.json();
    const validationResult = startStorySchema.safeParse(body);

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

    const { chapter_id } = validationResult.data;

    // 3. Verify chapter exists in the database
    // ৩. অধ্যায়টি ডাটাবেজে আছে কিনা তা যাচাই করা
    const { data: chapter, error: chapterError } = await supabaseServer
      .from('chapters')
      .select('id')
      .eq('id', chapter_id)
      .single();

    if (chapterError || !chapter) {
      return NextResponse.json(
        {
          error: 'অধ্যায়টি পাওয়া যায়নি',
          error_en: 'Chapter not found',
          code: 'CHAPTER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // 4. Check if user has an active session for this chapter
    // ৪. এই অধ্যায়ের জন্য ইউজারের কোনো সক্রিয় (active) সেশন আছে কিনা তা পরীক্ষা করা
    const { data: activeSessions, error: searchError } = await supabaseServer
      .from('story_sessions')
      .select('*')
      .eq('user_id', payload.userId)
      .eq('chapter_id', chapter_id)
      .eq('status', 'active')
      .order('started_at', { ascending: false });

    if (searchError) {
      console.error('Error fetching active session:', searchError.message);
      return NextResponse.json(
        {
          error: 'সেশন তথ্য খুঁজতে সমস্যা হয়েছে',
          error_en: 'Error fetching session data',
          code: 'DATABASE_ERROR',
        },
        { status: 500 }
      );
    }

    let session = activeSessions && activeSessions.length > 0 ? activeSessions[0] : null;
    let isResumed = false;

    if (session) {
      isResumed = true;
    } else {
      // 5. Create new session if no active session exists
      // ৫. কোনো সক্রিয় সেশন না থাকলে নতুন সেশন তৈরি করা

      // Fetch user's preferred version (bangla or english) to fulfill the NOT NULL CHECK constraint in migration 003
      // ইউজারের ভাষা সংস্করণ (বাংলা বা ইংরেজি) সংগ্রহ করা
      const { data: user, error: userError } = await supabaseServer
        .from('users')
        .select('version')
        .eq('id', payload.userId)
        .single();

      if (userError || !user) {
        return NextResponse.json(
          {
            error: 'ব্যবহারকারীকে খুঁজে পাওয়া যায়নি',
            error_en: 'User not found',
            code: 'USER_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      const version = (user.version as 'bangla' | 'english') || 'bangla';

      const { data: newSession, error: createError } = await supabaseServer
        .from('story_sessions')
        .insert({
          user_id: payload.userId,
          chapter_id,
          version,
          status: 'active',
          current_scene_index: 0, // Defaults to 0 as in existing DB schema
          total_scenes: 5,
          scenes_completed: 0,
          correct_choices: 0,
        })
        .select()
        .single();

      if (createError || !newSession) {
        console.error('Failed to create story session:', createError?.message);
        return NextResponse.json(
          {
            error: 'নতুন সেশন তৈরি করতে ব্যর্থ হয়েছে',
            error_en: 'Failed to create new session',
            code: 'SESSION_CREATION_FAILED',
          },
          { status: 500 }
        );
      }

      session = newSession;
    }

    // 6. Determine target scene_index: treat 0 as first scene (index 1)
    // ৬. লক্ষ্যদৃশ্য সূচক নির্ধারণ: ০ হলে প্রথম দৃশ্য (সূচক ১) হিসেবে বিবেচনা করা
    const targetSceneIndex = session.current_scene_index === 0 ? 1 : session.current_scene_index;

    // 7. Fetch the specific scene
    // ৭. নির্দিষ্ট দৃশ্যপট ডাটাবেজ থেকে নিয়ে আসা
    const { data: scene, error: sceneError } = await supabaseServer
      .from('story_scenes')
      .select('*')
      .eq('chapter_id', chapter_id)
      .eq('scene_index', targetSceneIndex)
      .single();

    if (sceneError || !scene) {
      console.error('Failed to fetch story scene:', sceneError?.message);
      return NextResponse.json(
        {
          error: 'দৃশ্যপট খুঁজে পাওয়া যায়নি',
          error_en: 'Story scene not found',
          code: 'SCENE_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // 8. Return response formatted exactly as specified (NO correct_option or explanations to prevent cheating)
    // ৮. নির্দিষ্ট ফরম্যাটে রেসপন্স পাঠানো (কোনোভাবেই সঠিক অপশন বা ব্যাখ্যা ফাঁস করা যাবে না)
    return NextResponse.json({
      session_id: session.id,
      total_scenes: session.total_scenes || 5,
      current_scene_index: targetSceneIndex,
      is_resumed: isResumed,
      current_scene: {
        id: scene.id,
        scene_index: scene.scene_index,
        title_bn: scene.title_bn,
        title_en: scene.title_en,
        narrative_bn: scene.narrative_bn,
        narrative_en: scene.narrative_en,
        question_bn: scene.question_bn,
        question_en: scene.question_en,
        options: {
          a: { bn: scene.option_a_bn, en: scene.option_a_en },
          b: { bn: scene.option_b_bn, en: scene.option_b_en },
          c: { bn: scene.option_c_bn, en: scene.option_c_en },
        },
        icon_name: scene.icon_name || 'sparkles',
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Story start error:', error.message);
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
