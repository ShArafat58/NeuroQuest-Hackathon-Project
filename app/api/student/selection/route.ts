import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { cookies } from "next/headers";
import { verifyJWTEdge } from "@/lib/jwt-edge";
import { selectionSchema } from "@/lib/validators";

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
    const validationResult = selectionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { subject_id, chapter_id } = validationResult.data;

    // Use upsert to create or update the student's selection
    const { data: selection, error } = await supabaseServer
      .from("student_selections")
      .upsert(
        { user_id: payload.userId, current_subject_id: subject_id, current_chapter_id: chapter_id, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Database error upserting selection:", error);
      return NextResponse.json({ error: "Failed to save selection" }, { status: 500 });
    }

    return NextResponse.json({ success: true, selection });
  } catch (error: any) {
    console.error("Unexpected error saving selection:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
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

    const { data: selection, error } = await supabaseServer
      .from("student_selections")
      .select(`
        *,
        subjects:current_subject_id ( id, code, name_en, name_bn ),
        chapters:current_chapter_id ( id, chapter_number, title_en, title_bn )
      `)
      .eq("user_id", payload.userId)
      .maybeSingle();

    if (error) {
      console.error("Database error fetching selection:", error);
      return NextResponse.json({ error: "Failed to fetch selection" }, { status: 500 });
    }

    return NextResponse.json({ selection: selection || null });
  } catch (error: any) {
    console.error("Unexpected error fetching selection:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
