const BASE_SMOOTHING_PASSES = 4
const BREADTH_MODES = new Set(['web', 'combo'])
const HEIGHT_MODES = new Set(['stack', 'combo'])
const LAYOUT_MODES = new Set(['web', 'stack', 'combo', 'scale'])

/** Return the relative geometry for one Specterr-style visualizer layer. */
export function getLayerLayout(mode, layerIndex, layerCount, separationPercent) {
  const safeMode = LAYOUT_MODES.has(mode) ? mode : 'web'
  const depth = getLayerDepth(safeMode, layerIndex, layerCount)
  const separation = clamp(Number(separationPercent) / 50, 0, 2)
  const broadensWave = BREADTH_MODES.has(safeMode)
  const scalesLayer = safeMode === 'scale'
  return {
    heightScale: getHeightScale(safeMode, depth, separation),
    overallScale: scalesLayer ? 1 + depth * separation * 0.1 : 1,
    baseOffsetScale: scalesLayer ? depth * separation * 0.15 : 0,
    smoothingPasses: getSmoothingPasses(broadensWave, depth, separation),
    peakShiftPasses: broadensWave ? Math.floor(4 * depth * separation) : 0,
  }
}

function getHeightScale(mode, depth, separation) {
  if (!HEIGHT_MODES.has(mode)) return 1
  return 0.25 + depth * separation * 0.25
}

function getSmoothingPasses(broadensWave, depth, separation) {
  if (!broadensWave || depth === 0) return BASE_SMOOTHING_PASSES
  return BASE_SMOOTHING_PASSES + Math.floor(4 * (depth + 1) * separation)
}

/** Return normalized, snapshot-compatible layer records for rendering. */
export function getRenderableLayers(store) {
  const layers = Array.isArray(store.visualizerLayers) && store.visualizerLayers.length
    ? store.visualizerLayers
    : createLegacyLayers(store)
  return layers.map((layer, index) => normalizeLayer(layer, index, store))
}

function getLayerDepth(mode, index, count) {
  if (mode === 'web' && count === 2) return index * 4
  if (mode === 'web' && count === 3) return index * 2
  return index
}

function createLegacyLayers(store) {
  return [
    { id: 'layer-1', fillColor: store.barColor },
    { id: 'layer-2', fillColor: store.barColor2 },
  ]
}

function normalizeLayer(layer, index, store) {
  return {
    id: layer.id || `layer-${index + 1}`,
    fillColor: layer.fillColor || getLegacyColor(index, store),
    outlineColor: layer.outlineColor || '#000000',
    outlineWidth: clamp(Number(layer.outlineWidth) || 0, 0, 20),
    visible: layer.visible !== false,
  }
}

function getLegacyColor(index, store) {
  if (index === 0) return store.barColor || '#f85462'
  if (index === 1) return store.barColor2 || store.barColor || '#7b2ff7'
  return store.barColor || '#f85462'
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value))
}
