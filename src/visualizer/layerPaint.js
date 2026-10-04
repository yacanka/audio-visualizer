import { mixLch } from './colorMix.js'

/** Interpolate a layer's paint with audio magnitude, keeping fill and outline independent. */
export function getLayerPaint(layer, magnitude) {
  const amount = Math.max(0, Math.min(1, magnitude || 0))
  return {
    ...layer,
    fillColor: mixPaint(layer.fillColor, layer.fillOpacity ?? 1, layer.secondaryFillColor, layer.secondaryFillOpacity ?? 1, amount, layer.colorMix),
    outlineColor: mixPaint(layer.outlineColor, layer.outlineOpacity ?? 1, layer.secondaryOutlineColor, layer.secondaryOutlineOpacity ?? 1, amount, layer.colorMix),
  }
}

function mixPaint(primary, primaryAlpha, secondary, secondaryAlpha, amount, mode) {
  if (!secondary && primaryAlpha === 1) return primary
  const first = parseColor(primary)
  const second = secondary ? parseColor(secondary) : first
  const alpha = secondary ? primaryAlpha + (secondaryAlpha - primaryAlpha) * amount : primaryAlpha
  const channels = secondary && mode === 'lch' ? mixLch(first, second, amount) : first.map((value, index) => Math.round(value + (second[index] - value) * amount))
  return `rgba(${channels.join(',')},${alpha})`
}

function parseColor(color) {
  const value = /^#[0-9a-f]{6}$/i.test(color) ? color.slice(1) : 'ffffff'
  return [0, 2, 4].map(index => parseInt(value.slice(index, index + 2), 16))
}
