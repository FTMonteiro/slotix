import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

// SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY are optional at the app level (see env.ts) so the
// API still boots without them — only gallery uploads actually need Supabase configured.
const client: SupabaseClient | null =
  env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY) : null;

export function getStorageClient(): SupabaseClient {
  if (!client) {
    throw new Error("Supabase Storage não está configurado (defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY).");
  }
  return client;
}

export const GALLERY_BUCKET = env.SUPABASE_STORAGE_BUCKET;
