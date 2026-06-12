# FilmGen Storyboard Current State Report

Last reviewed: June 9, 2026

Status: Superseded historical snapshot. This report describes the pre-redesign Storyboard implementation. The active Storyboard tab was replaced on June 9, 2026 by the Image Generation Interface documented in `HANDOFF_CURRENT_STATUS.md`.

Purpose: this report documents the current Storyboard section of FilmGen Studio in detail so a redesign-focused AI agent can understand what exists, what is real, what is mocked, and what workflow assumptions are currently embedded in the UI.

Scope: this report covers only the Storyboard tab and its directly related local entities: style cards, characters, storyboard frames, storyboard stitches, and the local project-store behavior that supports them.

## 1. Executive Summary

The Storyboard tab is the default Studio entry point at `/studio?tab=storyboard`. It currently acts as a local-first preproduction workspace where the user can:

- See a project library with style cards and characters.
- Create new style cards through a full-screen Style Card Creator.
- Create new characters through a full-screen Character Creator.
- Add manual storyboard shots.
- Edit shot title, prompt, shot type, camera movement, and aspect ratio.
- Duplicate and delete shots.
- Switch between grid, list, and storyboard/stitch views.
- Build a local storyboard stitch payload and contact-sheet image from selected shots.

The Storyboard section is polished enough to communicate the intended product direction, but it is still a frontend demo. No paid AI call runs. No actual image generation runs. No cloud persistence runs. No Convex mutation runs. No upload/storage flow runs. No direct send-to-editor or send-to-workspace flow is currently active from shot cards.

The section's current purpose is best described as:

> A visual planning and creative-library prototype for AI film shots, where local demo data simulates style, cast, frames, generated imagery, and stitch preparation.

## 2. Where It Lives

Main route:

- `/studio?tab=storyboard`
- `/studio` also resolves to Storyboard by default.

Routing source:

- `app/(dashboard)/studio/page.tsx`

Main Storyboard components:

- `components/cards/storyboard/storyboard-workspace.tsx`
- `components/cards/storyboard/storyboard-frame-card.tsx`
- `components/library/style-card-creator.tsx`
- `components/library/character-creator.tsx`

State and types:

- `lib/stores/project.ts`
- `lib/stores/projectRepository.ts`
- `lib/types.ts`

Related docs/tests:

- `WORKSPACE_MODES.md`
- `tests/stores.test.ts`
- `STUDIO_CURRENT_STATE_REPORT.md`

## 3. Product Role In The Current Studio

The Storyboard section is positioned as the first step in the creative workflow.

The UI copy says:

- Badge: `Storyboard`
- Page title: `Shot pipeline`
- Description: `Plan each shot as a beat, camera setup, generated frame, then send it to workspace or editing.`

What this implies:

- Storyboard should be where shots are planned.
- Style cards and characters are supporting creative assets.
- Each shot should eventually be able to move downstream to Workspace or Editing.
- A generated frame is part of the intended shot lifecycle.

What is actually implemented:

- Shot planning is editable and local.
- Style and character creation are local demo flows.
- Generated frames are represented by gradients or seeded demo images.
- Stitching creates a local contact sheet and prompt payload.
- Sending shots to Workspace or Editing is not connected from the Storyboard frame cards.

## 4. Current Layout And Information Architecture

The Storyboard tab uses a two-region layout:

- Left: Library sidebar
- Right: Shot pipeline main area

Desktop layout:

- Uses a CSS grid with columns `280px` and `1fr`.
- Sidebar has right border.
- Main area has padding.

Mobile layout:

- Grid collapses to one column.
- Library appears above the main shot pipeline.
- Sidebar uses bottom border instead of right border.

Top-level component:

- `StoryboardWorkspace`

Local React UI state inside `StoryboardWorkspace`:

- `styleOpen`: whether Style Card Creator overlay is open.
- `characterOpen`: whether Character Creator overlay is open.
- `view`: current shot presentation mode, one of `grid`, `list`, `storyboard`.

