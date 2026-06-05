/** Draw the configured background onto the canvas. */
export function drawBackdrop(store, ctx, width, height) {
  ctx.save()
  ctx.filter = getBackdropFilter(store)
  drawBackdropBase(store, ctx, width, height)
  ctx.filter = 'none'
  drawColorize(store, ctx, width, height)
  drawReflection(store, ctx, width, height)
  ctx.restore()
}

function drawBackdropBase(store, ctx, width, height) {
  if (store.backdropType === 'gradient') {
    drawGradientBackdrop(store, ctx, width, height)
    return
  }

  if (store.backdropType === 'image' && store.backdropImage) {
    drawFittedImage(store, ctx, store.backdropImage, width, height)
    return
  }

  ctx.fillStyle = store.backdropColor
  ctx.fillRect(0, 0, width, height)
}

function getBackdropFilter(store) {
  const saturation = Math.max(0, store.backdropSaturation * 2)
  const brightness = Math.max(0, store.backdropLightness * 2)
  return `hue-rotate(${store.backdropHue}deg) saturate(${saturation}%) brightness(${brightness}%)`
}

function drawColorize(store, ctx, width, height) {
  if (!store.backdropColorize) return
  ctx.globalAlpha = store.backdropColorizeIntensity / 200
  ctx.fillStyle = store.backdropGradient1
  ctx.fillRect(0, 0, width, height)
  ctx.globalAlpha = 1
}

function drawReflection(store, ctx, width, height) {
  if (store.backdropReflection === 'none') return
  drawReflectedCopy(ctx, width, height, true)
  if (store.backdropReflection === '4-way') drawReflectedCopy(ctx, width, height, false)
}

function drawReflectedCopy(ctx, width, height, horizontal) {
  ctx.save()
  ctx.globalAlpha = 0.18
  if (horizontal) ctx.setTransform(-1, 0, 0, 1, width, 0)
  else ctx.setTransform(1, 0, 0, -1, 0, height)
  ctx.drawImage(ctx.canvas, 0, 0, width, height)
  ctx.restore()
}

function drawGradientBackdrop(store, ctx, width, height) {
  const angle = (store.backdropGradientAngle * Math.PI) / 180
  const gradient = ctx.createLinearGradient(
    width / 2 - Math.cos(angle) * width,
    height / 2 - Math.sin(angle) * height,
    width / 2 + Math.cos(angle) * width,
    height / 2 + Math.sin(angle) * height,
  )
  gradient.addColorStop(0, store.backdropGradient1)
  gradient.addColorStop(1, store.backdropGradient2)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

function drawFittedImage(store, ctx, image, width, height) {
  ctx.save()
  mirrorIfNeeded(store, ctx, width)
  rotateIfNeeded(store, ctx, width, height)

  if (store.backdropImageFit === 'fill') {
    ctx.drawImage(image, 0, 0, width, height)
    ctx.restore()
    return
  }

  const fit = getFittedRect(store, image, width, height)
  ctx.drawImage(image, fit.x, fit.y, fit.w, fit.h)
  ctx.restore()
}

function mirrorIfNeeded(store, ctx, width) {
  if (!store.mirrorH) return
  ctx.translate(width, 0)
  ctx.scale(-1, 1)
}

function rotateIfNeeded(store, ctx, width, height) {
  if (!store.backdropRotate) return
  const degrees = store.currentTime * store.backdropRotationSpeed
  ctx.translate(width / 2, height / 2)
  ctx.rotate((degrees * Math.PI) / 180)
  ctx.translate(-width / 2, -height / 2)
}

function getFittedRect(store, image, width, height) {
  const scale = store.backdropImageFit === 'contain'
    ? Math.min(width / image.width, height / image.height)
    : Math.max(width / image.width, height / image.height)
  const reactiveScale = store.backdropReactive && store.isPlaying
    ? 1 + store.backdropReactiveIntensity / 1000
    : 1
  const fittedWidth = image.width * scale * reactiveScale
  const fittedHeight = image.height * scale * reactiveScale
  const drift = getBackdropDrift(store, width)
  return {
    x: (width - fittedWidth) / 2 + drift,
    y: (height - fittedHeight) / 2,
    w: fittedWidth,
    h: fittedHeight,
  }
}

function getBackdropDrift(store, width) {
  if (!store.backdropDrift || !store.isPlaying) return 0
  return Math.sin(store.currentTime * 0.8) * width * (store.backdropDriftIntensity / 2500)
}
