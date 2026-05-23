import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { cookies } from "next/headers";
import { verifyJWTEdge } from "@/lib/jwt-edge";
import { changeClassSchema } from "@/lib/validators";

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
    const validationResult = changeClassSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { new_class } = validationResult.data;

    // 1. Update user's class
    const { error: updateError } = await supabaseServer
      .from("users")
      .update({ current_class: new_class })
      .eq("id", payload.userId);

    if (updateError) {
      console.error("Failed to update class:", updateError);
      return NextResponse.json({ error: "Failed to update class" }, { status: 500 });
    }

    // 2. Delete student's current selections
    await supabaseServer
      .from("student_selections")
      .delete()
      .eq("user_id", payload.userId);

    return NextResponse.json({ success: true, new_class });
  } catch (error: any) {
    console.error("Unexpected error changing class:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
