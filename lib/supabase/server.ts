import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"

export async function createClient() {
  const { url, anonKey, isReady } = getSupabaseBrowserEnv()

  if (!isReady) {
    throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.")
  }

  const cookieStore = await cookies()

  return createServerClient(url!, anonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Server Components cannot always set cookies; Server Actions and Route Handlers can.
        }
      }
    }
  })
}
