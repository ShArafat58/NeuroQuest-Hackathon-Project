import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { extractChapterText, chunkText, estimateTokenCount } from "@/lib/pdf-parser";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chapter_id, version } = body;

    if (!chapter_id || !version) {
      return NextResponse.json({ error: "chapter_id and version are required" }, { status: 400 });
    }

    if (version !== "bangla" && version !== "english") {
      return NextResponse.json({ error: "Invalid version" }, { status: 400 });
    }

    // 1. Fetch chapter with subject join
    const { data: chapter, error: chapterError } = await supabaseServer
      .from("chapters")
      .select(`
        *,
        subjects ( code, grade )
      `)
      .eq("id", chapter_id)
      .single();

    if (chapterError || !chapter || !chapter.subjects) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // Determine PDF filename: {subject_prefix}_{version_suffix}.pdf
    const subjectPrefix = (chapter.subjects as any).code.split('_')[0]; // e.g. physics_ssc -> physics
    const versionSuffix = version === "bangla" ? "bn" : "en";
    const pdfFilename = `${subjectPrefix}_${versionSuffix}.pdf`;

    // 2. Mark chapter pdf_status as 'ingesting'
    await supabaseServer
      .from("chapters")
      .update({ pdf_status: "ingesting" })
      .eq("id", chapter_id);

    try {
      // 3. Delete existing chunks for this chapter+version
      await supabaseServer
        .from("chapter_chunks")
        .delete()
        .eq("chapter_id", chapter_id)
        .eq("version", version);

      // 4. Extract text from PDF
      const pageStart = chapter.page_start || 1;
      const pageEnd = chapter.page_end || 999;
      
      const extractionResult = await extractChapterText(pdfFilename, pageStart, pageEnd);
      
      // 5. Chunk the text and save to DB
      let totalChunks = 0;
      let totalTokens = 0;

      for (const page of extractionResult.pages) {
        const chunks = chunkText(page.text, 500);
        
        for (let i = 0; i < chunks.length; i++) {
          const chunkString = chunks[i];
          const tokens = estimateTokenCount(chunkString);
          
          await supabaseServer
            .from("chapter_chunks")
            .insert({
              chapter_id,
              version,
              chunk_index: i + 1, // Store local index per page or global depending on need. Using local + page here.
              chunk_text: chunkString,
              page_number: page.pageNumber,
              token_count: tokens
            });
            
          totalChunks++;
          totalTokens += tokens;
        }
      }

      // 6. Update status to ingested
      await supabaseServer
        .from("chapters")
        .update({ pdf_status: "ingested" })
        .eq("id", chapter_id);

      return NextResponse.json({
        success: true,
        chunks_created: totalChunks,
        total_tokens: totalTokens
      });

    } catch (processError: any) {
      console.error("PDF processing error:", processError);
      
      // Mark as failed
      await supabaseServer
        .from("chapters")
        .update({ pdf_status: "failed" })
        .eq("id", chapter_id);

      return NextResponse.json(
        { error: `PDF Processing Failed: ${processError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in ingest-pdf API handler:", error);
    return NextResponse.json(
      { error: "An unexpected system error occurred" },
      { status: 500 }
    );
  }
}
