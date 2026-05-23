import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators";
import { comparePassword, generateJWT } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate email and password inputs
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // 2. Fetch user profile by email
    const { data: user, error: userError } = await supabaseServer
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    // 3. Security-conscious check: if user not found, return generic 401 (prevent email enumeration)
    if (userError || !user) {
      return NextResponse.json(
        { error: "Wrong email or password" },
        { status: 401 }
      );
    }

    // Compare plain-text password to database bcrypt hash
    const isPasswordCorrect = await comparePassword(password, user.password_hash);
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "Wrong email or password" },
        { status: 401 }
      );
    }

    // 4. Ensure email is verified before allowing active session creation
    if (!user.email_verified) {
      return NextResponse.json(
        { error: "Please verify your email first", email: user.email },
        { status: 403 }
      );
    }

    // 5. Generate session JWT
    const token = await generateJWT(user.id, user.email);

    // Save session in Supabase sessions table
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    const { error: sessionError } = await supabaseServer
      .from("sessions")
      .insert({
        user_id: user.id,
        token,
        expires_at: expiresAt,
      });

    if (sessionError) {
      console.error("Database active session insertion error:", sessionError);
      return NextResponse.json(
        { error: "Session creation failed. Please try again." },
        { status: 500 }
      );
    }

    // 6. Return response with HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        version: user.version,
        current_class: user.current_class,
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
    console.error("Unexpected error in login API handler:", error);
    return NextResponse.json(
      { error: "An unexpected system error occurred" },
      { status: 500 }
    );
  }
}
