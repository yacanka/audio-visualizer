import { drawLayeredVisualizer } from './layeredShapes.js'
import { drawSoundVisibleVisualizer } from './soundVisibleVisualizer.js'
import { getCachedImage } from './images.js'

/** Draw the active visualizer shape. */
export function drawVisualizerShape(store, ctx, data, size, driftOffset, rumbleScale = 1, animationTime = 0, deltaTime = 0, visualizerState = null) {
  const shapeData = getShapeData(store, data)
  ctx.save()
  applyVisualizerTransform(store, ctx, size, rumbleScale, data.motion)
  drawActiveVisualizer(store, ctx, shapeData, size, driftOffset, animationTime, deltaTime, visualizerState)
  drawVisualizerImage(store, ctx, size, data.motion)
  ctx.restore()
}

function drawVisualizerImage(store, ctx, size, motion) {
  if (store.visualizerImageVisible === false || store.vizShape !== 'circular') return
  const image = getCachedImage(store.visualizerImageSrc)
  if (!image?.complete || !image.naturalWidth) return
  const diameter = Math.min(size.w, size.h) * (store.visualizerDiameter / 110) * (store.visualizerImageSize / 100)
  ctx.save()
  ctx.translate(size.w / 2, size.h / 2)
  if (store.visualizerLogoLocked && store.visualizerSpin) ctx.rotate(-(motion?.spin || 0) * Math.PI / 180)
  ctx.beginPath()
  ctx.arc(0, 0, diameter / 2, 0, Math.PI * 2)
  ctx.clip()
  const scale = diameter / Math.min(image.naturalWidth, image.naturalHeight)
  ctx.drawImage(image, -image.naturalWidth * scale / 2, -image.naturalHeight * scale / 2,
    image.naturalWidth * scale, image.naturalHeight * scale)
  ctx.restore()
}

function drawActiveVisualizer(store, ctx, shapeData, size, driftOffset, animationTime, deltaTime, visualizerState) {
  if (store.visualizerMode === 'soundvisible') {
    drawSoundVisibleVisualizer(store, ctx, shapeData.frequency, size, animationTime, deltaTime, visualizerState)
    return
  }
  if (store.vizShape === 'bars' || store.vizShape === 'circular') {
    drawLayeredVisualizer(store, ctx, shapeData.frequency, size, driftOffset, shapeData.layerFrequencies, shapeData.motion?.layerSpins)
  }
  if (store.vizShape === 'mirror') drawLegacyMirror(store, ctx, shapeData.frequency, size)
  if (store.vizShape === 'wave') drawWave(store, ctx, shapeData.time, size)
  if (store.vizShape === 'filled') drawFilled(store, ctx, shapeData.frequency, size)
}

function getShapeData(store, data) {
  // Layered shapes invert their selected frequency band, never the entire FFT.
  if (store.visualizerMode !== 'soundvisible' && ['bars', 'circular'].includes(store.vizShape)) return data
  if (!store.vizInvert) return data
  return { ...data, frequency: [...data.frequency].reverse(), time: [...data.time].reverse(),
    layerFrequencies: data.layerFrequencies?.map(frequency => [...frequency].reverse()) }
}

function applyVisualizerTransform(store, ctx, size, rumbleScale, motion = {}) {
  const x = (store.visualizerXPosition / 100) * size.w * 0.5
  const y = (store.visualizerYPosition / 100) * size.h * 0.5
  const spin = store.visualizerSpin ? (motion.spin ?? store.currentTime * 24) : 0
  ctx.translate(size.w / 2 + x + ((motion.x || 0) + (motion.shakeX || 0)) * size.w,
    size.h / 2 + y + ((motion.y || 0) + (motion.shakeY || 0)) * size.h)
  ctx.rotate(((store.visualizerRotation + spin + (motion.rotation || 0)) * Math.PI) / 180)
  ctx.scale(rumbleScale * (motion.scale || 1), rumbleScale * (motion.scale || 1))
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
