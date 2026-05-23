"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Bell, CreditCard, LogOut, Settings, Sparkles, User, Wallet } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import {
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { cn } from "@/lib/utils"
import { studioTabs, type StudioTab } from "@/lib/types"

const tabLabels: Record<StudioTab, string> = {
  storyboard: "Storyboard",
  workspace: "Cinema Workspace",
  editing: "Editing",
  export: "Export"
}

export function StudioTopNav({ activeTab = "storyboard" }: { activeTab?: StudioTab }) {
  const router = useRouter()
  const pathname = usePathname()
  const isSettings = pathname === "/studio/settings"

  return (
    <header className="sticky top-0 z-40 grid h-[var(--nav-height)] grid-cols-[1fr_auto_1fr] items-center border-b border-border-subtle bg-surface px-4">
      <Link href="/studio?tab=storyboard" className="justify-self-start">
        <BrandLogo compact />
      </Link>

      <nav className="hidden items-center gap-1 rounded-full border border-border-subtle bg-background p-1 md:flex">
        {studioTabs.map((tab) => {
          const active = !isSettings && activeTab === tab
          return (
            <button
              key={tab}
              type="button"
              onClick={() => router.push(`/studio?tab=${tab}`)}
              className={cn(
                "relative h-8 rounded-full px-4 font-heading text-xs font-semibold uppercase tracking-[0.08em] transition",
                active ? "text-accent-cyan" : "text-text-secondary hover:text-text-primary"
              )}
            >
              {active ? (
                <motion.span
                  layoutId="tab-indicator"
                  className="absolute inset-0 rounded-full bg-accent-cyan-dim"
                  transition={{ duration: 0.18 }}
                />
              ) : null}
              <span className="relative z-10">{tabLabels[tab]}</span>
            </button>
          )
        })}
      </nav>

      <div className="flex items-center justify-end gap-2">
        <div className="rounded-full bg-accent-amber-dim px-3 py-1 font-heading text-sm font-semibold text-accent-amber">
          ◈ 50
        </div>
        <button
          type="button"
          className="relative grid h-9 w-9 place-items-center rounded-full text-text-secondary transition hover:bg-elevated hover:text-text-primary"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent-cyan" />
        </button>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="grid h-8 w-8 place-items-center rounded-full border border-border bg-elevated font-heading text-xs font-bold text-text-primary"
              aria-label="Open user menu"
            >
              D
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Sparkles className="h-4 w-4" />
              Upgrade Plan
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Wallet className="h-4 w-4" />
              Buy Credits
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push("/studio/settings")}>
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <CreditCard className="h-4 w-4" />
              Free Tier Only
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut className="h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu.Root>
      </div>
    </header>
  )
}
