import { NextResponse } from "next/server";
import { verifyAnswerSchema } from "@/lib/validators";
import { supabaseServer } from "@/lib/supabase";
import { comparePassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = verifyAnswerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, security_answer } = parsed.data;

    const { data: user, error: userError } = await supabaseServer
      .from("users")
      .select("security_answer_hash")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json(
        { error: "এই ইমেইলে অ্যাকাউন্ট নেই / No account found" },
        { status: 404 }
      );
    }

    if (!user.security_answer_hash) {
      return NextResponse.json(
        { error: "এই অ্যাকাউন্টে কোনো নিরাপত্তা উত্তর সেট করা নেই / No security answer configured" },
        { status: 400 }
      );
    }

    const sanitizedAnswer = security_answer.trim().toLowerCase();
    const isCorrect = await comparePassword(sanitizedAnswer, user.security_answer_hash);

    if (!isCorrect) {
      return NextResponse.json(
        { error: "উত্তর সঠিক নয় / Incorrect answer" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Unexpected error in verify-answer API handler:", error);
    return NextResponse.json(
      { error: "An unexpected system error occurred" },
      { status: 500 }
    );
  }
}
