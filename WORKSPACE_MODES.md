# Workspace Modes And Local Project Memory

FilmGen has two workspace modes: Amateur and Director. Both modes are stored per local project, and each user can keep up to five projects in their browser.

## Local Project Memory

Project memory is stored locally in the browser so it does not create server or database costs for the app owner.

- Project metadata, storyboard data, workspace graphs, and editor state are saved in local browser storage.
- Imported image, video, and audio blobs are saved in IndexedDB.
- Memory is isolated per project: switching projects restores that project storyboard, workspace, assets, and timeline.
- The limit is five local projects.
- This memory is not cloud synced. A different browser, device, or cleared browser storage will not have the same projects.

## Amateur Mode

Amateur mode is a guided linear workflow for users who do not want to think in node graphs.

The workflow is:

1. Style Card
2. Action Card
3. Camera
4. Prompt
5. Image or Video Output
6. Preview / Send to Editor

The user chooses a style card, picks the action/beat, reviews the camera setup, writes the shot prompt, chooses image or video, then sends the prepared output into the editor. The mode intentionally keeps the screen simple and avoids freeform connections.

## Director Mode

Director mode is the freeform node editor. It is for users who want precise control over how story, style, character, camera, prompt, script, image, video, and preview nodes connect.

Director nodes:

- Style Card: visual language, mood, palette, references.
- Action Card: beat, subject, action, and emotional intent.
- Character: cast member identity and role.
- Camera: lens, movement, angle, aperture, and fps.
- Prompt: shot prompt text.
- Script: dialogue, narration, or story text.
- Combiner: merges upstream creative inputs.
- Image Output: still-frame generation target.
- Video Output: motion-generation target.
- Preview: final review node for assembled output notes.

## Director Node Connections

Allowed connection flow:

- Style Card can feed Action Card, Character, Prompt, Camera, Combiner, Image Output, or Video Output.
- Action Card can feed Camera, Prompt, Combiner, Image Output, or Video Output.
- Character can feed Action Card, Prompt, Combiner, Image Output, or Video Output.
- Prompt can feed Camera, Combiner, Image Output, Video Output, or Script.
- Camera can feed Combiner, Image Output, Video Output, or Preview.
- Script can feed Prompt, Combiner, Video Output, or Preview.
- Combiner can feed Image Output, Video Output, or Preview.
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

## Storyboard Stitching

Storyboard stitching creates a local contact sheet from selected shots. The stitch workflow preserves shot order and stores a provider-ready prompt payload for a future image-generation adapter such as NanoBanana 2.

Current behavior:

- Selected storyboard shots are assembled into a local contact sheet.
- User feedback is included as prompt guidance.
- The generated prompt payload is saved with the stitch.
- The stitch is saved as an image asset for the editor.
- No paid AI call runs in this implementation.