Project state read from `useProjectStore`:

- `styleCards`
- `characters`
- `storyboardFrames`
- `storyboardStitches`

Project actions used:

- `addStoryboardFrames`
- `createStoryboardStitch`

## 5. Library Sidebar

The Library sidebar is the left rail of the Storyboard tab.

Header:

- Icon: `Library`
- Text: `Library`

Sections:

- Style Cards
- Characters
- Assets

Each section is rendered by the local `LibrarySection` helper in `storyboard-workspace.tsx`.

### Style Cards Section

Source data:

- `useProjectStore((state) => state.styleCards)`

Displayed count:

- Number of style cards in the current local project.

Add button:

- Opens `StyleCardCreator`.
- Uses an image-plus icon.

Empty state:

- `Create a visual style pack.`

Card display:

- Each style card appears as a `Card`.
- Top visual preview uses `card.generatedImages[0]` as CSS background.
- Body shows:
  - Style card name
  - Two-line clamped description

Important implementation note:

- Style cards are not grouped, searchable, reorderable, editable, or deletable from this sidebar.
- The sidebar only creates and displays them.

### Characters Section

Source data:

- `useProjectStore((state) => state.characters)`

Displayed count:

- Number of characters in the current local project.

Add button:

- Opens `CharacterCreator`.
- Uses a user-plus icon.

Empty state:

- `Create a cast member.`

Character display:

- Each character appears as a horizontal `Card`.
- Left visual swatch uses `character.portraitUrls[0]` as CSS background.
- Body shows:
  - Character name
  - Role badge

Important implementation note:

- Characters are not editable, deleteable, or searchable from this sidebar.
- Character portrait images are currently gradient swatches, not real generated portraits.

### Assets Section

Current behavior:

- The Assets section count is hardcoded to `0`.
- Its add action is a no-op: `onAdd={() => undefined}`.
- Empty copy says: `Demo assets are shown in the editing workspace.`

Important contradiction:

- The current project store does contain `assets`.
- Storyboard stitches create image assets.
- Demo seed project contains storyboard image assets and an audio asset.
- However, the Storyboard Library Assets section does not read or display `state.assets`.

Redesign implication:

- If a future Storyboard section needs to be a true production hub, the Assets section should likely become a real media bin or be removed to avoid false affordance.

## 6. Main Header And View Controls

The main area header contains:

- Badge: `Storyboard`
- Title: `Shot pipeline`
- Description about planning shots and sending to workspace/editing

Controls:

- View segmented control: `grid`, `list`, `storyboard`
- Disabled `PDF Disabled` button
- `Stitch` button
- `Add Shot` button

### View Segmented Control

Values:

- `grid`
- `list`
- `storyboard`

Current behavior:

- `grid` displays shot cards in a responsive card grid.
- `list` displays the same shot cards in a single-column grid.
- `storyboard` displays the stitch/sequence workflow.

Selected state:

- Cyan dim background and cyan text.

Important note:

- `list` is not a fundamentally different list component. It reuses the same `StoryboardFrameCard` component and just changes layout.

### PDF Disabled Button

Button state:

- Disabled.

Title attribute:

- `PDF export is intentionally absent from the frontend-only demo.`

Current meaning:

- PDF export is not implemented.
- It is visible as a placeholder/action hint.

Redesign implication:

- A production redesign should decide whether PDF export belongs in Storyboard at all, and if so, expose it as a real export workflow rather than a disabled demo label.

### Stitch Button

Behavior:

- Sets `view` to `storyboard`.
- Does not create a stitch by itself.

Visual:

- Secondary button with Sparkles icon.

### Add Shot Button

Behavior:

- Calls the local `addShot()` function in `StoryboardWorkspace`.
- Adds one new manual storyboard frame to project state.

Created frame shape:

