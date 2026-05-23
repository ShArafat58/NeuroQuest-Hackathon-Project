import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { verifyJWTEdge } from '@/lib/jwt-edge';
import { z } from 'zod';

// Zod Schema for validation
// ইনপুট ভ্যালিডেশন স্কিমা
const nextSceneQuerySchema = z.object({
  session_id: z.string().uuid({
    message: 'Invalid session ID format / সেশন আইডি ফরম্যাট অবৈধ',
  }),
  scene_index: z.coerce.number().int().min(1).max(5, {
    message: 'Scene index must be between 1 and 5 / দৃশ্য সূচক অবশ্যই ১ থেকে ৫ এর মধ্যে হতে হবে',
  }),
});

export async function GET(request: Request) {
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

    // 2. Parse and validate query parameters
    // ২. কুয়েরি প্যারামিটার ভ্যালিডেশন
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');
    const scene_index = searchParams.get('scene_index');

    const validationResult = nextSceneQuerySchema.safeParse({
      session_id,
      scene_index,
    });

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

    const { session_id: validatedSessionId, scene_index: validatedSceneIndex } = validationResult.data;

    // 3. Fetch session to verify ownership
    // ৩. সেশন এবং তার মালিকানা যাচাই করা
    const { data: session, error: sessionError } = await supabaseServer
      .from('story_sessions')
      .select('*')
      .eq('id', validatedSessionId)
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

    // 4. Fetch the scene by index and chapter ID
    // ৪. অধ্যায় ও দৃশ্য সূচক মিলিয়ে নির্দিষ্ট দৃশ্যপট নিয়ে আসা
    const { data: scene, error: sceneError } = await supabaseServer
      .from('story_scenes')
      .select('*')
      .eq('chapter_id', session.chapter_id)
      .eq('scene_index', validatedSceneIndex)
      .single();

    if (sceneError || !scene) {
      return NextResponse.json(
        {
          error: 'দৃশ্যপট খুঁজে পাওয়া যায়নি',
          error_en: 'Story scene not found',
          code: 'SCENE_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // 5. Return response formatted exactly as specified (NO correct_option or explanations to prevent cheating)
    // ৫. নির্দিষ্ট ফরম্যাটে রেসপন্স পাঠানো (কোনোভাবেই সঠিক অপশন বা ব্যাখ্যা ফাঁস করা যাবে না)
    return NextResponse.json({
      session_id: session.id,
      total_scenes: session.total_scenes || 5,
      current_scene_index: validatedSceneIndex,
      is_resumed: true,
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
      console.error('Next scene fetch error:', error.message);
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
