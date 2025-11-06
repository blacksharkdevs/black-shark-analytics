import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing env.VITE_SUPABASE_URL. Check your .env file.");
}
if (!supabaseAnonKey) {
  throw new Error("Missing env.VITE_SUPABASE_ANON_KEY. Check your .env file.");
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);
