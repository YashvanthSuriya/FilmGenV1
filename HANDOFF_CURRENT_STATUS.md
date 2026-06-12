# FilmGenV1 / Cine Studio Current Handoff Report

Last updated: 2026-06-11

## Update 2026-06-11 (director-workspace-runnable-workflow)

- Upgraded the Director workspace from a static planning canvas into a runnable local workflow prototype.
- Added `lib/workspace/workflowRun.ts` for graph health analysis, upstream node traversal, preview output collection, and lightweight workspace mock asset creation.
- Added `lib/workspace/workflowTemplates.ts` with four starter workflow blueprints: Single Shot, Image to Video, Three Shot Scene, and Character Scene.
- Image Output and Video Output nodes now compile upstream context, block invalid runs, create local `source: "workspace"` assets, render generated previews/posters, expose download actions for previews, and can append generated assets to Editing.
- Video Output now blocks image-to-video runs until the connected Image Output has produced an asset, preventing source-frame workflows from silently becoming prompt-to-video.
- Preview now collects directly connected image/video output nodes as a sequence and can append ready outputs to Editing.
- Combiner has been reframed as Shot Builder, and graph rules no longer allow raw Camera, Script, or Shot Builder nodes to feed Preview directly.
- Added a narrow localStorage migration for the legacy built-in five-node Demo Board, replacing only that old demo with the new runnable eight-node board while leaving custom workspaces intact.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`.
- Browser verification passed on `http://127.0.0.1:3000/studio?tab=workspace`: migrated Demo Board showed 8 nodes, Run Image/Run Video were visible, Run Video correctly blocked until Image Output ran, Image and Video runs created ready assets, all four templates appeared, no horizontal overflow appeared, and no console warnings/errors were reported.

## Update 2026-06-11 (storyboard-applied-cards-layout-scale)

- Added applied-card context to the Storyboard composer. The Cards popup now lets users select saved Style, Storyboard, and Character cards for the next image or video generation, and the composer shows removable applied-card chips.
- Image and video generation stubs now accept `appliedCardIds` with strict Zod limits. This keeps future prompt injection/server guidance work server-side: the browser sends IDs, not composed provider instructions from card content.
- Generated media can display/search applied-card snapshots while preserving the rule that videos remain generated outputs only and cannot be saved into card libraries.
- Reduced the Storyboard page scale at 100% browser zoom with a shorter top stage, smaller desktop hero type, tighter composer shell/controls, and a denser gallery card layout.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`.
- Browser verification passed on `http://127.0.0.1:3000/studio?tab=storyboard`: Cards popup opened, an existing Style card attached to the composer, image and video mock generations both stored/displayed `1 applied card`, the video card still had no Add to Library action, no horizontal overflow appeared, and no console warnings/errors were reported.

## Update 2026-06-11 (storyboard-unified-media-gallery)

- Removed the Storyboard image stack feature. `components/cards/storyboard/animated-generation-stack.tsx` was deleted and the active Storyboard surface no longer imports or renders `AnimatedGenerationStack`.
- Replaced `Recent Images` / `Image stack` and the previous mode-specific video gallery with one `Generated Media` / `Media gallery` browser.
- Added gallery controls for larger output sets: search by prompt/model/type, All/Images/Videos media filters, image card-type filters, sort order, result count, and clear filters.
- Added a unified responsive media-card grid for images and videos. Images can still be selected and added to card libraries; videos stay play/download/delete only and cannot become cards.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`.
- Browser verification was attempted on `http://127.0.0.1:3000/studio?tab=storyboard`, but the in-app browser blocked localhost navigation with `net::ERR_BLOCKED_BY_CLIENT`, so final live DOM verification could not be completed for this update.

## Update 2026-06-11 (storyboard-inline-generation-progress)

- Added the provided `ImageGeneration` component as `components/cards/storyboard/ai-chat-image-generation-1.tsx` and installed `motion` so the component can use `motion/react`.
- Added shadcn-style theme aliases (`card`, `foreground`, `muted-foreground`) in `tailwind.config.ts` and `app/globals.css` so the pasted component renders correctly with the app's theme.
- Removed the blocking full-screen Storyboard generation popup. Image/video generation progress now appears inline in the left/latest preview panel.
- Added pending generation preview state to `components/cards/storyboard/storyboard-workspace.tsx`: the side panel shows progress immediately, but the Recent Images/Videos gallery is updated only after the mock generation finishes and `createGeneration` runs.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`.
- Browser verification passed on `http://127.0.0.1:3000/studio?tab=storyboard`: during generation there were zero fixed generating overlays, the side panel showed inline progress and the pending prompt, the gallery did not contain the pending prompt; after completion, the gallery contained the new prompt and no console warnings/errors appeared.

## Update 2026-06-11 (storyboard-latest-media-preview-polish)

- Reworked the Storyboard `Latest frame` / `Latest clip` hero area into an explicit generated-media preview box. Image generations render their generated image inside the box; mock video generations now show the generated poster image in the box with a play affordance layered above it.
- Removed the remaining dark top hero gradient overlay from `components/cards/storyboard/storyboard-layout.tsx`, leaving the upper Storyboard page transparent like the lower gallery area.
- Updated the Generation Chat surface in `components/cards/storyboard/storyboard-workspace.tsx` so the composer and textarea use darker glass styling instead of the previous grey input slab.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run test`, plus a final `npm.cmd run typecheck` after the video-poster adjustment.
- Browser verification passed on `http://127.0.0.1:3000/studio?tab=storyboard`: the latest preview area contained an `IMG` inside the box, the top section background computed transparent, textarea background computed `rgba(7, 16, 19, 0.85)`, there was no horizontal overflow, and no console warnings/errors appeared. Browser screenshot capture timed out twice on the animated page, so verification used the live browser plus DOM/style checks.

## Update 2026-06-11 (workspace-director-only)

- Removed the visible Amateur workspace mode. `/studio?tab=workspace` now opens directly into the Director node graph with a static `Director Workspace` label instead of an Amateur/Director mode switch.
- Deleted `components/workspace/AmateurWorkspace.tsx` and removed the Amateur workflow state/type from `lib/stores/workspace.ts` and `lib/types.ts`.
- Project/workspace memory now normalizes to `workspaceMode: "director"`, so old local projects saved with Amateur mode cannot route the Workspace tab to the removed surface.
- Updated `WORKSPACE_MODES.md` to describe the current Director-only workspace. Storyboard remains the guided image/video generation surface.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`.
- Browser verification passed on `http://127.0.0.1:3000/studio?tab=workspace`: `Director Workspace` is visible, no Amateur text/button is present, the node palette renders, there is no horizontal overflow, and no console warnings/errors appeared.

