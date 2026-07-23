import { createClient } from "@supabase/supabase-js";

// Supabase backs the optional Discord login and cloud deck storage. Both
// values are public by design (RLS policies on the tables do the actual
// protection), so they're committed rather than injected via env.
export const SUPABASE_URL = "https://udylbxforcfsoumpfcun.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_I-iayZ6ZlGaW5yGin3MLbg_EsaWqXbM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
