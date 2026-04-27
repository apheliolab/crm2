export function getSupabaseEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

export function isSupabaseConfigured() {
  const { url, publishableKey } = getSupabaseEnv();
  return Boolean(url && publishableKey);
}

export function getSupabasePublicEnvScript() {
  const { url, publishableKey } = getSupabaseEnv();

  return `window.__APHELIO_SUPABASE_ENV__=${JSON.stringify({
    url: url ?? "",
    publishableKey: publishableKey ?? "",
  })};`;
}
