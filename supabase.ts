import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && anonKey && !url.includes("YOUR_PROJECT") && !anonKey.includes("YOUR_"));
export const supabase = supabaseConfigured ? createClient(url!, anonKey!) : null;