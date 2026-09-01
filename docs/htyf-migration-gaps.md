# HTYF migration gaps

The migration is not complete. This document records unresolved user-visible or
acceptance gaps; it is not a list of completed fallbacks.

## Verification environment

- Dependencies are installed. Jest passes 10 tests and the files changed in this
  migration pass ESLint.
- Full TypeScript validation reports 118 errors. Main groups are React 19 JSX
  namespace changes, FlashList 2 API changes, TabView 4 API changes, React
  Navigation 7 types/options, missing third-party declarations, ref initialization,
  filesystem API types and pre-existing domain-model typing errors.
- No Android/iOS or HTYF host smoke test has been recorded.

## Current gaps

### Existing MMKV data compatibility

The target previously created generic database ids such as `App.config` and
`LocalSheet.*`. They now use the application-owned `plugin_music.*` prefix to avoid
cross-application collisions. A one-time migration from the old ids has not yet been
implemented because the target has no recorded released-data baseline. User impact:
existing data from an earlier target build may appear reset. Acceptance requires
either migrating verified old ids once or confirming those builds were never released.

### Page-header capsule coverage

The shared AppBar and home navigation now derive right-side avoidance from the live
HTYF capsule rectangle. Other bespoke headers have not yet been inventoried and
visually verified. Acceptance requires portrait/landscape checks with font scaling,
long titles and multiple 44-point action targets.

### Functional parity

Directory and route parity is present, but playback, plugins, downloads, backup,
permissions, overlays, loading/empty/error states and platform interactions have not
been verified feature by feature. See `.htyf-migration/migration-checklist.md`.
