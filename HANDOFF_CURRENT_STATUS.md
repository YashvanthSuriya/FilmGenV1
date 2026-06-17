# FilmGenV1 / Cine Studio Current Handoff Report

Last updated: 2026-06-17 (V7FilmGen)

## Update 2026-06-17 (V7FilmGen — comprehensive director workflow overhaul)

This update represents a complete overhaul of the Director workspace, Storyboard→Workspace handoff, Editing tab, and extensive cleanup of dead code. All changes are on the `V7FilmGen` branch.

### Director Workspace — Node Graph Overhaul

- **Camera Config node fixed**: Extended `CameraConfig` type with explicit `body`, `focalLength` fields (was incorrectly mapping camera body → `movement`, focal length → `angle`). Shared `CameraConfigGrid` component now used in both Director mode and Storyboard composer.
- **Script node removed**: Merged into Prompt. Dialogue goes inline (e.g. "MIRA (whispering): ..."). One freeform textarea per shot.
- **Shot Builder (Combiner) node removed**: Variant feature moved to a "Variant" text field on Image/Video Output nodes. The node type is kept in the type union for backward compat with existing graphs but is no longer addable from the palette.
- **Node palette reduced to 8 types**: Style Card, Action, Character, Prompt, Camera, Image, Video, Preview (was 10 — removed Script + Shot Builder).
- **All nodes are collapsible**: Per-node chevron toggle in the header + "Collapse all / Expand all" button in the workspace toolbar. Collapse state lives in the workspace store (`collapsedNodeIds: Set<string>`).
- **(i) properties button removed** from all node headers — the PropertiesPanel is no longer triggered.
- **Edge routing**: Switched from smoothstep to bezier by default. Toggle button in toolbar (Spline ↔ GitBranch icons).
- **Preview image shift bug fixed**: `CompiledPromptPreview` now has a fixed `min-h-[58px]`. Created `upstreamSignature.ts` — computes a stable signature of only THIS node's upstream subgraph, so the analysis `useMemo` only recomputes when upstream actually changes (not on every global graph edit).
- **Image-to-image references on Image Output**: Dropdown of project image assets + chip list of attached refs with remove buttons.
- **Image upload on Style/Character/Action nodes**: Shared `NodeImageUploader` component with drag-and-drop + click-to-select. Uploaded images become real project assets.
- **Model selection on Image/Video Output nodes**: New `modelRegistry.ts` with extensible `ModelDefinition` interface (id, label, description, available flag, features array). `ModelSelector` component renders model dropdown + dynamic feature chips (aspect ratio for images; resolution + duration for videos). Adding a new model = add one entry to the registry, zero component changes.
- **"Run all" on Preview node**: Runs every un-run upstream output in sequence with progress bar. Shift-click forces re-run of all. Sequence order by Y-axis position.
- **"Duplicate shot cluster"**: Right-click output node → duplicates it + direct upstream Prompt/Camera/Image Output, preserving shared Style/Character connections.
- **"Send sequence" from Preview**: Sequence-aware send to Editing with cut/dissolve/dipToBlack/fadeInOut transitions between adjacent clips.
- **Templates updated**: 6 templates (Single Shot, Image to Video, Three Shot Scene, Character Scene, Short Film Structure, Interview + B-roll). Character Scene now uses Prompt instead of Script+Combiner. All descriptions rewritten for clarity.

### Storyboard → Workspace Handoff

- **No hardcoded auto-attach**: `buildWorkspaceFromStoryboard` no longer falls back to the first style/character. If user doesn't pick one, no style/character nodes are created.
- **"Send to Workspace" opens picker wizard**: One-click button opens `StoryboardImportWizard` modal. User picks which frames + which style/character/action (or none). Style/character default to "— None —".
- **Storyboard assets imported as real project assets**: Each selected generation is imported as a `ProjectAsset` with `assetId` + `status="completed"` on the Image Output node. Send-to-Editing works immediately.
- **Camera config carries over**: The composer's camera config is passed to every shot's Camera node in the workspace graph.

### Storyboard Composer

