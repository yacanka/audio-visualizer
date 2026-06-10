import { getRenderableFrequencyData, getRenderableTimeData } from './audioData.js'
import { drawBackdrop } from './backdrop.js'
import { drawVisualizerShape } from './shapes.js'
import { drawElements, drawProgressBar, drawTextOverlay } from './overlays.js'

/** Create a stateful canvas renderer for animation frames. */
export function createVisualizerRenderer(store) {
  const renderingContexts = new WeakMap()
  let driftOffset = 0
  let driftDirection = 1
  let lastTime = 0

  function drawFrame(canvas, getFrequencyData, getTimeData, timestamp) {
    const ctx = getRenderingContext(canvas, renderingContexts)
    const size = { w: canvas.width, h: canvas.height }
    const deltaTime = timestamp - lastTime
    lastTime = timestamp

    drawBackdrop(store, ctx, size.w, size.h)
    driftOffset = updateDrift(store, driftOffset, driftDirection, deltaTime)
    driftDirection = updateDriftDirection(driftOffset, driftDirection)
    drawMainContent(store, ctx, size, getFrequencyData, getTimeData, driftOffset)
  }

  return { drawFrame }
}

function getRenderingContext(canvas, renderingContexts) {
  if (renderingContexts.has(canvas)) return renderingContexts.get(canvas)
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true })
  renderingContexts.set(canvas, ctx)
  return ctx
}

function drawMainContent(store, ctx, size, getFrequencyData, getTimeData, driftOffset) {
  applyGlow(store, ctx)
  drawVisualizerShape(store, ctx, getFrameData(store, getFrequencyData, getTimeData), size, driftOffset)
  ctx.shadowBlur = 0
  drawTextOverlay(store, ctx, size, driftOffset)
  drawProgressBar(store, ctx, size)
  drawElements(store, ctx, size)
}

function getFrameData(store, getFrequencyData, getTimeData) {
  return {
    frequency: getRenderableFrequencyData(store, getFrequencyData()),
    time: getRenderableTimeData(store, getTimeData()),
  }
}

function updateDrift(store, currentOffset, direction, deltaTime) {
  if (!store.drift || !store.isPlaying || store.previewBackgroundMode !== 'animate') return currentOffset
  return currentOffset + store.driftIntensity * 0.0003 * direction * deltaTime
}

function updateDriftDirection(offset, currentDirection) {
  return Math.abs(offset) > 30 ? currentDirection * -1 : currentDirection
}

function applyGlow(store, ctx) {
  ctx.shadowBlur = getShadowBlur(store)
  if (store.glowEnabled) ctx.shadowColor = store.glowColor
  if (store.fireEnabled) ctx.shadowColor = '#ff7a18'
  if (store.shadowEnabled && !store.glowEnabled) ctx.shadowColor = 'rgba(0,0,0,0.6)'
}

function getShadowBlur(store) {
  if (store.fireEnabled) return store.glowAmount + 12
  if (store.glowEnabled) return store.glowAmount + store.glowScale * 0.4
  return store.shadowEnabled ? 12 : 0
}
