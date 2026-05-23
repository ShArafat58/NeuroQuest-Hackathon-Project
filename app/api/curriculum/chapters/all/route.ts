import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: chapters, error } = await supabaseServer
      .from("chapters")
      .select(`
        *,
        subjects ( name_en, name_bn )
      `)
      .order("subject_id")
      .order("chapter_number");

    if (error) {
      throw error;
    }

    return NextResponse.json({ chapters });
  } catch (error: any) {
    console.error("Error fetching all chapters:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
