import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Server-side client using the service role key to securely handle all user, session, and verification DB tables.
// We disable standard Supabase session persistence on this client because we manage custom sessions using JWT cookies.
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Client-side client using the anon key (primarily for direct subscription or public storage reads).
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
