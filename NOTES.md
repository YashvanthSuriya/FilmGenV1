# FilmGen Notes

## June 12, 2026 - Storyboard Side Rail + Single Launcher

- Moved the Image/Video toggle out of the top chip row and into a slim left-side rail so the composer reads more like a compact black-blue control panel.
- Kept template launch on the `+` button only, added a paperclip launcher for references, and removed the extra visible template/reference entry points.
- Made the hero preview mode-aware so only the latest three items for the active image or video lane appear in the stack.
- Restyled generated media cards with flatter black-blue shells, lighter overlays, and less visual weight in the footer controls.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`.

## June 12, 2026 - Storyboard Compact Picker Row

- Tightened the Storyboard composer so the launcher chips, prompt bar, and Generate button fit more comfortably at 100% zoom.
- Compressed the active `+` tools panel and made each section close after selection, so Mode, Templates, Cards, References, Model, and Output stay one-at-a-time and do not force extra scrolling.
- Preserved the existing shader/glass direction and the unified media gallery; this pass only reduced the footprint of the controls and menus.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`.

## June 12, 2026 - Storyboard Compact Create Console

- Reworked the Storyboard tab toward the compact reference direction: the flowing shader component is no longer mounted here, and the page now uses a static cyan-to-black gradient/grid background.
- Added Storyboard-local `Create` and `Media` subsections. Create keeps the generation experience focused; Media holds the searchable generated image/video library without changing the global Gallery tab.
- Replaced the old large latest-frame panel with the shared `CardStack` carousel from Gallery/Challenges, showing the latest three generated images when available and template fallback cards otherwise.
- Collapsed visible composer controls into small tabs and a compact bottom dock. Templates, cards, references, model, aspect/size, seconds, and card type now live behind the existing `+` tools menu; the visible Request preview control was removed.
- Preserved generation behavior: images can still be added to card libraries, videos remain generated-media outputs only, and applied card IDs remain client-safe context for future server-side runtime prompt assembly.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`. In-app browser verification could not complete because the browser client blocked both `127.0.0.1:3000` and `localhost:3000` with `net::ERR_BLOCKED_BY_CLIENT`.
- Follow-up fix: the Storyboard tools menu was moved to open upward, and the compact mode/model/aspect chips were kept as visible launch points so the options remain accessible within the viewport.

## June 11, 2026 - Storyboard Spacious Creation Canvas

- Reworked the Storyboard top section from a side-by-side dashboard into a full-height creation canvas: latest output is centered in open space, the prompt dock sits underneath, and the generated-media gallery starts below the first screen.
- The latest generated image/video now fills the entire preview card surface. Status, chips, prompt text, progress, and actions are layered as glass overlays instead of rendering an inset media card.
- The composer is now a wider prompt dock with softer glass, more breathing room, a less generic `Creation Prompt` framing, and the same existing mode/template/cards/reference/request/generate functionality.
- Gallery media cards now use the generated image/video as the entire card surface with overlaid glass metadata/actions, removing the separate footer block so the gallery matches the hero preview language.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`.

## June 11, 2026 - Storyboard Glass Poster Integration

- Reworked Storyboard mock poster artwork so generated image/video placeholders no longer render their own title band, `Generated Image`/`Generated Video` text, or heavy flat teal/gold blocks inside the media area.
- Mock generated media now renders as glass artwork only: translucent radial light, subtle grid texture, inner edge shine, soft glass circles, and shader-compatible cyan/purple/amber accents.
- Moved readability responsibility back to the surrounding UI. Hero metadata, gallery titles, chips, and actions remain outside the visual artwork, preventing clipped thumbnail text and duplicate labels.
- Restyled the generated-media gallery toolbar, card shells, icon buttons, card footers, and hero preview actions with lighter translucent glass surfaces instead of hard black/white blocks.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`.

## June 11, 2026 - Storyboard 100 Percent Density Fix

- Reduced the Storyboard interface scale so normal 100% browser zoom feels closer to the user's preferred 75% Chrome zoom without using global CSS zoom/transform hacks.
- Preserved the existing glassmorphism and Interactive Nebula shader; this pass only changed layout density, typography tiers, padding, max widths, and modal/player sizing.
- Tightened the top Storyboard console: lower hero minimum height, smaller `Latest frame` heading, smaller preview monitor, shorter composer prompt box, smaller controls/dropdowns, and smaller generated-media toolbar.
- Tightened media browsing surfaces: denser gallery cards, smaller chips/actions, smaller saved-card library modal, smaller generation detail/card detail modals, and a capped generated-video player width so it no longer fills the whole screen at 100% zoom.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`.
- Browser screenshot verification could not be repeated in this turn because the in-app browser rejected the local screenshot action under its URL policy; do not work around that policy with alternate browser automation.