## Update 2026-06-10 (storyboard-video-gallery-overlap-fix)

- Replaced the video-mode Recent section's shared animated image stack with a flat generated-video gallery. The section now reads `Video outputs`; it no longer renders `Video stack`, `Next Video`, or stacked/overlapping cards for videos.
- Video outputs are now a unified gallery, not a card-type system. Video mode hides the composer `Card Type` dropdown, ignores image/card filters, removes the All/Style Cards/Storyboards/Characters filter buttons, stores new videos with `cardType: "none"`, and does not display style/storyboard/character labels on video output cards.
- Added reusable generated CSS artwork for video cards and mock video playback, so video previews no longer render `generation.imageUrl` in the video gallery/player. This prevents older persisted mock videos with baked-in play triangles or title blocks from showing behind the real controls.
- Removed the large center `Play video preview` button from video cards. Video outputs now have explicit Open, Download, Delete, and Play Video actions without play artwork inside the background image.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`.
- Browser verification passed on `/studio?tab=storyboard`: `Video outputs` present, `Video stack` absent, zero `Next Video` buttons, zero `Play video preview` buttons, zero video-gallery `<img>` elements, zero Add to Library/Select controls, no `Card Type` dropdown, no category filters, no category labels on video output cards, no horizontal overflow, and no console warnings/errors. The generated-video player opened with zero mock-player images, one download action, one progress control, zero quality selectors, and zero Add to Library controls.

## Update 2026-06-10 (storyboard-video-output-viewer)

- Storyboard now supports Image/Video mode switching inside the same composer. Video mode keeps the same template, Cards, image reference, and request-preview workflow, and adds generated-video controls for Seedance model, video size, and seconds.
- Added `app/api/generate/video/route.ts` as the server-owned runtime boundary for future video generation. It authenticates, rate-limits, validates with strict Zod, validates data URL references, resolves template guidance server-side from `templateId`, and returns an honest 501 stub until the real provider/worker path exists.
- Extended `lib/types.ts` and `lib/stores/storyboard.ts` so generations are typed as image or video, can carry `videoSize`, `durationSeconds`, and future `videoUrl`, and persist compactly without reintroducing localStorage quota crashes.
- Video outputs are not cards. The Storyboard UI hides Select and Add to Library controls in video mode, `openLibraryModal` ignores video generations, and the video stack exposes only play/open, download, and delete actions.
- Added a Storyboard generated-output player overlay. It borrows the useful Gallery player interaction pattern but is adapted for generated/downloadable API outputs rather than streaming: no quality dropdown, fixed asset metadata, mock playback when `videoUrl` is absent, and native `<video>` playback/download readiness when `videoUrl` is later returned by the API.
- Cleaned the animated video stack card so it has a single play affordance, compact footer metadata, no duplicated baked-in poster play button, and no card-save actions.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`.
- Browser verification passed on `/studio?tab=storyboard`: video generation creates a fast mock output, video mode reports one `Play video preview` button, one `Open video` action, zero `Add to Library`/`Select generation` controls, zero player quality selectors, fixed output metadata in the player, no browser console warnings/errors, and no horizontal overflow.

## Update 2026-06-09 (storyboard-interactive-nebula-background)

- Removed the Storyboard flow-field canvas background component and replaced it with `components/cards/storyboard/liquid-shader.tsx`, a Storyboard-local `InteractiveNebulaShader` based on the provided Three.js shader component.
- Added `three` and `@types/three` to the root project so the shader has runtime and TypeScript support.
- The shader is mounted once in `components/cards/storyboard/storyboard-layout.tsx` as the global Storyboard background.
- Removed the hero section's separate mock image layer and radial gradient wash so the top section has the clearer style used lower on the page; only a subtle dark linear overlay remains for text/composer readability.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`.
- Browser verification passed on `/studio?tab=storyboard`: one shader canvas, no runtime error, no fresh console warnings/errors, and no horizontal overflow.

## Update 2026-06-09 (storyboard-flow-background-performance)

- Reduced Storyboard from two animated flow-field canvases to one global canvas after the UI felt slow in the browser.
- Removed the hero-local animated canvas from `components/cards/storyboard/storyboard-layout.tsx`; the hero now uses static radial light fields and the existing mock hero background for visual depth.
- Optimized `components/cards/storyboard/flow-field-background.tsx`: particle count is capped, device pixel ratio is clamped, per-particle canvas shadows are removed, animation is throttled to 30fps, animation pauses on hidden tabs, and reduced-motion users get a static frame.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`.
- Browser verification passed on `/studio?tab=storyboard`: the page reports one canvas layer, no runtime error, and no horizontal overflow.

## Update 2026-06-09 (storyboard-flow-background-visibility)

- Made the Storyboard flow-field effect much more prominent by increasing the global canvas opacity, particle count, particle speed, trail length, and particle glow.
- Added a second hero-local flow-field canvas layer in `components/cards/storyboard/storyboard-layout.tsx` so the effect is visible above the mock hero background image and below the content.
- Reduced the hero background image opacity and softened the dark gradient mask so the effect can be seen without hurting text/composer readability.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`.
- Browser verification passed on `/studio?tab=storyboard`: the page now reports two canvas layers, no runtime error, and no horizontal overflow.

## Update 2026-06-09 (storyboard-flow-dropdown-stack-ux)

- Removed the `Character Portrait` Storyboard template from `lib/storyboard/templates.ts` and removed its server-side guidance entry from `app/api/generate/image/template-guidance.ts`.
- Hero/detail/recent-image surfaces no longer display persisted generation template names, so old local demo generations cannot keep showing `Character Portrait`.
- Added `components/cards/storyboard/flow-field-background.tsx`, adapted from the uploaded flow-field component, and layered it behind the Storyboard page.
- Added `components/cards/storyboard/animated-generation-stack.tsx`, adapted from the uploaded animated-card component, and replaced the Recent Images grid cards with an animated stack.
- Moved Card Type, Aspect, and Model selectors into compact composer dropdowns. GPT Image 2 remains visibly reserved/disabled.
- Raised the hero/composer stacking layer so dropdowns remain clickable when they overlap the Recent Images section.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`.
- Browser/local Chrome verification passed: `Character Portrait` absent, background canvas present, composer dropdowns clickable, animated stack visible after generation, no runtime error, and no horizontal overflow.

## Update 2026-06-09 (storyboard-mock-generation-quota-speed)

- Fixed the `QuotaExceededError` from `filmgen-storyboard-v2` by stopping full mock PNG data URLs from being persisted.
- `components/cards/storyboard/storyboard-workspace.tsx` now creates compact SVG mock image data URLs and uses a short prototype delay for mock generation.
- `lib/stores/storyboard.ts` now compacts persisted Storyboard state: reference image `src` payloads are removed from persisted composer/generation records, oversized/blob image URLs are replaced with lightweight placeholders, recent generations are capped, card counts are capped, and card image counts are capped.
- Added quota-safe localStorage handling for the Storyboard store: if writing `filmgen-storyboard-v2` hits browser quota, the app removes its own key and retries without crashing the UI.
- The UI still fires the image API request so the future server-side `templateId` runtime guidance boundary remains represented, but the mock UI no longer waits for the stubbed request to finish.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`.
- Browser verification passed on `/studio?tab=storyboard`: one live in-app generation completed without the quota/runtime error.
- Supplemental local Chrome check passed: five consecutive mock generations completed in roughly 343-616ms each, no quota/runtime error appeared, and `filmgen-storyboard-v2` was about 13 KB afterward.

