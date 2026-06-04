import { NextResponse } from "next/server";
import { setNewPasswordSchema } from "@/lib/validators";
import { supabaseServer } from "@/lib/supabase";
import { comparePassword, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = setNewPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, security_answer, password } = parsed.data;

    // 1. Fetch user to verify and locate ID
    const { data: user, error: userError } = await supabaseServer
      .from("users")
      .select("id, security_answer_hash")
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

    // 2. Validate security answer again server-side before password reset
    const sanitizedAnswer = security_answer.trim().toLowerCase();
    const isCorrect = await comparePassword(sanitizedAnswer, user.security_answer_hash);

    if (!isCorrect) {
      return NextResponse.json(
        { error: "উত্তর সঠিক নয় / Incorrect answer" },
        { status: 400 }
      );
    }

    // 3. Hash the new password using bcryptjs
    const newPasswordHash = await hashPassword(password);

    // 4. Update the user's password hash in the database
    const { error: userUpdateError } = await supabaseServer
      .from("users")
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (userUpdateError) {
      console.error("Failed to update user password in DB:", userUpdateError);
      return NextResponse.json(
        { error: "Database update failed. Please try again." },
        { status: 500 }
      );
    }

    // 5. Purge active sessions for this user (force log out on all devices)
    const { error: sessionPurgeError } = await supabaseServer
      .from("sessions")
      .delete()
      .eq("user_id", user.id);

    if (sessionPurgeError) {
      console.error("Warning: Failed to purge old sessions for user:", sessionPurgeError);
    }

    // 6. Delete session cookie
    const response = NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
    response.cookies.delete("neuroquest_session");

    return response;
  } catch (error) {
    console.error("Unexpected error in set-new-password API handler:", error);
    return NextResponse.json(
      { error: "An unexpected system error occurred" },
      { status: 500 }
    );
  }
}
