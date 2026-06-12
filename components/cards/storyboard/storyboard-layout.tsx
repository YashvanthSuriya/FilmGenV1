"use client"

import type { ReactNode } from "react"

export function StoryboardWorkspaceLayout({
  toolbar,
  hero,
  composer,
  gallery,
  overlays
}: {
  toolbar?: ReactNode
  hero?: ReactNode
  composer?: ReactNode
  gallery?: ReactNode
  overlays?: ReactNode
}) {
  return (
    <main className="relative min-h-[calc(100vh-var(--nav-height))] overflow-hidden bg-[#030506] text-text-primary">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(0,229,255,0.34),transparent_34%),radial-gradient(circle_at_18%_82%,rgba(0,229,255,0.18),transparent_28%),linear-gradient(180deg,#070a0c_0%,#05090c_45%,#020304_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:72px_72px]" />
      {hero || composer ? (
        <section className="relative z-20 min-h-[calc(100vh-var(--nav-height))] overflow-visible border-b border-white/[0.08]">
          <div className="relative z-10 mx-auto flex min-h-[calc(100vh-var(--nav-height))] w-full max-w-[1180px] flex-col px-4 py-4 md:px-6 lg:px-8">
            {toolbar}
          <div className="flex flex-1 items-center justify-center py-4 lg:py-6">
            {hero}
          </div>
          <div className="pb-8 lg:pb-5">
            {composer}
          </div>
          </div>
        </section>
      ) : null}

      {gallery ? (
        <section className="relative z-10 mx-auto w-full max-w-[1180px] space-y-5 px-4 py-5 md:px-6 lg:px-8">
          {toolbar}
          {gallery}
        </section>
      ) : null}

      {overlays}
    </main>
  )
}

export function StoryboardContentSection({
  eyebrow,
  title,
  actions,
  children
}: {
  eyebrow: string
  title: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.12em] text-accent-cyan">{eyebrow}</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-text-primary md:text-2xl">{title}</h2>
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}
