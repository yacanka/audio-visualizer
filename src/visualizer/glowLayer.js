import { drawVisualizerShape } from './shapes.js'

const MAX_GLOW_DIMENSION = 960
const GLOW_FRAME_INTERVAL = 1000 / 30

/** Compose independent glow, fire and shadow passes from a shared shape mask. */
export function createGlowLayerRenderer(canvas) {
  const source = createLayer(canvas)
  const blurred = createLayer(canvas)
  const composite = createLayer(canvas)
  const innerComposite = createLayer(canvas)
  let hasInner = false
  let lastRenderTime = -Infinity
  let previousSettings = ''

  function draw(store, targetContext, frameData, size, motion, timestamp) {
    const effects = getEffects(store)
    hasInner = false
    if (!effects.length || !source?.context || !blurred?.context || !composite?.context || !innerComposite?.context) return
    hasInner = effects.some(effect => effect.inner)
    const key = JSON.stringify([effects, size, store.isPlaying, store.visualizerImageSrc])
    if (key !== previousSettings || timestamp - lastRenderTime >= GLOW_FRAME_INTERVAL) {
      renderEffects(store, source, blurred, composite, innerComposite, frameData, size, motion, effects)
      lastRenderTime = timestamp
      previousSettings = key
    }
    targetContext.drawImage(composite.canvas, 0, 0, size.w, size.h)
  }

  function drawInner(targetContext, size) {
    if (hasInner && innerComposite) targetContext.drawImage(innerComposite.canvas, 0, 0, size.w, size.h)
  }

  return { draw, drawInner }
}

function createLayer(canvas) {
  const ownerDocument = canvas.ownerDocument ?? globalThis.document
  const layerCanvas = ownerDocument?.createElement?.('canvas')
  if (!layerCanvas) return null
  return { canvas: layerCanvas, context: layerCanvas.getContext('2d') }
}

function renderEffects(store, source, blurred, composite, innerComposite, frameData, size, motion, effects) {
  const scale = Math.min(1, MAX_GLOW_DIMENSION / Math.max(size.w, size.h))
  const width = Math.ceil(size.w * scale), height = Math.ceil(size.h * scale)
  for (const layer of [source, blurred, composite, innerComposite]) {
    if (layer.canvas.width !== width || layer.canvas.height !== height) {
      layer.canvas.width = width; layer.canvas.height = height
    }
    resetContext(layer.context, layer.canvas)
  }
  source.context.save()
  source.context.scale(scale, scale)
  drawVisualizerShape({ ...store, visualizerImageVisible: false }, source.context, frameData, size, motion.driftOffset, motion.rumbleScale)
  source.context.restore()
  effects.forEach(effect => {
    drawEffect(source, blurred, effect, scale, store.currentTime || 0)
    const destination = effect.inner ? innerComposite : composite
    destination.context.drawImage(blurred.canvas, 0, 0)
  })
}

function drawEffect(source, output, effect, scale, time) {
  const ctx = output.context
  resetContext(ctx, output.canvas)
  ctx.save()
  ctx.filter = `blur(${effect.blur * scale}px)`
  const lift = effect.fire ? (8 + Math.sin(time * 17) * 4) * effect.intensity * scale : 0
  ctx.drawImage(source.canvas, 0, -lift, source.canvas.width, source.canvas.height + lift)
  ctx.restore()
  ctx.save()
  ctx.globalCompositeOperation = effect.inner ? 'source-out' : 'source-in'
  ctx.fillStyle = effect.color
  ctx.fillRect(0, 0, output.canvas.width, output.canvas.height)
  if (effect.inner) {
    ctx.globalCompositeOperation = 'destination-in'
    ctx.drawImage(source.canvas, 0, 0)
  }
  ctx.restore()
}

function resetContext(context, canvas) {
  context.setTransform(1, 0, 0, 1, 0, 0)
  context.clearRect(0, 0, canvas.width, canvas.height)
}

function getEffects(store) {
  if (store.visualizerMode === 'soundvisible') return []
  const effects = []
  if (store.shadowEnabled) effects.push({ color: `rgba(0,0,0,${(store.shadowOpacity ?? 60) / 100})`, blur: store.shadowBlur ?? 12 })
  if (store.fireEnabled) effects.push({ color: '#ff7a18', blur: 8 + (store.fireDetail ?? 2) * 3,
    fire: true, intensity: (store.fireIntensity ?? 50) / 50 })
  if (store.glowEnabled) effects.push({ color: store.glowColor, blur: store.glowAmount + store.glowScale * 0.4, inner: store.glowType === 'inner' })
  return effects
}
