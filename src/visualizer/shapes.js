import { getBarColor, lerpColor } from './colors.js'
import { forEachCircularBarAngle, getCircularReflectionMultiplier } from './circularReflection.js'

/** Draw the active visualizer shape. */
export function drawVisualizerShape(store, ctx, data, size, driftOffset) {
  const shapeData = getShapeData(store, data)
  const shape = store.vizShape
  ctx.save()
  applyVisualizerTransform(store, ctx, size)
  if (shape === 'bars') drawBars(store, ctx, shapeData.frequency, size, false)
  if (shape === 'mirror') drawBars(store, ctx, shapeData.frequency, size, true)
  if (shape === 'wave') drawWave(store, ctx, shapeData.time, size)
  if (shape === 'circular') drawCircular(store, ctx, shapeData.frequency, size, driftOffset)
  if (shape === 'filled') drawFilled(store, ctx, shapeData.frequency, size)
  ctx.restore()
}

function getShapeData(store, data) {
  if (!store.vizInvert) return data
  return { frequency: [...data.frequency].reverse(), time: [...data.time].reverse() }
}

function applyVisualizerTransform(store, ctx, size) {
  const x = (store.visualizerXPosition / 100) * size.w * 0.5
  const y = (store.visualizerYPosition / 100) * size.h * 0.5
  const spin = store.visualizerSpin ? store.currentTime * 24 : 0
  ctx.translate(size.w / 2 + x, size.h / 2 + y)
  ctx.rotate(((store.visualizerRotation + spin) * Math.PI) / 180)
  ctx.translate(-size.w / 2, -size.h / 2)
}

function getSpectrumSlice(store, frequencyData) {
  const limitRatio = store.vizSpectrum === 'bass' ? 0.25 : 0.85
  return { data: frequencyData, limit: Math.floor(frequencyData.length * limitRatio) }
}

function drawBars(store, ctx, frequencyData, size, mirror) {
  const { data, limit } = getSpectrumSlice(store, frequencyData)
  const metrics = getBarMetrics(store, size, mirror)

  for (let index = 0; index < store.barCount; index++) {
    drawBar(store, ctx, data, limit, metrics, index, mirror)
  }
}

function getBarMetrics(store, size, mirror) {
  const totalGap = store.barGap * (store.barCount - 1)
  const barWidth = Math.max(1, (size.w - totalGap) / store.barCount)
  return {
    barWidth,
    maxHeight: mirror ? size.h * 0.38 : size.h * 0.78,
    baseY: mirror ? size.h / 2 : size.h,
    size,
  }
}

function drawBar(store, ctx, data, limit, metrics, index, mirror) {
  const dataIndex = Math.round((index / store.barCount) * limit)
  const height = Math.max(1, (data[dataIndex] / 255) * store.sensitivity * metrics.maxHeight)
  const x = index * (metrics.barWidth + store.barGap) + getCenteredOffset(store, metrics)
  const y = metrics.baseY - height
  const rect = { x, y, w: metrics.barWidth, h: height }

  ctx.fillStyle = getBarColor(store, ctx, rect, metrics.size)
  if (store.vizStyle === 'point') return drawBarPoint(ctx, rect, mirror)
  drawRoundedRect(store, ctx, rect, [1, 1, 0, 0])
  if (mirror && height > 1) drawRoundedRect(store, ctx, { ...rect, y: metrics.baseY }, [0, 0, 1, 1])
}

function drawBarPoint(ctx, rect, mirror) {
  ctx.beginPath()
  ctx.arc(rect.x + rect.w / 2, rect.y, Math.max(2, rect.w / 2), 0, Math.PI * 2)
  ctx.fill()
  if (!mirror) return
  ctx.beginPath()
  ctx.arc(rect.x + rect.w / 2, rect.y + rect.h * 2, Math.max(2, rect.w / 2), 0, Math.PI * 2)
  ctx.fill()
}

function getCenteredOffset(store, metrics) {
  const totalWidth = store.barCount * (metrics.barWidth + store.barGap) - store.barGap
  return (metrics.size.w - totalWidth) / 2
}

function drawRoundedRect(store, ctx, rect, corners) {
  const radius = Math.min(store.barRounding, rect.w / 2, rect.h / 2)
  ctx.beginPath()
  if (radius > 0) ctx.roundRect(rect.x, rect.y, rect.w, rect.h, corners.map(value => value * radius))
  else ctx.rect(rect.x, rect.y, rect.w, rect.h)
  ctx.fill()
}