- `id`: `shot-manual-${Date.now()}`
- `title`: `Shot ${frames.length + 1}`
- `prompt`: `Beat: describe the story moment. Prompt: subject, action, mood, lighting, and camera intent.`
- `shotType`: `Wide`
- `cameraMovement`: `Static`
- `aspectRatio`: `16:9`
- `referenceImages`: empty array

Important note:

- New shots do not create assets.
- New shots do not get an `imageUrl`.
- New shots do not trigger generation.
- New shots are immediately saved to local project memory through store subscription.

## 7. Empty State

If `storyboardFrames.length === 0`, the main area shows a large empty card.

Empty-state UI:

- Dashed card.
- Film icon in a cyan framed square.
- Heading: `Add your first shot to begin`
- Copy: `Build frames manually with static demo imagery and editable shot notes.`
- Add Shot button.

Meaning:

- This is an honest local-frame creation entry point.
- It does not suggest AI generation in the empty state.

## 8. Storyboard Frame Card

Main file:

- `components/cards/storyboard/storyboard-frame-card.tsx`

Props:

- `frame: StoryboardFrame`
- `index: number`

Project store actions used:

- `updateStoryboardFrame`
- `duplicateStoryboardFrame`
- `deleteStoryboardFrame`

### Card Structure

Each frame card has:

- Header
- Visual frame preview
- Shot metadata controls
- Prompt editor
- Reference image swatches
- Footer actions

### Header

Header contents:

- Shot number label: `SH-01`, `SH-02`, etc.
- Editable title input.
- GripVertical icon.

Title input behavior:

- Value is `frame.title`.
- On change, calls `updateStoryboardFrame(frame.id, { title: event.target.value })`.
- No save button is required.
- Changes persist locally via project-store subscription.

Grip icon behavior:

- The grip icon is visual only.
- There is no drag/reorder behavior implemented.

Redesign implication:

- The current UI hints that shots may be draggable, but the app does not support reordering.

### Visual Frame Preview

Aspect behavior:

- If `frame.aspectRatio === "9:16"`, uses portrait aspect `9/16`.
- Otherwise uses landscape `aspect-video`.

Image source:

- If `frame.imageUrl` exists, it is used as CSS background.
- If not, a cyan/amber/purple gradient fallback is used.

Hover overlay:

- On hover, a dark overlay appears.
- It contains a secondary icon button with Pencil icon.
- The button has aria-label `Edit prompt`.

Important limitation:

- The edit prompt button does not have an `onClick`.
- It is visually clickable but not functional.

### Shot Metadata Controls

There are four cells in a two-column grid:

- Shot type select
- Camera movement select
- Aspect ratio select
- Static status chip

Shot type options:

- Wide
- Medium
- Close-up
- Extreme Close-up
- POV

Camera movement options:

- Static
- Pan
- Tilt
- Zoom
- Dolly
- Handheld

Aspect ratio options:

- 16:9
- 9:16

Static status:

- Text: `Frame ready`
- This does not reflect any actual generation status.

Important limitation:

- Shot type and camera movement are free strings in the type model, but the UI offers fixed options.
- There is no support for custom shot type, lens, camera angle, duration, scene number, notes, or shot order metadata.

### Prompt Editor

Prompt textarea:

- Value is `frame.prompt`.
- On change, calls `updateStoryboardFrame(frame.id, { prompt: event.target.value })`.
- No explicit label is visible.
- No generation action is attached to the prompt field.

Behavior:

- Editing is immediate/local.
- Empty prompts are allowed.
- No validation or length limit exists at this UI layer.

Security note:

- This prompt is rendered as plain text in the UI.
- No AI provider receives it from the Storyboard tab today.

### Reference Images

If `frame.referenceImages.length > 0`, the card shows a horizontal strip of small swatches.

Current data:

- Seeded demo frames can reference style-card gradients or character portrait gradients.
- New manual frames start with no reference images.

Limitations:

- Users cannot add/remove references from the frame card.
- There is no file upload.
- There is no connection to the Style Cards or Characters UI from the frame card.

