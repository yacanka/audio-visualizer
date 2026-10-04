import { getCachedImage } from './images.js'
import { getDriftMotion } from './motion.js'

/** Draw a clean background each frame, then mirror its pixels into exact halves. */
export function drawBackdrop(store, ctx, width, height, audioMotion = {}, time = 0) {
  ctx.save()
  ctx.fillStyle = store.backdropColor || '#0d0d1a'
  ctx.fillRect(0, 0, width, height)
  ctx.save()
  const energy = store.previewAudioAnalysisEnabled && store.isPlaying ? (audioMotion.energy || 0) : 0
  applyMotion(store, ctx, width, height, time, energy)
  ctx.filter = getBackdropFilter(store)
  drawBackdropBase(store, ctx, width, height)
  ctx.restore()
  drawColorize(store, ctx, width, height)
  drawReflection(store, ctx, width, height)
  ctx.restore()
}

function drawBackdropBase(store, ctx, width, height) {
  if (store.backdropType === 'gradient') return drawGradientBackdrop(store, ctx, width, height)
  if (store.backdropType === 'video' && store.backdropVideo?.readyState >= 2) {
    drawFittedImage(store, ctx, store.backdropVideo, width, height)
    return
  }
  const image = store.backdropImage || getCachedImage(store.backdropImageSrc)
  if (store.backdropType === 'image' && image && image.complete !== false && (image.naturalWidth ?? image.width)) {
    drawFittedImage(store, ctx, image, width, height)
    return
  }
  ctx.fillStyle = store.backdropColor || '#0d0d1a'
  ctx.fillRect(0, 0, width, height)
}

function applyMotion(store, ctx, width, height, time, energy) {
  const drift = getDriftMotion(store, time, energy, 'backdrop')
  const rumble = { none: 0, medium: 0.008, high: 0.018 }[store.backdropRumble] || 0
  const shake = rumble * energy
  const reactive = store.backdropReactive ? energy * (store.backdropReactiveIntensity / 500) : 0
  const rotation = store.backdropRotate && store.previewBackgroundMode !== 'static' ? time * store.backdropRotationSpeed : 0
  ctx.translate(width / 2 + (drift.x + Math.sin(time * 71) * shake) * width,
    height / 2 + (drift.y + Math.sin(time * 89) * shake) * height)
  ctx.rotate((rotation + drift.rotation) * Math.PI / 180)
  const scale = drift.scale + reactive + Math.abs(drift.x) * 2 + Math.abs(drift.y) * 2 + shake * 2
  ctx.scale(store.mirrorH ? -scale : scale, scale)
  ctx.translate(-width / 2, -height / 2)
}

function getBackdropFilter(store) {
  return `hue-rotate(${store.backdropHue || 0}deg) saturate(${Math.max(0, (store.backdropSaturation ?? 50) * 2)}%) brightness(${Math.max(0, (store.backdropLightness ?? 50) * 2)}%)`
}

function drawColorize(store, ctx, width, height) {
  if (!store.backdropColorize) return
  ctx.save()
  ctx.globalAlpha = store.backdropColorizeIntensity / 200
  ctx.fillStyle = store.backdropGradient1
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
}

function drawReflection(store, ctx, width, height) {
  if (!['2-way', '4-way'].includes(store.backdropReflection)) return
  ctx.save()
  ctx.translate(width, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(ctx.canvas, 0, 0, width / 2, height, 0, 0, width / 2, height)
  ctx.restore()
  if (store.backdropReflection !== '4-way') return
  ctx.save()
  ctx.translate(0, height)
  ctx.scale(1, -1)
  ctx.drawImage(ctx.canvas, 0, 0, width, height / 2, 0, 0, width, height / 2)
  ctx.restore()
}

function drawGradientBackdrop(store, ctx, width, height) {
  const angle = (store.backdropGradientAngle * Math.PI) / 180
  const gradient = ctx.createLinearGradient(
    width / 2 - Math.cos(angle) * width, height / 2 - Math.sin(angle) * height,
    width / 2 + Math.cos(angle) * width, height / 2 + Math.sin(angle) * height,
  )
  gradient.addColorStop(0, store.backdropGradient1)
  gradient.addColorStop(1, store.backdropGradient2)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

function drawFittedImage(store, ctx, image, width, height) {
  if (store.backdropImageFit === 'fill') return ctx.drawImage(image, 0, 0, width, height)
  const imageWidth = image.videoWidth || image.naturalWidth || image.width
  const imageHeight = image.videoHeight || image.naturalHeight || image.height
  if (!imageWidth || !imageHeight) return
  const fit = store.backdropImageFit === 'contain' ? Math.min : Math.max
  const scale = fit(width / imageWidth, height / imageHeight)
  ctx.drawImage(image, (width - imageWidth * scale) / 2, (height - imageHeight * scale) / 2,
    imageWidth * scale, imageHeight * scale)
}