## June 11, 2026 - Storyboard Gallery Scalability Polish

- Preserved the existing Storyboard glassmorphism and flowing Interactive Nebula shader background as requested.
- Added local-only starred/favorite state for generated Storyboard media, including a `Starred first` gallery sort option.
- Added comfort/compact gallery density controls so users can scan larger 20-50 item media libraries without changing the page's glass style.
- Reworked mock poster persistence so generated mock posters store compact `filmgen-poster:` tokens instead of large SVG data URLs; the UI now renders deterministic poster artwork at runtime from generation metadata.
- Updated hero preview, media gallery cards, generated video player, generation detail, and card detail surfaces so compact poster tokens never appear as broken image URLs.
- Kept videos as unified gallery/download/playback outputs only; they still cannot be saved into image card libraries.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run test`, and in-app browser checks on `/studio?tab=storyboard` for shader canvas presence, no generated-token broken images, density/star controls, no console errors, and no horizontal overflow.

## June 11, 2026 - Director Workspace Runnable Workflow

- Upgraded Director mode from a static node demo into a runnable local workflow surface. Image and Video Output nodes now assemble upstream prompt context, validate graph health, create lightweight `source: "workspace"` mock assets, show generated previews, expose downloads for generated posters/images, and can append ready assets to Editing.
- Added graph health checks for empty creative inputs, unselected connected card nodes, and image-to-video chains where the source Image Output has not been run yet.
- Reframed Combiner as Shot Builder and changed Preview into a terminal sequence collector for directly connected image/video output nodes.
- Added starter templates from the Director toolbar: Single Shot, Image to Video, Three Shot Scene, and Character Scene.
- Added a narrow migration for the legacy built-in five-node Demo Board so localStorage users get the new runnable eight-node demo without overwriting custom workspaces.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`.
- Browser verification passed on `http://127.0.0.1:3000/studio?tab=workspace`: the migrated Demo Board showed 8 nodes, Run Image/Run Video were visible, Run Video blocked until the connected Image Output was run, Image and Video runs created ready assets, all four templates appeared, no horizontal overflow appeared, and no console warnings/errors were reported.

## June 11, 2026 - Storyboard Applied Cards + Layout Scale