## Update 2026-06-09 (storyboard-chat-popup-ux)

- Updated the Storyboard composer so templates are chosen from the plus-button popup rather than a separate page section.
- The template popup is categorized by the three card/library types: Style, Storyboard, and Character. It uses display-safe template metadata only; provider prompt guidance remains server-owned and should be resolved from `templateId` at runtime.
- Adapted the uploaded liquid-glass card direction into `components/cards/storyboard/elite-plan-card.tsx` under the Storyboard feature folder, leaving `components/ui/` primitives untouched.
- Added portaled, closeable chat popups for template selection and the composer `Cards` menu so future UI layout changes do not get clipped by the hero/composer layout.
- Removed standalone Template Showcase and My Cards slots from `components/cards/storyboard/storyboard-layout.tsx`. The Storyboard page now exposes hero, composer, recent image grid, and overlays.
- Recent Images now render as a responsive grid instead of horizontal rows.
- Saved image libraries now open as a dedicated modal from the `Cards` composer button. Style Cards, Storyboards, and Character Sheets each have their own storage space and count.
- Template cards use remote preview images with gradient fallbacks from `lib/storyboard/templates.ts` so the UI remains designed when remote images do not load.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run test`.
- Browser/screenshot verification passed for `/studio?tab=storyboard`: plus template popup opens, Cards menu opens, saved library modal opens, standalone Template Showcase/My Cards sections are absent, and exact 375px mobile screenshot metrics showed no horizontal overflow.

## Update 2026-06-09 (storyboard-server-runtime-prompt-boundary)

- Hardened Storyboard template handling so provider prompt guidance is not stored or composed in client-side code.
- Public template metadata now lives in `lib/storyboard/templates.ts` and contains display-safe fields only, including `guidanceSummary`.
- Server-owned runtime guidance lives in `app/api/generate/image/template-guidance.ts`. Future backend wiring should resolve prompt guidance from `templateId` inside the API/Convex/worker path, after prompt sanitization.
- The Storyboard client now sends `prompt`, `templateId`, card type, references, aspect ratio, and model. It does not send template guidance text or a client-combined provider prompt.
- `GenerationResult` no longer stores a client-combined final prompt. It stores the user's prompt plus selected template metadata only.
- The composer UI now shows `Preview Request`, which explains the safe request plan without exposing or building provider prompt text in the browser.
- Added `components/cards/storyboard/storyboard-layout.tsx` with slot-based layout primitives so future UI/UX changes can rearrange hero, composer, templates, gallery, and cards more easily.
- Removed the Studio page client mount gate that could leave `/studio` stuck on the loading fallback after dev-server rebuilds. The selected tab now renders immediately while `activeTab` still syncs to the project store in an effect.
- Verification passed after this hardening: `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run test`, and `npm.cmd run build`.
- Browser verification passed for `/studio?tab=storyboard`: Storyboard rendered after reload, `Preview Request` was present, `Preview Prompt` was gone, `Server Guidance` appeared on template hover content, and no horizontal overflow was detected.

## Update 2026-06-09 (storyboard-image-generation-interface)

- Replaced the visible Storyboard tab with a Gallery-inspired Image Generation Interface in `components/cards/storyboard/storyboard-workspace.tsx`.
- The new Storyboard flow has a hero-first generation composer, optional template showcase row, generations gallery, filter tabs, selection actions, detail modals, and dedicated My Cards libraries.
- Safe public template metadata lives in `lib/storyboard/templates.ts`: Cinematic Noir, Sci-Fi Concept, Character Portrait, Fantasy Landscape, Cyberpunk Street, and Anime Style.
- Server-owned runtime template guidance lives beside the image API in `app/api/generate/image/template-guidance.ts`. The client sends only user prompt fields and `templateId`; it does not store or compose provider prompt guidance.
- Storyboard layout structure is now slot-based in `components/cards/storyboard/storyboard-layout.tsx`, so future UI/UX passes can rearrange hero/composer/templates/gallery/cards without rewriting the whole workflow controller.
- Storyboard v2 state is isolated per project and persisted under localStorage key `filmgen-storyboard-v2`.
- Added new local data types in `lib/types.ts`: `Template`, `GenerationResult`, `UserCard`, `UserCardImage`, `GenerationReferenceImage`, and related generation enums.
- Retired the legacy Storyboard preproduction planning model from the active project store, type surface, and visible UI. The Storyboard tab now presents only the v2 image-generation workflow.
- Updated `POST /api/generate/image` to the new contract: authenticated request, strict Zod schema, prompt sanitization, local 3/min generation rate limit, server-side data URL image validation, and honest 501 stub response.
- Editing, Gallery, and Challenges tabs were not changed by this Storyboard replacement.
- Verification passed for this update: `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run test`, and `npm.cmd run build`.
- Browser verification passed for `/studio?tab=storyboard`: desktop rendered the v2 interface, template selection worked, generation created a gallery result, Add to Library saved a My Style Card, and no desktop horizontal overflow was detected.
- Exact 375x812 supplemental Edge verification passed: no horizontal overflow, composer/templates/gallery/My Cards present, template row swipe area available, and the mobile hamburger exposed Storyboard, Cinema Workspace, Editing, Gallery, Challenges, and project selection.

## Update 2026-06-07 (remove-export-tab-page)

- Removed the Studio Export tab from `studioTabs`.
- Removed the Export placeholder page from `app/(dashboard)/studio/page.tsx`.
- Updated desktop and mobile Studio navigation so only Storyboard, Cinema Workspace, Editing, Gallery, and Challenges are shown.
- `?tab=export` now resolves back to Storyboard because `export` is no longer a valid Studio tab.
- Updated the editor placeholder status copy from `Export bridge reserved` to `Render bridge reserved`.
- Added tests asserting `studioTabs` does not include `export`.
- API export stubs remain in place; this change removes the visible Studio tab/page only.
- Verification passed: `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run test`, and `npm.cmd run build`.
- Browser verification on `3001`: desktop nav shows five tabs with no Export tab, the old `?tab=export` URL does not show an export page, and exact 375x812 mobile verification shows Storyboard, Cinema Workspace, Editing, Gallery, Challenges, project controls, no Export entry, and no horizontal overflow.

## Update 2026-06-07 (remove-freecut-editor-placeholder)

- Removed the active FreeCut iframe from the Studio Editing tab.
- Added `components/editor/EditorPlaceholder.tsx` as the native FilmGen editor placeholder. It shows the active project name, timeline shell, project media counts, reserved control state, and unregisters any legacy `/freecut-editor/` service worker when visited.
- Removed root FreeCut build wiring: no `apps/editor` workspace, no editor prebuild/copy scripts, no `scripts/copy-editor.mjs`, and no `/freecut-editor` Next rewrite/header config.
- Removed the tracked copied FreeCut bundle from `public/freecut-editor`.
- Updated landing/studio copy and `AGENTS.md` so the current editor state is documented as a native placeholder rather than an embedded editor.
- Left the preexisting dirty `apps/editor` checkout untouched; it is no longer referenced by the root package/build.
- Verification passed after this removal: `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run test`, and `npm.cmd run build`.
- Browser verification: `/studio?tab=editing` shows the native placeholder with zero iframes. In-app browser mobile breakpoint check showed all Studio tabs plus project selection in the hamburger menu. Supplemental headless Edge checks at exactly 375x812 confirmed placeholder present, zero iframes, no horizontal overflow, and mobile menu/project controls available.

## Update 2026-06-07 (gallery-challenges-card-fix)

- Investigated the Gallery and Challenges tabs with browser screenshots before making changes.
- Root visual finding: the first screenshots showed unstyled pages because the dev server was serving stale CSS asset URLs after a production build rewrote `.next`. Restarting only the existing `127.0.0.1:3000` dev process restored the stylesheet; browser verification then showed the app stylesheet loaded with active CSS rules.
- Updated `components/ui/card-stack.tsx` so the shared moving card component now has visible left/right arrow controls, bounded overflow inside the stack stage, cleaner dot styling, and an `onSelectItem` callback.
- Reduced the Gallery hero CardStack to a tighter, bounded three-card fan so it no longer spills across the hero or obscures the rows below.
- Gallery CardStack clicks/arrows now update the visible hero information. Browser verification confirmed the hero changed from `Neon Drift` to `The Last Signal` after using the stack arrow.
- Gallery row scroll arrows are now visible across viewport sizes instead of being desktop-only.
- Reduced the Challenges previous-winners CardStack to a tighter, bounded three-card fan.
- Added a Challenges active-winner info panel under the moving cards. Clicking/arrowing through winner cards updates the displayed title, creator, vote count, status, and description.
- Browser verification confirmed the Challenges winner info changed from `Rain Protocol` to `Glass Gardens` after using the stack arrow.
- Cleaned broken bullet separators and invalid/nonstandard utility classes in the new Gallery/Challenges UI.
- Verification after this follow-up passed: `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run test`, and `npm.cmd run build`.
- Build note: the FreeCut/Vite build still emits existing chunk-size, plugin-timing, and ineffective dynamic import warnings. They are not caused by this card/layout fix.

## Update 2026-06-07 (gallery-challenges-reset)

- Restarted the Movie Gallery / Film Challenges implementation from the new instructions.
- Removed the conflicting embedded gallery and challenge sections from `components/workspace/AmateurWorkspace.tsx`; Workspace is back to generation controls, prompt input, mode/model/timing/quality controls, and reference upload actions.
- Expanded Studio navigation from four tabs to six tabs: Storyboard, Cinema Workspace, Editing, Gallery, Challenges, and Export.
- Added a dedicated Gallery tab in `components/gallery/GalleryTab.tsx`.
- Added Gallery local state and demo catalog data in `lib/stores/gallery.ts`.
- Gallery now has a streaming-platform style hero, CardStack hero deck, horizontal video rows, clickable video cards, detail modal, Add to Project action, Share action, and a mock player overlay with keyboard controls.
- Added a dedicated Challenges tab in `components/challenges/ChallengesTab.tsx`.
- Added Challenge local state and demo challenge/submission data in `lib/stores/challenges.ts`.
- Challenges now has an active challenge hero, previous winners CardStack, challenge grid, submission modal, voting panel, sort controls, and leaderboard.
- The provided reference screenshots were used only as UI/UX inspiration. The implementation uses new Unsplash demo imagery and does not use the reference screenshots as placeholders.
- The pasted moving card component is implemented as `components/ui/card-stack.tsx` and is reused in both Gallery and Challenges.
- Backend status: Gallery streaming, voting, submitting, sharing, and Add to Project are still local/mock UI behaviors. They are ready for later backend wiring but do not currently persist to Convex or stream real video.
- Security/product note: this remains a UI/UX preview implementation. Do not treat local demo auth, local challenge votes, or gallery player state as production authorization or persistence.
- Verification after this reset passed: `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run test`, and `npm.cmd run build`.
- Build note: production build succeeds. The embedded FreeCut/Vite build still emits existing chunk-size, plugin-timing, and ineffective dynamic import warnings; these are not introduced by the Gallery/Challenges reset.

## Update 2026-06-07 (v5-setup)

- Upgraded to Next.js 15.5.19, React 19.2.5, TypeScript 5.9.3.
- Aligned package.json with installed versions.
- Restructured project to match AGENTS.md directory conventions.
- Replaced demo auth with Clerk v6 auth shell (sign-in/sign-up protected routes).
- Added a local-development-only demo auth bypass for UI/UX review when placeholder Clerk keys are present.
- Added mobile tab navigation to StudioTopNav.
- Created abstraction layers: `lib/ai/`, `lib/payments/`, `lib/storage/`, `lib/queue/` (stub implementations).
- Prepared Convex schema and client setup for backend phase.
- Hardened FreeCut iframe bridge with origin validation.
- Added Zod env validation in `lib/env.ts`.
- Removed all Supabase references.
- API routes created as stubs (health, webhooks, generate, upload).
- Next phase: Backend implementation (Convex mutations, Paddle webhooks, Railway workers, AI provider wiring).

## Update 2026-06-07 (local-demo-auth-ui-mode)

- Added UI/UX preview mode for auth while backend setup is intentionally deferred.
- When placeholder Clerk keys are present and `NODE_ENV !== "production"`, `/sign-in` and `/sign-up` show a local setup panel with `Continue to Studio`.
- In that local demo mode, `/studio` loads as `demo@filmgen.local` without requiring Clerk.
- `StudioTopNav` receives `demoAuth` and shows `Leave demo` instead of Clerk sign-out.
- The bypass is explicitly development-only through `isLocalDemoAuthEnabled()` in `lib/clerk-config.ts`.
- In production mode with missing/placeholder Clerk env, protected routes redirect to `/sign-in?configuration_error=clerk` instead of allowing unverified access.
- Security note: this demo path exists only so UI/UX can be reviewed before backend/auth setup. It must never become a production authentication substitute.

## Executive Summary

FilmGenV1 is now a frontend-first Next.js 15 / React 19 AI film creation studio with a Clerk auth shell, protected dashboard routes, five studio tabs, a Storyboard image-generation interface, a native editor placeholder, Convex schema preparation, and backend-facing API route stubs.

The application is still not a production backend implementation. Local Zustand stores remain the active UI source of truth. AI generation, billing, real cloud storage, worker queues, Convex mutations, webhooks, and server-side export are intentionally represented by typed stubs or honest 501 responses.

The main current workflow is:

- Public landing at `/`.
- Clerk sign-in at `/sign-in`.
- Clerk sign-up at `/sign-up`.
- Protected studio shell at `/studio`.
- Studio tabs via `?tab=storyboard`, `?tab=workspace`, `?tab=editing`, `?tab=gallery`, and `?tab=challenges`.
- `/studio?tab=storyboard` opens the Image Generation Interface: composer, optional templates, reference uploads, generation gallery, and custom My Cards libraries.
- Editing tab shows the native FilmGen editor placeholder.
- API routes define contracts but do not perform real backend work yet.

## Verification Status

Latest command verification after the Workspace Director-only removal passed on 2026-06-11:

- `npm.cmd run typecheck` passed with zero TypeScript errors.
- `npm.cmd run lint` passed with zero ESLint warnings or errors. It prints the expected Next.js deprecation notice for `next lint`.
- `npm.cmd run test` passed: 2 test files, 12 tests.
- Browser verification passed for `/studio?tab=workspace`: `Director Workspace` is visible, no Amateur text/button is present, the node palette renders, no browser console warnings/errors appeared, and no horizontal overflow was detected.
- `npm.cmd run build` was not rerun for this UI patch, per the user's earlier instruction.

Previous command verification after the Storyboard video gallery overlap fix passed on 2026-06-10:

- `npm.cmd run typecheck` passed with zero TypeScript errors.
- `npm.cmd run lint` passed with zero ESLint warnings or errors. It prints the expected Next.js deprecation notice for `next lint`.
- `npm.cmd run test` passed: 2 test files, 12 tests.
- Browser verification passed for `/studio?tab=storyboard`: `Video outputs` is present, `Video stack` is absent, there are zero `Next Video` buttons, zero `Play video preview` buttons, zero video-gallery `<img>` elements, zero Add to Library/Select controls, no `Card Type` dropdown, no category filters, no category labels on video output cards, no fresh console warnings/errors, and no horizontal overflow. The generated-video player opened with zero mock-player images, one download action, one progress control, zero quality selectors, and zero Add to Library controls.
- `npm.cmd run build` was not rerun for that UI patch, per the user's earlier instruction.

Previous command verification after the Storyboard video output viewer cleanup passed on 2026-06-10:

- `npm.cmd run typecheck` passed with zero TypeScript errors.
- `npm.cmd run lint` passed with zero ESLint warnings or errors. It prints the expected Next.js deprecation notice for `next lint`.
- `npm.cmd run test` passed: 2 test files, 12 tests.
- Browser verification passed for `/studio?tab=storyboard`: video mode generated a fast mock output, the video stack had one play button and one Open Video action, video mode had zero Add to Library/Select controls, the generated-video player had download/progress controls with fixed asset metadata and no streaming quality selector, no fresh console warnings/errors, and no horizontal overflow.
- `npm.cmd run build` was not rerun for that UI patch, per the user's earlier instruction.

Previous command verification after the Storyboard Interactive Nebula shader replacement passed on 2026-06-09:

- `npm.cmd run typecheck` passed with zero TypeScript errors.
- `npm.cmd run lint` passed with zero ESLint warnings or errors. It prints the expected Next.js deprecation notice for `next lint`.
- `npm.cmd run test` passed: 2 test files, 12 tests.
- Browser verification passed for `/studio?tab=storyboard`: one Interactive Nebula shader canvas, no runtime error, no fresh console warnings/errors, and no horizontal overflow.
- `npm.cmd run build` was not rerun for that UI patch.

Previous command verification after the Storyboard flow-field performance fix passed on 2026-06-09:

- `npm.cmd run typecheck` passed with zero TypeScript errors.
- `npm.cmd run lint` passed with zero ESLint warnings or errors. It prints the expected Next.js deprecation notice for `next lint`.
- `npm.cmd run test` passed: 2 test files, 12 tests.
- Browser verification passed for `/studio?tab=storyboard`: one canvas layer after hydration, no runtime error, no console warnings/errors, and no horizontal overflow.
- `npm.cmd run build` was not rerun for that performance-only patch.

Previous command verification after Storyboard server-runtime prompt-boundary hardening passed on 2026-06-09:

- `npm.cmd run typecheck` passed with zero TypeScript errors.
- `npm.cmd run lint` passed with zero ESLint warnings or errors. It prints the expected Next.js deprecation notice for `next lint`.
- `npm.cmd run test` passed: 2 test files, 12 tests.
- `npm.cmd run build` passed.
- Browser verification passed for `/studio?tab=storyboard` after the prompt-boundary/layout-slot update.

Previous command verification after Storyboard v2 replacement passed on 2026-06-09:

- `npm.cmd run typecheck` passed with zero TypeScript errors.
- `npm.cmd run lint` passed with zero ESLint warnings or errors.
- `npm.cmd run test` passed: 2 test files, 12 tests.
- `npm.cmd run build` passed.
- Browser verification passed for `/studio?tab=storyboard` on desktop and exact 375x812 mobile.

Previous command verification after FreeCut removal passed on 2026-06-07:

- `npm.cmd run typecheck` passed with zero TypeScript errors.
- `npm.cmd run lint` passed with zero ESLint warnings or errors. It prints the expected Next.js deprecation notice for `next lint`.
- `npm.cmd run test` passed: 2 test files, 12 tests.
- `npm.cmd run build` passed. The build now runs `next build` directly and no longer builds/copies FreeCut.
- Browser verification passed for `/studio?tab=editing`, including exact 375x812 supplemental mobile checks with zero iframes and no horizontal overflow.

Earlier Final Phase 8 command verification passed on 2026-06-07:

- `npm.cmd run typecheck` passed with zero TypeScript errors.
- `npm.cmd run lint` passed with zero ESLint warnings or errors. It prints the expected Next.js deprecation notice for `next lint`.
- `npm.cmd run test` passed: 3 test files, 36 tests.
- `npm.cmd run build` passed. At that earlier point the build compiled FreeCut, copied it into `public/freecut-editor`, then built the Next app. This was superseded by the FreeCut removal update above.
- `npm.cmd ls next react react-dom typescript convex @convex-dev/r2 @paddle/paddle-node-sdk --depth=0` passed and confirmed Next 15.5.19, React 19.2.5, React DOM 19.2.5, TypeScript 5.9.3, Convex 1.40.0, `@convex-dev/r2` 0.9.2, and `@paddle/paddle-node-sdk` 3.8.0.

Additional verification after the local-demo-auth patch:

- `npm.cmd run typecheck` passed.
- `npm.cmd run lint` passed.
- Browser verification: `http://127.0.0.1:3000/studio?tab=storyboard` loaded the studio UI in local demo mode after the first `/studio` compile completed.

