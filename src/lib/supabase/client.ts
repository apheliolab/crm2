"use client";

import { createBrowserClient } from "@supabase/ssr";

declare global {
  interface Window {
    __APHELIO_SUPABASE_ENV__?: {
      url?: string;
      publishableKey?: string;
    };
  }
}

export function createClient() {
  const runtimeEnv = typeof window !== "undefined" ? window.__APHELIO_SUPABASE_ENV__ : undefined;
  const url = runtimeEnv?.url || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = runtimeEnv?.publishableKey || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createBrowserClient(url, publishableKey);
}
