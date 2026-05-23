import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validators";
import { hashPassword } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1. Validate the code, new password, and confirmation password
    const parsed = resetPasswordSchema.safeParse({
      code: body.code,
      password: body.password,
      confirm_password: body.confirm_password,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { code, password } = parsed.data;

    // Fetch the user to locate their ID
    const { data: user, error: userError } = await supabaseServer
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json({ error: "User account not found" }, { status: 404 });
    }

    // 2. Find unused, non-expired reset code matching this user
    const now = new Date().toISOString();
    const { data: dbCode, error: codeError } = await supabaseServer
      .from("verification_codes")
      .select("*")
      .eq("user_id", user.id)
      .eq("code", code)
      .eq("type", "reset")
      .eq("used", false)
      .gt("expires_at", now)
      .maybeSingle();

    if (codeError || !dbCode) {
      return NextResponse.json(
        { error: "Invalid or expired password reset code" },
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

    // 5. Mark code as used
    await supabaseServer
      .from("verification_codes")
      .update({ used: true })
      .eq("id", dbCode.id);

    // 6. Delete all active sessions for this user (forces re-login on all devices for security)
    const { error: sessionPurgeError } = await supabaseServer
      .from("sessions")
      .delete()
      .eq("user_id", user.id);

    if (sessionPurgeError) {
      console.error("Warning: Failed to purge old sessions for user:", sessionPurgeError);
    }

    // 7. Clear the session cookie if they reset while logged in, and return success
    const response = NextResponse.json({ success: true });
    response.cookies.delete("neuroquest_session");

    return response;
  } catch (error) {
    console.error("Unexpected error in reset-password API handler:", error);
    return NextResponse.json(
      { error: "An unexpected system error occurred" },
      { status: 500 }
    );
  }
}
