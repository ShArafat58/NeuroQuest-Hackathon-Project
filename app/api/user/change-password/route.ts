import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { cookies } from "next/headers";
import { verifyJWTEdge } from "@/lib/jwt-edge";
import { changePasswordSchema } from "@/lib/validators";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("neuroquest_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWTEdge(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = changePasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { current_password, new_password } = validationResult.data;

    // 1. Fetch user to verify current password
    const { data: user, error: userError } = await supabaseServer
      .from("users")
      .select("id, password_hash")
      .eq("id", payload.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Verify current password
    const isPasswordValid = await bcrypt.compare(current_password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 401 });
    }

    // 3. Hash new password and update user
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(new_password, salt);

    const { error: updateError } = await supabaseServer
      .from("users")
      .update({ password_hash: newPasswordHash })
      .eq("id", payload.userId);

    if (updateError) {
      console.error("Failed to update password:", updateError);
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
    }

    // 4. Delete all sessions for this user
    await supabaseServer
      .from("sessions")
      .delete()
      .eq("user_id", payload.userId);

    // 5. Clear the session cookie
    const response = NextResponse.json({
      success: true,
      message: "Password changed. Please login again."
    });

    response.cookies.delete("neuroquest_session");

    return response;
  } catch (error: any) {
    console.error("Unexpected error changing password:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
