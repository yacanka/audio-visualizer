import { forEachCircularBarAngle } from './circularReflection.js'
import { getLayerLayout, getRenderableLayers } from './layerLayout.js'
import { createSpectrumMagnitudes } from './spectrumProcessing.js'
/** Draw all visible visualizer layers using the selected style and layout mode. */
export function drawLayeredVisualizer(store, ctx, frequencyData, size, driftOffset) {
  const layers = getRenderableLayers(store)
  for (let index = layers.length - 1; index >= 0; index--) {
    if (!layers[index].visible) continue
    const layout = getLayerLayout(store.vizLayerMode, index, layers.length, store.visualizerSeparation)
    drawLayer(store, ctx, frequencyData, size, driftOffset, layers[index], layout)
  }
  if (store.vizShape === 'circular') drawCenterCutout(store, ctx, size, driftOffset)
}

function drawLayer(store, ctx, data, size, driftOffset, layer, layout) {
  if (store.vizShape === 'circular') {
    drawCircularLayer(store, ctx, data, size, driftOffset, layer, layout)
    return
  }
  drawFlatLayer(store, ctx, data, size, layer, layout)
}
function drawCircularLayer(store, ctx, data, size, driftOffset, layer, layout) {
  const circle = getCircleMetrics(store, size, driftOffset, layout)
  const bars = collectCircularBars(store, data, circle, layout)
  if (store.vizStyle === 'solid') drawCircularSolid(ctx, bars, circle, layer)
  if (store.vizStyle === 'bar') bars.forEach(bar => drawCircularBar(store, ctx, bar, circle, layer))
  if (store.vizStyle === 'point') bars.forEach(bar => drawCircularPoint(store, ctx, bar, layer))
}

function getCircleMetrics(store, size, driftOffset, layout) {
  const baseRadius = Math.min(size.w, size.h) * (store.visualizerDiameter / 220)
  const scale = layout.overallScale
  return {
    cx: size.w / 2 + driftOffset * 0.3,
    cy: size.h / 2,
    radius: baseRadius * (1 + layout.baseOffsetScale) * scale,
    maxHeight: Math.min(size.w, size.h) * 0.25 * layout.heightScale * scale,
  }
}

function collectCircularBars(store, data, circle, layout) {
  const bars = []
  const magnitudes = createSpectrumMagnitudes(store, data, store.barCount, layout, shouldLoopSpectrum(store))
  forEachCircularBarAngle(store.vizReflection, store.barCount, (angle, _index, ratio) => {
    const height = getMagnitudeAtRatio(magnitudes, ratio) * circle.maxHeight
    bars.push({ angle, height, inner: pointOnCircle(circle, circle.radius, angle), outer: pointOnCircle(circle, circle.radius + height, angle) })
  })
  bars.sort((first, second) => first.angle - second.angle)
  return bars
}
function drawCircularSolid(ctx, bars, circle, layer) {
  if (!bars.length) return
  ctx.beginPath()
  ctx.moveTo(bars[0].outer.x, bars[0].outer.y)
  bars.slice(1).forEach(bar => ctx.lineTo(bar.outer.x, bar.outer.y))
  ;[...bars].reverse().forEach((bar) => {
    const inner = pointOnCircle(circle, circle.radius, bar.angle)
    ctx.lineTo(inner.x, inner.y)
  })
  ctx.closePath()
  paintShape(ctx, layer)
}

function drawCircularBar(store, ctx, bar, circle, layer) {
  const width = Math.max(1, (Math.PI * 2 * circle.radius / store.barCount) * (store.visualizerBarWidth / 100))
  if (layer.outlineWidth > 0) drawLine(ctx, bar.inner, bar.outer, layer.outlineColor, width + layer.outlineWidth * 2)
  drawLine(ctx, bar.inner, bar.outer, layer.fillColor, width)
}

function drawCircularPoint(store, ctx, bar, layer) {
  const radius = Math.max(1, store.visualizerPointRadius)
  ctx.beginPath()
  ctx.arc(bar.outer.x, bar.outer.y, radius, 0, Math.PI * 2)
  paintShape(ctx, layer)
}

function drawFlatLayer(store, ctx, data, size, layer, layout) {
  const metrics = getFlatMetrics(store, size, layout)
  const points = collectFlatPoints(store, data, metrics, layout)
  if (store.vizStyle === 'solid') drawFlatSolid(store, ctx, points, metrics, layer)
  if (store.vizStyle === 'bar') points.forEach(point => drawFlatBar(store, ctx, point, metrics, layer))
  if (store.vizStyle === 'point') points.forEach(point => drawFlatPoint(store, ctx, point, metrics, layer))
}

