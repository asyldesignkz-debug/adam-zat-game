import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Trim and validate
const supabaseUrl = rawUrl?.trim();
const supabaseAnonKey = rawKey?.trim();

// Validate URL format
if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL is missing or empty. Check .env.local file."
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or empty. Check .env.local file."
  );
}

// Validate URL is a proper https URL
if (!supabaseUrl.startsWith("https://")) {
  throw new Error(
    `NEXT_PUBLIC_SUPABASE_URL must start with https://. Got: ${supabaseUrl.substring(0, 50)}...`
  );
}

// Validate URL contains expected domain pattern
if (!supabaseUrl.includes(".supabase.co")) {
  throw new Error(
    `NEXT_PUBLIC_SUPABASE_URL should be a Supabase URL. Got: ${supabaseUrl.substring(0, 50)}...`
  );
}

try {
  new URL(supabaseUrl);
} catch {
  throw new Error(
    `Invalid NEXT_PUBLIC_SUPABASE_URL format. Must be a valid URL: ${supabaseUrl.substring(0, 50)}...`
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);