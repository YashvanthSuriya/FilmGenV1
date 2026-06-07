import { currentUser } from "@clerk/nextjs/server"
import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { DashboardProviders } from "@/app/(dashboard)/_components/dashboard-providers"
import { StudioTopNav } from "@/app/(dashboard)/studio/_components/studio-top-nav"
import { isLocalDemoAuthEnabled, isPlaceholderClerkEnv } from "@/lib/clerk-config"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  if (isLocalDemoAuthEnabled()) {
    return (
      <div className="min-h-screen bg-background">
        <StudioTopNav userId="demo-user" email="demo@filmgen.local" demoAuth />
        {children}
      </div>
    )
  }

  if (isPlaceholderClerkEnv()) {
    redirect("/sign-in?configuration_error=clerk")
  }

  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  return (
    <DashboardProviders>
      <div className="min-h-screen bg-background">
        <StudioTopNav
          userId={user.id}
          email={user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? ""}
        />
        {children}
      </div>
    </DashboardProviders>
  )
}