- Added saved-card application to the Storyboard composer. The Cards popup now lists saved Style, Storyboard, and Character cards as selectable context, and the composer shows removable applied-card chips.
- Image and video generation requests now send `appliedCardIds` only. The client does not assemble provider prompt guidance from card contents; future backend work should resolve card ownership/content server-side at generation runtime.
- Generated media stores a small applied-card snapshot for UI/search display. Videos still cannot be saved into cards; they only use applied cards as generation context.
- Tightened the Storyboard hero/composer/gallery scale for normal 100% browser zoom: smaller hero title tier, reduced top-section height, shorter composer controls, and denser gallery cards.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run test`, plus in-app browser checks for applying a saved Style card to both image and video mock generations.

## June 9, 2026 - Studio Current State Report

- Added `STUDIO_CURRENT_STATE_REPORT.md` as a root-level redesign handoff report because no `docs/`, `tasks.md`, or `NOTES.md` files existed in the current checkout.
- The report reflects the current local worktree: five Studio tabs, local-first Zustand state, Storyboard/Workspace/Gallery/Challenges demo behavior, and the native Editing placeholder after FreeCut removal.
- The report explicitly documents current backend boundaries: AI generation, uploads, credits, Convex persistence, and export are not active in the visible Studio workflow.

## June 9, 2026 - Storyboard Current State Report

- Added `STORYBOARD_CURRENT_STATE_REPORT.md` as a focused report for redesigning only the Storyboard section.
- The report documents the Storyboard route, library sidebar, shot cards, stitch flow, style-card creator, character creator, project-store behavior, current mock boundaries, UX issues, and redesign questions.
- Key finding: Storyboard is currently a local preproduction prototype, not a complete AI storyboard generation pipeline.

## June 9, 2026 - Storyboard Image Generation Interface

- Replaced the active Storyboard tab with a Gallery-inspired image generation interface: composer, optional template row, generation gallery, filters, detail modals, and My Cards libraries.
- Added `lib/stores/storyboard.ts` with per-project persisted state under `filmgen-storyboard-v2`.
- Removed old Storyboard frame/stitch types and actions from the active project store and added the new generation/card type surface in `lib/types.ts`.
- Updated `/api/generate/image` to the new authenticated strict-Zod contract with prompt sanitization, local generation rate limiting, and server-side data URL reference checks.
- Marked the previous Studio/Storyboard current-state reports as historical snapshots because their Storyboard sections describe the pre-redesign UI.

## June 9, 2026 - Storyboard Server-Side Prompt Boundary

- Moved Storyboard template display metadata into `lib/storyboard/templates.ts` and removed provider prompt guidance from client template objects.
- Added `app/api/generate/image/template-guidance.ts` as the server-owned template guidance registry for future runtime prompt construction.
- Updated the Storyboard UI to show a safe request preview instead of a client-combined final prompt.
- Added `components/cards/storyboard/storyboard-layout.tsx` so the Storyboard page is composed from hero/composer/templates/gallery/cards slots for easier future UI/UX iteration.
- Removed the Studio page mount gate so `/studio?tab=storyboard` renders the selected tab immediately instead of depending on a client boot flag.

## June 9, 2026 - Storyboard Chat Popup UX Pass

- Moved template discovery into the Storyboard composer plus-button popup. Templates are grouped by Style, Storyboard, and Character, and selection still sends only `templateId` for future server-side runtime prompt injection.
- Adapted the uploaded card style into `components/cards/storyboard/elite-plan-card.tsx` instead of changing shadcn primitives under `components/ui/`.
- Removed standalone Template Showcase and My Cards page sections from the Storyboard layout. Saved card libraries now open from the composer `Cards` button as a dedicated modal with separate Style, Storyboard, and Character storage spaces.
- Changed Recent Images from horizontal rows into a responsive grid. At 375px verification, document width stayed at 375px with no horizontal overflow.
- Added template image fallback gradients so the popup remains visually designed when remote preview images fail to load in local/headless environments.

## June 9, 2026 - Storyboard Mock Generation Quota/Speed Fix

- Replaced mock canvas PNG generation with compact SVG data URLs so repeated mock images do not fill `localStorage`.
- Added Storyboard store persistence compaction: reference image data URLs are not persisted, oversized/blob image URLs are replaced with lightweight placeholders, and generations/cards are capped.
- Added a quota-safe localStorage wrapper for `filmgen-storyboard-v2` that removes/retries the app's own key instead of crashing the UI on `QuotaExceededError`.
- Reduced mock generation wait time from the previous long fake delay to a fast prototype delay while leaving the server-side `templateId` request boundary intact.

## June 9, 2026 - Storyboard Flow Background / Dropdown Controls

- Removed the `Character Portrait` template and its server guidance entry. Old generated images no longer surface template names in the hero/detail/card-stack UI.
- Added the uploaded flow-field canvas background as a Storyboard feature component and layered it behind the Storyboard page.
- Replaced always-visible Card Type, Aspect, and Model segmented controls with compact composer dropdown controls.
- Replaced the Recent Images grid cards with an animated generation card stack adapted from the uploaded card-stack component.
- Fixed dropdown stacking so composer dropdowns can overlap the Recent Images section without click interception.

## June 9, 2026 - Storyboard Flow Background Visibility

- Increased flow-field visibility by raising canvas opacity, particle count, speed, and glow strength.
- Added a second hero-local flow-field layer above the mock hero image layer so the effect is visible behind the hero text and composer.
- Reduced the hero image/gradient masking enough for the effect to read while keeping the composer and hero copy legible.

## June 9, 2026 - Storyboard Flow Background Performance Fix

- Reduced Storyboard from two animated flow-field canvas layers to one global canvas layer after the UI felt slow in the browser.
- Kept the background visually prominent with static radial light fields and a stronger hero gradient instead of a second animated canvas.
- Capped the flow-field renderer at 320 particles, clamped device pixel ratio, removed per-particle canvas shadows, throttled animation to 30fps, paused animation when the tab is hidden, and rendered a static frame for reduced-motion users.
- Browser verification on `/studio?tab=storyboard` now reports one canvas layer, no runtime error, and no horizontal overflow.

## June 9, 2026 - Storyboard Interactive Nebula Background

- Removed the Storyboard flow-field background component and replaced it with a Storyboard-local `InteractiveNebulaShader` WebGL background powered by `three`.
- Added `three` and `@types/three` to the root dependencies for the shader implementation.
- Kept the pasted shader structure but used a `performance.now()` timer instead of deprecated `THREE.Clock` so the browser console stays clean.
- Removed the hero section's separate mock image layer and radial gradient wash; the hero now uses the same clearer background style as the lower Storyboard section with only a subtle dark readability overlay.
- Browser verification on `/studio?tab=storyboard` reports one shader canvas, no runtime error, no fresh console warnings/errors, and no horizontal overflow.

## June 10, 2026 - Storyboard Video Output Viewer

- Added a video-generation mode inside the same Storyboard composer, with video size, duration, and Seedance model controls while preserving template, Cards, image reference, and server-side runtime prompt boundaries.
- Added `POST /api/generate/video` as an authenticated strict-Zod stub that resolves template guidance server-side and returns an honest 501 until the real worker/provider path exists.
- Video generations now remain generated outputs only: the Storyboard UI hides selection and Add to Library actions for videos, and `openLibraryModal` ignores video generations so they cannot be saved into cards.
- Added a generated-output player overlay for Storyboard videos. It borrows the useful Gallery interaction pattern but is adapted for returned/downloadable video assets: fixed asset metadata replaces streaming quality switching, downloads route through the generation, and native `<video>` playback is ready for future `videoUrl` responses.
- Cleaned the animated video stack card so it has one play affordance, compact footer metadata, and no duplicated baked-in play/title text from the mock poster.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`. Browser verification on `/studio?tab=storyboard` found one video play button, one Open Video action, zero Add to Library/Select controls in video mode, zero quality selectors in the video player, no browser console warnings/errors, and no horizontal overflow.