Live browser verification was intentionally not rerun after the local port cleanup. Earlier, a helper server I started on port 3000 became a stale/nonresponsive listener, and I incorrectly tried alternate ports before diagnosing it. Those helper server processes were stopped. Current server/process checks showed no Next/Convex app listener left running; only the Codex Node runtime remained.

## Current Tech Stack

Root application:

- Next.js `15.5.19`
- React `19.2.5`
- React DOM `19.2.5`
- TypeScript `5.9.3`
- Tailwind CSS `3.4.18` declared
- Zustand `^5.0.8`
- Clerk `@clerk/nextjs ^6.35.7`
- Convex `^1.30.0` declared, currently resolved to `1.40.0`
- `@convex-dev/r2 ^0.9.1`, currently resolved to `0.9.2`
- `@paddle/paddle-node-sdk ^3.8.0`, currently resolved to `3.8.0`
- Upstash Redis and ratelimit packages installed
- Sentry, Resend, Framer Motion, Radix primitives, Lucide icons, Zod
- Vitest `^4.0.13`, Testing Library React `^16.3.0`, ESLint `8.57.1`, `eslint-config-next ^15.5.19`

Editor surface:

- The Studio Editing tab renders `components/editor/EditorPlaceholder.tsx`.
- Root `npm.cmd run build` no longer builds `apps/editor` or copies a bundle into `public/freecut-editor`.
- The copied `public/freecut-editor` bundle has been removed.
- Legacy `/freecut-editor/` service workers are unregistered when the native placeholder mounts.
- `apps/editor` remains present in the checkout but is detached from the root package metadata and was not modified in this removal task.

