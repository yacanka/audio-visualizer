import { ref, watch } from 'vue'

export const MAX_VISUALIZER_LAYERS = 7

const LAYER_COLORS = ['#f85462', '#7b2ff7', '#45f3ff', '#f2c94c', '#ff6bd6', '#7cffcb', '#ffbe55']

/** Create visualizer shape, layer, color, and motion state refs. */
export function createVisualizerState() {
  return {
    ...createLayerState(),
    ...createShapeState(),
    ...createEffectState(),
    ...createMotionState(),
  }
}

function createLayerState() {
  const state = {
    barColor: ref(LAYER_COLORS[0]), barColor2: ref(LAYER_COLORS[1]),
    visualizerLayers: ref([createLayer(1, LAYER_COLORS[0]), createLayer(2, LAYER_COLORS[1])]),
    selectedVisualizerLayer: ref('layer-1'),
  }
  watch(state.barColor, color => syncLayerColor(state.visualizerLayers, 0, color), { flush: 'sync' })
  watch(state.barColor2, color => syncLayerColor(state.visualizerLayers, 1, color), { flush: 'sync' })
  return { ...state, ...createLayerActions(state) }
}

function createLayerActions(state) {
  return {
    /** Add a new visualizer layer and select it. */
    addVisualizerLayer: () => addVisualizerLayer(state),
    /** Remove a visualizer layer while always retaining one layer. */
    removeVisualizerLayer: layerId => removeVisualizerLayer(state, layerId),
    /** Duplicate a visualizer layer when capacity permits. */
    duplicateVisualizerLayer: layerId => duplicateVisualizerLayer(state, layerId),
    /** Move a visualizer layer one position toward the front or back. */
    moveVisualizerLayer: (layerId, direction) => moveVisualizerLayer(state, layerId, direction),
    /** Update safe, serializable properties on one visualizer layer. */
    updateVisualizerLayer: (layerId, properties) => updateVisualizerLayer(state, layerId, properties),
  }
}

function createShapeState() {
  return {
    vizShape: ref('bars'), vizStyle: ref('bar'), vizReflection: ref('none'), vizLayerMode: ref('web'),
    vizSpectrum: ref('bass'), barCount: ref(80), barGap: ref(2), barRounding: ref(4),
    visualizerBarWidth: ref(75), visualizerPointRadius: ref(5), sensitivity: ref(1),
    vizSmooth: ref(true), vizInvert: ref(false), visualizerDiameter: ref(40),
    visualizerImageSize: ref(95), visualizerWidth: ref(90), visualizerBaseHeight: ref(0),
    visualizerXPosition: ref(0), visualizerYPosition: ref(0), visualizerWaveHeight: ref(30),
    visualizerSeparation: ref(40), visualizerRotation: ref(0), centerCutout: ref(0),
  }
}

function createEffectState() {
  return {
    useGradient: ref(true), gradientDir: ref('vertical'), smoothing: ref(0.82),
    glowEnabled: ref(true), glowAmount: ref(15), glowColor: ref('#f85462'),
    glowType: ref('outer'), glowScale: ref(10), fireEnabled: ref(false), shadowEnabled: ref(false),
  }
}

function createMotionState() {
  return {
    waveDelay: ref(false), drift: ref(true), driftIntensity: ref(50), driftCustom: ref(false),
    visualizerRumble: ref(0), visualizerBounce: ref(20), visualizerSpin: ref(false),
  }
}

function addVisualizerLayer(state) {
  const layers = state.visualizerLayers.value
  if (layers.length >= MAX_VISUALIZER_LAYERS) return false
  const layer = createLayer(getNextLayerNumber(layers), getNextColor(layers))
  layers.push(layer)
  state.selectedVisualizerLayer.value = layer.id
  return true
}

function removeVisualizerLayer(state, layerId) {
  const layers = state.visualizerLayers.value
  if (layers.length === 1) return false
  const index = layers.findIndex(layer => layer.id === layerId)
  if (index < 0) return false
  layers.splice(index, 1)
  selectNearestLayer(state, index)
  return true
}

function duplicateVisualizerLayer(state, layerId) {
  const layers = state.visualizerLayers.value
  if (layers.length >= MAX_VISUALIZER_LAYERS) return false
  const sourceIndex = layers.findIndex(layer => layer.id === layerId)
  if (sourceIndex < 0) return false
  const layer = duplicateLayer(layers[sourceIndex], layers)
  layers.splice(sourceIndex + 1, 0, layer)
  state.selectedVisualizerLayer.value = layer.id
  return true
}

function moveVisualizerLayer(state, layerId, direction) {
  const layers = state.visualizerLayers.value
  const index = layers.findIndex(layer => layer.id === layerId)
  const step = normalizeDirection(direction)
  const targetIndex = index + step
  if (!step) return false
  if (index < 0 || targetIndex < 0 || targetIndex >= layers.length) return false
  const [layer] = layers.splice(index, 1)
  layers.splice(targetIndex, 0, layer)
  return true
}

function updateVisualizerLayer(state, layerId, properties) {
  const layers = state.visualizerLayers.value
  const index = layers.findIndex(layer => layer.id === layerId)
  if (index < 0) return false
  layers[index] = { ...layers[index], ...getSafeLayerProperties(properties) }
  syncLegacyColor(state, index, layers[index].fillColor)
  return true
}

function selectNearestLayer(state, removedIndex) {
  const layers = state.visualizerLayers.value
  const selectedExists = layers.some(layer => layer.id === state.selectedVisualizerLayer.value)
  if (selectedExists) return
  state.selectedVisualizerLayer.value = layers[Math.min(removedIndex, layers.length - 1)].id
}

function syncLegacyColor(state, index, color) {
  if (index === 0) state.barColor.value = color
  if (index === 1) state.barColor2.value = color
}

function createLayer(number, fillColor) {
  return {
    id: `layer-${number}`, name: `Wave Layer ${number}`, fillColor,
    outlineColor: '#000000', outlineWidth: 0, visible: true,
  }
}

function duplicateLayer(source, layers) {
  const number = getNextLayerNumber(layers)
  return { ...source, id: `layer-${number}`, name: `Wave Layer ${number}` }
}

function getNextLayerNumber(layers) {
  const numbers = layers.map(layer => Number(layer.id?.match(/layer-(\d+)/)?.[1]) || 0)
  return Math.max(0, ...numbers) + 1
}

function getNextColor(layers) {
  return LAYER_COLORS[layers.length % LAYER_COLORS.length]
}

function syncLayerColor(layers, index, color) {
  const layer = layers.value[index]
  if (!layer || layer.fillColor === color) return
  layers.value[index] = { ...layer, fillColor: color }
}

function getSafeLayerProperties(properties = {}) {
  const safeProperties = {}
  if (isHexColor(properties.fillColor)) safeProperties.fillColor = properties.fillColor
  if (isHexColor(properties.outlineColor)) safeProperties.outlineColor = properties.outlineColor
  if (Object.hasOwn(properties, 'visible')) safeProperties.visible = Boolean(properties.visible)
  if (Object.hasOwn(properties, 'outlineWidth')) {
    safeProperties.outlineWidth = Math.min(20, Math.max(0, Number(properties.outlineWidth) || 0))
  }
  return safeProperties
}

function isHexColor(value) {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
}

function normalizeDirection(direction) {
  if (direction === -1 || direction === 1) return direction
  return 0
}
