# FilmGen Studio Current State Report

Last reviewed: June 9, 2026

Status: Partially superseded historical snapshot. The Storyboard sections in this report describe the pre-redesign implementation; the active Storyboard tab was replaced on June 9, 2026 by the Image Generation Interface documented in `HANDOFF_CURRENT_STATUS.md`.

Purpose: this report describes the current Studio area in enough detail for a redesign-focused AI agent to understand what exists today before changing the workflow, IA, UI, or product model.

Source of truth: this report reflects the current local worktree in `C:\Users\USER\Documents\FilmGenV1`, including the recent removal of the visible Export tab and active FreeCut editor embed. It describes the implementation as it exists now, not the future roadmap.

## 1. Executive Summary

FilmGen Studio is currently a frontend-first, local-state AI film creation demo. It is not yet a fully connected production studio.

The main Studio route is `/studio`. The visible Studio tabs are:

- Storyboard
- Cinema Workspace
- Editing
- Gallery
- Challenges

The default tab is Storyboard. Tabs are controlled by the `tab` query parameter, for example `/studio?tab=workspace`. Invalid tab values fall back to Storyboard.

The Studio has a real UI, real local state, local project switching, editable storyboard frames, a React Flow node workspace, a guided amateur composer, a native editor placeholder, a streaming-style gallery, and a challenge/voting demo. However, AI generation, cloud persistence, credits, payments, uploads, workers, and real editing/export are not connected yet.

Current high-level product truth:

- The Studio is branded visually as `CINE STUDIO` in the logo, while app metadata and docs call the product FilmGen.
- State is stored with Zustand and browser localStorage.
- Media blob helpers exist for IndexedDB, but most visible media is static demo data or remote Unsplash imagery.
- Convex is wired as a provider shell, but Studio UI does not use live Convex queries or mutations yet.
- API generation/upload/export routes validate payloads and return 501 stub responses.
- The Editing tab is intentionally a native FilmGen placeholder. FreeCut is no longer served or embedded in the root Studio.

## 2. Key Files To Read First

Route shell:

- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/studio/page.tsx`
- `app/(dashboard)/studio/_components/studio-top-nav.tsx`
- `app/(dashboard)/studio/settings/page.tsx`

Core state:

- `lib/types.ts`
- `lib/stores/project.ts`
- `lib/stores/projectRepository.ts`
- `lib/stores/workspace.ts`
- `lib/stores/gallery.ts`
- `lib/stores/challenges.ts`

Main Studio tabs:

- `components/cards/storyboard/storyboard-workspace.tsx`
- `components/cards/storyboard/storyboard-frame-card.tsx`
- `components/workspace/WorkspaceCanvas.tsx`
- `components/workspace/AmateurWorkspace.tsx`
- `components/editor/EditorPlaceholder.tsx`
- `components/gallery/GalleryTab.tsx`
- `components/challenges/ChallengesTab.tsx`

Workspace graph logic:

- `components/workspace/NodePalette.tsx`
- `components/workspace/PropertiesPanel.tsx`
- `components/workspace/CustomEdge.tsx`
- `components/workspace/nodes/*`
- `lib/workspace/graphRules.ts`
- `lib/workspace/promptAssembly.ts`

Design system:

- `app/globals.css`
- `tailwind.config.ts`
- `components/ui/*`
- `components/brand-logo.tsx`

Tests and handoff docs:

- `tests/stores.test.ts`
- `tests/workspace.test.ts`
- `WORKSPACE_MODES.md`
- `HANDOFF_CURRENT_STATUS.md`

## 3. Entry, Auth, And Shell

The public landing page is `/`. It presents FilmGen Studio as an AI film creation tool with three pillars: Storyboard, Workspace, and Editing. The landing CTA routes to Clerk sign-up/sign-in.

The dashboard layout protects Studio routes:

- In normal mode, `app/(dashboard)/layout.tsx` calls `currentUser()` from Clerk server APIs. If no user exists, it redirects to `/sign-in`.
- In local demo mode, when placeholder Clerk keys are detected and `NODE_ENV !== "production"`, the layout injects a demo identity: `demo@filmgen.local`.
- The root layout only wraps with `ClerkProvider` when the publishable key is not the dummy placeholder.

Middleware protects:

- `/studio(.*)`
- `/api/generate(.*)`
- `/api/export(.*)`
- `/api/worker(.*)`

Important auth caveat:

- Local demo auth is only for UI review.
- It is not production auth.
- In production with placeholder Clerk configuration, protected routes redirect to a sign-in configuration error.

## 4. Studio Routing

`app/(dashboard)/studio/page.tsx` is a client component that reads `useSearchParams()`.

Tab resolution:

- Valid tab list comes from `studioTabs` in `lib/types.ts`.
- Current value is resolved from `?tab=...`.
- Unknown tabs resolve to `"storyboard"`.
- The active tab is also pushed into `useProjectStore().activeTab`.

The page waits until client mount before showing tab content. Before mount it shows a boot/loading surface:

- Centered card
- "Loading Studio"
- "Restoring local project memory."
- Animated cyan loading bar

Every tab is wrapped in `StudioErrorBoundary`, which catches rendering errors and displays:

- "Studio could not load"
- The error message
- A reload button

## 5. Top Navigation UX

The top nav is sticky at the top and has a fixed height from `--nav-height` currently `52px`.

Desktop layout:

- Left: compact `CINE STUDIO` brand logo linking to `/studio?tab=storyboard`
- Center: pill-shaped tab nav
- Right: project menu, mobile menu button hidden on desktop, notifications button, user menu

Desktop tabs:

- Storyboard
- Cinema Workspace
- Editing
- Gallery
- Challenges

The active tab uses a Framer Motion `layoutId="tab-indicator"` cyan pill background.

Project menu:

- Visible as a pill showing the active project name.
- Opens a dropdown with local projects.
- Shows "Account-ready projects X/5".
- Each project row shows name, sync status, and version.
- Users can select, rename, or delete projects.
- Delete is disabled when only one project exists.
- New project is disabled at five projects.

Project rename UX:

- Rename starts via the edit icon.
- The active row becomes an input with save and cancel icon buttons.
- Rename only commits when the save icon is clicked.

Mobile navigation:

- Below `md`, desktop tabs are hidden.
- A hamburger button opens a dropdown panel.
- Mobile panel includes all Studio tabs with icons.
- Mobile panel includes project selection and New project.
- This satisfies the current rule that Studio tabs and project selection must be accessible on mobile.

Other top nav details:

- Notifications button is visible on `sm` and up. It is a visual-only dummy; no notification panel exists.
- User menu contains Profile display, Settings, and Sign out or Leave demo.
- Settings routes to `/studio/settings`.

## 6. Data And State Model

The Studio's active state is local-first.

Primary project store:

- File: `lib/stores/project.ts`
- Library: Zustand
- Browser persistence: `projectRepository` using localStorage key `filmgen-local-projects`
- Max local projects: 5
- If no projects exist in localStorage, the store seeds `Neon Signal Demo`.

Project repository:

- File: `lib/stores/projectRepository.ts`
- LocalStorage wrapper
- Handles JSON parse failure by returning an empty list
- Slices loaded/saved project arrays to max project count

Project slot shape includes:

- `id`
- `projectId`
- `name`
- `ownerId`
- `updatedAt`
- `version`
- `syncStatus`
- `styleCards`
- `characters`
- `actionCards`
- `storyboardFrames`
- `storyboardStitches`
- `assets`
- `cameraConfig`
- `editingState`
- `workspaceMode`
- `workspaceMemory`

Project switching:

- Before switching, the current project is rebuilt from the active in-memory store.
- The current project's workspace memory is also captured.
- The target project's storyboard, assets, editing state, workspace mode, and workspace memory are restored.
- Workspace memory is pushed into `useWorkspaceStore`.

Autosave behavior:

- `useProjectStore.subscribe(...)` saves the active project into localStorage on store changes.
- `useWorkspaceStore.subscribe(...)` also saves the active project whenever workspace state changes.
- The UI labels this as saved/local memory, but there is no cloud sync.

Demo seed project:

- Name: `Neon Signal Demo`
- Style cards: `Neon Rain Noir`, `Solar Western`
- Characters: `Mira Vale`, `Orren Pike`
- Action card: `Market Crossing`
- Storyboard frames: `Market Reveal`, `Signal Close-Up`, `Rooftop Choice`
- Assets: two storyboard image assets and one demo audio asset
- Editing state: seeded video, audio, and overlay clips
- Workspace mode: director

New project behavior:

- New project name is `Project N`.
- New project starts empty.
- Workspace mode defaults to amateur.
- Editing state starts with default tracks and no clips.

IndexedDB media helper:

- File: `lib/storage/indexedDb.ts`
- DB name: `filmgen-local-media`
- Store name: `blobs`
- Exposes save/load/createObjectUrl helpers.
- The visible Studio mostly uses demo gradients/remote image URLs, but this helper is ready for local media blobs.

## 7. Current Type Model

Core Studio types live in `lib/types.ts`.

Current tab union:

- `storyboard`
- `workspace`
- `editing`
- `gallery`
- `challenges`

Current workspace node types:

- `styleCard`
- `actionCard`
- `character`
- `prompt`
- `cameraConfig`
- `imageOutput`
- `videoOutput`
- `combiner`
- `script`
- `preview`

Current workspace modes:

- `amateur`
- `director`

Current project asset types:

- `image`
- `video`
- `audio`

Timeline basics:

- Track types: `video`, `audio`, `overlay`
- Clip types: `video`, `image`, `audio`, `overlay`
- Transitions: `cut`, `dissolve`, `wipe`, `dipToBlack`, `fadeInOut`

Editor support types already exist for color grading, audio studio, text overlays, timeline clips, transitions, and tool windows. The visible editor UI does not expose most of these yet.

## 8. Visual Design System

The app uses a dark cinematic theme.

Global styling:

- File: `app/globals.css`
- Body font: DM Sans
- Heading font: Syne
- Color scheme: dark
- Primary background: near black
- Main accent: cyan
- Secondary accents: amber, purple, green, red
- Scrollbars are very thin and dark
- `@xyflow/react` stylesheet is imported globally

Important CSS variables:

- `--bg: #080808`
- `--bg-surface: #111111`
- `--bg-elevated: #1a1a1a`
- `--accent-cyan: #00E5FF`
- `--accent-amber: #FFB800`
- `--accent-purple: #9B59FF`
- `--nav-height: 52px`
- `--radius-sm: 4px`
- `--radius-md: 8px`
- `--radius-lg: 12px`
- `--radius-xl: 16px`

Common UI patterns:

- Dark cards and panels
- Cyan selected states
- Uppercase Syne labels
- Pills for segments and tags
- Thin borders
- Lucide icons
- Full-screen overlays for creators/modals
- CardStack hero interactions in Gallery and Challenges
- React Flow grid canvas in Director mode

Potential redesign note:

- The current UI is cohesive but very dark/cyan-heavy. A redesign should consciously decide whether to preserve the "cinematic control room" feel or move toward a clearer production workflow language.

## 9. Storyboard Tab

Main file: `components/cards/storyboard/storyboard-workspace.tsx`

Purpose today:

- Manage project creative assets for preproduction.
- Create visual style cards.
- Create characters.
- Create and edit storyboard frames.
- Create a local storyboard stitch payload/contact sheet.

Layout:

- Full height under top nav.
- Desktop two-column grid:
  - Left sidebar: Library
  - Main area: Shot pipeline
- Mobile collapses to one column, with Library above main content.

Library sidebar:

- Header: Library
- Style Cards section:
  - Shows count.
  - Add button opens Style Card Creator.
  - Each style card is a card with a visual gradient preview, title, and description.
- Characters section:
  - Shows count.
  - Add button opens Character Creator.
  - Each character row shows portrait swatch, name, and role badge.
- Assets section:
  - Currently count is hardcoded to 0.
  - Empty message says demo assets are shown in editing workspace.
  - It does not display real project `assets`.

Main header:

- Badge: Storyboard
- Title: Shot pipeline
- Supporting text: "Plan each shot as a beat, camera setup, generated frame, then send it to workspace or editing."

Header controls:

- Segmented view switch: `grid`, `list`, `storyboard`
- `PDF Disabled` button, disabled with a title explaining PDF export is absent
- `Stitch` button, switches view to storyboard
- `Add Shot` button

Empty state:

- If no frames exist, a large dashed card says "Add your first shot to begin".
- Add Shot creates a manual frame with a default prompt.

Grid/list frame behavior:

- Uses `StoryboardFrameCard`.
- Grid view uses responsive cards: 1 column, then 2, then 3.
- List view still maps the same cards in a single grid column.
- An extra dashed Add Shot tile appears after existing frames.

Storyboard frame card:

- Header shows shot number, editable title input, and grip icon.
- Image area uses `imageUrl` if present, otherwise a gradient placeholder.
- Hover overlay contains an edit icon button, but this button has no connected edit action.
- Controls:
  - Shot type select: Wide, Medium, Close-up, Extreme Close-up, POV
  - Camera movement select: Static, Pan, Tilt, Zoom, Dolly, Handheld
  - Aspect ratio select: 16:9 or 9:16
  - Static "Frame ready" status chip
- Prompt textarea edits `frame.prompt`.
- Reference image swatches render if frame has references.
- Footer:
  - Duplicate button
  - Delete button
  - `Demo Shot` button disabled with a note that cross-workflow publishing is not connected.

Add Shot behavior:

- Adds a frame to `storyboardFrames`.
- New frame id: `shot-manual-${Date.now()}`
- Title: `Shot ${frames.length + 1}`
- Prompt: default instructional text
- Shot type: Wide
- Camera movement: Static
- Aspect ratio: 16:9
- No reference images

Duplicate/delete behavior:

- Duplicate inserts a copy after the original and appends `Copy` to the title.
- Delete removes the frame.

## 10. Storyboard Stitching

The storyboard view is a local mock of a future AI stitch flow.

Visible UI:

- Sequence Strip panel
- AI Stitch Prep side panel

Sequence Strip:

- Horizontal strip of storyboard frames.
- Each frame card shows shot number, included/skipped toggle, image, title, and prompt.
- Included frames have cyan border.
- Skipped frames are dimmed.
- Add Shot button exists inside this view.

AI Stitch Prep:

- Title input, default `Stitched Storyboard`
- Feedback textarea, default continuity guidance
- Button: `Build Stitch Payload`
- Latest stitch preview appears after creation
- Latest prompt payload appears in a readonly textarea

What `Build Stitch Payload` does:

- Calls `createStoryboardStitch` in `useProjectStore`.
- Collects selected frames.
- Creates a local `StoryboardStitch`.
- Builds a provider-ready text payload referencing NanoBanana 2 compatibility.
- Creates a contact sheet locally using browser canvas.
- Saves the stitch in `storyboardStitches`.
- Saves a generated image asset in `assets`.

What it does not do:

- It does not call an AI model.
- It does not upload to cloud storage.
- It does not create a Convex record.
- It does not enqueue a job.

Important wording issue:

- The UI label says "Feedback / Prompt Injection". For a production redesign, this wording should probably be changed because "prompt injection" has security meaning.

## 11. Style Card Creator

Main file: `components/library/style-card-creator.tsx`

The Style Card Creator is a full-screen overlay.

Opening:

- Triggered from the Storyboard Library Style Cards add button.

Layout:

- Top bar with title and close icon.
- Two-column desktop layout.
- Left column: input workflow.
- Right column: preview outputs and extracted metadata.

Inputs:

- Reference Slot card with Add Reference button.
- Add Reference creates a static gradient swatch.
- Description textarea.
- Keyword chips append words to the description:
  - Cinematic
  - Noir
  - Ethereal
  - High Contrast
  - Pastel
  - Cyberpunk
  - Western
  - Horror
  - Documentary
- Card Name input.

Validation:

- Requires name and description.
- Shows error if missing.

Saved style card:

- Id: `style-${Date.now()}`
- Name from input
- Description from input
- Reference images from local swatches
- Generated images are nine static gradients
- Keywords are first six words from description
- Mood is fixed: `Dark / Dramatic / Cinematic`
- Palette is fixed cyan/amber/purple/dark/white
- Primary reference is first reference

Current limitations:

- No file upload.
- No AI style extraction.
- No real image generation.
- No persistence beyond local project memory.
- Generated preview images are gradients, not model outputs.

## 12. Character Creator

Main file: `components/library/character-creator.tsx`

The Character Creator is also a full-screen overlay.

Opening:

- Triggered from the Storyboard Library Characters add button.

Layout:

- Top bar with title and close icon.
- Two-column desktop layout.
- Left column: character inputs.
- Right column: portrait preview grid.

Inputs:

- Name input.
- Role select:
  - Hero
  - Villain
  - Supporting
  - Narrator
- Physical Description textarea.
- Style Association chips based on existing style cards.

Validation:

- Requires name.
- Description is optional.

Saved character:

- Id: `character-${Date.now()}`
- Name, role, description from inputs
- Emotions fixed to Neutral, Happy, Angry, Fearful
- Portrait URLs are static gradients
- Style card ids from selected style chips

Current limitations:

- No image upload.
- No identity consistency generation.
- No actor sheet generation.
- No Convex persistence.

## 13. Cinema Workspace Tab

Main file: `components/workspace/WorkspaceCanvas.tsx`

The Cinema Workspace tab supports two modes:

- Amateur mode
- Director mode

The active mode comes from project state and workspace state.

Current defaults:

- Seed demo project starts in Director mode.
- Newly created empty projects start in Amateur mode.

Mode switching:

- Both modes have a small segmented switch between amateur/director.
- Switching calls `setWorkspaceMode` in the project store, which also updates the workspace store.

## 14. Amateur Workspace Mode

Main file: `components/workspace/AmateurWorkspace.tsx`

Purpose:

- A guided linear composer for users who do not want to work with node graphs.
- It compresses style, action, camera, prompt, model, duration, quality, and references into one surface.

Overall layout:

- Full-height scrolling page.
- Very cinematic hero-like center area.
- Fixed desktop tool rail on the left.
- Top selection strip.
- Large prompt composer at bottom.

Desktop side tool rail:

- Select
- Add
- Image reference
- Video reference

Top selection panel:

- Mode switch: amateur/director
- Style strip:
  - Uses project style cards.
  - Defaults to first style if no amateur state selection exists.
  - Shows fallback `Style Auto` when empty.
- Scene/action strip:
  - Uses project action cards.
  - Defaults to first action card.
  - Shows fallback `Action Auto` when empty.
- Liked button:
  - Visual-only.
  - No state is connected.

Hero content:

- Eyebrow: `Cinema Studio 3.5`
- Main prompt: `What would you shoot with infinite budget?`
- Prompt chips:
  - Genre from style mood
  - Style name
  - Camera lens

Composer:

- Output type vertical toggle:
  - image
  - video
- Prompt textarea with placeholder about using `@` to add entities.
- Model segmented controls:
  - Seedance 2.0, supports video
  - Kling, supports video
  - Ray 3.14, supports image and video
  - Modify, supports image and video
- Timing segmented controls:
  - 5s
  - 10s
  - 15s
- Quality segmented controls:
  - 480p
  - 720p
  - 1080p
- Add image and Add video reference buttons.
- Reference chips can be removed by clicking them.

Output-type behavior:

- Switching to image removes video references.
- Video references are disabled in image mode.
- Model is auto-resolved to a compatible fallback.
- Image fallback model is Ray 3.14.
- Video fallback model is Seedance 2.0.

Reference behavior:

- References are not real uploads.
- They are local demo objects using `demo://image/...` and `demo://video/...` sources.
- Add image/video cycles through static reference names.

Prompt assembly:

- A hidden readonly textarea contains the assembled amateur prompt for accessibility/testing.
- Assembly includes style, action, output type, model, duration, quality, camera, references, and prompt text.

Prepare button:

- Does not call an AI API.
- Calls `addMediaClipToTimeline`.
- Adds a generated-looking clip directly to editing state.
- For image output, the clip gets a gradient URL.
- For video output, URL may be undefined.
- The generated media is not saved as a project asset by this action.

Current limitations:

- No real generation.
- No queue/job creation.
- No credits.
- No model/provider abstraction is called.
- No actual upload/reference file picker.
- "Liked" is not functional.
- The prompt mentions `@` entities, but no autocomplete exists.

## 15. Director Workspace Mode

Main file: `components/workspace/WorkspaceCanvas.tsx`

Purpose:

- A freeform node graph for directors who want explicit creative control.
- Built with `@xyflow/react`.

Overall layout:

- Left node palette.
- Main React Flow canvas.
- Floating top-left controls.
- Floating workspace switcher.
- MiniMap and Controls from React Flow.
- Status bar.
- Optional context menu.
- Optional properties panel.

Node palette:

- File: `components/workspace/NodePalette.tsx`
- Width is 172px desktop, compressed icon/text rail on mobile.
- Addable node types:
  - Style Card
  - Action
  - Character
  - Prompt
  - Camera
  - Image
  - Video
  - Combiner
  - Script
  - Preview

Canvas controls:

- Mode switch amateur/director.
- Fit view button.
- Workspace tabs:
  - Demo Board
  - Scratch
- Each workspace tab displays node count.
- Eraser button clears the active workspace.

React Flow behavior:

- Drag nodes.
- Connect handles.
- Pan/zoom.
- Fit view on initial render if nodes exist.
- Delete key removes selected elements through React Flow.
- Min zoom: 0.2
- Max zoom: 1.4
- Default edge type: custom animated cyan edge.

Workspace slots:

- Stored in `useWorkspaceStore`.
- Seeded workspaces:
  - `Demo Board`, with demo nodes and edges.
  - `Scratch`, empty.
- Switching workspaces restores that workspace's nodes, edges, and viewport.
- Clearing a workspace removes nodes/edges and resets viewport.

Demo board:

- Style node: Neon Rain Noir
- Character node: Mira Vale
- Prompt node: Market Reveal Prompt
- Camera node: 35mm Dolly
- Preview node: Shot Preview
- Edges connect style/character to prompt, prompt/camera to preview.

Selection behavior:

- Clicking a node selects it.
- Clicking pane clears selection and context state.
- Selecting a node can show "Next" suggestions.

Next-node suggestions:

- Floating panel shows after selecting a node if rules exist.
- Collapsed state shows "Next" and number of suggestions.
- Expanded state shows suggested node buttons.
- Choosing a suggestion creates the new node to the right of selected node and connects it.

Context menu:

- Right-click canvas:
  - Add any node type
  - Fit View
  - Select All
- Right-click node:
  - Duplicate
  - Delete
  - Pin
- Right-click edge:
  - Disconnect
  - Delete Edge

Pin behavior:

- Toggles `data.pinned` on the node.
- No visible pinned styling appears beyond stored data in current UI.

Status bar:

- Shows node count.
- Shows edge count.
- Shows Saved/Saving.
- Shows last saved label.
- `Session only` is used as a local autosave label.

Properties panel:

- File: `components/workspace/PropertiesPanel.tsx`
- Opens from the info icon in a node header.
- Desktop slides from right, width 320px.
- Mobile slides from bottom, height 44vh.
- Closes on outside click or close button.
- Editable fields:
  - Label
  - Output notes textarea
- Readonly fields:
  - Status
  - Node Type

## 16. Director Node Types

All node components use `BaseNode`.

Base node:

- File: `components/workspace/nodes/BaseNode.tsx`
- Fixed width 248px by default.
- Header with icon, label, info/properties button, status dot.
- Target handle on left.
- Source handle on right.
- Footer displays run status label.
- Status labels:
  - Idle
  - Queued
  - Generating
  - Completed
  - Error

Style Card node:

- Selects a project style card.
- Displays selected style description.
- Empty message tells user to create a style card in Storyboard.

Character node:

- Selects a project character.
- Displays role and description.
- Empty message tells user to create a character in Storyboard.

Action Card node:

- Selects a project action card.
- Defaults visually to first action card if none selected.
- Displays action beat.
- If actionCards is empty, select has no options.

Prompt node:

- Textarea for shot prompt.

Script node:

- Textarea for scene beats or dialogue.

Camera Config node:

- Larger than other nodes: 620px wide, max 80vw.
- Uses four visual columns:
  - Camera
  - Lens
  - Focal Length
  - Aperture
- It maps camera body choice into `camera.movement`.
- It maps lens choice into `camera.lens`.
- It maps focal length into `camera.angle` as a string like `35mm`.
- It maps aperture into `camera.aperture`.
- This is visually rich but semantically odd because `movement` currently stores camera body and `angle` stores focal length.

Combiner node:

- Static text explaining it merges upstream style, character, prompt, and camera signals.
- No actual merge action is triggered in the UI.

Image Output node:

- Placeholder output preview.
- Footer says Demo.
- Displays `data.output` or "Static image output preview".

Video Output node:

- Placeholder output preview.
- Footer says Demo.
- Displays `data.output` or "Static video output preview".

Preview node:

- Placeholder final preview.
- Displays `data.output` or "Connected outputs preview here".

## 17. Director Graph Rules

Main file: `lib/workspace/graphRules.ts`

Allowed outgoing connections:

- Style Card can feed Action Card, Character, Prompt, Camera, Combiner, Image Output, or Video Output.
- Action Card can feed Camera, Prompt, Combiner, Image Output, or Video Output.
- Character can feed Action Card, Prompt, Combiner, Image Output, or Video Output.
- Prompt can feed Camera, Combiner, Image Output, Video Output, or Script.
- Camera can feed Combiner, Image Output, Video Output, or Preview.
- Combiner can feed Image Output, Video Output, or Preview.
- Script can feed Prompt, Combiner, Video Output, or Preview.
- Image Output can feed Video Output or Preview.
- Video Output can feed Preview.
- Preview is terminal.

Connection validation rejects:

- Missing source/target
- Self connections
- Duplicate source-target pairs
- Missing endpoint nodes
- Invalid source/target node type pairs
- Cycles

User feedback:

- Invalid connection attempts show a clickable amber notice near the top center.

Prompt assembly:

- File: `lib/workspace/promptAssembly.ts`
- Walks upstream from a selected node and collects connected style, character, action, camera, prompt, and script data.
- Produces a newline-separated prompt.
- This is covered by tests, but there is no visible Director UI button that runs generation or shows assembled prompt output today.

## 18. Editing Tab

Main file: `components/editor/EditorPlaceholder.tsx`

Purpose today:

- Honest native editor placeholder.
- Shows project timeline state without pretending to be a complete editor.
- Confirms FreeCut has been removed from this root Studio surface.

Important behavior:

- On mount, checks service worker registrations.
- If a registration scope exactly matches `${window.location.origin}/freecut-editor/`, it unregisters it.
- This cleans up legacy FreeCut service worker state.

Main layout:

- Max width 7xl.
- Desktop grid:
  - Main editing area
  - Right sidebar, 320px

Header:

- Eyebrow: Editing
- Project name from `useProjectStore().projectName`
- Copy says the editor tab is open for the native FilmGen editor and FreeCut has been removed.
- Duration pill computed from timeline clips.

Preview placeholder:

- Large bordered black/surface area.
- Aspect-video placeholder with film icon.
- Text:
  - "Native editor placeholder"
  - "Media playback and editing controls will attach here in the editor phase."

Controls row:

- Disabled play button.
- Disabled audio button.
- Decorative progress bar.
- Text: "Controls pending"

Timeline shell:

- Title: Reserved track layout.
- Shows number of clips.
- Renders first four tracks from editing state.
- Default tracks:
  - Video V1
  - Video V2
  - Audio A1
  - Graphics O1
- Each track row displays clips positioned by start/duration percentages.
- Empty tracks show "Empty".

Right sidebar:

- Project Media card:
  - Total asset count
  - Image count
  - Video count
  - Audio count
- Native Editor card:
  - Reserved status
  - Preview surface reserved
  - Timeline shell reserved
  - Render bridge reserved

Current limitations:

- No playback.
- No trim/move UI.
- No media import UI in editor tab.
- No export.
- No actual canvas/video processing.
- No MediaBunny or ffmpeg integration active in the root Studio.
- No iframe.
- No FreeCut public bundle.

## 19. Timeline And Editing State Under The Hood

Main files:

- `lib/editor/timeline.ts`
- `lib/editor/transitions.ts`
- `lib/editor/playback.ts`
- `lib/editor/colorGrade.ts`
- `lib/media/assets.ts`

Default editing state:

- Tracks: Video V1, Video V2, Audio A1, Graphics O1
- Clips: empty in new projects
- Transitions: empty
- Playhead: 0
- Playback state: idle
- Timeline zoom: 1
- Playback speed: 1
- Preview volume: 100
- Master volume: 80
- Color grading defaults exist
- Audio studio defaults exist
- Text overlay defaults exist

Timeline utilities support:

- Create tracks
- Create clips
- Add/update/delete clips
- Duplicate clips
- Split clips
- Move clips
- Trim clips
- Reorder tracks
- Resolve clip start without overlap
- Snap times

The editor placeholder currently only visualizes part of this state.

## 20. Gallery Tab

Main files:

- `components/gallery/GalleryTab.tsx`
- `lib/stores/gallery.ts`
- `components/ui/card-stack.tsx`

Purpose today:

- Streaming-platform style showcase of demo/generated films.
- Demonstrates browsing, details, mock playback, share, and add-to-project behavior.

Data source:

- Static local `galleryVideos` array.
- Remote Unsplash images for thumbnails and heroes.
- Models represented in data:
  - Seedance 2.0
  - Kling
  - Ray 3.14
  - Modify

Top hero:

- Uses selected featured video.
- Full-width background image with dark gradient overlay.
- Shows FilmGen Gallery eyebrow, title, synopsis, duration/genres/year/model.
- Buttons:
  - Play
  - More Info
- Right side uses CardStack with up to six videos.
- CardStack can auto-advance and has dots/arrows.
- Changing CardStack updates featured video.

Rows:

- Continue Watching
- Top Picks
- AI Generated
- Challenge Winners
- Recently Added

Each row:

- Horizontal scroll list.
- Left/right scroll buttons.
- Video cards with thumbnail, duration, title, and genres.
- Clicking a card opens detail modal.

Detail modal:

- Full overlay dialog.
- Focuses modal on open.
- Escape closes.
- Tab focus is trapped.
- Hero background.
- Shows style name, title, synopsis, metadata pills.
- Actions:
  - Play
  - Add to Project
  - Share
- Actor cards/tags displayed as chips.
- Related films row based on overlapping genre.

Add to Project:

- Calls `importAsset` in project store.
- Creates a video asset with:
  - id `gallery-${video.id}-${Date.now()}`
  - source `workspace`
  - type `video`
  - name from video title
  - prompt from synopsis
  - thumbnail URL
  - url `demo://gallery/${video.id}`
  - duration parsed from duration string
- Marks video as added in gallery store.
- This persists in the local project asset list through project store subscription.

Share:

- Builds URL `${origin}/studio?tab=gallery&video=${video.id}`
- Copies it to clipboard if available.
- Marks share state as copied.
- The Gallery tab currently does not read the `video` query param to auto-open that video.

Player overlay:

- Full-screen-ish modal.
- Simulates loading for 1.2 seconds.
- Simulates progress while playing.
- Displays background hero image, play/pause state, completion state.
- Controls:
  - Play/Pause
  - Progress range
  - Volume range
  - Quality select
  - Fullscreen toggle state
- Keyboard:
  - Escape closes
  - Space toggles play/pause
  - ArrowRight/ArrowLeft scrub progress
  - ArrowUp/ArrowDown change volume
  - F toggles fullscreen state

Current limitations:

- No real video stream.
- No saved watch progress beyond local component state.
- No real sharing backend.
- Add to Project imports a demo asset, not downloadable media.
- Gallery store itself is not persisted.

## 21. Challenges Tab

Main files:

- `components/challenges/ChallengesTab.tsx`
- `lib/stores/challenges.ts`
- `components/ui/card-stack.tsx`

Purpose today:

- Challenge discovery, previous winners showcase, voting demo, leaderboard, and local project submission modal.

Data source:

- Static local `filmChallenges` array.
- Static local `challengeSubmissions` array.
- Remote Unsplash images.

Initial selected challenge:

- `cyberpunk-noir`

Top hero:

- Full-width selected challenge hero image with dark overlay.
- Eyebrow: Active Challenge
- Title and description.
- Metrics:
  - Deadline
  - Prize credits
  - Entrants
- Prize placement text.
- Submit Project button opens submission modal for current challenge.

Previous winners area:

- CardStack of winner/shortlisted submissions.
- Auto-advances.
- Active winner details panel under the stack.
- Shows status, title, creator, vote count, and description.

Lower layout:

- Left/main:
  - Challenge Grid
  - Voting Panel
- Right:
  - Leaderboard

Challenge Grid:

- Shows all challenges.
- Challenge statuses:
  - Open
  - Voting
  - Judging
  - Closed
- Clicking a challenge changes selected challenge.
- Open challenges show Submit button.
- Closed/judging/voting challenges can still be selected.

Voting Panel:

- Shows submissions for selected challenge.
- Sort modes:
  - Most Voted
  - Newest
  - Random
- Upvote button:
  - Disabled after local vote.
  - Increments vote count in local Zustand store.
- Shortlisted submissions show a "Jury shortlist" chip.

Leaderboard:

- Winner announcement card.
- Top 10 ordered by vote count.

Submission Modal:

- Dialog with focus trap and Escape close.
- Select project from local project list.
- Submission title input, defaulting to current project name.
- Description textarea.
- Thumbnail chooser with three fixed Unsplash options.
- Acknowledgement checkbox required.
- Confirm Submission button disabled until acknowledged.
- One local submission per challenge enforced by `submittedChallengeIds`.

Submit behavior:

- Creates local submission with creator `You`.
- Uses selected project name if title is blank.
- Uses fallback description if blank.
- Starts with 1 vote.
- Prepends to submissions.
- Marks challenge as submitted locally.
- Closes modal.

Countdown behavior:

- `formatCountdown` compares challenge deadline against `Date.now()`.
- Deadlines before the current time show `Closed`.
- As of June 9, 2026, the `retro-future` deadline of June 8, 2026 is past even though its status is `Judging`; this is expected in current mock data.

Current limitations:

- No backend voting.
- No fraud prevention.
- No real project media submission.
- No upload.
- No moderation.
- No challenge ownership.
- Challenge store is not persisted.

## 22. Settings Page

Main file: `app/(dashboard)/studio/settings/page.tsx`

Purpose today:

- Simple frontend-only settings placeholder.

Layout:

- Sidebar/top nav with sections:
  - Account
  - Notifications
  - Demo Defaults
  - Appearance
- On desktop, sidebar is left column.
- On mobile, section nav becomes horizontal scroll.

Visible content:

- Heading: Settings
- Copy: "Frontend-only account and presentation preferences for the demo."
- Account card:
  - Display Name input, default `Director`
  - Email input, default `director@studio.com`
- Demo Build card:
  - Explains no backend, subscriptions, credits, API keys, or cloud services are connected.

Current limitations:

- Only Account content is visible.
- Section buttons do not switch content.
- Inputs are uncontrolled and not persisted.

## 23. Cross-Workflow Connections That Exist

Storyboard to Workspace:

- Style cards created in Storyboard are selectable in Director Style Card nodes and Amateur style strip.
- Characters created in Storyboard are selectable in Director Character nodes.
- Action cards exist in project state and are selectable in Director Action Card nodes and Amateur scene strip.
- There is no direct "send this storyboard frame to workspace" action connected.

Storyboard to Editing:

- Storyboard stitch creates an image asset and saves it to project `assets`.
- Demo seed assets are visible in Editing placeholder counts.
- Storyboard frame `Demo Shot` button is disabled.
- There is no active publish-to-editor control from a frame card.

Workspace to Editing:

- Amateur `Prepare` adds a clip directly to editing timeline state.
- Director output nodes do not currently add assets or clips.
- Prompt assembly exists as a utility but is not connected to generation UI.

Gallery to Project:

- Gallery detail modal `Add to Project` imports a video asset into project assets.
- The Editing placeholder will count that asset.
- There is no visible "add gallery asset to timeline" UI in Gallery or Editing.

Challenges to Project:

- Submission modal reads local project list.
- It can submit current/local project metadata into local challenge store.
- It does not upload or publish actual project media.

Editing to anything:

- Editing tab is a placeholder.
- It does not export, publish, or update Gallery/Challenges.

## 24. Backend And API Boundary

Studio-facing backend work is mostly stubbed.

Generation routes:

- `app/api/generate/route.ts`
- `app/api/generate/image/route.ts`
- `app/api/generate/video/route.ts`

Behavior:

- Require Clerk auth.
- Validate request bodies with Zod.
- Return `501` with stub job/status fields.
- Do not call AI providers.
- Do not create Convex jobs.
- Do not check credits.
- Do not enqueue Railway workers.

Upload route:

- `app/api/upload/route.ts`
- Requires Clerk auth.
- Validates file metadata.
- Returns `501`.
- Does not generate upload URLs.

Export route:

- Exists as API stub, but visible Studio Export tab has been removed.

Convex:

- Provider shell exists in dashboard.
- Schema and generated types exist.
- Frontend Studio still reads/writes local Zustand, not Convex.

Payments/credits:

- No visible credits balance in Studio.
- Project store tests assert no `credits` or `generatedMedia` state in the frontend demo store.

## 25. Current UX Strengths

The current Studio is useful as a visual prototype because:

- It has a complete top-level IA with five tabs.
- The Storyboard tab gives a concrete preproduction workflow.
- Style and Character creators give the user visible creative-library affordances.
- Director mode communicates node-based creative assembly well.
- Amateur mode offers a simpler guided path.
- Gallery and Challenges provide a broader platform/community feel.
- Local project memory makes the demo feel stateful.
- Mobile nav exposes tabs and project selection.
- The editor placeholder is honest about current implementation.

## 26. Current UX Problems And Redesign Risks

Major workflow issues:

- The product has multiple disconnected creation metaphors: storyboard cards, amateur composer, director graph, gallery streaming, challenge submissions, and editor timeline.
- "Prepare" in Amateur mode adds a timeline clip, but does not create a project asset or run generation.
- Director mode has output nodes but no generation/run button.
- Storyboard frames imply send-to-workspace/editing, but the visible send button is disabled.
- Gallery can add assets, but there is no visible way to manage or use them in Editing.
- Challenges can submit projects, but submissions are local metadata only.
- Settings exists but is not functional.

Major implementation truth gaps:

- No real AI generation.
- No credits.
- No queues.
- No upload.
- No cloud project persistence.
- No real editor.
- No export.
- No real auth behavior in local demo mode.

Content/label issues:

- `CINE STUDIO` brand name conflicts with FilmGen naming.
- "Cinema Studio 3.5" appears in Amateur mode but is not explained elsewhere.
- "Prompt Injection" appears as a label in Storyboard stitching and should be renamed before production.
- "Account-ready projects" appears in project menu, but projects are browser-local only.
- `PDF Disabled`, `Demo Shot`, and native editor placeholder copy expose demo status directly.

Mobile risks:

- Mobile nav exists, but full tab-by-tab redesign should still be verified at 375px.
- Director mode on mobile compresses node palette but React Flow plus properties panel may still be heavy.
- Gallery/Challenges heroes are large and visually rich; redesign should verify row visibility and scroll behavior.

Accessibility notes:

- Many buttons have aria labels.
- Gallery and Challenge modals trap focus.
- Gallery player has keyboard controls.
- Some controls are disabled with only title tooltips, which may not be enough for touch/mobile.
- Decorative images often use empty `alt`, which is appropriate for background-like images but should be reviewed.

## 27. Non-Negotiable Constraints For Redesign Agents

Do not assume the planned backend is active.

Current source of truth:

- Local Zustand stores remain the active frontend source of truth until Convex mutations/queries are implemented.

Editor constraint:

- The Editing tab is intentionally a native placeholder after FreeCut removal.
- Do not reintroduce FreeCut, MediaBunny, ffmpeg.wasm, or another active editor without human approval.

Mobile constraint:

- Studio tabs must stay accessible below the `md` breakpoint.
- Project selection must stay accessible on mobile.
- Test at 375px before committing UI changes.

Security constraints:

- Do not expose API keys in public env vars.
- Do not call AI providers from client-side code.
- Do not add wildcard `postMessage`.
- Do not skip Clerk/Convex ownership checks when backend work begins.
- Do not use local demo auth as production auth.

Architecture constraints:

- Vercel API routes should validate/delegate, not run long AI work.
- AI generation should run in Railway workers or Convex actions per the locked architecture.
- BullMQ should not be called directly from Vercel routes.
- Credit modification must be internal on the backend.

## 28. Suggested Redesign Framing

If a redesign agent is asked to rethink Studio, the first product decision should be the core creation flow.

Today the implied flow is:

1. Start in Storyboard.
2. Create style cards and characters.
3. Add/edit shots.
4. Optionally stitch storyboard frames.
5. Move to Cinema Workspace.
6. Use Amateur or Director mode to prepare image/video generation.
7. Add prepared media to the editor timeline.
8. Edit in the native editor.
9. Publish to Gallery or submit to Challenges.

But only pieces of this are actually connected.

A clearer redesigned flow might need to decide:

- Is Storyboard the main source of truth, or is the Workspace graph?
- Should Amateur and Director be separate modes or one adaptive workflow?
- Should project assets have a central media bin visible across all tabs?
- Should generation happen from frames, nodes, or the composer?
- Should Editing be a separate phase or always visible as timeline/media state?
- Should Gallery and Challenges be creation destinations or discovery/community spaces?
- How should projects move from local demo memory to Convex-backed persistence?

## 29. Current Implementation Inventory By Tab

Storyboard:

- Implemented as editable local UI.
- Creates style cards, characters, frames, and stitches.
- Stitches become image assets.
- No real generation.

Cinema Workspace:

- Implemented as two-mode UI.
- Amateur can add clips to editing state.
- Director can create/connect/edit graph nodes.
- No real generation/run.

Editing:

- Placeholder only.
- Visualizes project timeline and asset counts.
- No active editor.

Gallery:

- Implemented as local streaming-style demo.
- Can import demo video assets into project.
- Mock player only.

Challenges:

- Implemented as local challenge/voting/submission demo.
- Can submit local project metadata.
- No backend.

Settings:

- Placeholder only.
- Inputs not persisted.

## 30. Bottom Line For The Next AI Agent

Treat the current Studio as a polished interactive prototype with local state, not as a production workflow.

The redesign should preserve only the parts that support the desired future workflow. The most important thing to fix is not visual polish alone. The important problem is workflow coherence: how a user moves from idea, to style/cast, to shots, to generation, to media assets, to editing, to publishing or challenge submission.

Any redesign plan should explicitly map:

- Where creative intent is authored.
- Where generation is triggered.
- Where outputs are stored.
- How outputs enter the timeline.
- What Studio mode a beginner sees first.
- What advanced/director control looks like.
- Which state remains local and which moves to Convex.
- What is honest placeholder UI versus production-ready behavior.
