import { ref, watch } from 'vue'

/** Coordinate file upload and playback commands for the visualizer audio API. */
export function useAudioController(getAudio) {
  const waveformData = ref(null)
  let stopWaveformWatch = null

  async function loadSelectedFile(event) {
    const file = event.target.files[0]
    if (!file) return
    event.target.value = ''

    const audio = getAudio()
    if (!audio) return
    await audio.loadFile(file)
    waveformData.value = audio.waveformData.value
    watchWaveform(audio)
    audio.play()
  }

  function watchWaveform(audio) {
    stopWaveformWatch?.()
    stopWaveformWatch = watch(
      audio.waveformData,
      value => { waveformData.value = value },
      { immediate: true },
    )
  }

  function togglePlay() {
    getAudio()?.togglePlay()
  }

  function toggleMute() {
    getAudio()?.toggleMute()
  }

  function seek(time) {
    getAudio()?.seek(time)
  }

  function setVolume(volume) {
    getAudio()?.setVolume(volume)
  }

  function updateAnalyser() {
    getAudio()?.updateAnalyserSettings()
  }

  function clearWaveform() {
    waveformData.value = null
  }

  function dispose() {
    stopWaveformWatch?.()
  }

  return {
    waveformData,
    loadSelectedFile,
    togglePlay,
    toggleMute,
    seek,
    setVolume,
    updateAnalyser,
    clearWaveform,
    dispose,
  }
}
