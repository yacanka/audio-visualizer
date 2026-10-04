const LAYER_DELAY = 0.045
const MAX_HISTORY = 48

/** Keep a bounded spectrum history. A seek or source change starts a new trail. */
export function createWaveDelay() {
  let frames = []
  let lastTime = null
  let source = null

  return function sample(store, frequency, timestamp) {
    const time = Number.isFinite(store.currentTime) ? store.currentTime : timestamp / 1000
    const sourceChanged = source !== store.audioFile
    const discontinuity = lastTime !== null && (time < lastTime || time - lastTime > 0.5)
    if (sourceChanged || discontinuity || !store.waveDelay) frames = []
    source = store.audioFile
    if (!frames.length || (store.isPlaying && time !== lastTime)) {
      frames.push({ time, frequency: Uint8Array.from(frequency) })
      frames = frames.filter(frame => time - frame.time <= 0.5).slice(-MAX_HISTORY)
    }
    lastTime = time
    const count = store.visualizerLayers?.length || 2
    return Array.from({ length: count }, (_, index) => {
      if (!store.waveDelay || !index) return frequency
      const target = time - index * LAYER_DELAY
      return (frames.findLast(frame => frame.time <= target) || frames[0]).frequency
    })
  }
}