## June 10, 2026 - Storyboard Video Gallery Overlap Fix

- Replaced the video-mode Recent section's shared animated image stack with a flat `VideoGenerationGallery`, so generated videos no longer appear as overlapping stacked cards.
- Added `VideoPreviewArtwork` for video cards and mock video playback. It uses generated CSS artwork instead of `generation.imageUrl`, so old persisted video mock posters with baked-in play triangles/titles cannot reappear in video cards or the mock player.
- Removed the large `Play video preview` card-center control from video outputs. Video cards now expose explicit Open, Download, Delete, and Play Video actions without background play artwork.
- Video outputs are now one unified gallery. Video mode hides the composer `Card Type` dropdown, ignores the image/card filter state, removes the All/Style Cards/Storyboards/Characters filters, stores new video generations with `cardType: "none"`, and does not display style/storyboard/character labels on video cards.
- Browser verification on `/studio?tab=storyboard` found `Video outputs` present, `Video stack` absent, zero `Next Video` buttons, zero `Play video preview` buttons, zero article images in the video gallery, zero Add to Library/Select controls, no Card Type dropdown, no category filters, no category mentions on video output cards, no horizontal overflow, and no console warnings/errors. Player verification found zero mock-player images, one download button, one progress input, zero quality selectors, and zero Add to Library controls.

## June 11, 2026 - Workspace Director-Only Surface

