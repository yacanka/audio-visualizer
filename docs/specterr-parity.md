# Specterr adaptation

## Color mixing — 5 October 2026

- Confirmed current public bundle `https://app.specterr.com/static/js/main.ae8d2337.js`: secondary fill/outline colors use chroma.js LCH mixing, independent linear alpha, and a pure-black replacement of `#010101` before interpolation.
- Added dependency-free CIELCh/D65 interpolation with shortest hue arc, neutral hue inheritance, and sRGB channel clipping. This deliberately does not use CSS LCH/D50 or OKLCH.
- Specterr presets opt into LCH; existing version-1 layers without `colorMix` remain RGB. The layer Color Mixing selector permits either mode, and project import validates it. No project format version or dependencies changed.
- Verified against 1,000 deterministic color pairs/ratios using chroma-js 2.4.2 in a temporary reference file: zero byte-channel differences. Committed test fixtures also cover primary colors, neutrals, clipping, hue wrap, alpha, endpoints, legacy RGB and UI-to-renderer mode propagation.
- `pnpm test`: 34 files / 166 tests pass; `pnpm run build` passes, with the existing chunk-size warning (854 kB main / 169 kB gzip). `git diff --check` passes.
- This closes the RGB-versus-LCH interpolation difference at a given magnitude. It does not prove equivalent audio-analysis magnitudes or final postprocessed video pixels. Canvas spatial gradients and particle colors are outside this secondary-layer-color change.


## Update — 4 October 2026

The requested target is the rendered video, using both circular and flat examples. The existing 85 adapted presets and six local presets remain in the same order with the same stable ids.

Reference evidence checked again:

- The public `GetPresets` catalog now returns 121 records, including 87 enabled non-premium records. This update retains the existing 85-preset catalog; it does not claim to include the two newly added free presets or premium media.
- The live editor requires authentication. The public Default example at https://player.vimeo.com/video/437608921 was visually inspected. This is a visual reference, not a synchronized same-audio comparison.
- The current catalog confirms independent custom-layer spin, wave movement direction, hollow-center controls, and LEFT/CENTER/RIGHT text anchors. The existing adapter omitted the text anchors and artist weight: Jungle Cat's left-anchored artist text was rendered centered and visibly clipped by the frame.

Changes in this update:

- Local MP4/WebM background uploads, muted video playback, audio-playhead synchronization, looping, static-preview handling, and the same cover/contain/fill, reflection and color processing used by images. The export waits for a usable video and completes seeking before recording. Failed/missing video media prevents a misleading fallback-only export.
- Video object URLs and media elements are released on replacement/disposal. Files, elements, loading status and duration stay out of history/project JSON. Video filename and design controls are saved in version 1; the local file must be reselected after opening a project. Preset selection preserves the user's video backdrop.
- Independent layer spin speed and audio acceleration, inward/outward circular and flat waves, and optional hollow circular centers. Existing version-1 designs keep legacy hollow-center defaults. Reference preset selection uses filled centers, matching the observed catalog flags.
- Closed circular contours remove the seam between first and last spectrum samples. Point radius and outline width scale with the output's short edge, keeping thumbnails and output geometrically consistent.
- Reference presets disable the unrelated whole-frame WebGL displacement pass. Preview and thumbnail source rendering therefore agree for these presets.
- Export start, source replacement and timeline discontinuities reset transient motion rather than reusing an earlier preview's accumulated spin/particles.
- All 85 reference presets now retain their observed text anchors and artist font weight. Both text anchors and artist weight are editable and validated when opening projects. Title/artist text scales against the short canvas edge so the portrait layout does not enlarge and clip preset text.
- Video-only playback uses the clip duration for display/scrubbing and a continuous render clock; it no longer resets arbitrarily at twelve seconds. Silent video exports default to the background clip duration.

Validation for this update:

- `pnpm@12.8.1`; `pnpm test`: 34 files, 154 tests passed.
- `pnpm run build`: passed; non-fatal main-chunk warning remains (approximately 852 kB minified / 168 kB gzip).
- `git diff --check`: passed. No lint or type-check script exists in the repository.
- Regression coverage includes drawing geometry, resolution-scaled points, custom layer settings/project validation, independent spin, export reset, text anchors, local-video loading/failure/seek/cancel/disposal, preset media retention, and the video-only timeline.
- Browser checks and local decoded video evidence are stored under the ignored `output/playwright/qa-2026-10-04/` directory. Both circle and video-background flat outputs contain VP9 video and Opus audio and decode at 1280×720.

These checks validate this implementation and the sampled outputs. They do not establish pixel-identical Specterr rendering, full feature parity, or compatibility with every browser/codec. In particular, proprietary effect shaders, per-layer effect stacks, stock video search, premium templates and cloud MP4 rendering remain different or unavailable.

## Earlier adaptation — 14 September 2026

Inspected on 14 September 2026 (Europe/Istanbul):

- https://app.specterr.com/create — live editor, preset gallery, visualizer controls and canvas.
- https://app.specterr.com/static/js/main.49a55643.js — public browser bundle; examined to establish control semantics, preset application rules and rendering architecture. The bundle is not included in this project.
- https://app.specterr.com/api/VideoPresets/GetPresets — 118 public catalog records; 85 marked non-premium and enabled.
- https://app.specterr.com/api/media/GetMaxValues — reference control ranges.

## Implemented

