"use client"

import { useAuth } from "@clerk/nextjs"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import type { ReactNode } from "react"
import { convex } from "@/lib/convex"

export function DashboardProviders({ children }: { children: ReactNode }) {
  // In local demo mode (no Convex URL configured), skip the Convex provider entirely.
  // The app works fully without Convex — all state is local via Zustand.
  if (!convex) {
    return <>{children}</>
  }

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  )
}
