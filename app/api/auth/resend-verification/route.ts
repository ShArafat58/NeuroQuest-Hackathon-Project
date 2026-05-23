import { NextResponse } from "next/server";
import { generateCode } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1. Find the user by email
    const { data: user, error: userError } = await supabaseServer
      .from("users")
      .select("id, full_name, email, version, email_verified")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (userError || !user) {
      // Return success to prevent email enumeration attacks
      return NextResponse.json({
        success: true,
        message: "If account exists and is unverified, a new code has been sent",
      });
    }

    // 2. Do not resend if already verified
    if (user.email_verified) {
      return NextResponse.json(
        { error: "This email is already verified. Please login." },
        { status: 409 }
      );
    }

    // 3. Invalidate all existing unused signup codes for this user
    await supabaseServer
      .from("verification_codes")
      .update({ used: true })
      .eq("user_id", user.id)
      .eq("type", "signup")
      .eq("used", false);

    // 4. Generate a fresh 6-digit OTP code with 15-minute expiry
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { error: insertCodeError } = await supabaseServer
      .from("verification_codes")
      .insert({
        user_id: user.id,
        code,
        type: "signup",
        expires_at: expiresAt,
        used: false,
      });

    if (insertCodeError) {
      console.error("Database verification code re-insertion error:", insertCodeError);
      return NextResponse.json(
        { error: "Failed to generate new verification code. Please try again." },
        { status: 500 }
      );
    }

    // 5. Send the new verification email
    await sendVerificationEmail(user.email, code, user.full_name, user.version);

    return NextResponse.json({
      success: true,
      message: "A new verification code has been sent to your email",
    });
  } catch (error) {
    console.error("Unexpected error in resend-verification API:", error);
    return NextResponse.json(
      { error: "An unexpected system error occurred" },
      { status: 500 }
    );
  }
}
