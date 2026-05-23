import { isConfigured } from "@/lib/utils"

export function getSupabaseBrowserEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return {
    url,
    anonKey,
    isReady: isConfigured(url) && isConfigured(anonKey)
  }
}
