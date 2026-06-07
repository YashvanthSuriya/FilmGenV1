"use client"

import { useState } from "react"
import { SignOutButton } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Bell, Check, Download, Edit3, Film, LayoutGrid, LogOut, Menu, PlaySquare, Plus, Settings, Trash2, Trophy, User, X } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import {
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { cn } from "@/lib/utils"
import { studioTabs, type StudioTab } from "@/lib/types"
import { useProjectStore } from "@/lib/stores/project"

const tabLabels: Record<StudioTab, string> = {
  storyboard: "Storyboard",
  workspace: "Cinema Workspace",
  editing: "Editing",
  gallery: "Gallery",
  challenges: "Challenges",
  export: "Export"
}

const tabIcons: Record<StudioTab, React.ComponentType<{ className?: string }>> = {
  storyboard: Film,
  workspace: LayoutGrid,
  editing: Edit3,
  gallery: PlaySquare,
  challenges: Trophy,
  export: Download
}

interface StudioTopNavProps {
  activeTab?: StudioTab
  userId?: string
  email?: string
  demoAuth?: boolean
}

export function StudioTopNav({ activeTab, userId, email, demoAuth = false }: StudioTopNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isSettings = pathname === "/studio/settings"
  const tabParam = searchParams.get("tab") as StudioTab | null
  const currentTab = activeTab ?? (studioTabs.includes(tabParam as StudioTab) ? (tabParam as StudioTab) : "storyboard")
  const avatarLabel = (email?.trim()[0] ?? "U").toUpperCase()
  const projects = useProjectStore((state) => state.projects)
  const activeProjectId = useProjectStore((state) => state.activeProjectId)
  const projectName = useProjectStore((state) => state.projectName)
  const createProject = useProjectStore((state) => state.createProject)
  const selectProject = useProjectStore((state) => state.selectProject)
  const renamingProjectId = useProjectStore((state) => state.renamingProjectId)
  const renameDraft = useProjectStore((state) => state.renameDraft)
  const beginRenameProject = useProjectStore((state) => state.beginRenameProject)
  const setProjectRenameDraft = useProjectStore((state) => state.setProjectRenameDraft)
  const commitRenameProject = useProjectStore((state) => state.commitRenameProject)
  const cancelRenameProject = useProjectStore((state) => state.cancelRenameProject)
  const deleteProject = useProjectStore((state) => state.deleteProject)

  function setTab(tab: StudioTab) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.push(`/studio?${params.toString()}`)
    setMobileMenuOpen(false)
  }

  function selectMobileProject(projectId: string) {
    selectProject(projectId)
    setMobileMenuOpen(false)
  }

  function createMobileProject() {
    createProject()
    setMobileMenuOpen(false)
  }

  return (
    <div className="sticky top-0 z-40 bg-surface">
      <header className="grid h-[var(--nav-height)] grid-cols-[1fr_auto_1fr] items-center border-b border-border-subtle px-4">
        <Link href="/studio?tab=storyboard" className="justify-self-start">
          <BrandLogo compact />
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-border-subtle bg-background p-1 md:flex">
          {studioTabs.map((tab) => {
            const active = !isSettings && currentTab === tab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setTab(tab)}
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
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button type="button" className="hidden max-w-44 truncate rounded-full bg-accent-cyan-dim px-3 py-1 font-heading text-xs font-semibold uppercase tracking-[0.08em] text-accent-cyan sm:block" aria-label="Project menu">
                {projectName}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenuContent align="end" className="w-72">
              <div className="px-2 py-2">
                <p className="mb-2 font-heading text-[10px] uppercase tracking-[0.08em] text-text-muted">Account-ready projects {projects.length}/5</p>
                <div className="space-y-1">
                  {projects.map((project) => {
                    const active = project.id === activeProjectId
                    const renaming = project.id === renamingProjectId
                    return (
                      <div key={project.id} className={`rounded border p-1 ${active ? "border-accent-cyan bg-accent-cyan-dim" : "border-border-subtle bg-background"}`}>
                        {renaming ? (
                          <div className="grid grid-cols-[1fr_auto_auto] gap-1">
                            <input
                              value={renameDraft}
                              onChange={(event) => setProjectRenameDraft(event.target.value)}
                              className="min-w-0 rounded bg-surface px-2 text-sm text-text-primary outline-none ring-1 ring-border-subtle focus:ring-accent-cyan"
                              aria-label={`${project.name} rename draft`}
                              autoFocus
                            />
                            <button type="button" onClick={commitRenameProject} className="grid h-8 w-8 place-items-center rounded text-accent-green hover:bg-elevated" aria-label={`Save ${project.name} name`}>
                              <Check className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={cancelRenameProject} className="grid h-8 w-8 place-items-center rounded text-text-secondary hover:bg-elevated" aria-label="Cancel rename">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-[1fr_auto_auto] gap-1">
                            <button
                              type="button"
                              onClick={() => selectProject(project.id)}
                              className={`min-w-0 rounded px-2 text-left text-sm ${active ? "font-semibold text-accent-cyan" : "text-text-primary hover:bg-elevated"}`}
                              aria-label={`Select ${project.name}`}
                            >
                              <span className="block truncate">{active ? projectName : project.name}</span>
                              <span className="block truncate text-[10px] uppercase tracking-[0.08em] text-text-muted">{project.syncStatus} / v{project.version ?? 1}</span>
                            </button>
                            <button type="button" onClick={() => beginRenameProject(project.id)} className="grid h-8 w-8 place-items-center rounded text-text-secondary hover:bg-elevated hover:text-accent-cyan" aria-label={`Rename ${project.name}`}>
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="grid h-8 w-8 place-items-center rounded text-text-muted hover:bg-accent-red-dim hover:text-accent-red disabled:opacity-40"
                              disabled={projects.length <= 1}
                              onClick={() => {
                                if (window.confirm(`Delete ${project.name}? This removes the local-first project memory from this device.`)) deleteProject(project.id)
                              }}
                              aria-label={`Delete ${project.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <button
                  type="button"
                  disabled={projects.length >= 5}
                  onClick={createProject}
                  className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded border border-border-subtle text-sm text-text-secondary hover:border-accent-cyan hover:text-accent-cyan disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  New project
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu.Root>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full text-text-secondary transition hover:bg-elevated hover:text-text-primary md:hidden"
            aria-label={mobileMenuOpen ? "Close studio menu" : "Open studio menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <button
            type="button"
            className="relative hidden h-9 w-9 place-items-center rounded-full text-text-secondary transition hover:bg-elevated hover:text-text-primary sm:grid"
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
                {avatarLabel}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="flex-col items-start gap-0">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </span>
                <span className="mt-1 max-w-44 truncate text-xs text-text-muted">
                  {email || userId || "Signed in"}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push("/studio/settings")}>
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              {demoAuth ? (
                <DropdownMenuItem asChild>
                  <button type="button" className="w-full" onClick={() => router.push("/")}>
                    <LogOut className="h-4 w-4" />
                    Leave demo
                  </button>
                </DropdownMenuItem>
              ) : (
                <SignOutButton redirectUrl="/">
                  <DropdownMenuItem asChild>
                    <button type="button" className="w-full">
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </DropdownMenuItem>
                </SignOutButton>
              )}
            </DropdownMenuContent>
          </DropdownMenu.Root>
        </div>
      </header>

      {mobileMenuOpen ? (
        <div className="border-b border-border-subtle bg-surface p-3 shadow-xl md:hidden">
          <div className="grid gap-1">
            {studioTabs.map((tab) => {
              const active = !isSettings && currentTab === tab
              const TabIcon = tabIcons[tab]
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setTab(tab)}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-[var(--radius-md)] px-3 text-left text-sm transition",
                    active ? "bg-accent-cyan-dim text-accent-cyan" : "text-text-secondary hover:bg-elevated hover:text-text-primary"
                  )}
                >
                  <TabIcon className="h-4 w-4" />
                  {tabLabels[tab]}
                </button>
              )
            })}
          </div>

          <div className="mt-3 border-t border-border-subtle pt-3">
            <p className="px-1 font-heading text-[10px] uppercase tracking-[0.08em] text-text-muted">
              Projects {projects.length}/5
            </p>
            <div className="mt-2 grid gap-1">
              {projects.map((project) => {
                const active = project.id === activeProjectId
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => selectMobileProject(project.id)}
                    className={cn(
                      "rounded-[var(--radius-md)] px-3 py-2 text-left text-sm transition",
                      active ? "bg-accent-cyan-dim text-accent-cyan" : "text-text-secondary hover:bg-elevated hover:text-text-primary"
                    )}
                  >
                    <span className="block truncate">{active ? projectName : project.name}</span>
                    <span className="block truncate text-[10px] uppercase tracking-[0.08em] text-text-muted">
                      {project.syncStatus} / v{project.version ?? 1}
                    </span>
                  </button>
                )
              })}
              <button
                type="button"
                disabled={projects.length >= 5}
                onClick={createMobileProject}
                className="mt-1 flex h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border-subtle text-sm text-text-secondary transition hover:border-accent-cyan hover:text-accent-cyan disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                New project
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default StudioTopNav
