/** Return analyser data or a deterministic idle spectrum. */
export function getRenderableFrequencyData(store, frequencyData) {
  if (store.previewAudioAnalysisEnabled && frequencyData) return frequencyData

  const data = new Uint8Array(128)
  data.fill(store.isPlaying ? 70 : 28)
  return data
}

/** Return a flat or delayed idle waveform for non-analysed preview mode. */
export function getRenderableTimeData(store, timeData) {
  if (store.previewAudioAnalysisEnabled && timeData) return timeData

  const data = new Uint8Array(256)
  data.fill(128)
  if (!store.waveDelay) return data

  for (let index = 0; index < data.length; index++) {
    data[index] = 128 + Math.sin(index / 12) * 18
  }
  return data
}