function getFlatMetrics(store, size, layout) {
  const scale = layout.overallScale
  const width = size.w * (store.visualizerWidth / 100) * scale
  const baseOffset = size.h * layout.baseOffsetScale * 0.2
  const baseHeight = (store.visualizerBaseHeight / 100) * size.h * 0.4
  return {
    baseline: size.h / 2 + (baseHeight - baseOffset) * scale,
    height: size.h * (store.visualizerWaveHeight / 100) * layout.heightScale * scale,
    startX: (size.w - width) / 2,
    width,
  }
}

function collectFlatPoints(store, data, metrics, layout) {
  const count = Math.max(4, Math.floor(store.barCount))
  const magnitudes = createSpectrumMagnitudes(store, data, count, layout)
  return Array.from({ length: count }, (_, index) => {
    const ratio = count === 1 ? 0 : index / (count - 1)
    const sourceRatio = isHorizontalMirror(store.vizReflection) ? Math.abs(ratio * 2 - 1) : ratio
    return { x: metrics.startX + ratio * metrics.width, height: getMagnitudeAtRatio(magnitudes, sourceRatio) * metrics.height }
  })
}

function drawFlatSolid(store, ctx, points, metrics, layer) {
  if (!points.length) return
  ctx.beginPath()
  ctx.moveTo(points[0].x, metrics.baseline)
  points.forEach(point => ctx.lineTo(point.x, metrics.baseline - point.height))
  if (isVerticalMirror(store.vizReflection)) [...points].reverse().forEach(point => ctx.lineTo(point.x, metrics.baseline + point.height))
  else ctx.lineTo(points.at(-1).x, metrics.baseline)
  ctx.closePath()
  paintShape(ctx, layer)
}

function drawFlatBar(store, ctx, point, metrics, layer) {
  const width = Math.max(1, (metrics.width / store.barCount) * (store.visualizerBarWidth / 100))
  const bottom = isVerticalMirror(store.vizReflection) ? metrics.baseline + point.height : metrics.baseline
  const rectangle = { x: point.x - width / 2, y: metrics.baseline - point.height, width, height: bottom - metrics.baseline + point.height }
  ctx.fillStyle = layer.fillColor
  ctx.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height)
  if (layer.outlineWidth > 0) drawRectangleOutline(ctx, rectangle, layer)
}

function drawFlatPoint(store, ctx, point, metrics, layer) {
  drawPoint(ctx, point.x, metrics.baseline - point.height, store.visualizerPointRadius, layer)
  if (isVerticalMirror(store.vizReflection)) drawPoint(ctx, point.x, metrics.baseline + point.height, store.visualizerPointRadius, layer)
}

function getMagnitudeAtRatio(magnitudes, ratio) {
  if (!magnitudes.length) return 0
  const position = Math.min(1, Math.max(0, ratio)) * (magnitudes.length - 1)
  const lower = magnitudes[Math.floor(position)]
  const upper = magnitudes[Math.ceil(position)]
  return lower + (upper - lower) * (position % 1)
}

function drawLine(ctx, start, end, color, width) {
  if (width <= 0) return
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(end.x, end.y)
  ctx.stroke()
}

function drawPoint(ctx, x, y, radius, layer) {
  ctx.beginPath()
  ctx.arc(x, y, Math.max(1, radius), 0, Math.PI * 2)
  paintShape(ctx, layer)
}

function paintShape(ctx, layer) {
  ctx.fillStyle = layer.fillColor
  ctx.fill()
  if (layer.outlineWidth <= 0) return
  ctx.strokeStyle = layer.outlineColor
  ctx.lineWidth = layer.outlineWidth
  ctx.stroke()
}

function drawRectangleOutline(ctx, rectangle, layer) {
  ctx.strokeStyle = layer.outlineColor
  ctx.lineWidth = layer.outlineWidth
  ctx.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height)
}

function pointOnCircle(circle, radius, angle) {
  return { x: circle.cx + Math.cos(angle) * radius, y: circle.cy + Math.sin(angle) * radius }
}

function isHorizontalMirror(reflection) {
  return reflection === 'one-side' || reflection === 'combo'
}

function isVerticalMirror(reflection) {
  return reflection === 'two-side' || reflection === 'combo'
}

function shouldLoopSpectrum(store) {
  return store.vizShape === 'circular' && store.vizReflection !== 'vertical'
}

function drawCenterCutout(store, ctx, size, driftOffset) {
  if (store.centerCutout <= 0) return
  const radius = Math.min(size.w, size.h) * (store.visualizerDiameter / 220) * (store.centerCutout / 100)
  ctx.beginPath()
  ctx.arc(size.w / 2 + driftOffset * 0.3, size.h / 2, radius, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.38)'
  ctx.fill()
}
