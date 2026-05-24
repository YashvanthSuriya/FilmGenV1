"use client"

import { useEffect, useRef, useState } from "react"
import { Sparkles } from "lucide-react"
import WaveSurfer from "wavesurfer.js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProjectStore } from "@/lib/stores/project"
import type { AudioGenre, AudioIntensity } from "@/lib/types"

const genres: AudioGenre[] = ["Cinematic", "Electronic", "Jazz", "Acoustic", "Ambient", "Dramatic", "Noir"]
const intensities: AudioIntensity[] = ["Calm", "Moderate", "Intense"]

export function AIMusicGenerator() {
  const [prompt, setPrompt] = useState("Slow cinematic pulse with analog strings")
  const [duration, setDuration] = useState(30)
  const [genre, setGenre] = useState<AudioGenre>("Cinematic")
  const [intensity, setIntensity] = useState<AudioIntensity>("Moderate")
  const waveformRef = useRef<HTMLDivElement | null>(null)
  const tracks = useProjectStore((state) => state.editingState.audioState.musicTracks)
  const generate = useProjectStore((state) => state.generateMockMusic)

  useEffect(() => {
    if (!tracks[0] || !waveformRef.current) return undefined
    const wave = WaveSurfer.create({
      container: waveformRef.current,
      height: 48,
      waveColor: "rgba(255, 184, 0, 0.5)",
      progressColor: "#FFB800",
      cursorWidth: 0,
      interact: false,
      barWidth: 2,
      barGap: 3
    })
    void wave.loadBlob(createToneBlob())
    return () => wave.destroy()
  }, [tracks])

  return (
    <section className="rounded-[var(--radius-md)] border border-border-subtle bg-elevated p-3">
      <p className="mb-3 font-heading text-xs font-semibold uppercase tracking-[0.08em] text-text-primary">AI Music Generator</p>
      <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} className="min-h-20 w-full rounded-[var(--radius-md)] border border-border bg-background p-3 text-sm text-text-primary outline-none focus:border-accent-cyan" />
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label>
          <span className="mb-1 block font-heading text-[10px] uppercase tracking-[0.08em] text-text-muted">Duration</span>
          <Input type="number" min={5} max={180} value={duration} onChange={(event) => setDuration(Number(event.target.value))} />
        </label>
        <label>
          <span className="mb-1 block font-heading text-[10px] uppercase tracking-[0.08em] text-text-muted">Intensity</span>
          <select className="h-10 w-full rounded-[var(--radius-md)] border border-border bg-background px-3 text-sm text-text-primary" value={intensity} onChange={(event) => setIntensity(event.target.value as AudioIntensity)}>
            {intensities.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {genres.map((item) => (
          <button key={item} type="button" onClick={() => setGenre(item)} className={`rounded-full border px-2.5 py-1 font-heading text-[10px] uppercase tracking-[0.08em] ${genre === item ? "border-accent-amber bg-accent-amber-dim text-accent-amber" : "border-border-subtle text-text-secondary"}`}>
            {item}
          </button>
        ))}
      </div>
      <Button className="mt-3 w-full" variant="primary" onClick={() => generate({ prompt, duration, genre, intensity })}>
        <Sparkles className="h-4 w-4" />
        Generate Music (5 Credits)
      </Button>
      {tracks[0] ? (
        <div className="mt-3 rounded border border-accent-amber bg-background p-2">
          <div ref={waveformRef} className="h-12" />
          <p className="mt-2 truncate text-xs text-text-muted">{tracks[0].genre} / {tracks[0].intensity} / {tracks[0].duration}s</p>
        </div>
      ) : null}
    </section>
  )
}

function createToneBlob() {
  const sampleRate = 8000
  const seconds = 1
  const samples = sampleRate * seconds
  const buffer = new ArrayBuffer(44 + samples * 2)
  const view = new DataView(buffer)
  writeString(view, 0, "RIFF")
  view.setUint32(4, 36 + samples * 2, true)
  writeString(view, 8, "WAVEfmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(view, 36, "data")
  view.setUint32(40, samples * 2, true)
  for (let i = 0; i < samples; i += 1) {
    const value = Math.sin((i / sampleRate) * Math.PI * 2 * 220) * 0.25
    view.setInt16(44 + i * 2, value * 32767, true)
  }
  return new Blob([buffer], { type: "audio/wav" })
}

function writeString(view: DataView, offset: number, value: string) {
  for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i))
}
