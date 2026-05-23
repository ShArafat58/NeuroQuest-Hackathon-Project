import { NextResponse } from "next/server";
import { verifyEmailSchema } from "@/lib/validators";
import { generateJWT } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1. Validate the 6-digit OTP code structure
    const parsed = verifyEmailSchema.safeParse({ code: body.code });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { code } = parsed.data;

    // Fetch the user to locate their ID
    const { data: user, error: userError } = await supabaseServer
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json({ error: "User account not found" }, { status: 404 });
    }

    // 2. Find matching, unused, and non-expired signup code
    const now = new Date().toISOString();
    const { data: dbCode, error: codeError } = await supabaseServer
      .from("verification_codes")
      .select("*")
      .eq("user_id", user.id)
      .eq("code", code)
      .eq("type", "signup")
      .eq("used", false)
      .gt("expires_at", now)
      .maybeSingle();

    if (codeError || !dbCode) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // 3. Mark user's email as verified
    const { error: userUpdateError } = await supabaseServer
      .from("users")
      .update({ email_verified: true })
      .eq("id", user.id);

    if (userUpdateError) {
      console.error("Failed to update user verification status:", userUpdateError);
      return NextResponse.json(
        { error: "Database update failed. Please try again." },
        { status: 500 }
      );
    }

    // 4. Mark verification code as used
    await supabaseServer
      .from("verification_codes")
      .update({ used: true })
      .eq("id", dbCode.id);

    // 5. Generate a JWT token
    const token = await generateJWT(user.id, user.email);

    // 6. Save session token to DB
    const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    const { error: sessionError } = await supabaseServer
      .from("sessions")
      .insert({
        user_id: user.id,
        token,
        expires_at: sessionExpiresAt,
      });

    if (sessionError) {
      console.error("Failed to insert active session to DB:", sessionError);
      return NextResponse.json(
        { error: "Session registration failed. Please try again." },
        { status: 500 }
      );
    }

    // 7. Set HTTP-only cookie and return user info
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        version: user.version,
      },
    });

    response.cookies.set({
      name: "neuroquest_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Unexpected error in verify-email API:", error);
    return NextResponse.json(
      { error: "An unexpected system error occurred" },
      { status: 500 }
    );
  }
}
