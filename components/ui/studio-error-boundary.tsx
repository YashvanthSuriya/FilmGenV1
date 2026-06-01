"use client"

import React from "react"
import { AlertTriangle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export class StudioErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  reloadDemo() {
    window.location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <main className="grid min-h-[calc(100vh-var(--nav-height))] place-items-center bg-background p-6">
        <section className="w-full max-w-lg rounded-[var(--radius-lg)] border border-accent-red bg-surface p-5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)] bg-accent-red-dim">
              <AlertTriangle className="h-5 w-5 text-accent-red" />
            </div>
            <div>
              <h1 className="font-heading text-base font-semibold uppercase tracking-[0.08em] text-text-primary">Studio could not load</h1>
              <p className="mt-1 text-sm text-text-muted">Reload the frontend demo to return to the curated session state.</p>
            </div>
          </div>
          <pre className="mt-4 max-h-32 overflow-auto rounded border border-border-subtle bg-background p-3 text-xs text-text-muted">
            {this.state.error.message}
          </pre>
          <Button className="mt-4 w-full" variant="primary" onClick={() => this.reloadDemo()}>
            <RefreshCcw className="h-4 w-4" />
            Reload Demo
          </Button>
        </section>
      </main>
    )
  }
}
