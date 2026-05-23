import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("neuroquest_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Verify and decode the JWT session token
    const decoded = await verifyJWT(token);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Cross-verify that the session is still active in the database
    const now = new Date().toISOString();
    const { data: dbSession, error: sessionError } = await supabaseServer
      .from("sessions")
      .select("id")
      .eq("token", token)
      .gt("expires_at", now)
      .maybeSingle();

    if (sessionError || !dbSession) {
      // Invalidate the browser cookie if session is not active in DB
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      response.cookies.delete("neuroquest_session");
      return response;
    }

    // 3. Fetch user details
    const { data: user, error: userError } = await supabaseServer
      .from("users")
      .select("id, full_name, email, version, current_class, created_at")
      .eq("id", decoded.userId)
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // 4. Return user profile
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        version: user.version,
        current_class: user.current_class,
      },
    });
  } catch (error) {
    console.error("Unexpected error in /api/auth/me endpoint:", error);
    return NextResponse.json(
      { error: "An unexpected system error occurred" },
      { status: 500 }
    );
  }
}
