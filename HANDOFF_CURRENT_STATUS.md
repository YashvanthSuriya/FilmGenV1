# FilmGenV1 / Cine Studio Current Handoff Report

Last updated: 2026-06-07

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

FilmGenV1 is now a frontend-first Next.js 15 / React 19 AI film creation studio with a Clerk auth shell, protected dashboard routes, six studio tabs, a FreeCut iframe editor, Convex schema preparation, and backend-facing API route stubs.

The application is still not a production backend implementation. Local Zustand stores remain the active UI source of truth. AI generation, billing, real cloud storage, worker queues, Convex mutations, webhooks, and server-side export are intentionally represented by typed stubs or honest 501 responses.

The main current workflow is:

- Public landing at `/`.
- Clerk sign-in at `/sign-in`.
- Clerk sign-up at `/sign-up`.
- Protected studio shell at `/studio`.
- Studio tabs via `?tab=storyboard`, `?tab=workspace`, `?tab=editing`, `?tab=gallery`, `?tab=challenges`, and `?tab=export`.
- Editing tab embeds FreeCut from `/freecut-editor/projects`.
- API routes define contracts but do not perform real backend work yet.

## Verification Status

Final Phase 8 command verification passed on 2026-06-07:

- `npm.cmd run typecheck` passed with zero TypeScript errors.
- `npm.cmd run lint` passed with zero ESLint warnings or errors. It prints the expected Next.js deprecation notice for `next lint`.
- `npm.cmd run test` passed: 3 test files, 36 tests.
- `npm.cmd run build` passed. The build compiles FreeCut, copies it into `public/freecut-editor`, then builds the Next app.
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

Embedded FreeCut editor:

- Lives in `apps/editor`.
- Built by the root `prebuild` script.
- Copied into `public/freecut-editor` by `scripts/copy-editor.mjs`.
- Vite/Vite-plus build currently emits chunk size, plugin timing, and ineffective dynamic import warnings. These are warnings, not build failures.
- The copied bundle changes hashed files in `public/freecut-editor` whenever the editor rebuilds.

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
- Mobile menu exposes all four tabs: Storyboard, Cinema Workspace, Editing, Export.
- Mobile menu exposes project selection and create-project controls.
- Studio page now resolves `?tab=` directly with `useSearchParams`.
- Deleted the stale `StudioShell` wrapper.
- Added an honest Export placeholder instead of pretending server export exists.

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

Prepared backend state:

- Convex schema exists in `convex/schema.ts`.
- Convex generated type bindings exist in `convex/_generated`.
- Convex client is wired for dashboard components.
- No real Convex queries or mutations are implemented yet.

Important rule:

- Until backend mutations exist, local Zustand stores remain the source of truth for UI state.

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

## Current FreeCut Integration

Implemented:

- FreeCut is built as a workspace app from `apps/editor`.
- Root build copies FreeCut output to `public/freecut-editor`.
- Editing tab embeds `/freecut-editor/projects` in an iframe.
- The iframe bridge passes studio assets into FreeCut.
- Export completion can message back to the parent.
- Bridge now uses strict same-origin postMessage rules.

Limitations:

- FreeCut still has its own internal project/timeline model.
- Cine Studio storyboard/workspace state is not fully synchronized with FreeCut timeline state.
- FreeCut may still prompt for its own workspace/project setup.
- FreeCut bundle is large and emits build warnings.
- The service worker is scoped, but future UI testing should verify cache/update behavior inside `/freecut-editor/`.

## Major UI/UX Risks

- Mobile navigation is implemented in code, but the 375px browser test was not completed after the port issue. This should be visually verified before design iteration.
- Local demo auth now allows UI/UX review without Clerk, but this can mask auth-gated UX issues until real Clerk is configured.
- Hosted preview/production environments must not run with placeholder Clerk keys and development demo auth enabled.
- The Export tab is intentionally a placeholder. It is honest but not a finished export workflow.
- The Editing tab is a full embedded editor app. It may feel like a separate product until project/timeline sync is built.
- FreeCut onboarding/workspace-folder prompts may interrupt the expected FilmGen flow.
- Large FreeCut chunks may affect load time and perceived performance.
- The current top navigation is functional but dense. On small screens, project management and tab navigation share the same menu, so it needs hands-on UX review.
- API route stubs validate contracts, but no route has real rate limiting, credit checks, or backend delegation yet.
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
- API route TODO comments are intentionally present as backend contract markers, but AGENTS.md normally discourages untracked TODOs. Backend planning should either keep them as explicit stub contracts or move them into a task tracker.

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
- `components/editor/FreeCutFrame.tsx`
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
9. Implement upload/storage flows through Convex storage and R2.
10. Implement Paddle webhooks with signature verification.
11. Add route-level rate limiting.
12. Visually test `/studio` at 375px across all tabs after real Clerk/local server setup is stable.
