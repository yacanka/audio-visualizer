const FADE_DISTANCE_RATIO = 0.18

/** Return normalized opacity bounds with backwards-compatible defaults. */
export function createParticleOpacityOptions(store) {
  const minOpacity = clamp(Number(store.particleMinOpacity ?? 35), 0, 100) / 100
  const maxOpacity = clamp(Number(store.particleMaxOpacity ?? 85) / 100, minOpacity, 1)
  return { minOpacity, maxOpacity }
}

/** Return particle alpha based on its opacity and distance from the exit edge. */
export function getParticleAlpha(point, phase, options, opacity) {
  const fadeIn = options.fadeIn ? getFadeRatio(phase) : 1
  const fadeOut = options.fadeOut ? getEdgeFadeRatio(point, options) : 1
  return opacity * Math.min(fadeIn, fadeOut)
}

function getEdgeFadeRatio(point, options) {
  const distance = getExitEdgeDistance(point, options)
  const normalizedDistance = distance / Math.min(options.w, options.h)
  return getFadeRatio(normalizedDistance)
}

function getExitEdgeDistance(point, options) {
  if (options.direction === 'left') return options.w - point.x
  if (options.direction === 'right') return point.x
  if (options.direction === 'up') return options.h - point.y
  if (options.direction === 'down') return point.y
  return Math.min(point.x, options.w - point.x, point.y, options.h - point.y)
}

function getFadeRatio(distance) {
  return clamp(distance / FADE_DISTANCE_RATIO, 0, 1)
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value))
}
