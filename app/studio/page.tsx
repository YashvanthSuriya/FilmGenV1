import { StudioShell } from "@/components/studio/studio-shell"
import { studioTabs, type StudioTab } from "@/lib/types"

function parseTab(tab: string | string[] | undefined): StudioTab {
  const value = Array.isArray(tab) ? tab[0] : tab
  return studioTabs.includes(value as StudioTab) ? (value as StudioTab) : "storyboard"
}

export default function StudioPage({ searchParams }: { searchParams?: { tab?: string | string[] } }) {
  return <StudioShell initialTab={parseTab(searchParams?.tab)} />
}
