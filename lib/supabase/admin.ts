import { createClient } from "@supabase/supabase-js";

// Service role client — server-side only, never exposed to the browser
// Bypasses all RLS policies (safe for API routes and server actions)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
