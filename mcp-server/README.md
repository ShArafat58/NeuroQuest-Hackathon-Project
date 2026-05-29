# NeuroQuest Curriculum MCP Server

A standalone Model Context Protocol (MCP) server that exposes NeuroQuest's NCTB curriculum data — subjects, chapters, concepts, and story scenes — to external AI tools such as Cursor, Claude Desktop, and custom agents. It uses read-only Supabase access with the ANON key and communicates via the MCP stdio transport.

Built for **Infinity AI BuildFest 2026 — Team Hackers, BRAC University**.

---

## Installation

```bash
cd mcp-server
npm install
```

## Build

```bash
npm run build
```

## Configuration

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```
2. Fill in your Supabase credentials in `.env`:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=eyJhbGci...
   ```
   > ⚠️ Never use the `SUPABASE_SERVICE_ROLE_KEY` — this server uses the ANON key for read-only access.

## Local Testing

```bash
npm start
```

You should see (on stderr):
```
NeuroQuest Curriculum MCP Server running on stdio
```

## Schema Inspection (Debug)

To verify the Supabase connection and inspect table schemas:

```bash
npm run inspect
```

## Adding to Cursor

Add the following to your Cursor MCP config file:

- **Windows**: `%APPDATA%\Cursor\mcp.json`
- **macOS/Linux**: `~/.cursor/mcp.json`

```json
{
  "mcpServers": {
    "neuroquest-curriculum": {
      "command": "node",
      "args": ["<ABSOLUTE_PATH_TO>/mcp-server/dist/index.js"]
    }
  }
}
```

Replace `<ABSOLUTE_PATH_TO>` with the actual absolute path on your machine.

After saving, **restart Cursor** and test by asking:
> "List NeuroQuest subjects using the neuroquest-curriculum MCP tool"

---

## Available Tools

| Tool | Description |
|------|-------------|
| `list_subjects` | List all subjects in the NeuroQuest NCTB curriculum (e.g., Physics, Biology). Returns id, code, name (Bangla & English), grade, and paper. |
| `list_chapters` | List all chapters for a given subject by `subject_id`. Returns chapter number, titles, summaries, page ranges, and PDF status. |
| `get_concept` | Get details of a specific concept by `concept_id`. Returns name, description, difficulty level, and display order. |
| `list_story_scenes` | List all story quest scenes for a given chapter by `chapter_id`. Returns scene narratives, questions, answer options, and explanations. |

---

## Project Structure

```
mcp-server/
├── src/
│   └── index.ts          # MCP server implementation
├── scripts/
│   └── inspect-schema.mjs # Schema inspection utility
├── dist/
│   └── index.js          # Compiled output (after build)
├── package.json
├── tsconfig.json
├── .env                  # Real credentials (gitignored)
├── .env.example          # Template for env vars
├── .gitignore
└── README.md
```

---

## Tech Stack

- **Runtime**: Node.js (ES2022)
- **Language**: TypeScript
- **MCP SDK**: `@modelcontextprotocol/sdk`
- **Database**: Supabase (PostgreSQL) via `@supabase/supabase-js`
- **Transport**: stdio (standard MCP transport)
