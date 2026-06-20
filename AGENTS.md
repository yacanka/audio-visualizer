# AGENTS.md

## Must-follow constraints
- Use `npm`; the repo is locked by `package-lock.json`. Do not introduce `pnpm-lock.yaml` or `yarn.lock`.
- Do not edit `dist/`; it is build output and ignored by git.
- Keep browser-only APIs (`Audio`, `AudioContext`, `MediaRecorder`, `captureStream`, canvas) behind UI/composable boundaries or mock them in tests.
- Preserve WebM export behavior in `src/composables/useVideoExport.js`: canvas stream first, optional audio tracks added from the audio element, tracks stopped after download.

## Validation before finishing
- Run `npm test` for logic, store, template, or visualizer changes.
- Run `npm run build` for Vue component, CSS, Vite config, dependency, or export-flow changes.

## Repo-specific conventions
- Pinia app state is assembled in `src/stores/app.js` from `src/stores/modules/*`; add new state in a module and expose it through `useAppStore`.
- Undo/redo tracks only refs included by `createTrackedRefs()` in `src/stores/app.js`; transient fields must stay excluded unless history restore should affect them.
- Project save/export payloads use `store.createSnapshot()`. New persistent settings must be snapshot-safe JSON values.
- Visualizer drawing is split by responsibility: `renderer.js` orchestrates, `backdrop.js`, `shapes.js`, and `overlays.js` draw.

## Change safety rules
- Preserve existing project JSON compatibility: keep `app: "audio-spectrum-visualizer"` and `version: 1` unless migration support is added.
- Preserve supported aspect ratios/qualities in `src/visualizer/dimensions.js` unless UI controls and tests are updated together.
- When changing preset names or order in `src/templates/videoTemplates.js`, update tests that lock observed Specterr names and step order.
