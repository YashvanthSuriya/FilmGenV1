"use client"

import { useEffect, useState } from "react"
import { Bell, MonitorCog, Palette, User } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const sections = [{ label: "Account", icon: User }, { label: "Notifications", icon: Bell }, { label: "Studio defaults", icon: MonitorCog }, { label: "Appearance", icon: Palette }]
const key = "filmgen-preferences"

export default function StudioSettingsPage() {
  const [active, setActive] = useState("Account")
  const [name, setName] = useState("Director")
  const [email, setEmail] = useState("director@filmgen.local")
  const [reducedMotion, setReducedMotion] = useState(false)
  const [saved, setSaved] = useState(false)
  useEffect(() => { try { const stored = JSON.parse(localStorage.getItem(key) ?? "{}"); setName(stored.name ?? name); setEmail(stored.email ?? email); setReducedMotion(Boolean(stored.reducedMotion)) } catch { /* local demo can recover with defaults */ } }, [])
  function save() { localStorage.setItem(key, JSON.stringify({ name, email, reducedMotion })); document.documentElement.dataset.motion = reducedMotion ? "reduced" : "full"; setSaved(true); window.setTimeout(() => setSaved(false), 1800) }
  return <main className="grid min-h-[calc(100vh-var(--nav-height))] grid-cols-1 bg-background md:grid-cols-[220px_1fr]"><aside className="border-b border-border-subtle bg-surface p-3 md:border-b-0 md:border-r"><nav className="flex gap-2 overflow-x-auto md:flex-col">{sections.map(({label,icon:Icon})=><button key={label} type="button" onClick={()=>setActive(label)} className={`flex h-10 shrink-0 items-center gap-2 rounded-[var(--radius-md)] px-3 text-left font-heading text-xs font-semibold uppercase tracking-[.08em] ${active===label?"bg-accent-cyan-dim text-accent-cyan":"text-text-secondary hover:bg-elevated hover:text-text-primary"}`}><Icon className="h-4 w-4"/>{label}</button>)}</nav></aside><section className="p-4 sm:p-7"><div className="max-w-3xl"><p className="eyebrow">FilmGen preferences</p><h1 className="mt-2 font-heading text-3xl font-bold text-text-primary">{active}</h1><p className="mt-2 text-text-secondary">Stored locally in this demo. Cloud account preferences connect through the same surface later.</p><Card className="mt-6 p-5"><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="displayName">Display name</Label><Input id="displayName" value={name} onChange={e=>setName(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} /></div></div><label className="mt-5 flex items-center justify-between gap-4 rounded-lg border border-border-subtle bg-background p-4 text-sm text-text-secondary"><span><b className="block text-text-primary">Reduced motion</b>Minimize decorative interface motion.</span><input type="checkbox" checked={reducedMotion} onChange={e=>setReducedMotion(e.target.checked)} className="h-4 w-4 accent-cyan" /></label><div className="mt-5 flex items-center gap-3"><button onClick={save} className="rounded-md bg-accent-cyan px-4 py-2 font-heading text-xs font-bold uppercase tracking-[.08em] text-black">Save preferences</button>{saved?<span className="text-sm text-accent-green">Saved locally</span>:null}</div></Card></div></section></main>
}
