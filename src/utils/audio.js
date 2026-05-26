/** Clamp a numeric value into an inclusive range. */
export function clamp(value, minimum, maximum) {
  const numericValue = Number.isFinite(value) ? value : minimum
  return Math.min(Math.max(numericValue, minimum), maximum)
}

/** Normalize waveform samples without producing NaN for silent audio. */
export function normalizeSamples(samples) {
  const maximum = Math.max(...samples, 0)
  if (maximum <= 0) return samples.map(() => 0)
  return samples.map(sample => sample / maximum)
}

/** Build compact average-amplitude samples from decoded PCM channel data. */
export function buildWaveformSamples(rawData, sampleCount = 1200) {
  if (!rawData?.length) return []

  const targetCount = clamp(Math.floor(sampleCount), 1, rawData.length)
  const blockSize = Math.max(1, Math.floor(rawData.length / targetCount))
  const samples = []

  for (let index = 0; index < targetCount; index++) {
    const start = index * blockSize
    const end = Math.min(start + blockSize, rawData.length)
    if (start >= end) break

    let sum = 0
    for (let cursor = start; cursor < end; cursor++) {
      sum += Math.abs(rawData[cursor])
    }
    samples.push(sum / (end - start))
  }

  return normalizeSamples(samples)
}
