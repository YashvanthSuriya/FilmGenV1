"use client"

import { createBrowserClient } from "@supabase/ssr"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"

export function createClient() {
  const { url, anonKey, isReady } = getSupabaseBrowserEnv()

  if (!isReady) {
    throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.")
  }

  return createBrowserClient(url!, anonKey!)
}
