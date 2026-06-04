import { NextResponse } from "next/server";
import { lookupQuestionSchema } from "@/lib/validators";
import { supabaseServer } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = lookupQuestionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const { data: user, error: userError } = await supabaseServer
      .from("users")
      .select("security_question")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json(
        { error: "এই ইমেইলে অ্যাকাউন্ট নেই / No account found" },
        { status: 404 }
      );
    }

    if (!user.security_question) {
      return NextResponse.json(
        { error: "এই অ্যাকাউন্টে কোনো নিরাপত্তা প্রশ্ন সেট করা নেই / No security question set for this account" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      security_question: user.security_question,
    });
  } catch (error) {
    console.error("Unexpected error in lookup-question API handler:", error);
    return NextResponse.json(
      { error: "An unexpected system error occurred" },
      { status: 500 }
    );
  }
}
