# CINE STUDIO CONTINUATION SYSTEM PROMPT

You are continuing development of **Cine Studio**, a browser-first AI film production studio, in:

`C:\Users\USER\Documents\FilmGen\cine-studio`

The user wants you to continue from the implemented local MVP, not restart from scratch.

## Current State

The project is a Vite + React + TypeScript + Tailwind app. The local MVP has already been implemented and verified.

The app currently includes:

- A full studio workspace UI replacing the original static scaffold.
- Zustand-driven project state.
- Script generation, style-pack generation, mock video generation, mock audio generation, media bin, timeline metadata, inspector, credit ledger, undo/redo, and export manifest flow.
- Mock providers behind typed adapter interfaces.
- Credit reserve, commit, refund, and transaction history behavior.
- OPFS storage with IndexedDB fallback.
- `.env.example`.
- `LICENSE-THIRDPARTY.txt`.
- Vitest test coverage for credit service, timecode helpers, project manifest persistence, Omniclip bridge smoke behavior, and workspace rendering.

Important files and areas:

- `src/App.tsx` contains the current main studio workspace UI.
- `src/index.css` contains the current global app styling.
- `src/domain/types.ts` defines core project, media, generation, credit, storage, and provider interfaces.
- `src/stores/studioStore.ts` wires the main local MVP behavior.
- `src/services/mockGenerationProvider.ts` implements mock script/style/video/music generation.
- `src/services/creditService.ts` implements the local credit ledger.
- `src/services/storageProvider.ts` implements browser storage.
- `src/services/exportProvider.ts` creates a mock export manifest.
- `src/services/timelineBridge.ts` isolates the Omniclip integration.

## Verification Already Completed

The following commands passed:

```powershell
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

Browser verification at `http://localhost:5173` completed successfully:

1. Generated a screenplay.
2. Generated a style tile.
3. Generated a mock 720p video clip.
4. Confirmed credit deductions.
5. Confirmed generated media appeared in the media bin.
6. Added the clip to the timeline metadata preview.
7. Exported a mock project manifest.

A verification screenshot exists at:

`C:\Users\USER\Documents\FilmGen\cine-studio\cine-studio-mvp-verification.png`

## Omniclip Status

Omniclip was installed as:

```json
"omniclip": "npm:@omnimedia/omniclip@^1.1.3"
```

However, the current Omniclip npm package pulls blocked deep dependency exports in Vite, including dependencies such as `@ffmpeg/ffmpeg`, `@ffmpeg/util`, `@floating-ui/dom`, `@zip.js/zip.js`, and `web-demuxer`.

Because of that, the current `TimelineBridge` intentionally does **not** execute Omniclip at runtime. It keeps the integration boundary and reports the issue in the UI. Do not remove the bridge. The next proper fix is to either:

- patch/fork Omniclip’s export-map/deep import issues, or
- create a compatibility wrapper that loads only safe Omniclip custom elements.

Until that is fixed, Cine Studio timeline metadata remains independent and usable.

## Major Next Requirement

The user has explicitly said that **major UI/UX changes are coming** and will be mentioned by the user.

Treat those upcoming UI/UX instructions as high priority. When the user gives them:

- Do not merely polish the existing UI.
- Be willing to restructure layout, navigation, information hierarchy, panels, spacing, visual language, and interaction flow.
- Preserve the working MVP behavior unless the user explicitly asks to change it.
- Keep the app usable as a real production tool, not a marketing landing page.
- Prefer dense, professional studio/workstation ergonomics over decorative SaaS-style cards.
- Ensure text does not overflow controls and the interface works at desktop and tablet widths.

## Design Direction To Keep In Mind

The current UI works, but it is only an MVP shell. The next UI/UX pass should likely focus on:

- A more cinematic but professional production-suite layout.
- Better separation between pre-production, generation, timeline, media, inspector, and export.
- More intuitive job/progress feedback.
- Better timeline affordances and media interactions.
- Clearer credit cost visibility without making the app feel like a billing dashboard.
- Stronger visual hierarchy and less generic panel/card repetition.
- More polished empty states and generated asset previews.

Do not assume the current UI is final.

## Development Rules

- Continue using React, TypeScript, Vite, Tailwind, and Zustand.
- Keep external services mocked unless the user explicitly asks for live integrations.
- Keep provider interfaces and adapter boundaries intact.
- Do not put AI API keys or other secrets in frontend code.
- Use `npm.cmd` on Windows because PowerShell blocks the `npm.ps1` shim.
- If local commands fail with sandbox path permission errors around `C:\Users\USER`, rerun the important command with escalation.
- Run `npm.cmd run lint`, `npm.cmd run test`, and `npm.cmd run build` after meaningful implementation changes.
- If frontend changes are made, start the Vite dev server and verify in the browser at `http://localhost:5173`.

## Suggested Next Tasks

1. Wait for the user’s UI/UX direction and treat it as the main product spec.
2. Refactor the current workspace UI accordingly while preserving working flows.
3. Improve timeline interaction, media bin ergonomics, and generation flow.
4. Decide whether to patch/fork Omniclip or keep building a local timeline layer until Omniclip is compatible.
5. Keep tests updated around credit, generation, storage, and user-visible flow behavior.

## Current Product Summary

Cine Studio is now a functioning local MVP for:

`idea -> script -> style tile -> generated placeholder clip -> media bin -> timeline metadata -> export manifest`

The next session should build from that foundation and prioritize the user’s forthcoming major UI/UX changes.
