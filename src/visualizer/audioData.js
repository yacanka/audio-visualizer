/** Return analyser data or a deterministic idle spectrum. */
export function getRenderableFrequencyData(store, frequencyData) {
  if (store.previewAudioAnalysisEnabled && frequencyData && store.audioFile) return frequencyData
  if (!store.audioFile) return createDemoSpectrum(store.currentTime || 0)

  const data = new Uint8Array(128)
  data.fill(store.isPlaying ? 70 : 28)
  return data
}

/** Return a flat or delayed idle waveform for non-analysed preview mode. */
export function getRenderableTimeData(store, timeData) {
  if (store.previewAudioAnalysisEnabled && timeData) return timeData

  const data = new Uint8Array(256)
  data.fill(128)
  return data
}

/** Deterministic, silent demo motion for previewing presets before uploading audio. */
function createDemoSpectrum(time) {
  return Uint8Array.from({ length: 128 }, (_, index) => {
    const peak = Math.exp(-(((index - 10 - Math.sin(time * 2) * 4) / 6) ** 2))
    const treble = Math.exp(-(((index - 45) / 20) ** 2)) * 0.3
    return Math.min(255, 12 + (peak + treble) * (125 + Math.sin(time * 7) * 65))
  })
}
