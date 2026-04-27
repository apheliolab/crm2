declare global {
  interface Window {
    __APHELIO_SUPABASE_ENV__?: {
      url?: string;
      publishableKey?: string;
      enableDemoSeed?: boolean;
    };
  }
}

export function getSupabaseEnv() {
  const runtimeEnv = typeof window !== "undefined" ? window.__APHELIO_SUPABASE_ENV__ : undefined;

  return {
    url: runtimeEnv?.url || process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: runtimeEnv?.publishableKey || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    enableDemoSeed: runtimeEnv?.enableDemoSeed ?? (process.env.NEXT_PUBLIC_ENABLE_DEMO_SEED === "true"),
  };
}

export function isSupabaseConfigured() {
  const { url, publishableKey } = getSupabaseEnv();
  return Boolean(url && publishableKey);
}

export function getSupabasePublicEnvScript() {
  const { url, publishableKey, enableDemoSeed } = getSupabaseEnv();

  return `window.__APHELIO_SUPABASE_ENV__=${JSON.stringify({
    url: url ?? "",
    publishableKey: publishableKey ?? "",
    enableDemoSeed,
  })};`;
}
