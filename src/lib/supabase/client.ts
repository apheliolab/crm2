"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

export function createClient() {
  const { url, publishableKey } = getSupabaseEnv();

  if (!url || !publishableKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createBrowserClient(url, publishableKey);
}
