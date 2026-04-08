import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

// Use service role key on the server for full DB access (bypasses RLS).
// MIGRATION NOTE: On AWS this would be replaced with a direct Postgres connection
// via RDS/Aurora — the Supabase client is Vercel-specific here.
export const db = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});
