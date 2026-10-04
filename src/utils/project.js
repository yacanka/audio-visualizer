import { isLocalImageSource } from '../visualizer/images.js'

/** Validate version-1 project JSON before any editor state is changed. */
export function parseProject(text, currentSettings) {
  const payload = JSON.parse(text)
  if (payload?.app !== 'audio-spectrum-visualizer' || payload.version !== 1 || !isRecord(payload.settings)) {
    throw new Error('Choose an Audio Spectrum Visualizer version 1 project.')
  }
  const snapshot = {}
  for (const [key, current] of Object.entries(currentSettings)) {
    if (!Object.hasOwn(payload.settings, key)) continue
    let value = payload.settings[key]
    if (key === 'visualizerRumble' && ['none', 'medium', 'high'].includes(value)) value = { none: 0, medium: 50, high: 100 }[value]
    if (!isCompatible(value, current)) throw new Error(`Invalid project setting: ${key}`)
    if (ENUMS[key] && !ENUMS[key].includes(value)) throw new Error(`Invalid project setting: ${key}`)
    snapshot[key] = typeof value === 'number' ? boundNumber(key, value) : value
  }
  for (const key of ['backdropImageSrc', 'visualizerImageSrc']) {
    if (snapshot[key] && !isLocalImageSource(snapshot[key])) throw new Error('The project contains an unsupported image source.')
  }
  validateLayers(snapshot.visualizerLayers)
  validateElements(snapshot.elements)
  if (snapshot.lyricSegments?.some(segment => !isRecord(segment) || !Number.isFinite(segment.start) || !Number.isFinite(segment.end) || typeof segment.text !== 'string')) throw new Error('Invalid lyric segments.')
  return snapshot
}

function isRecord(value) { return value !== null && typeof value === 'object' && !Array.isArray(value) }
function isCompatible(value, current) {
  if (current === null) return value === null || typeof value === 'string'
  if (Array.isArray(current)) return Array.isArray(value) && value.length <= 2000
  if (typeof current === 'number') return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= 1000000
  return typeof current === typeof value && ['string', 'boolean'].includes(typeof value)
}