Dependency deviations from the guide:

- The guide referenced `@convex-dev/r2 ^0.5.1`, but that conflicted with the installed Convex 1.x peer range. The project uses `@convex-dev/r2 ^0.9.1`.
- The guide referenced `paddle-node-sdk`, but npm did not provide that package. The project uses the official `@paddle/paddle-node-sdk ^3.8.0`.
- `wavesurfer.js` remains installed because legacy editing code still imports it.

## Implemented Phases

### Phase 0: Dependency Alignment

Implemented:

- Updated root dependencies to Next.js 15.5.x and React 19.2.x.
- Added Clerk, Convex, R2, Upstash, Paddle, Sentry, Resend, and Zod stack dependencies.
- Removed the stale root lockfile and regenerated package metadata through `npm install`.
- Created/updated root `AGENTS.md` with the locked tech stack.
- Replaced `.env.example` with the Convex, Clerk, Upstash, R2, Paddle, Railway, AI provider, Resend, app, cron, and Sentry env shape.

Verification:

- Typecheck passed.
- Tests passed.
- Build passed.

### Phase 1: Project Restructure

Implemented:

- Created route groups under `app/(auth)` and `app/(dashboard)`.
- Moved studio components under `app/(dashboard)/studio/_components`.
- Moved storyboard cards under `components/cards/storyboard`.
- Moved FreeCut wrapper to `components/editor/FreeCutFrame.tsx`.
- Moved IndexedDB media helper to `lib/storage/indexedDb.ts`.
- Moved editing utilities to `lib/editor`.
- Added explicit path aliases in `tsconfig.json`.
- Updated imports after the moves.

