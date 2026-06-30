import { DisplacementFilter, Sprite } from 'pixi.js'

const MAP_SIZE = 128
const MAX_INTENSITY = 60

/** Create a PixiJS displacement filter backed by a generated canvas map. */
export function createPixiDisplacementSurface(ownerDocument) {
  const canvas = ownerDocument.createElement('canvas')
  canvas.width = MAP_SIZE
  canvas.height = MAP_SIZE
  const context = canvas.getContext('2d', { willReadFrequently: false })
  const sprite = Sprite.from(canvas, true)
  const filter = new DisplacementFilter({ sprite, scale: { x: 0, y: 0 } })
  return { canvas, context, filter, imageData: null, sprite }
}

/** Resize and update the generated displacement map for the current frame. */
export function updatePixiDisplacement(surface, store, frequencyData, timestamp, size) {
  resizeDisplacementSprite(surface.sprite, size)
  const intensity = getDisplacementIntensity(store, frequencyData)
  setFilterIntensity(surface.filter, intensity)
  if (!intensity || !surface.context) return
  drawDisplacementMap(surface, timestamp, intensity)
  surface.sprite.texture.source.update()
}

/** Return active Pixi filters for the WebGL compositor. */
export function getPixiDisplacementFilters(surface, store) {
  return isDisplacementEnabled(store) ? [surface.filter] : null
}

function resizeDisplacementSprite(sprite, size) {
  sprite.position.set(0, 0)
  sprite.width = size.w
  sprite.height = size.h
}

function getDisplacementIntensity(store, frequencyData) {
  if (!isDisplacementEnabled(store)) return 0
  const base = clamp(Number(store.webglDisplacementIntensity ?? 10), 0, MAX_INTENSITY)
  const energy = getFrequencyEnergy(frequencyData)
  return base * (store.isPlaying ? 1 + energy * 1.35 : 0.55)
}

function isDisplacementEnabled(store) {
  return store.webglDisplacementEnabled !== false
}

function setFilterIntensity(filter, intensity) {
  filter.scale.x = intensity
  filter.scale.y = intensity * 0.65
  filter.padding = Math.ceil(intensity * 2)
}

function drawDisplacementMap(surface, timestamp, intensity) {
  surface.imageData ||= surface.context.createImageData(MAP_SIZE, MAP_SIZE)
  const time = Number.isFinite(timestamp) ? timestamp * 0.001 : 0
  fillDisplacementPixels(surface.imageData.data, time, intensity)
  surface.context.putImageData(surface.imageData, 0, 0)
}

function fillDisplacementPixels(pixels, time, intensity) {
  for (let y = 0; y < MAP_SIZE; y++) fillDisplacementRow(pixels, y, time, intensity)
}

function fillDisplacementRow(pixels, y, time, intensity) {
  for (let x = 0; x < MAP_SIZE; x++) writeDisplacementPixel(pixels, x, y, time, intensity)
}

function writeDisplacementPixel(pixels, x, y, time, intensity) {
  const offset = (y * MAP_SIZE + x) * 4
  const wave = getWaveValue(x, y, time)
  pixels[offset] = clampByte(128 + wave.x * intensity * 3.2)
  pixels[offset + 1] = clampByte(128 + wave.y * intensity * 2.4)
  pixels[offset + 2] = 128
  pixels[offset + 3] = 255
}

function getWaveValue(x, y, time) {
  const cross = Math.sin((x + y) * 0.075 + time * 1.7)
  return {
    x: Math.sin(x * 0.16 + time * 2.1) + cross * 0.45,
    y: Math.cos(y * 0.13 - time * 1.8) - cross * 0.35,
  }
}

function getFrequencyEnergy(frequencyData) {
  if (!frequencyData?.length) return 0.18
  const sampleCount = Math.max(1, Math.floor(frequencyData.length * 0.35))
  return getAverageFrequency(frequencyData, sampleCount) / 255
}

function getAverageFrequency(frequencyData, sampleCount) {
  let total = 0
  for (let index = 0; index < sampleCount; index++) total += frequencyData[index] || 0
  return total / sampleCount
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value))
}

function clampByte(value) {
  return Math.round(clamp(value, 0, 255))
}