### Footer Actions

Left actions:

- Duplicate frame
- Delete frame

Right action:

- Disabled `Demo Shot` button

Duplicate behavior:

- Finds source frame by id.
- Creates a copy with:
  - New id `${source.id}-copy-${Date.now()}`
  - Title `${source.title} Copy`
- Inserts copy immediately after source frame.

Delete behavior:

- Filters the frame out of `storyboardFrames`.
- Does not remove any related assets or stitches.

Demo Shot behavior:

- Disabled.
- Title attribute says cross-workflow publishing is not connected in the frontend-only demo.

Important limitation:

- Deleting a frame does not clean up `storyboardStitches` that reference that frame.
- Deleting a frame does not remove storyboard assets created from that frame.
- There is no confirmation dialog for deleting a frame.

## 9. Grid, List, And Storyboard Views

### Grid View

Condition:

- `view === "grid"`

Layout:

- Responsive grid with gap.
- One column by default.
- Two columns at `md`.
- Three columns at `xl`.

Content:

- One `StoryboardFrameCard` per frame.
- Add Shot dashed tile at the end.

### List View

Condition:

- `view === "list"`

Layout:

- `grid gap-4`
- Single column.

Content:

- Same `StoryboardFrameCard` component.
- Add Shot dashed tile at the end.

Important note:

- List view is not a dense editorial shot list.
- It is simply a single-column card stack.

### Storyboard/Stitch View

Condition:

- `view === "storyboard"`

Component:

- Local nested `StitchedStoryboard` function in `storyboard-workspace.tsx`

Purpose:

- Select frames.
- Build a contact-sheet stitch.
- Prepare a provider-ready prompt payload.

## 10. Storyboard Stitch Workflow

The stitch workflow is the most AI-adjacent part of the Storyboard tab, but it is still local.

### Layout

Desktop layout:

- Two columns at `xl`:
  - Left: Sequence Strip
  - Right: AI Stitch Prep, fixed 360px

Mobile/tablet:

- Single-column stack.

### Local State

Inside `StitchedStoryboard`:

- `selectedIds`: initialized to all current frame ids.
- `feedback`: default `Keep panel continuity, readable cinematic framing, and clear shot order.`
- `title`: default `Stitched Storyboard`

Latest stitch:

- `const latest = stitches[0]`
- The UI only previews the most recent stitch.

Important limitation:

- If frames change after the view mounts, `selectedIds` does not automatically include new frames unless toggled/added in that session flow.

### Sequence Strip

Header:

- Title: `Sequence Strip`
- Copy: `Select shots, stitch a contact sheet, then prepare a provider-ready AI storyboard prompt.`
- Add Shot button

Frame display:

- Horizontal scroll container.
- Each frame is a 288px-wide card.
- Displays shot number, included/skipped toggle, image, title, and clamped prompt.

Selection behavior:

- Clicking `Included`/`Skipped` toggles the frame id in `selectedIds`.
- Included frames have cyan border.
- Skipped frames have subtle border and opacity 55%.

Important implementation detail:

- The order used by `createStoryboardStitch` is the order of `state.storyboardFrames`, filtered by selected ids.
- It does not preserve the click order of selection.

### AI Stitch Prep Panel

Header:

- `AI Stitch Prep`

Copy:

- `Provider-ready mock for a future image model adapter. No paid API call runs here.`

Inputs:

- Title input.
- Feedback textarea.

Problematic label:

- Feedback label is currently `Feedback / Prompt Injection`.
- This is a security-sensitive phrase and should likely be renamed during redesign.

Build button:

- Text: `Build Stitch Payload`
- Disabled if no frames are selected.
- Calls `onCreate({ frameIds: selectedIds, title, feedback })`.

Latest output:

- If `latest` exists:
  - Shows stitch image preview.
  - Shows readonly textarea with prompt payload.

## 11. What Create Storyboard Stitch Does

Main store method:

- `createStoryboardStitch` in `lib/stores/project.ts`

