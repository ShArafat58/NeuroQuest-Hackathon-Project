import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// ── Load environment variables ──────────────────────────────────────
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "❌ Missing required env vars: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env"
  );
  process.exit(1);
}

// ── Supabase client (read-only, ANON key only) ─────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── MCP Server ──────────────────────────────────────────────────────
const server = new Server(
  {
    name: "neuroquest-curriculum-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ── Tool Definitions ────────────────────────────────────────────────
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_subjects",
        description:
          "List all subjects in the NeuroQuest NCTB curriculum (e.g., Physics, Biology). Returns id, code, name (Bangla & English), grade, and paper.",
        inputSchema: {
          type: "object" as const,
          properties: {},
        },
      },
      {
        name: "list_chapters",
        description:
          "List all chapters for a given subject by subject_id. Returns chapter number, titles (Bangla & English), summaries, page ranges, and PDF status.",
        inputSchema: {
          type: "object" as const,
          properties: {
            subject_id: {
              type: "string",
              description: "The UUID of the subject to list chapters for",
            },
          },
          required: ["subject_id"],
        },
      },
      {
        name: "get_concept",
        description:
          "Get details of a specific concept by its ID. Returns name (Bangla & English), description, difficulty level, and display order.",
        inputSchema: {
          type: "object" as const,
          properties: {
            concept_id: {
              type: "string",
              description: "The UUID of the concept to retrieve",
            },
          },
          required: ["concept_id"],
        },
      },
      {
        name: "list_story_scenes",
        description:
          "List all story quest scenes for a given chapter by chapter_id. Returns scene narratives, questions, answer options, and explanations (Bangla & English).",
        inputSchema: {
          type: "object" as const,
          properties: {
            chapter_id: {
              type: "string",
              description: "The UUID of the chapter to list story scenes for",
            },
          },
          required: ["chapter_id"],
        },
      },
    ],
  };
});

// ── Tool Execution ──────────────────────────────────────────────────
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;
  const args = request.params.arguments ?? {};

  try {
    switch (name) {
      // ── list_subjects ───────────────────────────────────────────
      case "list_subjects": {
        const { data, error } = await supabase
          .from("subjects")
          .select("id, code, name_bn, name_en, grade, paper, created_at")
          .order("name_en", { ascending: true });

        if (error) throw new Error(error.message);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      // ── list_chapters ───────────────────────────────────────────
      case "list_chapters": {
        const subjectId = args.subject_id as string;
        if (!subjectId) throw new Error("subject_id is required");

        const { data, error } = await supabase
          .from("chapters")
          .select(
            "id, subject_id, chapter_number, title_bn, title_en, summary_bn, summary_en, page_start, page_end, pdf_status, created_at"
          )
          .eq("subject_id", subjectId)
          .order("chapter_number", { ascending: true });

        if (error) throw new Error(error.message);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      // ── get_concept ─────────────────────────────────────────────
      case "get_concept": {
        const conceptId = args.concept_id as string;
        if (!conceptId) throw new Error("concept_id is required");

        const { data, error } = await supabase
          .from("concepts")
          .select(
            "id, chapter_id, name_bn, name_en, description_bn, description_en, difficulty, display_order, created_at"
          )
          .eq("id", conceptId)
          .single();

        if (error) throw new Error(error.message);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      // ── list_story_scenes ───────────────────────────────────────
      case "list_story_scenes": {
        const chapterId = args.chapter_id as string;
        if (!chapterId) throw new Error("chapter_id is required");

        const { data, error } = await supabase
          .from("story_scenes")
          .select(
            "id, chapter_id, scene_index, title_bn, title_en, narrative_bn, narrative_en, concept_id, question_bn, question_en, option_a_bn, option_a_en, option_b_bn, option_b_en, option_c_bn, option_c_en, correct_option, explanation_bn, explanation_en, icon_name"
          )
          .eq("chapter_id", chapterId)
          .order("scene_index", { ascending: true });

        if (error) throw new Error(error.message);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      // ── Unknown tool ───────────────────────────────────────────
      default:
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: Unknown tool "${name}"`,
            },
          ],
          isError: true,
        };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [
        {
          type: "text" as const,
          text: `Error: ${message}`,
        },
      ],
      isError: true,
    };
  }
});

// ── Main entry point ────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Use console.error — stdout is reserved for MCP protocol messages
  console.error("NeuroQuest Curriculum MCP Server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error starting MCP server:", err);
  process.exit(1);
});
