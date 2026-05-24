"use client"

import { Music } from "lucide-react"
import { AIMusicGenerator } from "@/components/editing/audio/AIMusicGenerator"
import { AudioMixer } from "@/components/editing/audio/AudioMixer"
import { SFXLibrary } from "@/components/editing/audio/SFXLibrary"
import { VoiceoverPanel } from "@/components/editing/audio/VoiceoverPanel"

export function AudioStudioPanel() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <Music className="h-4 w-4 text-accent-amber" />
        <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">Audio Studio</h3>
      </div>
      <AIMusicGenerator />
      <SFXLibrary />
      <VoiceoverPanel />
      <AudioMixer />
    </div>
  )
}
