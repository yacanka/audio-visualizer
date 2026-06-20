import { drawVisualizerShape } from './shapes.js'

const MAX_GLOW_DIMENSION = 960
const GLOW_FRAME_INTERVAL = 1000 / 30

/** Create a cached, reduced-resolution glow compositor for a canvas. */
export function createGlowLayerRenderer(canvas) {
  const source = createLayer(canvas)
  const blurred = createLayer(canvas)
  let lastRenderTime = Number.NEGATIVE_INFINITY

  function draw(store, targetContext, frameData, size, motion, timestamp) {
    const effect = getEffect(store)
    if (!effect || !source || !blurred) return
    if (timestamp - lastRenderTime >= GLOW_FRAME_INTERVAL) {
      renderGlow(store, source, blurred, frameData, size, motion, effect)
      lastRenderTime = timestamp
    }
    targetContext.drawImage(blurred.canvas, 0, 0, size.w, size.h)
  }

  return { draw }
}

function createLayer(canvas) {
  const ownerDocument = canvas.ownerDocument ?? globalThis.document
  const layerCanvas = ownerDocument?.createElement?.('canvas')
  if (!layerCanvas) return null
  return { canvas: layerCanvas, context: layerCanvas.getContext('2d') }
}

function renderGlow(store, source, blurred, frameData, size, motion, effect) {
  const scale = resizeLayers(source.canvas, blurred.canvas, size)
  drawGlowSource(store, source, frameData, size, motion, effect.color, scale)
  blurGlowSource(source, blurred, effect.blur * scale)
}

function resizeLayers(sourceCanvas, blurredCanvas, size) {
  const scale = Math.min(1, MAX_GLOW_DIMENSION / Math.max(size.w, size.h))
  const width = Math.max(1, Math.ceil(size.w * scale))
  const height = Math.max(1, Math.ceil(size.h * scale))
  resizeCanvas(sourceCanvas, width, height)
  resizeCanvas(blurredCanvas, width, height)
  return scale
}

function resizeCanvas(canvas, width, height) {
  if (canvas.width === width && canvas.height === height) return
  canvas.width = width
  canvas.height = height
}

function drawGlowSource(store, layer, frameData, size, motion, color, scale) {
  resetContext(layer.context, layer.canvas)
  layer.context.save()
  layer.context.scale(scale, scale)
  drawVisualizerShape(store, layer.context, frameData, size, motion.driftOffset, motion.rumbleScale)
  layer.context.globalCompositeOperation = 'source-in'
  layer.context.fillStyle = color
  layer.context.fillRect(0, 0, size.w, size.h)
  layer.context.restore()
}

function blurGlowSource(source, blurred, blurRadius) {
  resetContext(blurred.context, blurred.canvas)
  blurred.context.save()
  blurred.context.filter = `blur(${blurRadius}px)`
  blurred.context.drawImage(source.canvas, 0, 0)
  blurred.context.restore()
}

function resetContext(context, canvas) {
  context.setTransform(1, 0, 0, 1, 0, 0)
  context.clearRect(0, 0, canvas.width, canvas.height)
}

function getEffect(store) {
  if (!store.fireEnabled && !store.glowEnabled && !store.shadowEnabled) return null
  if (store.fireEnabled) return { color: getFireColor(store), blur: store.glowAmount + 12 }
  if (store.glowEnabled) return { color: store.glowColor, blur: store.glowAmount + store.glowScale * 0.4 }
  return { color: 'rgba(0,0,0,0.6)', blur: 12 }
}

function getFireColor(store) {
  return store.shadowEnabled && !store.glowEnabled ? 'rgba(0,0,0,0.6)' : '#ff7a18'
}
