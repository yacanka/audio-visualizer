import { getRenderableFrequencyData, getRenderableTimeData } from './audioData.js'
import { drawBackdrop } from './backdrop.js'
import { drawVisualizerShape } from './shapes.js'
import { drawElements, drawParticleElements, drawProgressBar, drawTextOverlay } from './overlays.js'
import { getParticleFrameMotion } from './particles.js'
import { getVisualizerRumbleMotion } from './rumble.js'
import { createGlowLayerRenderer } from './glowLayer.js'

/** Create the legacy 2D canvas renderer used as PixiJS source and fallback. */
export function createCanvasVisualizerRenderer(store) {
  const renderingContexts = new WeakMap()
  const glowRenderers = new WeakMap()
  const state = createFrameState()

  function drawFrame(canvas, getFrequencyData, getTimeData, timestamp) {
    const ctx = getRenderingContext(canvas, renderingContexts)
    const size = { w: canvas.width, h: canvas.height }
    const deltaTime = state.lastTime ? timestamp - state.lastTime : 0
    const frameData = getFrameData(store, getFrequencyData, getTimeData)
    const particleMotion = updateParticleState(store, state, frameData.frequency, deltaTime)
    updateDriftState(store, state, deltaTime)
    const rumbleMotion = getVisualizerRumbleMotion(store, particleMotion, state.rumbleEnvelope, deltaTime)
    state.rumbleEnvelope = rumbleMotion.envelope
    state.lastTime = timestamp
    drawBackdrop(store, ctx, size.w, size.h)
    drawMainContent(store, ctx, size, frameData, state, rumbleMotion.scale, getGlowRenderer(canvas, glowRenderers), timestamp, deltaTime)
  }

  return { drawFrame }
}

function createFrameState() {
  return {
    driftOffset: 0, driftDirection: 1, lastTime: 0, particleTime: 0,
    particleEnergy: null, particleImpulse: 0, rumbleEnvelope: 0, soundVisibleShards: { particles: [] },
  }
}

function updateParticleState(store, state, frequencyData, deltaTime) {
  const motion = getParticleFrameMotion(store, frequencyData, state.particleEnergy, state.particleImpulse)
  state.particleTime = updateParticleTime(store, state.particleTime, deltaTime, motion.boost)
  state.particleEnergy = motion.energy
  state.particleImpulse = motion.impulse
  return motion
}

function updateDriftState(store, state, deltaTime) {
  state.driftOffset = updateDrift(store, state.driftOffset, state.driftDirection, deltaTime)
  state.driftDirection = updateDriftDirection(state.driftOffset, state.driftDirection)
}

function getRenderingContext(canvas, renderingContexts) {
  if (renderingContexts.has(canvas)) return renderingContexts.get(canvas)
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true })
  renderingContexts.set(canvas, ctx)
  return ctx
}

function getGlowRenderer(canvas, glowRenderers) {
  if (!glowRenderers.has(canvas)) glowRenderers.set(canvas, createGlowLayerRenderer(canvas))
  return glowRenderers.get(canvas)
}

function drawMainContent(store, ctx, size, frameData, state, rumbleScale, glowRenderer, timestamp, deltaTime) {
  ctx.shadowBlur = 0
  const motion = { driftOffset: state.driftOffset, rumbleScale }
  drawParticleElements(store, ctx, size, state.particleTime * 1000, frameData.frequency)
  glowRenderer.draw(store, ctx, frameData, size, motion, timestamp)
  drawVisualizerShape(store, ctx, frameData, size, state.driftOffset, rumbleScale, timestamp, deltaTime, state.soundVisibleShards)
  drawTextOverlay(store, ctx, size, state.driftOffset)
  drawProgressBar(store, ctx, size)
  drawElements(store, ctx, size, state.particleTime * 1000, frameData.frequency)
}

function getFrameData(store, getFrequencyData, getTimeData) {
  return {
    frequency: getRenderableFrequencyData(store, getFrequencyData()),
    time: getRenderableTimeData(store, getTimeData()),
  }
}

function updateParticleTime(store, currentTime, deltaTime, boost) {
  if (!store.isPlaying) return currentTime
  const safeDelta = Math.max(0, deltaTime) / 1000
  return currentTime + safeDelta * boost
}

function updateDrift(store, currentOffset, direction, deltaTime) {
  if (!store.drift || !store.isPlaying || store.previewBackgroundMode !== 'animate') return currentOffset
  return currentOffset + store.driftIntensity * 0.0003 * direction * deltaTime
}

function updateDriftDirection(offset, currentDirection) {
  return Math.abs(offset) > 30 ? currentDirection * -1 : currentDirection
}
