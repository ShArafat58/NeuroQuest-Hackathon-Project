import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { cookies } from "next/headers";
import { verifyJWTEdge } from "@/lib/jwt-edge";

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

    const { searchParams } = new URL(request.url);
    const subject_code = searchParams.get("subject_code");

    if (!subject_code) {
      return NextResponse.json({ error: "subject_code is required" }, { status: 400 });
    }

    // 1. Fetch Subject
    const { data: subject, error: subjectError } = await supabaseServer
      .from("subjects")
      .select("id, code, name_bn, name_en")
      .eq("code", subject_code)
      .single();

    if (subjectError || !subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // 2. Fetch Chapters with concept count
    const { data: chaptersData, error: chaptersError } = await supabaseServer
      .from("chapters")
      .select(`
        id, chapter_number, title_bn, title_en, summary_bn, summary_en, page_start, page_end,
        concepts (count)
      `)
      .eq("subject_id", subject.id)
      .order("chapter_number");

    if (chaptersError) throw chaptersError;

    // Transform concepts count to a flat property
    const chapters = chaptersData.map(ch => ({
      ...ch,
      concept_count: ch.concepts && ch.concepts.length > 0 ? (ch.concepts[0] as any).count : 0
    }));

    return NextResponse.json({ subject, chapters });
  } catch (error: any) {
    console.error("Error fetching chapters:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