function drawWave(store, ctx, timeData, size) {
  ctx.beginPath()
  ctx.lineWidth = 2.5
  ctx.strokeStyle = getWaveColor(store, ctx, size.w)

  const step = size.w / timeData.length
  for (let index = 0; index < timeData.length; index++) {
    const height = (store.visualizerWaveHeight / 100) * size.h
    const y = size.h / 2 + ((timeData[index] - 128) / 128) * height * store.sensitivity
    if (index === 0) ctx.moveTo(0, y)
    else ctx.lineTo(index * step, y)
  }
  ctx.stroke()
}

function getWaveColor(store, ctx, width) {
  if (!store.useGradient) return store.barColor
  const gradient = ctx.createLinearGradient(0, 0, width, 0)
  gradient.addColorStop(0, store.barColor)
  gradient.addColorStop(1, store.barColor2)
  return gradient
}

function drawFilled(store, ctx, frequencyData, size) {
  const { data, limit } = getSpectrumSlice(store, frequencyData)
  const gradient = ctx.createLinearGradient(0, 0, 0, size.h)
  gradient.addColorStop(0, store.barColor)
  gradient.addColorStop(1, store.useGradient ? store.barColor2 : `${store.barColor}44`)
  ctx.fillStyle = gradient
  ctx.strokeStyle = store.barColor
  ctx.lineWidth = 2
  drawFilledPath(store, ctx, data, limit, size)
}

function drawFilledPath(store, ctx, data, limit, size) {
  ctx.beginPath()
  ctx.moveTo(0, size.h)
  for (let index = 0; index < limit; index++) {
    const y = size.h - (data[index] / 255) * store.sensitivity * size.h * 0.78
    ctx.lineTo(index * (size.w / limit), y)
  }
  ctx.lineTo(size.w, size.h)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
}

function drawCircular(store, ctx, frequencyData, size, driftOffset) {
  const { data, limit } = getSpectrumSlice(store, frequencyData)
  const circle = getCircleMetrics(store, size, driftOffset)

  forEachCircularBarAngle(store.vizReflection, store.barCount, (angle, index, ratio) => {
    drawCircularBar(store, ctx, data, limit, circle, { angle, index, ratio })
  })
  drawInnerCircle(store, ctx, circle)
}

function getCircleMetrics(store, size, driftOffset) {
  const radius = Math.min(size.w, size.h) * (store.visualizerDiameter / 220)
  const multiplier = getCircularReflectionMultiplier(store.vizReflection)
  return {
    cx: size.w / 2 + driftOffset * 0.3,
    cy: size.h / 2,
    radius,
    maxBarHeight: Math.min(size.w, size.h) * 0.25,
    lineWidth: getCircularLineWidth(radius, store.barCount, multiplier),
  }
}

function getCircularLineWidth(radius, barCount, multiplier) {
  const safeBarCount = Math.max(1, barCount * multiplier)
  return Math.max(1.5, (Math.PI * 2 * radius / safeBarCount) * 0.6)
}

function drawCircularBar(store, ctx, data, limit, circle, bar) {
  const height = getCircularBarHeight(store, data, limit, circle, bar.ratio)
  const start = pointOnCircle(circle, circle.radius, bar.angle)
  const end = pointOnCircle(circle, circle.radius + height, bar.angle)
  ctx.beginPath()
  ctx.strokeStyle = getCircularBarColor(store, bar.index)
  ctx.lineWidth = circle.lineWidth
  ctx.lineCap = 'round'
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(end.x, end.y)
  ctx.stroke()
}

function getCircularBarHeight(store, data, limit, circle, ratio) {
  const index = Math.min(data.length - 1, Math.round(ratio * limit))
  return (data[index] / 255) * store.sensitivity * circle.maxBarHeight
}

function getCircularBarColor(store, index) {
  if (!store.useGradient) return store.barColor
  return lerpColor(store.barColor, store.barColor2, index / store.barCount)
}

function pointOnCircle(circle, radius, angle) {
  return { x: circle.cx + Math.cos(angle) * radius, y: circle.cy + Math.sin(angle) * radius }
}

function drawInnerCircle(store, ctx, circle) {
  if (store.centerCutout <= 0) return
  ctx.beginPath()
  ctx.arc(circle.cx, circle.cy, circle.radius * (store.centerCutout / 100), 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.38)'
  ctx.fill()
}
