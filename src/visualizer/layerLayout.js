const LAYOUT_FACTORS = {
  web: { width: 0.4, height: 0, scale: 0 },
  stack: { width: 0, height: 0.75, scale: 0 },
  combo: { width: 0.4, height: 0.75, scale: 0 },
  scale: { width: 0, height: 0, scale: 0.6 },
}

/** Return the relative geometry for one Specterr-style visualizer layer. */
export function getLayerLayout(mode, layerIndex, layerCount, separationPercent) {
  const depth = getLayerDepth(mode, layerIndex, layerCount)
  const separation = clamp(Number(separationPercent) / 100, 0, 1)
  const factors = LAYOUT_FACTORS[mode] || LAYOUT_FACTORS.web
  return {
    widthScale: 1 + depth * separation * factors.width,
    heightScale: 1 + depth * separation * factors.height,
    overallScale: 1 + depth * separation * factors.scale,
  }
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
