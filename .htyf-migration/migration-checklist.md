# MusicFree HTYF migration checklist

Audit input: source repository `https://github.com/maotoumao/MusicFree.git`, branch
`master`, checked-out commit `d118b18b3d0c904400f7eea7bf99c0ceec6c1aee`.
The source working tree contains only the untracked `htyf/` target.

This is a rebuilt inventory because no trustworthy previous
`.htyf-migration/source-state.json` exists. Do not create that verified state file
until all items below pass validation.

## Feature inventory

- [x] All 19 source page directories have target counterparts.
- [x] All 19 top-level source routes are registered with React Navigation.
- [ ] Verify route parameters, nested navigation, focus behavior and Android back behavior.
- [ ] Verify home, drawer, search and plugin installation end to end.
- [x] Remove the legacy in-app update workflow at the user's request. HTYF host
  delivery replaces startup version checks, manual update entry points, remote
  version-source links, download prompts and skipped-version persistence.
- [ ] Verify playback, queue, seek, lyrics, quality, rate and sleep timer end to end.
  - [x] Restore UI-runtime playback-progress subscription and lyric auto-scroll state updates.
  - [x] Drive the visible lyric page from `useProgress(250)` without relying on service state sharing.
  - [x] Cover repeated lyric text advancing to a new timestamp/index with a regression test.
- [ ] Verify local sheets, remote sheets, history and list editing end to end.
- [ ] Verify plugin import, subscription, update and user variables end to end.
- [ ] Verify downloads, local files, permissions and file selection end to end.
- [ ] Verify backup/restore and WebDAV end to end.
- [ ] Verify themes, custom images, orientation and safe-area behavior end to end.
- [x] Replace the legacy AsyncStorage adapter with an app-owned MMKV namespace.
- [ ] Confirm migration of existing pre-prefix MMKV data, or document the deliberate reset.
- [x] Add logical/physical capsule-coordinate normalization and header avoidance.
- [ ] Apply and visually verify capsule avoidance on every custom page header.
  The player header now shares the capsule row and reserves only the capsule's occupied
  right-side rectangle; device visual verification remains open.
- [ ] Audit every dialog, panel, menu and toast for in-tree overlay ownership and back dismissal.
- [ ] Review exported API documentation and replace vague TODO comments.
- [ ] Run typecheck, lint, unit tests and device-level acceptance checks.
  Unit tests currently pass (10/10), and changed files pass ESLint. Full TypeScript
  validation still reports 118 errors, so this item remains open.

## File reconciliation

The target contains 384 files under `src/`; the source contains 393. Thirty-seven
source-relative paths have no same-path target file. Several have apparent renamed
replacements (for example `core/appConfig.ts` to `core/config.ts`), but each mapping
still needs behavioral review. Missing same-path areas include i18n, error boundary,
schedule-close dialog, downloader, plugin-manager modules and bootstrap modules.