Input:

- `{ frameIds: string[]; title: string; feedback: string }`

Behavior:

1. Reads current project state.
2. Selects frames whose ids are included in `input.frameIds`.
3. Returns `null` if no frames are selected.
4. Creates a `StoryboardStitch`.
5. Creates a corresponding `ProjectAsset`.
6. Prepends the stitch to `storyboardStitches`.
7. Prepends the asset to `assets`.
8. Returns the stitch.

Created stitch fields:

- `id`: `stitch-${Date.now()}`
- `frameIds`: selected frame ids in storyboard order
- `title`: trimmed input title or `Storyboard Stitch`
- `feedback`: raw input feedback
- `imageUrl`: local canvas contact sheet data URL
- `promptPayload`: generated text payload
- `createdAt`: current ISO timestamp

Created asset fields:

- `id`: `asset-${stitch.id}`
- `source`: `storyboard`
- `type`: `image`
- `name`: stitch title
- `prompt`: stitch prompt payload
- `url`: stitch image URL
- `thumbnailUrl`: stitch image URL
- `duration`: `Math.max(3, selectedFrames.length * 2)`
- `createdAt`: stitch timestamp

Important limitation:

- The created asset is visible in project state and counted by the Editing placeholder, but the Storyboard Assets sidebar does not show it.

## 12. Stitch Prompt Payload

Main helper:

- `stitchPromptPayload(frames, feedback)`

The payload text includes:

- Provider adapter target: NanoBanana 2 compatible storyboard image generation.
- Instruction to create a polished storyboard contact sheet.
- Instruction to preserve shot order, continuity, character identity, camera intent, and aspect ratio notes.
- User feedback if present.
- One line per panel:
  - Panel number
  - Frame title
  - Shot type
  - Camera movement
  - Aspect ratio
  - Frame prompt

Important limitation:

- This is a text payload only.
- No model call happens.
- No validation/sanitization happens before storing it locally.
- The helper references NanoBanana 2, which is roadmap/provider language, not an active API call.

## 13. Contact Sheet Generation

Main helper:

- `createContactSheetDataUrl(frames)`

Runtime:

- Browser-only canvas.

Fallback:

- If `document` is undefined, returns a gradient string.

Canvas dimensions:

- Panel width: 320
- Panel height: 240
- Padding: 24
- Columns: min 3, based on frame count
- Rows: based on frame count

Rendering behavior:

- Draws a dark background.
- For each frame, draws a cyan/dark/amber gradient panel.
- Draws a black caption band.
- Writes:
  - `SH-XX frame.title`
  - `frame.shotType / frame.cameraMovement`

Important limitation:

- It does not draw the actual frame image.
- It does not use `frame.imageUrl`.
- It does not use reference images.
- The contact sheet is a stylized local placeholder, not a true visual stitch.

## 14. Style Card Creator

Main file:

- `components/library/style-card-creator.tsx`

Opened from:

- Storyboard Library > Style Cards add button.

Overlay:

- Full-screen fixed overlay.
- Top bar with close button.
- Desktop two-column layout.
- Scrolls vertically.

Left column:

- Reference Slot card.
- Add Reference button.
- Reference swatch grid if references exist.
- Description textarea.
- Style chips.
- Card Name input.
- Error message.
- Save button.

Right column:

- 3x3 grid of generated-looking gradient images.
- Extracted Keywords card.
- Fixed color palette swatches.

Style chips:

- Cinematic
- Noir
- Ethereal
- High Contrast
- Pastel
- Cyberpunk
- Western
- Horror
- Documentary

Palette:

- `#00E5FF`
- `#FFB800`
- `#9B59FF`
- `#151515`
- `#F0F0F0`

Validation:

- Requires card name.
- Requires style description.

Saved style card:

- `id`: `style-${Date.now()}`
- `name`: input name
- `description`: input description
- `referenceImages`: local gradient swatches
- `generatedImages`: nine local gradients
- `keywords`: first six tokens from description
- `mood`: fixed `Dark / Dramatic / Cinematic`
- `palette`: fixed palette
- `primaryReference`: first reference swatch

