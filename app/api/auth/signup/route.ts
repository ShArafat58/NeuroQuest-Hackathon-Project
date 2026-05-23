import { NextResponse } from "next/server";
import { signupSchema } from "@/lib/validators";
import { hashPassword, generateCode } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate request body against our strict Zod signupSchema
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      // Return the exact error message from Zod validation
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { full_name, email, password, birthdate, version, current_class } = parsed.data;

    // 2. Check if a user with this email is already registered
    const { data: existingUser, error: checkError } = await supabaseServer
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (checkError) {
      console.error("Database check error during signup:", checkError);
      return NextResponse.json(
        { error: "A database error occurred. Please try again." },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // 3. Hash the plain password using bcryptjs
    const passwordHash = await hashPassword(password);

    // 4. Insert the new user into our Postgres database (initially unverified)
    const formattedBirthdate = new Date(birthdate).toISOString().split("T")[0];
    const { data: newUser, error: insertUserError } = await supabaseServer
      .from("users")
      .insert({
        full_name,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        birthdate: formattedBirthdate,
        version,
        current_class,
        email_verified: false,
      })
      .select("id, full_name, version")
      .single();

    if (insertUserError || !newUser) {
      console.error("Database user insertion error:", insertUserError);
      return NextResponse.json(
        { error: "Failed to create user account. Please try again." },
        { status: 500 }
      );
    }

    // 5. Generate a 6-digit OTP code and set expiry to 15 minutes from now
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { error: insertCodeError } = await supabaseServer
      .from("verification_codes")
      .insert({
        user_id: newUser.id,
        code,
        type: "signup",
        expires_at: expiresAt,
        used: false,
      });

    if (insertCodeError) {
      console.error("Database verification code insertion error:", insertCodeError);
      return NextResponse.json(
        { error: "Failed to generate verification code. Please try again." },
        { status: 500 }
      );
    }

    // 6. Send the verification email containing the code via Resend
    await sendVerificationEmail(email.toLowerCase(), code, newUser.full_name, newUser.version);

    // 7. Return the response
    return NextResponse.json({
      success: true,
      userId: newUser.id,
      message: "Check your email for verification code",
    });
  } catch (error) {
    console.error("Unexpected error in signup API handler:", error);
    return NextResponse.json(
      { error: "An unexpected system error occurred" },
      { status: 500 }
    );
  }
}