function validateLayers(layers) {
  if (!layers) return
  if (!layers.length || layers.length > 7 || layers.some(layer => !isRecord(layer))) throw new Error('Invalid visualizer layers.')
  for (const layer of layers) {
    if (typeof layer.id !== 'string') throw new Error('Invalid visualizer layer id.')
    for (const key of ['opacity', 'fillOpacity', 'outlineOpacity', 'secondaryFillOpacity', 'secondaryOutlineOpacity', 'outlineWidth']) {
      if (layer[key] !== undefined && !Number.isFinite(layer[key])) throw new Error('Invalid layer value.')
      if (key !== 'outlineWidth' && layer[key] !== undefined) layer[key] = Math.min(1, Math.max(0, layer[key]))
    }
    for (const key of ['fillColor', 'outlineColor', 'secondaryFillColor', 'secondaryOutlineColor']) {
      if (layer[key] != null && (typeof layer[key] !== 'string' || !/^#[0-9a-f]{6}$/i.test(layer[key]))) throw new Error('Invalid layer color.')
    }
    if (layer.colorMix !== undefined && !['rgb', 'lch'].includes(layer.colorMix)) throw new Error('Invalid layer color mixing mode.')
    if (layer.outlineWidth !== undefined) layer.outlineWidth = Math.min(20, Math.max(0, layer.outlineWidth))
    if (layer.settings && (!isRecord(layer.settings) || Object.keys(layer.settings).some(key => !LAYER_KEYS.has(key)))) {
      throw new Error('Invalid custom layer settings.')
    }
    if (layer.settings) layer.settings = parseLayerSettings(layer.settings)
  }
}
const LAYER_KEYS = new Set(['vizStyle', 'vizSpectrum', 'vizReflection', 'vizInvert', 'barCount', 'vizSmooth', 'visualizerWaveHeight', 'visualizerBarWidth', 'visualizerPointRadius', 'visualizerRotation', 'visualizerMovement', 'visualizerHollowCenter', 'visualizerSpin', 'visualizerSpinSpeed', 'visualizerSpinAcceleration'])

function validateElements(elements) {
  if (!elements) return
  if (elements.length > 100) throw new Error('The project has too many elements.')
  for (const element of elements) {
    if (!isRecord(element) || typeof element.id !== 'string' || !['text', 'image', 'particles'].includes(element.type)) throw new Error('Invalid project element.')
    if (element.type === 'image' && !isLocalImageSource(element.src)) throw new Error('An element contains an unsupported image source.')
    if (['x', 'y', 'size'].some(key => typeof element[key] !== 'number' || !Number.isFinite(element[key]))) throw new Error('Invalid element position or size.')
    element.size = Math.min(500, Math.max(1, element.size))
    if (element.count !== undefined) {
      if (!Number.isFinite(element.count)) throw new Error('Invalid particle count.')
      element.count = Math.min(500, Math.max(1, Math.round(element.count)))
    }
    if (element.type === 'text' && typeof element.text !== 'string') throw new Error('Invalid text element.')
  }
}

const ENUMS = {
  aspectRatio: ['16:9', '9:16', '1:1'], previewQuality: [1080, 720, 480, 360, 240],
  fftSize: [256, 512, 1024, 2048, 4096, 8192, 16384, 32768],
  vizShape: ['bars', 'circular', 'mirror', 'wave', 'filled'], vizStyle: ['solid', 'bar', 'point'],
  visualizerMode: ['classic', 'soundvisible'], vizSpectrum: ['bass', 'wide'],
  visualizerMovement: ['outward', 'inward'],
  vizReflection: ['none', 'vertical', 'across', '3-way', '4-way', 'one-side', 'two-side', 'combo'],
  textPosition: ['top', 'center', 'bottom', 'custom'],
  titleAlign: ['left', 'center', 'right'], artistAlign: ['left', 'center', 'right'],
  artistWeight: ['400', '700'],
  backdropType: ['solid', 'gradient', 'image', 'video'], backdropImageFit: ['cover', 'contain', 'fill'],
  activeTab: ['general', 'visualizer', 'audio', 'backdrop', 'text', 'lyrics', 'elements'],
}
const RANGES = {
  barCount: [4, 200], sensitivity: [0, 3], smoothing: [0, 0.99], volume: [0, 1],
  stepGuideIndex: [0, 6], startTime: [0, 7200], endTime: [0, 7200],
  titleSize: [1, 200], artistSize: [1, 200], titleX: [-100, 200], titleY: [-100, 200], artistX: [-100, 200], artistY: [-100, 200],
  visualizerDiameter: [1, 120], visualizerWidth: [1, 120], visualizerWaveHeight: [0, 100],
  visualizerSpinSpeed: [-180, 180], visualizerSpinAcceleration: [-180, 180],
  visualizerImageSize: [1, 160], visualizerBarWidth: [1, 100], visualizerPointRadius: [1, 20],
  visualizerXPosition: [-100, 100], visualizerYPosition: [-100, 100], visualizerRotation: [-360, 360],
  soundVisibleShardAmount: [0, 48], glowAmount: [0, 50], glowScale: [0, 50],
}
function boundNumber(key, value) {
  if (key === 'previewQuality' || key === 'fftSize') return value
  const [min, max] = RANGES[key] || [-360, 360]
  return Math.min(max, Math.max(min, value))
}
function parseLayerSettings(settings) {
  const result = {}
  for (const [key, value] of Object.entries(settings)) {
    if (ENUMS[key]) {
      if (!ENUMS[key].includes(value)) throw new Error('Invalid layer option.')
      result[key] = value
    } else if (['vizSmooth', 'vizInvert', 'visualizerHollowCenter', 'visualizerSpin'].includes(key)) {
      if (typeof value !== 'boolean') throw new Error('Invalid layer smoothing.')
      result[key] = value
    } else {
      if (!Number.isFinite(value)) throw new Error('Invalid layer number.')
      result[key] = boundNumber(key, value)
    }
  }
  return result
}
