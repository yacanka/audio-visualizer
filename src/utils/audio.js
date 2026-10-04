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

/** Measure all decoded channels; a single track-wide gain preserves beat dynamics. */
export function getAudioPeak(buffer) {
  let peak = 0
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    for (const sample of buffer.getChannelData(channel)) peak = Math.max(peak, Math.abs(sample))
  }
  return peak
}

/** Adjust visual analysis in the analyser's dB scale without changing audible volume. */
export function applySpectrumOptions(data, { normalize, bassBoost, peak, binHertz, decibelRange }) {
  if (!normalize && !bassBoost) return data
  const gain = normalize && peak > 0 ? clamp(20 * Math.log10(0.95 / peak), -12, 12) : 0
  const bytePerDb = 255 / Math.max(1, decibelRange)
  return Uint8Array.from(data, (value, index) => {
    // An analyser's zero bins represent silence, which must remain silent.
    if (!value) return 0
    const bassGain = bassBoost ? 6 / (1 + (index * binHertz / 250) ** 2) : 0
    return clamp(Math.round(value + (gain + bassGain) * bytePerDb), 0, 255)
  })
}