What is real:

- It creates a local style card in the active project.
- The card becomes available in:
  - Storyboard library
  - Amateur Workspace style selector
  - Director Workspace Style Card node

What is mocked:

- Reference upload.
- Style extraction.
- Image generation.
- Mood inference.
- Palette extraction.

## 15. Character Creator

Main file:

- `components/library/character-creator.tsx`

Opened from:

- Storyboard Library > Characters add button.

Overlay:

- Full-screen fixed overlay.
- Top bar with close button.
- Desktop two-column layout.
- Scrolls vertically.

Left column:

- Portrait reference placeholder.
- Name input.
- Role select.
- Physical Description textarea.
- Style Association chips.
- Error message.
- Save button.

Right column:

- Portrait preview grid, one per emotion.

Role options:

- Hero
- Villain
- Supporting
- Narrator

Emotion labels:

- Neutral
- Happy
- Angry
- Fearful

Validation:

- Requires character name.
- Role defaults to Hero.
- Description is optional.

Saved character:

- `id`: `character-${Date.now()}`
- `name`: input name
- `role`: selected role
- `description`: input description
- `emotions`: fixed emotions
- `portraitUrls`: local gradient portraits
- `styleCardIds`: selected style cards

What is real:

- It creates a local character in the active project.
- The character becomes available in:
  - Storyboard library
  - Director Workspace Character node

What is mocked:

- Portrait upload.
- Character generation.
- Emotion sheet generation.
- Identity consistency.

## 16. Storyboard Data Types

Relevant interfaces in `lib/types.ts`.

### StyleCard

Fields:

- `id`
- `name`
- `description`
- `referenceImages`
- `generatedImages`
- `keywords`
- `mood`
- `palette`
- `primaryReference?`

### Character

Fields:

- `id`
- `name`
- `role`
- `description`
- `emotions`
- `portraitUrls`
- `styleCardIds`

### StoryboardFrame

Fields:

- `id`
- `title`
- `prompt`
- `shotType`
- `cameraMovement`
- `aspectRatio`: `16:9` or `9:16`
- `referenceImages`
- `imageUrl?`

### ActionCard

Fields:

- `id`
- `title`
- `beat`
- `subject`
- `action`
- `emotion`

Important note:

- Action cards exist in project state and are used in Workspace, but the current Storyboard UI does not provide an Action Card creator or editor.

### StoryboardStitch

Fields:

- `id`
- `frameIds`
- `title`
- `imageUrl`
- `feedback`
- `promptPayload`
- `createdAt`

### ProjectAsset

Storyboard-relevant fields:

- `source`: can be `storyboard`
- `type`: image/video/audio
- `name`
- `prompt`
- `thumbnailUrl`
- `url`
- `duration`
- `storyboardFrameId?`

## 17. Demo Seed Data

The default local project is `Neon Signal Demo`.

Seed style cards:

- `Neon Rain Noir`
- `Solar Western`

Seed characters:

- `Mira Vale`
- `Orren Pike`

Seed action card:

- `Market Crossing`

Seed storyboard frames:

- `Market Reveal`
- `Signal Close-Up`
- `Rooftop Choice`

Seed assets:

- `Market Reveal`, image asset from storyboard.
- `Signal Close-Up`, image asset from storyboard.
- `City Night Bed`, audio asset from storyboard.

Seed timeline:

- The demo editing state uses the seeded storyboard image/audio assets to create clips.

Important implication:

- The default Storyboard feels richer than a new project because demo data already contains cards, frames, assets, and timeline clips.
- A new empty project starts with no style cards, no characters, no frames, no assets, and default editing tracks.

## 18. Persistence And Project Isolation

Storyboard state is stored inside the active `ProjectSlot`.

Persisted per project:

