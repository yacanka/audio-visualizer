import { drawLayeredVisualizer } from './layeredShapes.js'

/** Draw the active visualizer shape. */
export function drawVisualizerShape(store, ctx, data, size, driftOffset, rumbleScale = 1) {
  const shapeData = getShapeData(store, data)
  ctx.save()
  applyVisualizerTransform(store, ctx, size, rumbleScale)
  if (store.vizShape === 'bars' || store.vizShape === 'circular') {
    drawLayeredVisualizer(store, ctx, shapeData.frequency, size, driftOffset)
  }
  if (store.vizShape === 'mirror') drawLegacyMirror(store, ctx, shapeData.frequency, size)
  if (store.vizShape === 'wave') drawWave(store, ctx, shapeData.time, size)
  if (store.vizShape === 'filled') drawFilled(store, ctx, shapeData.frequency, size)
  ctx.restore()
}

function getShapeData(store, data) {
  if (!store.vizInvert) return data
  return { frequency: [...data.frequency].reverse(), time: [...data.time].reverse() }
}

function applyVisualizerTransform(store, ctx, size, rumbleScale) {
  const x = (store.visualizerXPosition / 100) * size.w * 0.5
  const y = (store.visualizerYPosition / 100) * size.h * 0.5
  const spin = store.visualizerSpin ? store.currentTime * 24 : 0
  ctx.translate(size.w / 2 + x, size.h / 2 + y)
  ctx.rotate(((store.visualizerRotation + spin) * Math.PI) / 180)
  ctx.scale(rumbleScale, rumbleScale)
  ctx.translate(-size.w / 2, -size.h / 2)
}

function drawLegacyMirror(store, ctx, frequencyData, size) {
  const count = Math.max(1, Math.floor(store.barCount))
  const width = Math.max(1, size.w / count - store.barGap)
  for (let index = 0; index < count; index++) {
    const height = getLegacyHeight(store, frequencyData, index, count, size.h * 0.38)
    drawLegacyMirrorBar(store, ctx, size, index, width, height)
  }
}

function drawLegacyMirrorBar(store, ctx, size, index, width, height) {
  const x = index * (width + store.barGap)
  ctx.fillStyle = store.barColor
  ctx.fillRect(x, size.h / 2 - height, width, height * 2)
}

function getLegacyHeight(store, data, index, count, maximum) {
  const limitRatio = store.vizSpectrum === 'bass' ? 0.25 : 0.85
  const dataIndex = Math.round((index / count) * data.length * limitRatio)
  return Math.max(1, (data[dataIndex] / 255) * store.sensitivity * maximum)
}

function drawWave(store, ctx, timeData, size) {
  ctx.beginPath()
  ctx.lineWidth = 2.5
  ctx.strokeStyle = getWaveColor(store, ctx, size.w)
  const step = size.w / timeData.length
  for (let index = 0; index < timeData.length; index++) {
    drawWavePoint(store, ctx, timeData[index], index, step, size)
  }
  ctx.stroke()
}

function drawWavePoint(store, ctx, sample, index, step, size) {
  const height = (store.visualizerWaveHeight / 100) * size.h
  const y = size.h / 2 + ((sample - 128) / 128) * height * store.sensitivity
  if (index === 0) ctx.moveTo(0, y)
  else ctx.lineTo(index * step, y)
}

function getWaveColor(store, ctx, width) {
  if (!store.useGradient) return store.barColor
  const gradient = ctx.createLinearGradient(0, 0, width, 0)
  gradient.addColorStop(0, store.barColor)
  gradient.addColorStop(1, store.barColor2)
  return gradient
}

function drawFilled(store, ctx, frequencyData, size) {
  const limitRatio = store.vizSpectrum === 'bass' ? 0.25 : 0.85
  const limit = Math.floor(frequencyData.length * limitRatio)
  const gradient = ctx.createLinearGradient(0, 0, 0, size.h)
  gradient.addColorStop(0, store.barColor)
  gradient.addColorStop(1, store.useGradient ? store.barColor2 : `${store.barColor}44`)
  ctx.fillStyle = gradient
  ctx.strokeStyle = store.barColor
  ctx.lineWidth = 2
  drawFilledPath(store, ctx, frequencyData, limit, size)
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