- 85 adapted non-premium presets in `src/templates/specterrPresets.json`, alongside the six remaining local presets. Existing stable local ids continue to resolve.
- 82 public image backgrounds in `public/presets/`, fetched from the corresponding catalog `settings.background.mediaSource.data.url` on `specterr.b-cdn.net`. Approximately 68 MB on disk. These are reference-site media, not newly authored or public-domain artwork. Original ownership and terms remain with their respective owners. The circular SpectraViz logo is authored locally.
- Searchable gallery with lazy canvas thumbnails and hover/focus animation using the same 2D renderer as the editor. Thumbnails visualize a deterministic synthetic spectrum, not a recording of the original Specterr examples.
- Complete design-state replacement when selecting a preset, while preserving user audio, text, lyrics, uploaded images and added elements. Nested preset arrays are cloned to prevent catalog mutation.
- Circle/flat wave shapes, solid/bar/point styles, reflections, seven layers, layouts, per-layer opacity and custom style/height/count/reflection/rotation/smoothing/inversion controls. Inversion retains the chosen bass/wide band.
- Independent fill/outline opacity and audio-reactive secondary colors/opacity. Transparent-fill presets retain their outlines, and point presets can fade in with sound. Secondary colors now support LCH; reference presets opt in while legacy saved layers retain RGB (see October 5 update).
- Real spectrum history for delayed layers, reset on seek/source replacement; rumble translation independent of bounce scale; configurable reverse/forward spin, audio acceleration and logo lock; custom drift translation, rotation and zoom.
- Central image upload/visibility/size, circular clipping, serializable background images, real mirrored halves, and background movement driven by audio energy.
- Independent glow, inner mask, fire and shadow composition. Fire uses an original animated canvas glow approximation.
- Working guide steps for images, text, colors and export. Silent animated preview before an audio upload.
- Track-wide visual normalization based on the peak across all decoded channels, with gain limited to ±12 dB; optional low-frequency emphasis up to 6 dB. Both affect visual analysis only and preserve silent bins. Stale file decoding cannot replace the current waveform/normalization data.
- Timed text/image elements with fade/pop entry and exit. The like/subscribe preset now has an actual timed animation.
- Version-1 project JSON save/open; validated input and retained image data. Audio remains a local file and must be reselected after opening a saved project.
- WebM capture with progress, cancellation, duplicate-export prevention and resource cleanup on success/failure/cancel. Canvas capture remains first, optional audio tracks come from the audio element, and owned tracks are stopped after downloading.
- Portrait/square/landscape preview fitting, including Pixi texture-geometry invalidation on output size changes.

## Fidelity limits and remaining differences

This is an adaptation, not a verified pixel-identical implementation of all Specterr features.

- The 33 premium presets and their protected video media are not bundled. Older local Forest of Lights/Purgatory-style approximations remain local presets; they are not the premium originals.
- Neon Tunnel, thru space & time and Drizzle & Brew use gradient substitutes because their catalog backgrounds are videos. Gallery cards identify these substitutes.
- Local background video upload/playback was added in the October update. Stock-media search, an animated stock-video library and a cloud storage backend are still unavailable.
- Frequency normalization, drift noise, delay timing, fire/glow/shadow shaders, particle distributions and several coordinate conversions are implemented in this project's renderer. They have matching control purposes but have not been proven numerically identical to Specterr's pipeline.
- Independent per-layer spin was added in the October update. Per-layer effect stacks, logo-specific glow, full text effects, advanced particle shapes, background motion blur and the complete reference lyrics/timeline editor remain incomplete.
- Bass Boost and Normalize now affect analysis, using a local implementation rather than Specterr's server-side pre-analysis pipeline.
- Preview uses Pixi/WebGL when available, with a 2D fallback. Gallery previews use the shared 2D source without the final WebGL displacement pass.
- Font families beyond the loaded Inter, Orbitron and Montserrat may fall back to browser sans-serif fonts.
- Specterr's account system, subscription gating, public video hosting, cloud project management and queued MP4 rendering are server features. This project still saves locally and exports real-time WebM. The privacy field is saved metadata only.
- Audio export depends on browser support for audio-element `captureStream`; a browser lacking it exports video without audio, as before.

## Verification

Completed on 14 September 2026:

- `npm test`: 31 files, 128 tests passed. Coverage includes preset isolation, all 91 presets passing project validation, version-1 round trips, reactive paint/opacity, spectrum inversion, delayed layers, motion, element timing, Pixi resize/disposal and export success/error/cancellation cleanup.
- `npm run build`: passed. Vite reports a non-fatal main-chunk size warning: approximately 887 kB minified / 176 kB gzip. No dependency or lockfile changes.
- `git diff --check`: passed. The repository has no lint or type-check script.
- Production-preview browser checks: gallery rendering/search/selection, user text surviving a preset change, seven-layer project save/open, portrait fitting, actual audio upload/playback, export cancellation and restored controls.
- Real three-second WebM downloaded from the production preview with the Northern Lights preset: 712,583 bytes, VP9 video and Opus audio streams. The download completed without error. No JavaScript errors or warnings in the final preview session.
- Visual evidence: `output/playwright/final-gallery.png`, `final-editor.png`, `portrait-fixed.png`; export evidence: `verified-export.webm`; project round-trip evidence: `verified-project.json`. These browser artifacts are intentionally ignored by Git.

These checks verify this implementation's behavior, not exhaustive numerical or pixel parity with the reference service, every browser codec, or every preset at every output resolution.
