# Director Workspace And Local Project Memory

FilmGen now uses a single Director workspace in the Workspace tab. The previous Amateur mode has been retired because its guided generation workflow is covered by the Storyboard image/video generation surface.

## Local Project Memory

Project memory is stored locally in the browser so it does not create server or database costs for the app owner.

- Project metadata, Storyboard v2 generation data, Director workspace graphs, and editor state are saved in local browser storage.
- Imported image, video, and audio blobs are saved in IndexedDB.
- Memory is isolated per project: switching projects restores that project Storyboard v2 generations/cards, Director workspace graph, assets, and timeline.
- The limit is five local projects.
- This memory is not cloud synced. A different browser, device, or cleared browser storage will not have the same projects.

## Director Workspace

Director workspace is the freeform node editor. It is for users who want precise control over how story, style, character, camera, prompt, script, image, video, and preview nodes connect.

Director nodes:

- Style Card: visual language, mood, palette, references.
- Action Card: beat, subject, action, and emotional intent.
- Character: cast member identity and role.
- Camera: lens, movement, angle, aperture, and fps.
- Prompt: shot prompt text.
- Script: dialogue, narration, or story text.
- Shot Builder: merges upstream creative inputs before a generation target.
- Image Output: still-frame generation target with local mock run, generated asset preview, download, and send-to-Editing actions.
- Video Output: motion-generation target with local mock run, poster preview, and send-to-Editing actions. If a direct Image Output feeds it, that image must be run first.
- Preview: terminal sequence review node that collects directly connected Image/Video Output nodes and can append ready assets to Editing.

Starter templates are available from the Director toolbar:

- Single Shot
- Image to Video
- Three Shot Scene
- Character Scene

These templates create complete runnable graphs instead of decorative demo layouts.

## Director Node Connections

Allowed connection flow:

- Style Card can feed Action Card, Character, Prompt, Camera, Combiner, Image Output, or Video Output.
- Action Card can feed Camera, Prompt, Combiner, Image Output, or Video Output.
- Character can feed Action Card, Prompt, Combiner, Image Output, or Video Output.
- Prompt can feed Camera, Combiner, Image Output, Video Output, or Script.
- Camera can feed Shot Builder, Image Output, or Video Output.
- Script can feed Prompt, Shot Builder, or Video Output.
- Shot Builder can feed Image Output or Video Output.
- Image Output can feed Video Output or Preview.
- Video Output can feed Preview.
- Preview is terminal.

The graph rejects duplicate connections, cycles, self-connections, and invalid source-target pairs.

## Prompt Assembly

Prompt assembly walks upstream from the selected output node and gathers connected inputs:

- Style cards contribute visual style, mood, and palette.
- Action cards contribute beat, subject, action, and emotion.
- Characters contribute role and description.
- Camera nodes contribute lens, movement, angle, aperture, and fps.
- Prompt nodes contribute direct shot instructions.
- Script nodes contribute scene or narration text.

This lets directors build complex prompts by connecting only the creative inputs that should influence a specific output.

## Local Director Runs

Director output nodes now run a fast local mock generation for workflow validation:

- The output node gathers upstream cards, characters, actions, camera settings, prompts, scripts, and source image context.
- The graph analyzer blocks empty/illogical runs, such as output nodes with no creative input, unselected connected card nodes, or video nodes that depend on an image output that has not been run yet.
- A successful run creates a lightweight `source: "workspace"` project asset, stores the assembled prompt on the node, renders a poster/thumbnail, and records `assetId` plus `lastRunAt`.
- Ready assets can be appended to the Editing timeline from the output node or from the Preview node.
- This is still local prototype behavior. Real provider execution must remain server/worker-side in the backend generation phase.

## Storyboard Image Generation Interface

The Storyboard tab is now the local-first image generation surface for visual development.

Current behavior:

- Users write a prompt, optionally select a built-in visual template, attach PNG/JPEG/WebP reference images, choose a card type, aspect ratio, and model.
- Built-in templates are optional inspiration. Selecting one updates the target card type and sends only the template ID to the API; provider prompt guidance is resolved server-side at runtime.
- Generate calls `POST /api/generate/image`, shows a loading overlay, and then saves a local simulated image result into the generation gallery.
- The API route validates auth, applies strict Zod validation, sanitizes the prompt, rate-limits locally at 3 requests per minute, validates reference images, resolves template guidance server-side from `templateId`, and returns a 501 stub until backend generation is wired.
- Generated images can be downloaded, deleted, selected, opened in a detail modal, or saved into My Style Cards, My Storyboards, or My Character Sheets.
- Storyboard v2 state persists with Zustand under `filmgen-storyboard-v2` and is keyed by project ID.
- No paid AI call runs in this implementation.