- Style cards
- Characters
- Action cards
- Storyboard frames
- Storyboard stitches
- Assets
- Editing state
- Workspace memory

Storage mechanism:

- Browser localStorage via `projectRepository`.

Storage key:

- `filmgen-local-projects`

Project cap:

- Five local projects.

Project switching:

- Saves current project before switching.
- Restores target project's storyboard arrays and other state.

Current limitations:

- No cloud sync.
- No Convex persistence.
- Clearing browser storage loses the data.
- Different browsers/devices do not share project state.

## 19. Connections To Other Studio Sections

### Storyboard To Workspace

Implemented:

- Style cards created in Storyboard are selectable in:
  - Amateur Workspace style strip.
  - Director Style Card nodes.
- Characters created in Storyboard are selectable in:
  - Director Character nodes.

Not implemented:

- No direct send-frame-to-workspace action.
- No action-card creator in Storyboard.
- No per-shot graph generation from a storyboard frame.

### Storyboard To Editing

Implemented:

- Seed storyboard assets appear in the demo editing state.
- Storyboard stitch creates an image asset.
- Editing placeholder counts all project assets.

Not implemented:

- `Demo Shot` button is disabled.
- No direct add-shot-to-timeline action from a frame.
- No editor media bin in Storyboard.
- No generated frame-to-clip flow.

### Storyboard To Gallery/Challenges

Implemented:

- No direct connection.

Not implemented:

- No publish storyboard.
- No challenge submission from storyboard.
- No gallery preview from storyboard.

## 20. Current UI Copy Inventory

Important visible strings:

- `Library`
- `Style Cards`
- `Characters`
- `Assets`
- `Create a visual style pack.`
- `Create a cast member.`
- `Demo assets are shown in the editing workspace.`
- `Storyboard`
- `Shot pipeline`
- `Plan each shot as a beat, camera setup, generated frame, then send it to workspace or editing.`
- `grid`
- `list`
- `storyboard`
- `PDF Disabled`
- `Stitch`
- `Add Shot`
- `Add your first shot to begin`
- `Build frames manually with static demo imagery and editable shot notes.`
- `Frame ready`
- `Demo Shot`
- `Sequence Strip`
- `Select shots, stitch a contact sheet, then prepare a provider-ready AI storyboard prompt.`
- `AI Stitch Prep`
- `Provider-ready mock for a future image model adapter. No paid API call runs here.`
- `Feedback / Prompt Injection`
- `Build Stitch Payload`

Copy concerns:

- `Prompt Injection` should be renamed.
- `generated frame` in the header implies a feature that is not active.
- `send it to workspace or editing` implies downstream actions that are not connected.
- `Frame ready` implies status but is static.
- `Demo Shot` is disabled and reveals demo limitations.
- `Assets` section has a count of zero even when project assets exist.

## 21. UX Strengths

The current Storyboard section does a few things well:

- It gives the user an obvious first step: add a shot.
- It visually separates creative library assets from shot planning.
- Style and character creators are easy to discover.
- Shot cards have clear editable fields.
- Aspect ratio changes affect the card preview shape.
- Stitch mode communicates sequence/continuity thinking.
- Local state makes the prototype feel persistent.
- The UI already supports empty and seeded project states.

## 22. UX Weaknesses

Workflow issues:

- There is no true shot lifecycle from idea to generated image to video to timeline.
- Style cards and characters are not attachable to a specific shot in the frame card UI.
- Action cards exist in state but are absent from the Storyboard UI.
- The disabled `Demo Shot` button blocks the implied downstream workflow.
- Stitching creates an asset, but the Storyboard tab does not show assets.
- The visual edit pencil has no action.
- Grip icon implies drag ordering, but reordering is not implemented.

Information architecture issues:

- `grid`, `list`, and `storyboard` are presentation modes, but `storyboard` actually means stitch workflow.
- The Library sidebar may become overloaded if assets, style, characters, actions, props, locations, references, and generated media are all added.
- The current shot card lacks hierarchy for story beat versus generation prompt versus camera metadata.