Deviation:

- `git mv` could not write to the `.git` index in the sandbox, so equivalent filesystem moves were used instead.

Verification:

- Typecheck passed.
- Tests passed.
- Build passed.

### Phase 2: Clerk Auth Shell

Implemented:

- Root `app/layout.tsx` now wraps the app in `ClerkProvider`.
- `middleware.ts` protects `/studio(.*)`, `/api/generate(.*)`, `/api/export(.*)`, and `/api/worker(.*)`.
- Added Clerk sign-in route at `app/(auth)/sign-in/[[...sign-in]]/page.tsx`.
- Added Clerk sign-up route at `app/(auth)/sign-up/[[...sign-up]]/page.tsx`.
- Added public landing page at `app/page.tsx`.
- Removed old demo auth pages/components.
- Added protected dashboard layout using `currentUser()`.
- Added a placeholder Clerk fallback in middleware for local dummy keys. Public routes continue; protected routes redirect to `/sign-in`.

Important local env note:

- `.env.local` contains dummy Clerk values and local Convex values for local builds only.
- Real Clerk keys are still required for production auth and full protected route behavior.

Verification:

- Typecheck passed.
- Tests passed.
- Build passed.

### Phase 3: Backend Abstraction Stubs

Implemented:

- `lib/ai/types.ts`
- `lib/ai/seedance.ts`
- `lib/ai/nanobanana.ts`
- `lib/ai/gpt-image.ts`
- `lib/ai/index.ts`
- `lib/ai/sanitize.ts` copied from the provided supplement
- `lib/payments/types.ts`
- `lib/payments/paddle.ts`
- `lib/payments/index.ts`
- `lib/storage/types.ts`
- `lib/storage/convex-storage.ts`
- `lib/storage/r2-storage.ts`
- `lib/storage/index.ts`
- `lib/queue/types.ts`
- `lib/queue/railway-http.ts`
- `lib/queue/index.ts`
- `lib/env.ts`

