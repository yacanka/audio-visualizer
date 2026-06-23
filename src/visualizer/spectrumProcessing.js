const BASE_SMOOTHING_PASSES = 4
const SMOOTHING_RADIUS = 2
const MAX_LAYOUT_PASSES = 64

/** Convert analyser bins into normalized, evenly spaced visualizer magnitudes. */
export function createSpectrumMagnitudes(store, data, pointCount, layout, loop = false) {
  const source = getRelevantSpectrum(store, data)
  const widened = widenPeaks(source, layout.peakShiftPasses)
  const passCount = store.vizSmooth ? layout.smoothingPasses : 0
  const smoothed = smoothSpectrum(widened, passCount, loop)
  const resampled = resampleSpectrum(smoothed, pointCount)
  return resampled.map(value => normalizeMagnitude(value, store.sensitivity))
}

function getRelevantSpectrum(store, data) {
  if (!data?.length) return [0]
  const ratio = store.vizSpectrum === 'bass' ? 0.25 : 0.85
  const limit = Math.max(1, Math.floor(data.length * ratio))
  return Array.from(data).slice(0, limit)
}

function widenPeaks(values, requestedPasses) {
  const passCount = clamp(Math.floor(requestedPasses || 0), 0, MAX_LAYOUT_PASSES)
  let result = values
  for (let pass = 0; pass < passCount; pass++) {
    result = resampleMaximum(resampleSpectrum(result, result.length * 2 + 1), result.length)
  }
  return result
}

function resampleMaximum(values, targetCount) {
  if (targetCount <= 1) return [values[0] || 0]
  const scale = (values.length - 1) / (targetCount - 1)
  return Array.from({ length: targetCount }, (_, index) => {
    const position = index * scale
    return Math.max(values[Math.floor(position)] || 0, values[Math.ceil(position)] || 0)
  })
}

function smoothSpectrum(values, requestedPasses, loop) {
  const passCount = clamp(Math.floor(requestedPasses ?? BASE_SMOOTHING_PASSES), 0, MAX_LAYOUT_PASSES)
  let result = values
  for (let pass = 0; pass < passCount; pass++) result = smoothOnce(result, loop)
  return result
}

function smoothOnce(values, loop) {
  return values.map((_, index) => {
    let total = 0
    for (let offset = -SMOOTHING_RADIUS; offset <= SMOOTHING_RADIUS; offset++) {
      total += getWindowValue(values, index, offset, loop)
    }
    return total / (SMOOTHING_RADIUS * 2 + 1)
  })
}

function getWindowValue(values, index, offset, loop) {
  const target = index + offset
  if (target >= 0 && target < values.length) return values[target]
  if (!loop) return values[index]
  return values[(target + values.length) % values.length]
}

function resampleSpectrum(values, requestedCount) {
  const targetCount = Math.max(1, Math.floor(requestedCount) || 1)
  if (values.length === 1) return Array(targetCount).fill(values[0])
  const scale = (values.length - 1) / Math.max(1, targetCount - 1)
  return Array.from({ length: targetCount }, (_, index) => interpolate(values, index * scale))
}

function interpolate(values, position) {
  const lowerIndex = Math.floor(position)
  const upperIndex = Math.min(values.length - 1, Math.ceil(position))
  const amount = position - lowerIndex
  return values[lowerIndex] * (1 - amount) + values[upperIndex] * amount
}

function normalizeMagnitude(value, sensitivity) {
  const safeSensitivity = Number.isFinite(Number(sensitivity)) ? Number(sensitivity) : 1
  return clamp((value / 255) * safeSensitivity, 0, 1)
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value))
}
