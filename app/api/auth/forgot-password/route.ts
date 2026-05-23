import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validators";
import { generateCode } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";
import { sendResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate incoming email
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // 2. Fetch the user profile by email
    const { data: user, error: userError } = await supabaseServer
      .from("users")
      .select("id, full_name, version")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    // 3. Security check: if user not found, STILL return success to prevent email discovery
    if (userError || !user) {
      return NextResponse.json({
        success: true,
        message: "If account exists, reset code sent",
      });
    }

    // 4. Generate a 6-digit OTP code and set expiry to 15 minutes from now
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { error: insertCodeError } = await supabaseServer
      .from("verification_codes")
      .insert({
        user_id: user.id,
        code,
        type: "reset",
        expires_at: expiresAt,
        used: false,
      });

    if (insertCodeError) {
      console.error("Database password-reset code insertion error:", insertCodeError);
      return NextResponse.json(
        { error: "Failed to generate password reset code. Please try again." },
        { status: 500 }
      );
    }

    // 5. Send password-reset email containing the code via Resend
    await sendResetEmail(email.toLowerCase(), code, user.full_name, user.version);

    // 6. Return response
    return NextResponse.json({
      success: true,
      message: "If account exists, reset code sent",
    });
  } catch (error) {
    console.error("Unexpected error in forgot-password API handler:", error);
    return NextResponse.json(
      { error: "An unexpected system error occurred" },
      { status: 500 }
    );
  }
}
