/** Create a bar fill style for the current color settings. */
export function getBarColor(store, ctx, rect, canvasSize) {
  if (!store.useGradient) return store.barColor

  const gradient = store.gradientDir === 'vertical'
    ? ctx.createLinearGradient(rect.x, rect.y + rect.h, rect.x, rect.y)
    : ctx.createLinearGradient(0, 0, canvasSize.w, 0)

  gradient.addColorStop(0, store.barColor)
  gradient.addColorStop(1, store.barColor2)
  return gradient
}

/** Interpolate between two hex colors. */
export function lerpColor(colorA, colorB, amount) {
  const [r1, g1, b1] = parseHexColor(colorA)
  const [r2, g2, b2] = parseHexColor(colorB)
  const red = Math.round(r1 + (r2 - r1) * amount)
  const green = Math.round(g1 + (g2 - g1) * amount)
  const blue = Math.round(b1 + (b2 - b1) * amount)
  return `rgb(${red},${green},${blue})`
}

/** Convert a hex color to an rgba string with a safe alpha range. */
export function toRgba(color, alpha = 1, fallback = '#f7d774') {
  const safeColor = isHexColor(color) ? color : fallback
  const [red, green, blue] = parseHexColor(safeColor)
  return `rgba(${red},${green},${blue},${clamp(alpha, 0, 1)})`
}

function parseHexColor(value) {
  return [
    parseInt(value.slice(1, 3), 16),
    parseInt(value.slice(3, 5), 16),
    parseInt(value.slice(5, 7), 16),
  ]
}

function isHexColor(value) {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value))
}