Status:

- These are contract stubs, not real implementations.
- They should be replaced during the backend phase without changing the exported interfaces.

Verification:

- Typecheck passed.
- Tests passed.
- Build passed.

### Phase 4: Studio Navigation And Layout

Implemented:

- `StudioTopNav` now supports a mobile hamburger menu below the `md` breakpoint.
- Mobile menu exposes the active Studio tabs: Storyboard, Cinema Workspace, Editing, Gallery, and Challenges.
- Mobile menu exposes project selection and create-project controls.
- Studio page now resolves `?tab=` directly with `useSearchParams`.
- Deleted the stale `StudioShell` wrapper.
- The earlier Export placeholder has since been removed from the Studio UI.

Status:

- Command verification passed.
- Live 375px browser verification was not completed after the port diagnostic issue. The code is implemented, but this is still a UI verification gap.

Verification:

- Typecheck passed.
- Tests passed.
- Build passed.

### Phase 5: FreeCut Hardening

Implemented:

- `components/editor/FreeCutFrame.tsx` validates `event.origin === window.location.origin`.
- `FreeCutFrame` validates `event.source === iframeRef.current?.contentWindow`.
- Parent iframe posts now target `window.location.origin` instead of `"*"`.
- `apps/editor/src/bridge/bridge-client.ts` posts back to `window.location.origin`.
- The child bridge validates message origin and source before accepting studio messages.
- `apps/editor/src/features/export/hooks/use-render-queue-runner.ts` no longer posts to `"*"`.
- FreeCut manifest, service worker registration, update check, and service worker cache are scoped to `/freecut-editor/`.
- `apps/editor/index.html` now links to `/freecut-editor/manifest.webmanifest` and `/freecut-editor/favicon.svg`.

Verification:

- Targeted search showed no wildcard parent/iframe postMessage calls in the bridge path.
- Typecheck passed.
- Tests passed.
- Build passed.

### Phase 6: Convex Preparation

Implemented:

- Ran `npx convex init`, which configured a local anonymous Convex deployment in `.env.local`.
- Copied the provided schema into `convex/schema.ts`.
- Ran `npx convex codegen --typecheck disable --init` because `convex init` did not create `_generated` by itself.
- Generated:
  - `convex/_generated/api.d.ts`
  - `convex/_generated/api.js`
  - `convex/_generated/dataModel.d.ts`
  - `convex/_generated/server.d.ts`
  - `convex/_generated/server.js`
  - `convex/tsconfig.json`
- Added `lib/convex.ts`.
- Added client-side `DashboardProviders` with `ConvexProviderWithClerk`.
- Wrapped dashboard content with the Convex/Clerk provider.
- Added UI-safe Convex bridge types to `lib/types.ts`.

Deviation:

- The guide showed `ConvexProviderWithClerk` directly in the dashboard layout. Because the dashboard layout is a server component and `useAuth()` is a client hook, this project uses `app/(dashboard)/_components/dashboard-providers.tsx` as a client wrapper.

Verification:

- Typecheck passed.
- Tests passed.
- Build passed.

### Phase 7: API Route Stubs

Implemented guide routes:

- `app/api/health/route.ts`
- `app/api/webhooks/clerk/route.ts`
- `app/api/webhooks/paddle/route.ts`
- `app/api/generate/route.ts`
- `app/api/upload/route.ts`

Implemented additional routes explicitly requested in the task:

- `app/api/generate/image/route.ts`
- `app/api/generate/video/route.ts`
- `app/api/export/route.ts`
- `app/api/worker/enqueue/route.ts`

Behavior:

- Protected API routes call `await auth()` and return `401` when unauthenticated.
- Route bodies are validated with Zod.
- `/api/generate/image` uses the Storyboard v2 request contract and applies strict validation, prompt sanitization, local 3/min rate limiting, and server-side PNG/JPEG/WebP data URL reference checks.
- `/api/generate/image` resolves template prompt guidance server-side from `templateId`. Future Convex/Railway worker wiring must preserve this boundary: client sends `templateId`, server/worker constructs the provider prompt at runtime.
- Backend work returns honest `501` responses.
- Webhooks currently acknowledge receipt and contain signature verification comments for the backend phase.

Verification:

- Typecheck passed.
- Tests passed.
- Build passed.
- Build output lists all API routes.

## Current Route Map

Public routes:

- `/`
- `/sign-in/[[...sign-in]]`
- `/sign-up/[[...sign-up]]`
- `/api/health`
- `/api/webhooks/clerk`
- `/api/webhooks/paddle`

Protected app routes:

- `/studio`
- `/studio?tab=storyboard` - Storyboard Image Generation Interface
- `/studio?tab=workspace` - Cinema Workspace
- `/studio?tab=editing` - native editor placeholder
- `/studio?tab=gallery` - Movie Gallery
- `/studio?tab=challenges` - Film Challenges
- `/studio/settings`

Local development exception:

- If placeholder Clerk keys are present and `NODE_ENV !== "production"`, `/studio` and `/studio/settings` are reachable as a demo user for UI/UX review.
- This exception is implemented by `isLocalDemoAuthEnabled()` and must remain development-only.

Protected API routes:

- `/api/generate`
- `/api/generate/image`
- `/api/generate/video`
- `/api/export`
- `/api/worker/enqueue`

Other API route:

- `/api/upload` includes an auth check in the handler. It is not currently included in the middleware protected matcher.

## Current Data And State Model

Active UI state:

- Zustand stores under `lib/stores`.
- Browser `localStorage` for local-first project state.
- IndexedDB for local media blob/object URL support through `lib/storage/indexedDb.ts`.
- Project shell state remains in `useProjectStore`.
- Storyboard v2 generation state lives in `useStoryboardStore` and persists under `filmgen-storyboard-v2`.
- Storyboard v2 data is keyed per project ID and stores composer state, selected template ID, generated images, filters, and custom card libraries grouped as style/storyboard/character.
- The active Storyboard type surface is `Template`, `GenerationResult`, `GenerationReferenceImage`, `UserCardImage`, and `UserCard`.
- `Template.guidanceSummary` is display-only public copy. Do not add provider prompt text back to client templates or persisted generation records.
- `GenerationResult` stores the user's prompt and selected template metadata only. It does not store a client-combined final prompt.

Prepared backend state:

- Convex schema exists in `convex/schema.ts`.
- Convex generated type bindings exist in `convex/_generated`.
- Convex client is wired for dashboard components.
- No real Convex queries or mutations are implemented yet.