- **"Generation type" segmented control**: Primary control above the prompt (Style/Storyboard/Character/None) with icons. Replaces the buried "Card type" in the Output submenu.
- **Camera accordion section**: Full `CameraConfigGrid` (same UI as Director mode) in the composer tools menu. Camera config carries into every Workspace shot on Send to Workspace.
- **"Applied cards" renamed**: Was "Cards" — now clearly labeled as saved references you attach. Distinct from "Generation type" (what you're creating) and "Templates" (premade inspiration).
- **Prompt placeholder updates per card type**: Style → "Describe visual language, mood, palette...", Storyboard → "Describe a scene, shot, action...", etc.
- **ImageGeneration component**: Replaced old CardStack carousel + spinner with the 21st.dev-style shimmer + blurred reveal overlay. Single `aspect-video` card, no overlapping designs.

### Card Management

- **"My Cards" modal**: Button in workspace toolbar. Shows all saved Style/Character/Action cards from the project store with thumbnails + "Add to canvas" button.
- **"Create card" modal**: Create new Style/Character/Action cards with image upload. Accessible from workspace toolbar + from inside My Cards modal.
- **Card bridge**: When a UserCard is saved in Storyboard ("Add to Library"), it's also converted to a `StyleCard`/`Character` and pushed to the project store. Workspace nodes read from the project store — so saved cards appear in node dropdowns immediately.
- **`addActionCard`** added to project store (was missing — only `addStyleCard` and `addCharacter` existed).

### Editing Tab — Full Redesign

- **3-pane pro-style layout**: Preview + asset bin on left, clip inspector on right (320px), timeline as full-width bottom panel.
- **Real playback** via requestAnimationFrame with play/pause/skip/split/duplicate/delete transport controls.
- **Drag-to-move** clips between positions, **drag-to-trim** via edge handles.
- **Clip inspector**: Timing (start/duration), transform (scale/rotation/opacity/flip), audio (volume/fades), transition picker.
- **Zoom controls**: ZoomIn/ZoomOut + px/s readout. PIXELS_PER_SECOND is state, range 8–96.
- **Timeline**: Capped at `max-h-[40vh]` with internal scroll.

### Cleanup — Dead Code Removed

- **Deleted files**: `ShotList.tsx`, `ShotCard.tsx`, `shotPromptAssembly.ts`, `ScriptNode.tsx`, `CombinerNode.tsx`
- **Removed types**: `Shot`, `ShotList`, `Environment` interfaces + `ProjectSlot` fields (`shots`, `shotListTransitionType`, `workspaceView`, `environments`)
- **Removed store state/actions**: `environments`, `shots`, `shotListTransitionType`, `workspaceView`, `addShot`, `updateShot`, `deleteShot`, `duplicateShot`, `reorderShots`, `setShotListTransitionType`, `setWorkspaceView`, `demoEnvironments`
- **Removed from storyboardImport.ts**: `buildShotsFromStoryboard` + `BuildShotsInput` (dead — only `buildWorkspaceFromGraph` is used)
- **Updated graphRules.ts**: Removed `combiner` and `script` from suggested next node rules
- **Updated nodeGuides.ts**: Removed Script and Shot Builder guide entries (8 types remain)

### Infrastructure Fixes

- **Convex runtime error fixed**: `lib/convex.ts` no longer throws when `NEXT_PUBLIC_CONVEX_URL` is missing. Returns `null` instead. `DashboardProviders` skips Convex wrapper when null.
- **localStorage quota exceeded fixed**: `projectRepository.ts` strips data URLs from assets before persisting + wraps `setItem` in try/catch.
- **Smooth tab transitions**: Studio page wraps each tab in a keyed div with `studio-tab-fade-in` CSS animation (200ms ease-out fade + 6px slide).

### Node Guide + Tooltips

- **"Guide" button** in workspace toolbar opens `NodesGuideModal` showing all 8 node types with description, "Contributes to prompt", "When to use", and "Example" sections.
- **"?" tooltip** on every node header (via `createPortal` to document.body so it escapes `overflow-hidden`). Shows short summary + contributes + when-to-use.

### Verification

- `npx tsc --noEmit` — clean (zero errors)
- `npx vitest run` — 18/18 tests pass
- All 9 routes return HTTP 200
- Zero runtime errors in dev log

### New Files Created

- `components/ui/ai-chat-image-generation-1.tsx` — ImageGeneration shimmer+blur component
- `components/workspace/CreateCardModal.tsx` — Create Style/Character/Action cards
- `components/workspace/MyCardsModal.tsx` — View + add saved cards
- `components/workspace/NodesGuideModal.tsx` — Node guide modal
- `components/workspace/StoryboardImportWizard.tsx` — Send-to-Workspace picker wizard
- `components/workspace/SendToWorkspaceButton.tsx` — One-click send button
- `components/workspace/nodes/CameraConfigGrid.tsx` — Shared camera config grid
- `components/workspace/nodes/CompiledPromptPreview.tsx` — Expandable compiled prompt
- `components/workspace/nodes/ModelSelector.tsx` — Model dropdown + feature chips
- `components/workspace/nodes/NodeImageUploader.tsx` — Drag-drop image upload
- `lib/workspace/cardBridge.ts` — Convert UserCard → project store types
- `lib/workspace/modelRegistry.ts` — Extensible model registry
- `lib/workspace/nodeGuides.ts` — Node metadata for tooltips + guide
- `lib/workspace/upstreamSignature.ts` — Scoped recompute signature

### Remaining / Future Work

- Real AI provider integration (replace mock generation)
- Color grading UI, audio mixer, text overlays in Editing tab
- Third-party editor handoff
- Real Clerk authentication + Convex cloud sync
- Paddle payments + R2 cloud storage