- Removed the active Amateur workspace branch from `WorkspaceCanvas`; `/studio?tab=workspace` now opens directly into the Director node graph.
- Deleted the orphaned `components/workspace/AmateurWorkspace.tsx` component and removed the Amateur workflow state/type from the workspace store and shared type surface.
- Project/workspace memory now normalizes to `workspaceMode: "director"` so old local projects cannot reopen the removed Amateur surface.
- Updated `WORKSPACE_MODES.md` to describe the current single Director workspace and note that the guided Amateur flow is retired in favor of Storyboard.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`. Browser verification on `/studio?tab=workspace` found `Director Workspace` visible, no Amateur text/button, the node palette present, no horizontal overflow, and no browser console warnings/errors.

## June 11, 2026 - Storyboard Latest Media Preview Polish

- Reworked the Storyboard hero's `Latest frame` / `Latest clip` area into an explicit preview box. Generated images and generated-video poster images now render inside the box instead of being implied by the page background.
- Removed the hero section's remaining dark linear overlay in `storyboard-layout.tsx`, so the upper Storyboard area uses the same transparent/clear treatment as the lower gallery section.
- Changed the Generation Chat composer shell and prompt textarea away from the grey slab look to darker glass surfaces that match the rest of the neon UI.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run test`, and a final `npm.cmd run typecheck` after the video-poster hero tweak. Browser verification on `/studio?tab=storyboard` found an `IMG` inside the latest preview box, transparent top-section background, no horizontal overflow, and no browser console warnings/errors. Browser screenshot capture timed out twice against the animated page, but live DOM/style checks and the visible in-app browser confirmed the update.

## June 11, 2026 - Storyboard Inline Generation Progress

- Added the provided `ImageGeneration` component as `components/cards/storyboard/ai-chat-image-generation-1.tsx` and installed the required `motion` package for its `motion/react` import.
- Added `card`, `foreground`, and `muted-foreground` Tailwind/theme tokens so the component's shadcn-style classes render inside the app's custom theme.
- Removed the blocking full-screen `GenerationLoadingOverlay`. Image and video generation progress now appears inside the left/latest preview panel.
- Added a pending generation preview state. The side panel shows the pending poster and progress immediately, while the Recent Images/Videos gallery only receives the new generation after the mock generation delay completes.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`. Browser verification on `/studio?tab=storyboard` found zero fixed generating overlays during generation, inline side-panel progress visible, the new prompt absent from the gallery during progress, the new prompt present in the gallery after completion, and no browser console warnings/errors.

## June 11, 2026 - Storyboard Unified Media Gallery

- Removed the Storyboard image stack feature by deleting `components/cards/storyboard/animated-generation-stack.tsx` and removing its import/usage from the active Storyboard surface.
- Replaced `Recent Images` / `Image stack` and the mode-specific video gallery with one `Generated Media` / `Media gallery` section.
- Added scalable gallery controls for 20-50 outputs: prompt/model/type search, All/Images/Videos media filters, image card-type filters, sort order, result count, and clear filters.
- Added a unified responsive media card grid for images and videos. Image cards keep select/Add to Library actions; video cards keep play/download/delete only and still cannot be saved into cards.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`. Final browser navigation to `/studio?tab=storyboard` was blocked by the in-app browser with `net::ERR_BLOCKED_BY_CLIENT`, so live DOM verification could not be completed after this change.

## June 11, 2026 - Storyboard Lightweight Redesign Revert

- Reverted the Storyboard `storyboardView=create|library` split and removed the Storyboard-local Create/Library/Cards subnav.
- Restored the single-page Storyboard flow: latest frame/clip hero, composer, and generated media gallery render together on `/studio?tab=storyboard`.
- Restored the composer to a fuller glass panel with visible mode toggle, larger prompt box, Request preview, output controls, references, cards, and generate action.
- Kept the existing shader/glassmorphism foundation and the unified media gallery behavior that existed before the lightweight split attempt.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`. Browser verification confirmed the hero, composer, visible controls, and media gallery are back on the same page; Create/Library subnav is gone; `storyboardView=library` no longer changes the surface; and no horizontal overflow is present.

## June 12, 2026 - Storyboard Left/Right Layout Restore

- Changed the Storyboard top workspace from a vertical stack back to a desktop two-column layout: latest generated image/video preview on the left, generation composer/chat on the right, gallery below.
- Kept mobile/tablet stacking behavior so smaller viewports still avoid horizontal overflow.
- Verification passed: `npm.cmd run typecheck` and `npm.cmd run lint`. Browser verification at desktop width confirmed the composer is to the right of the latest frame panel, the media gallery remains below, and no horizontal overflow is present.
