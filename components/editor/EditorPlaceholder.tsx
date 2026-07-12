"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Eye, EyeOff, Film, Lock, Maximize2, Pause, Play, Scissors, SkipBack, SkipForward, Trash2, Volume2, VolumeX } from "lucide-react"
import { useProjectStore } from "@/lib/stores/project"
import { addClip, createStudioTimeline, moveClip, rippleDelete, snap, splitClip, timelineDuration, trimClip, type StudioClip, type StudioTimeline } from "@/lib/editor/studioTimeline"

const PX_PER_SECOND = 48
const timecode = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${Math.floor(seconds % 60).toString().padStart(2, "0")}:${Math.round((seconds % 1) * 24).toString().padStart(2, "0")}`

export function EditorPlaceholder() {
  const assets = useProjectStore((state) => state.assets)
  const [timeline, setTimeline] = useState<StudioTimeline>(createStudioTimeline)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [grade, setGrade] = useState({ exposure: 0, contrast: 0, saturation: 100, temperature: 0, tint: 0, lut: "Natural" })
  const [master, setMaster] = useState(80)
  const monitorRef = useRef<HTMLDivElement>(null)
  const duration = timelineDuration(timeline)
  const selected = timeline.clips.find((clip) => clip.id === selectedId) ?? null
  const preview = useMemo(() => timeline.clips.filter((clip) => clip.kind !== "audio" && timeline.playhead >= clip.start && timeline.playhead < clip.start + clip.duration).sort((a, b) => b.start - a.start)[0], [timeline])

  useEffect(() => {
    if (!playing) return
    let frame = 0; let last = performance.now()
    const tick = (now: number) => { const next = timeline.playhead + (now - last) / 1000; last = now; setTimeline((current) => ({ ...current, playhead: next >= current.outPoint ? current.loop ? current.inPoint : current.outPoint : next })); frame = requestAnimationFrame(tick) }
    frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame)
  }, [playing, timeline.playhead, timeline.loop, timeline.outPoint, timeline.inPoint])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).matches("input,textarea,select")) return
      if (event.key.toLowerCase() === "k" || event.code === "Space") { event.preventDefault(); setPlaying((value) => !value) }
      if (event.key.toLowerCase() === "j") setTimeline((value) => ({ ...value, playhead: Math.max(value.inPoint, value.playhead - 1) }))
      if (event.key.toLowerCase() === "l") setTimeline((value) => ({ ...value, playhead: Math.min(value.outPoint, value.playhead + 1) }))
      if (event.key.toLowerCase() === "i") setTimeline((value) => ({ ...value, inPoint: value.playhead }))
      if (event.key.toLowerCase() === "o") setTimeline((value) => ({ ...value, outPoint: value.playhead }))
      if (event.key === "Delete" && selectedId) { setTimeline((value) => rippleDelete(value, selectedId)); setSelectedId(null) }
      if (event.key.toLowerCase() === "s" && selectedId) setTimeline((value) => splitClip(value, selectedId, value.playhead))
    }
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey)
  }, [selectedId])

  function addAsset(assetId: string, trackId: string) {
    const asset = assets.find((item) => item.id === assetId); if (!asset) return
    const kind = asset.type === "audio" ? "audio" : asset.type === "video" ? "video" : "image"
    const clip: StudioClip = { id: `clip-${Date.now()}`, trackId, name: asset.name, kind, start: timeline.playhead, duration: asset.duration ?? (kind === "audio" ? 12 : 5), sourceUrl: asset.url, thumbnailUrl: asset.thumbnailUrl, volume: 100, fadeIn: 0, fadeOut: 0, color: kind === "audio" ? "#c084fc" : "#36d8c2" }
    setTimeline((value) => addClip(value, clip)); setSelectedId(clip.id)
  }
  function updateSelected(patch: Partial<StudioClip>) { if (selected) setTimeline((value) => ({ ...value, clips: value.clips.map((clip) => clip.id === selected.id ? { ...clip, ...patch } : clip) })) }

  return <main className="editor-shell">
    <header className="editor-header"><div><p className="eyebrow">FilmGen Edit</p><h1>Picture editorial</h1></div><div className="editor-status"><span>LOCAL SESSION</span><span>{timecode(timeline.playhead)}</span><button onClick={() => setTimeline((value) => ({ ...value, loop: !value.loop }))} aria-pressed={timeline.loop}>Loop</button><button onClick={() => monitorRef.current?.requestFullscreen()} aria-label="Fullscreen monitor"><Maximize2 size={16}/></button></div></header>
    <section className="editor-main">
      <aside className="media-bin"><div className="panel-title"><span>Media bin</span><span>{assets.length}</span></div>{assets.length ? assets.map((asset) => <button key={asset.id} className="media-asset" onClick={() => addAsset(asset.id, asset.type === "audio" ? "audio-1" : "video-1")}><span className="asset-thumb" style={{ backgroundImage: asset.thumbnailUrl ? `url(${asset.thumbnailUrl})` : undefined }}><Film size={15}/></span><span><b>{asset.name}</b><small>{asset.type} · click to add</small></span></button>) : <p className="empty-copy">Send a storyboard or workspace result here to begin.</p>}</aside>
      <section className="monitor-panel"><div ref={monitorRef} className="monitor" style={{ filter: `brightness(${1 + grade.exposure / 100}) contrast(${1 + grade.contrast / 100}) saturate(${grade.saturation / 100}) sepia(${Math.max(0, grade.temperature) / 300}) hue-rotate(${grade.tint}deg)` }}>{preview?.thumbnailUrl || preview?.sourceUrl ? <img src={preview.thumbnailUrl ?? preview.sourceUrl} alt="Program monitor"/> : <div className="monitor-empty"><Film size={34}/><p>Build your first cut</p><small>Drag media from the bin or click an asset to place it at the playhead.</small></div>}<div className="safe-frame"/><span className="monitor-tc">{timecode(timeline.playhead)}</span></div><div className="transport"><button onClick={() => setTimeline((value) => ({...value, playhead: value.inPoint}))}><SkipBack size={17}/></button><button className="play" onClick={() => setPlaying((value) => !value)}>{playing ? <Pause size={18}/> : <Play size={18}/>}</button><button onClick={() => setTimeline((value) => ({...value, playhead: value.outPoint}))}><SkipForward size={17}/></button><button onClick={() => selectedId && setTimeline((value) => splitClip(value, selectedId, value.playhead))} disabled={!selectedId}><Scissors size={16}/> Split</button><button onClick={() => selectedId && (setTimeline((value) => rippleDelete(value, selectedId)), setSelectedId(null))} disabled={!selectedId}><Trash2 size={16}/> Ripple delete</button></div></section>
      <aside className="inspector"><div className="panel-title"><span>Inspector</span><span>{selected ? selected.name : "Sequence"}</span></div>{selected ? <div className="inspector-stack"><label>Start<input type="number" step="0.1" value={selected.start} onChange={(e) => setTimeline((value) => moveClip(value, selected.id, selected.trackId, Number(e.target.value)))}/></label><label>Duration<input type="number" step="0.1" value={selected.duration} onChange={(e) => updateSelected({duration: Math.max(.25, Number(e.target.value))})}/></label><label>Clip volume<input type="range" value={selected.volume} onChange={(e) => updateSelected({volume:Number(e.target.value)})}/></label><label>Fade in<input type="range" max="3" step=".1" value={selected.fadeIn} onChange={(e) => updateSelected({fadeIn:Number(e.target.value)})}/></label><label>Fade out<input type="range" max="3" step=".1" value={selected.fadeOut} onChange={(e) => updateSelected({fadeOut:Number(e.target.value)})}/></label></div> : <p className="empty-copy">Select a clip to inspect timing, audio, and effects.</p>}<div className="grade"><div className="panel-title"><span>Color</span><span>{grade.lut}</span></div>{(["exposure","contrast","saturation","temperature","tint"] as const).map((key) => <label key={key}>{key}<input type="range" min={key === "saturation" ? 0 : -100} max={key === "saturation" ? 200 : 100} value={grade[key]} onChange={(e) => setGrade({...grade,[key]:Number(e.target.value)})}/></label>)}<select value={grade.lut} onChange={(e) => setGrade({...grade,lut:e.target.value})}><option>Natural</option><option>Noir</option><option>Teal / Orange</option><option>Faded Film</option></select></div><div className="grade"><div className="panel-title"><span>Export</span><span>Client</span></div><p className="empty-copy">Browser export is prepared as a swappable capability. Rendering is unavailable until the local ffmpeg adapter is installed.</p><button disabled className="export-button">Export unavailable</button></div></aside>
    </section>
    <section className="timeline"><div className="timeline-toolbar"><span>Timeline · {timecode(duration)}</span><label>Master <input type="range" value={master} onChange={(e)=>setMaster(Number(e.target.value))}/></label><button onClick={() => setZoom((value)=>Math.max(.5,value-.25))}>−</button><button onClick={() => setZoom((value)=>Math.min(2,value+.25))}>+</button></div><div className="timeline-scroll"><div className="timeline-grid" style={{width: duration * PX_PER_SECOND * zoom + 184}}><div className="ruler">{Array.from({length:Math.ceil(duration/5)+1},(_,i)=><span key={i} style={{left:184+i*5*PX_PER_SECOND*zoom}}>{timecode(i*5)}</span>)}</div>{timeline.tracks.map((track)=><div className="track-row" key={track.id}><div className="track-header"><b>{track.name}</b><button onClick={()=>setTimeline(v=>({...v,tracks:v.tracks.map(t=>t.id===track.id?{...t,locked:!t.locked}:t)}))}><Lock size={13}/></button><button onClick={()=>setTimeline(v=>({...v,tracks:v.tracks.map(t=>t.id===track.id?{...t,muted:!t.muted}:t)}))}>{track.muted?<VolumeX size={13}/>:<Volume2 size={13}/>}</button><button onClick={()=>setTimeline(v=>({...v,tracks:v.tracks.map(t=>t.id===track.id?{...t,hidden:!t.hidden}:t)}))}>{track.hidden?<EyeOff size={13}/>:<Eye size={13}/>}</button></div><div className="track-lane" onClick={(e)=>{const rect=e.currentTarget.getBoundingClientRect();setTimeline(v=>({...v,playhead:snap((e.clientX-rect.left)/(PX_PER_SECOND*zoom),v)}))}}>{timeline.clips.filter(c=>c.trackId===track.id).map((clip)=><Clip key={clip.id} clip={clip} zoom={zoom} selected={selectedId===clip.id} onSelect={()=>setSelectedId(clip.id)} onMove={(start)=>setTimeline(v=>moveClip(v,clip.id,track.id,start))} onTrim={(edge,point)=>setTimeline(v=>trimClip(v,clip.id,edge,point))}/>)}</div></div>)}<div className="playhead" style={{left:184+timeline.playhead*PX_PER_SECOND*zoom}}/></div></div>
    </section>
  </main>
}

function Clip({clip,zoom,selected,onSelect,onMove,onTrim}:{clip:StudioClip;zoom:number;selected:boolean;onSelect:()=>void;onMove:(start:number)=>void;onTrim:(edge:"start"|"end",point:number)=>void}) {
  const drag = useRef<{kind:"move"|"start"|"end";x:number;start:number;duration:number}|null>(null)
  function down(event:React.PointerEvent<HTMLElement>,kind:"move"|"start"|"end"){event.currentTarget.setPointerCapture(event.pointerId);drag.current={kind,x:event.clientX,start:clip.start,duration:clip.duration};onSelect()}
  function move(event:React.PointerEvent<HTMLElement>){const active=drag.current;if(!active)return;const delta=(event.clientX-active.x)/(PX_PER_SECOND*zoom);if(active.kind==="move")onMove(active.start+delta);if(active.kind==="start")onTrim("start",active.start+delta);if(active.kind==="end")onTrim("end",active.start+active.duration+delta)}
  return <div className={`timeline-clip ${selected?"selected":""} ${clip.kind}`} style={{left:clip.start*PX_PER_SECOND*zoom,width:clip.duration*PX_PER_SECOND*zoom,background:clip.color}} onPointerDown={(e)=>down(e,"move")} onPointerMove={move} onPointerUp={()=>drag.current=null}><i onPointerDown={(e)=>{e.stopPropagation();down(e,"start")}}/><span>{clip.kind==="audio"?"〰〰〰 ":""}{clip.name}</span><i onPointerDown={(e)=>{e.stopPropagation();down(e,"end")}}/></div>
}
