import { toRgba } from './colors.js'
import { createSpectrumMagnitudes } from './spectrumProcessing.js'
import { drawSoundVisibleShards } from './soundVisibleShards.js'

const DEFAULT_LAYOUT = { peakShiftPasses: 1, smoothingPasses: 6 }
const DEFAULT_PRIMARY = '#f7d774'
const DEFAULT_SECONDARY = '#fff4b8'

/** Draw a SoundVisible-inspired horizontal beam visualizer. */
export function drawSoundVisibleVisualizer(store, ctx, frequencyData, size, animationTime = 0, deltaTime = 0, visualizerState = null) {
  const metrics = getBeamMetrics(store, size, animationTime)
  const magnitudes = createBeamMagnitudes(store, frequencyData)
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  drawBeamGlow(ctx, metrics)
  drawFrequencyLines(ctx, magnitudes, metrics)
  drawCenterTrace(ctx, magnitudes, metrics)
  drawSoundVisibleShards(ctx, magnitudes, metrics, getLineHeight, visualizerState, deltaTime)
  ctx.restore()
}

function createBeamMagnitudes(store, frequencyData) {
  const layout = { ...DEFAULT_LAYOUT, smoothingPasses: store.vizSmooth ? 7 : 0 }
  const pointCount = Math.max(8, Number(store.barCount) || 80)
  return createSpectrumMagnitudes(store, frequencyData, pointCount, layout)
}

function getBeamMetrics(store, size, animationTime) {
  const width = size.w * clamp((store.visualizerWidth ?? 90) / 100, 0.1, 1.2)
  const baseHeight = ((store.visualizerBaseHeight ?? 0) / 100) * size.h * 0.36
  return {
    canvasHeight: size.h, canvasWidth: size.w, centerY: size.h / 2 + baseHeight,
    colorA: getPrimaryColor(store), colorB: getSecondaryColor(store), endX: (size.w + width) / 2,
    glow: clamp(store.soundVisibleGlow ?? 70, 0, 100),
    height: size.h * clamp((store.visualizerWaveHeight ?? 30) / 100, 0.05, 0.8) * 0.56,
    lineWidth: clamp(store.soundVisibleLineWidth ?? 2, 1, 12),
    shardCount: Math.floor(clamp(store.soundVisibleShardAmount ?? 28, 0, 80)),
    shardFadeDistance: clamp(store.soundVisibleShardFadeDistance ?? 100, 40, 180),
    shardSize: clamp(store.soundVisibleShardSize ?? 22, 4, 60),
    shardTurbulence: clamp(store.soundVisibleShardTurbulence ?? 45, 0, 100),
    shardWindDirection: clamp(store.soundVisibleShardWindDirection ?? 0, -180, 180),
    startX: (size.w - width) / 2, time: getAnimationSeconds(store, animationTime), width,
  }
}

function getAnimationSeconds(store, animationTime) {
  const seconds = Number(animationTime) > 0 ? Number(animationTime) / 1000 : Number(store.currentTime)
  return Number.isFinite(seconds) ? seconds : 0
}

function drawBeamGlow(ctx, metrics) {
  getGlowPasses(metrics).forEach((pass) => {
    ctx.beginPath()
    ctx.lineWidth = pass.width
    ctx.strokeStyle = createBeamGradient(ctx, metrics, pass.alpha)
    ctx.moveTo(metrics.startX, metrics.centerY)
    ctx.lineTo(metrics.endX, metrics.centerY)
    ctx.stroke()
  })
}

function getGlowPasses(metrics) {
  const intensity = metrics.glow / 100
  return [
    { alpha: 0.14 * intensity, width: metrics.lineWidth + 58 * intensity },
    { alpha: 0.3 * intensity, width: metrics.lineWidth + 24 * intensity },
    { alpha: 0.92, width: metrics.lineWidth },
  ]
}

function createBeamGradient(ctx, metrics, alpha) {
  const gradient = ctx.createLinearGradient(metrics.startX, 0, metrics.endX, 0)
  gradient.addColorStop(0, toRgba(metrics.colorA, 0))
  gradient.addColorStop(0.18, toRgba(metrics.colorA, alpha * 0.72))
  gradient.addColorStop(0.5, toRgba(metrics.colorB, alpha))
  gradient.addColorStop(0.82, toRgba(metrics.colorA, alpha * 0.72))
  gradient.addColorStop(1, toRgba(metrics.colorA, 0))
  return gradient
}

function drawFrequencyLines(ctx, magnitudes, metrics) {
  const step = metrics.width / Math.max(1, magnitudes.length - 1)
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineWidth = Math.max(1, metrics.lineWidth * 1.25)
  ctx.strokeStyle = createBeamGradient(ctx, metrics, 0.9)
  ctx.shadowBlur = metrics.glow * 0.1
  ctx.shadowColor = toRgba(metrics.colorA, 0.9)
  ctx.beginPath()
  magnitudes.forEach((magnitude, index) => addFrequencyLine(ctx, metrics, magnitude, index, step))
  ctx.stroke()
  ctx.restore()
}

function addFrequencyLine(ctx, metrics, magnitude, index, step) {
  const x = metrics.startX + step * index
  const height = getLineHeight(magnitude, index, metrics)
  ctx.moveTo(x, metrics.centerY - height)
  ctx.lineTo(x, metrics.centerY + height)
}

function getLineHeight(magnitude, index, metrics) {
  const ripple = 0.88 + Math.sin(index * 0.41 + metrics.time * 2.2) * 0.12
  return Math.max(metrics.lineWidth, metrics.height * Math.pow(magnitude, 0.78) * ripple)
}

function drawCenterTrace(ctx, magnitudes, metrics) {
  const step = metrics.width / Math.max(1, magnitudes.length - 1)
  ctx.beginPath()
  magnitudes.forEach((magnitude, index) => addTracePoint(ctx, magnitude, index, step, metrics, -1))
  magnitudes.forEach((magnitude, index) => addTracePoint(ctx, magnitude, index, step, metrics, 1))
  ctx.lineWidth = Math.max(1, metrics.lineWidth * 0.72)
  ctx.strokeStyle = toRgba(metrics.colorB, 0.92)
  ctx.stroke()
}

function addTracePoint(ctx, magnitude, index, step, metrics, direction) {
  const x = metrics.startX + step * index
  const y = metrics.centerY + direction * metrics.height * Math.pow(magnitude, 1.35) * 0.22
  if (index === 0) ctx.moveTo(x, y)
  else ctx.lineTo(x, y)
}

function getPrimaryColor(store) {
  return store.soundVisibleColor || getVisibleLayerColor(store, 0) || store.barColor || DEFAULT_PRIMARY
}

function getSecondaryColor(store) {
  return store.soundVisibleCoreColor || getVisibleLayerColor(store, 1) || store.barColor2 || DEFAULT_SECONDARY
}

function getVisibleLayerColor(store, index) {
  if (!Array.isArray(store.visualizerLayers)) return null
  return store.visualizerLayers.filter(layer => layer.visible !== false)[index]?.fillColor
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, Number(value) || 0))
}