Important rule:

- Until backend mutations exist, local Zustand stores remain the source of truth for UI state.
- The legacy local Storyboard planning data model is removed from the active Storyboard flow.

## Current Auth Model

Implemented:

- Clerk provider in root layout.
- Clerk sign-in/sign-up pages.
- Protected dashboard layout with `currentUser()`.
- Middleware route protection for studio and key API route groups.
- Local UI/UX demo auth mode for placeholder Clerk keys in development only.

Limitations:

- `.env.local` uses dummy Clerk keys for local build survival.
- Real Clerk keys are required to test real sign-in/sign-up and authenticated studio access.
- In local demo mode, `/studio` uses a hardcoded demo user (`demo@filmgen.local`) and bypasses real Clerk.
- In production mode with placeholder/missing Clerk env, protected routes should not open; they redirect to `/sign-in?configuration_error=clerk`.
- The local demo bypass is not a production auth substitute and must not be used for hosted user testing unless the environment is completely private.

Files involved in local demo auth:

- `lib/clerk-config.ts`: centralizes dummy Clerk constants, placeholder detection, and `isLocalDemoAuthEnabled()`.
- `middleware.ts`: permits protected routes only in local demo mode; otherwise redirects when Clerk env is placeholder.
- `app/layout.tsx`: skips `ClerkProvider` only when the publishable key is the dummy placeholder, preventing the Clerk widget from hanging locally.
- `app/(auth)/_components/clerk-placeholder.tsx`: shows the local setup panel and, only in local demo mode, the `Continue to Studio` action.
- `app/(dashboard)/layout.tsx`: uses a demo user only when `isLocalDemoAuthEnabled()` is true.
- `app/(dashboard)/studio/_components/studio-top-nav.tsx`: shows `Leave demo` instead of Clerk sign-out when `demoAuth` is true.

## Current Editor Placeholder

Implemented:

- The Editing tab renders a native FilmGen placeholder instead of an iframe.
- The placeholder reflects local project state: project name, asset counts, timeline duration, reserved tracks, and clips.
- The placeholder unregisters legacy `/freecut-editor/` service workers.
- Root package/build metadata no longer references the FreeCut workspace or copy script.
- The copied FreeCut public bundle has been removed.

Limitations:

- Native editing behavior is not implemented yet.
- The placeholder intentionally does not fake playback, trimming, media processing, or final delivery.
- `apps/editor` remains in the checkout but is detached from the root build; its preexisting dirty state was left untouched.

## Major UI/UX Risks

- Mobile navigation is implemented in code, but the 375px browser test was not completed after the port issue. This should be visually verified before design iteration.
- Local demo auth now allows UI/UX review without Clerk, but this can mask auth-gated UX issues until real Clerk is configured.
- Hosted preview/production environments must not run with placeholder Clerk keys and development demo auth enabled.
- The Editing tab is intentionally a placeholder. It is honest but not a finished native editor workflow.
- The current top navigation is functional but dense. On small screens, project management and tab navigation share the same menu, so it needs hands-on UX review.
- API route stubs validate contracts, but only `/api/generate/image` currently has local in-memory rate limiting. Production-grade Upstash-backed limiting, credit checks, and backend delegation are still needed.
- Webhook stubs do not verify signatures yet. They must not be used as production webhook endpoints.
- `lib/env.ts` validates public env shape only; backend-only env validation is still minimal.

## Architecture Risks And Gaps

- No Convex mutations/queries are implemented for users, projects, credits, jobs, or media.
- No Paddle billing flow is implemented.
- No Railway worker is implemented.
- No AI provider is wired to a real API call.
- No real storage upload flow exists.
- No rate limiting is applied to route handlers yet.
- No production logging/monitoring behavior is configured beyond dependencies.
- No database migration from local Zustand/localStorage to Convex exists yet.
- Local demo auth is intentionally a development bypass. Before exposing the app to untrusted users, confirm `NODE_ENV` is production, real Clerk keys are present, and `/studio` cannot load without a verified Clerk session.
- Some API route stub comments remain as backend contract markers. Backend planning should either keep them as explicit stub contracts or move them into a task tracker.

## Environment Status

Committed env template:

- `.env.example` now matches AGENTS.md Section 7 key names and comments.

Local env:

- `.env.local` contains dummy Clerk values.
- `.env.local` contains local anonymous Convex values created by `npx convex init`.
- `.env.local` should not be committed with real secrets.

## Files Most Important For Future Agents

- `AGENTS.md`
- `HANDOFF_CURRENT_STATUS.md`
- `middleware.ts`
- `app/layout.tsx`
- `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/_components/dashboard-providers.tsx`
- `app/(dashboard)/studio/page.tsx`
- `app/(dashboard)/studio/_components/studio-top-nav.tsx`
- `components/editor/EditorPlaceholder.tsx`
- `package.json`
- `package-lock.json`
- `next.config.mjs`
- `public/freecut-editor/*` removed
- `apps/editor/src/bridge/bridge-client.ts`
- `apps/editor/src/features/export/hooks/use-render-queue-runner.ts`
- `apps/editor/public/manifest.webmanifest`
- `apps/editor/public/sw.js`
- `convex/schema.ts`
- `convex/_generated/*`
- `lib/ai/*`
- `lib/payments/*`
- `lib/storage/*`
- `lib/queue/*`
- `lib/env.ts`
- `lib/convex.ts`
- `app/api/*/route.ts`

## Recommended Next Phase

Backend implementation should proceed in this order:

1. Replace dummy Clerk env values with real development keys.
2. Remove or feature-flag the `Continue to Studio` demo path for any shared preview environment.
3. Verify `/studio` redirects/blocks unauthenticated users when `NODE_ENV=production`.
4. Implement Convex user sync from Clerk webhooks with signature verification.
5. Implement Convex project persistence while keeping local Zustand as a fallback.
6. Implement credit accounting in Convex before any AI route can enqueue jobs.
7. Implement Railway worker enqueue endpoint and secret verification.
8. Wire image/video generation providers behind `lib/ai` without changing exported interfaces.
9. When wiring Storyboard image generation, combine sanitized user prompt plus template guidance only inside the server/Convex/worker path using `templateId`; never reintroduce client-side provider prompt composition.
10. Implement upload/storage flows through Convex storage and R2.
11. Implement Paddle webhooks with signature verification.
12. Replace local in-memory generation rate limiting with the production Upstash-backed limiter.
13. Visually test `/studio` at 375px across all tabs after real Clerk/local server setup is stable.
