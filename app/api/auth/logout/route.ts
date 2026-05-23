import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabase";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("neuroquest_session")?.value;

    if (token) {
      // 1. Delete session from Supabase sessions table to invalidate JWT on server-side
      const { error: deleteError } = await supabaseServer
        .from("sessions")
        .delete()
        .eq("token", token);

      if (deleteError) {
        console.error("Warning: Failed to delete session from DB during logout:", deleteError);
      }
    }

    // 2. Clear cookie and return success response
    const response = NextResponse.json({ success: true });
    
    response.cookies.delete("neuroquest_session");

    return response;
  } catch (error) {
    console.error("Unexpected error in logout API handler:", error);
    return NextResponse.json(
      { error: "An unexpected system error occurred" },
      { status: 500 }
    );
  }
}
