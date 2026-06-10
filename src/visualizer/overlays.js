import { findCurrentLyric } from '../utils/lyrics.js'
import { drawParticleLayer } from './particles.js'

const imageCache = new Map()

/** Draw configured text and lyric overlays. */
export function drawTextOverlay(store, ctx, size, driftOffset) {
  const textLayout = getTextLayout(store, size)
  drawTitle(store, ctx, textLayout, driftOffset)
  drawArtist(store, ctx, textLayout, driftOffset)
  drawLyrics(store, ctx, size)
}

/** Draw progress bar when audio duration is available. */
export function drawProgressBar(store, ctx, size) {
  if (!store.showProgressBar || store.duration <= 0) return
  const progress = store.currentTime / store.duration
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  ctx.fillRect(0, size.h - 3, size.w, 3)
  ctx.fillStyle = store.barColor
  ctx.fillRect(0, size.h - 3, size.w * progress, 3)
}

/** Draw user-added elements over the visualizer preview. */
export function drawElements(store, ctx, size) {
  store.elements.forEach(element => drawElement(store, ctx, element, size))
}

function getTextLayout(store, size) {
  const hasTitle = store.showTitle && store.titleText.trim()
  const hasArtist = store.showArtist && store.artistText.trim()
  if (store.textPosition === 'top') return { y: 48, hasTitle, hasArtist }
  if (store.textPosition === 'center') return { y: size.h / 2 - (hasTitle && hasArtist ? 26 : 14), hasTitle, hasArtist }
  return { y: size.h - (hasArtist ? 70 : 50), hasTitle, hasArtist }
}

function drawTitle(store, ctx, layout, driftOffset) {
  if (!layout.hasTitle) return
  ctx.font = `${store.titleWeight} ${store.titleSize}px '${store.titleFont}', sans-serif`
  ctx.fillStyle = store.titleColor
  drawShadowedText(ctx, store.titleText, 0.6, 8, driftOffset * 0.1, layout.y)
}

function drawArtist(store, ctx, layout, driftOffset) {
  if (!layout.hasArtist) return
  ctx.font = `400 ${store.artistSize}px '${store.artistFont}', sans-serif`
  ctx.fillStyle = store.artistColor
  drawShadowedText(ctx, store.artistText, 0.5, 6, driftOffset * 0.08, layout.y + store.titleSize + 8)
}

function drawShadowedText(ctx, text, alpha, blur, xOffset, y) {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.shadowColor = `rgba(0,0,0,${alpha})`
  ctx.shadowBlur = blur
  ctx.fillText(text, ctx.canvas.width / 2 + xOffset, y)
  ctx.shadowBlur = 0
}

function drawLyrics(store, ctx, size) {
  if (!store.lyricsEnabled || !store.lyricSegments.length) return
  const segment = findCurrentLyric(store.lyricSegments, store.currentTime)
  if (!segment) return

  ctx.font = `700 ${Math.max(18, store.titleSize * 0.75)}px '${store.titleFont}', sans-serif`
  ctx.fillStyle = store.titleColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0,0,0,0.65)'
  ctx.shadowBlur = 8
  ctx.fillText(segment.text, size.w / 2, size.h * 0.78)
  ctx.shadowBlur = 0
}

function drawElement(store, ctx, element, size) {
  if (element.type === 'particles') {
    drawParticleLayer(store, ctx, element, size)
    return
  }
  const point = getElementPoint(element, size)
  if (element.type === 'text') drawTextElement(ctx, element, point.x, point.y)
  if (element.type === 'image') drawImageElement(ctx, element, point.x, point.y, size)
}

function getElementPoint(element, size) {
  return { x: (element.x / 100) * size.w, y: (element.y / 100) * size.h }
}

function drawTextElement(ctx, element, x, y) {
  ctx.font = `700 ${element.size}px Inter, sans-serif`
  ctx.fillStyle = element.color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0,0,0,0.55)'
  ctx.shadowBlur = 6
  ctx.fillText(element.text, x, y)
  ctx.shadowBlur = 0
}

function drawImageElement(ctx, element, x, y, size) {
  const image = getCachedImage(element.src)
  if (!image?.complete) return
  const imageSize = Math.max(24, (element.size / 100) * Math.min(size.w, size.h))
  ctx.globalAlpha = element.opacity ?? 1
  ctx.drawImage(image, x - imageSize / 2, y - imageSize / 2, imageSize, imageSize)
  ctx.globalAlpha = 1
}

function getCachedImage(src) {
  if (!src) return null
  if (imageCache.has(src)) return imageCache.get(src)
  const image = new Image()
  image.src = src
  imageCache.set(src, image)
  return image
}
