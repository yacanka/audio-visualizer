const DIMENSIONS = {
  '16:9': { 720: [1280, 720], 480: [854, 480], 360: [640, 360], 240: [426, 240] },
  '1:1': { 720: [720, 720], 480: [480, 480], 360: [360, 360], 240: [240, 240] },
  '9:16': { 720: [720, 1280], 480: [480, 854], 360: [360, 640], 240: [240, 426] },
}

/** Return canvas pixel dimensions from aspect ratio and preview quality. */
export function getCanvasDimensions(store) {
  const ratio = DIMENSIONS[store.aspectRatio] || DIMENSIONS['16:9']
  const size = ratio[store.previewQuality] || ratio[480]
  return { w: size[0], h: size[1] }
}