Data/model issues:

- Shot order is array order only.
- No explicit shot number field exists.
- No scene/sequence grouping exists.
- No frame status exists.
- No generation job id exists.
- No asset linkage exists except optional `storyboardFrameId` on assets.
- No style/character/action ids are attached to `StoryboardFrame`.

Visual issues:

- Many previews are gradients, so the product intent can feel more abstract than cinematic.
- Cards are dense but still not a production shot list.
- Sidebar cards are useful but not actionable beyond viewing.

## 23. Redesign Questions To Resolve

A redesign agent should answer these before changing the UI:

- Is Storyboard the canonical place where a film sequence is built?
- Should every shot have a structured schema: beat, prompt, style, character, action, camera, references, output, status?
- Should style cards, characters, and action cards be attached per shot?
- Should the user generate an image from a storyboard frame directly?
- Should generated images become project assets automatically?
- Should every generated image/video output have a visible status and history?
- Should frames be draggable/reorderable?
- Should shots be grouped by scene, act, sequence, or project?
- Should Stitch be a mode, a command, or a separate review/export panel?
- Should the Library sidebar become a full media/creative asset browser?
- Should "Storyboard" include action cards, props, locations, wardrobe, or camera presets?
- Should `list` be a real production shot list with columns and bulk actions?
- Should the disabled PDF/export/demo buttons be removed until implemented?

## 24. Recommendations For A Future Storyboard Redesign

High-value product changes:

- Create a real shot lifecycle: Draft -> Ready to Generate -> Generating -> Image Ready -> Video Ready -> In Timeline.
- Add per-shot links to style card, characters, action card, references, and output assets.
- Replace static `Frame ready` with real shot status.
- Replace disabled `Demo Shot` with a real primary action or remove it.
- Make shot reordering real if the grip remains.
- Rename `storyboard` view to `Stitch` or `Sequence` if it remains focused on contact-sheet creation.
- Rename `Feedback / Prompt Injection` to something like `Stitch Guidance`.
- Show real project assets in the sidebar or remove the placeholder Assets section.
- Add an explicit "Generate frame" action only when backend/provider wiring is real or clearly marked as local mock.
- Let users add reference images to individual shots.
- Consider a true shot detail drawer instead of cramming all shot editing into cards.

Backend-aware changes:

- Do not call AI providers from the client.
- Use validated API/Convex/Railway flows for generation.
- Store output media as project assets.
- Keep R2/Convex storage rules from `AGENTS.md`.
- Add owner checks and Convex persistence before production use.

## 25. What Is Safe To Preserve

The following concepts are good foundations:

- Storyboard as the default planning tab.
- Local style cards and characters as project-level creative library items.
- Editable shot cards.
- Fast Add Shot action.
- A sequence/contact-sheet concept.
- Local project isolation.
- 16:9 and 9:16 aspect support.
- Responsive grid/list layout.

## 26. What Should Be Treated As Placeholder

Treat these as placeholders, not final product behavior:

- Gradient generated images.
- Static style extraction.
- Static portrait/emotion generation.
- Hardcoded Assets count of zero.
- Disabled PDF button.
- Disabled Demo Shot button.
- Visual-only edit pencil.
- Visual-only grip icon.
- `Frame ready` status.
- Contact sheet canvas that does not use actual frame images.
- NanoBanana 2 prompt payload without actual provider call.

## 27. Bottom Line

The Storyboard section is currently a strong visual prototype of a preproduction workflow, but it is not yet a complete AI storyboard pipeline.

For redesign, the central job is to turn it from a set of attractive local cards into a coherent shot-production system:

- Define what a shot is.
- Define how creative library items influence a shot.
- Define how a shot generates images/videos.
- Define where outputs are stored.
- Define how outputs move into editing.
- Define what users see at each status.

Once that workflow is clear, the UI can be redesigned around the real user journey instead of the current demo affordances.
