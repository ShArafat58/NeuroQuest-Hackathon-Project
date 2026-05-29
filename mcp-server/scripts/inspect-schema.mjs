// Temporary schema inspection script
// Run: cd mcp-server && npm run inspect

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read .env file manually (no dotenv dependency yet at this stage)
const envPath = resolve(__dirname, '..', '.env');
let envContent;
try {
  envContent = readFileSync(envPath, 'utf-8');
} catch {
  // Fallback: try reading from root .env.local
  const rootEnvPath = resolve(__dirname, '..', '..', '.env.local');
  envContent = readFileSync(rootEnvPath, 'utf-8');
}

const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  envVars[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
}

const url = envVars['SUPABASE_URL'] || envVars['NEXT_PUBLIC_SUPABASE_URL'];
const key = envVars['SUPABASE_ANON_KEY'] || envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log(`Connecting to Supabase: ${url}\n`);

const supabase = createClient(url, key);

const tables = ['subjects', 'chapters', 'concepts', 'story_scenes'];

for (const table of tables) {
  console.log(`\n===== TABLE: ${table} =====`);
  const { data, error } = await supabase.from(table).select('*').limit(1);
  if (error) {
    console.error(`  ERROR: ${error.message}`);
    continue;
  }
  if (!data || data.length === 0) {
    console.log('  (empty table — no rows)');
    continue;
  }
  const columns = Object.keys(data[0]);
  console.log(`  Columns: ${columns.join(', ')}`);
  console.log(`  Sample row:`, JSON.stringify(data[0], null, 2));
}

console.log('\n✅ Schema inspection complete.');
