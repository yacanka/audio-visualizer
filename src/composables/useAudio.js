import { ref, shallowRef } from 'vue'
import { useAppStore } from '../stores/app.js'
import { applySpectrumOptions, buildWaveformSamples, clamp, getAudioPeak } from '../utils/audio.js'
import { getTimelineDuration } from '../utils/timeline.js'

export function useAudio() {
  let audioCtx = null
  let analyserNode = null
  let sourceNode = null
  let cleanupMediaListeners = null
  let objectUrl = null
  let audioPeak = 0
  let loadVersion = 0
  const store = useAppStore()
  const audioEl = shallowRef(null)
  const waveformData = ref(null)

  async function ensureContext(resume = true) {
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (resume && audioCtx.state === 'suspended') {
      await audioCtx.resume()
    }
  }

  function setup(el) {
    audioEl.value = el
    ensureContext(false)

    if (sourceNode) {
      try { sourceNode.disconnect() } catch {}
    }

    analyserNode = audioCtx.createAnalyser()
    analyserNode.fftSize = store.fftSize
    analyserNode.smoothingTimeConstant = store.smoothing

    sourceNode = audioCtx.createMediaElementSource(el)
    sourceNode.connect(analyserNode)
    analyserNode.connect(audioCtx.destination)

    bindMediaListeners(el)
  }

  function bindMediaListeners(el) {
    cleanupMediaListeners?.()
    const updateTime = () => { store.currentTime = el.currentTime }
    const updateDuration = () => { store.duration = Number.isFinite(el.duration) ? el.duration : 0 }
    const stopPlayback = () => { store.isPlaying = false }

    el.addEventListener('timeupdate', updateTime)
    el.addEventListener('loadedmetadata', updateDuration)
    el.addEventListener('ended', stopPlayback)
    cleanupMediaListeners = () => {
      el.removeEventListener('timeupdate', updateTime)
      el.removeEventListener('loadedmetadata', updateDuration)
      el.removeEventListener('ended', stopPlayback)
    }
  }

  function updateAnalyserSettings() {
    if (!analyserNode) return
    analyserNode.smoothingTimeConstant = store.smoothing
    analyserNode.fftSize = store.fftSize
  }

  function getFrequencyData() {
    if (!analyserNode) return null
    const data = new Uint8Array(analyserNode.frequencyBinCount)
    analyserNode.getByteFrequencyData(data)
    return applySpectrumOptions(data, {
      normalize: store.normalize,
      bassBoost: store.bassBoost,
      peak: audioPeak,
      binHertz: audioCtx.sampleRate / analyserNode.fftSize,
      decibelRange: analyserNode.maxDecibels - analyserNode.minDecibels,
    })
  }

  function getTimeDomainData() {
    if (!analyserNode) return null
    const data = new Uint8Array(analyserNode.frequencyBinCount)
    analyserNode.getByteTimeDomainData(data)
    return data
  }

  function getFrequencyBinCount() {
    return analyserNode ? analyserNode.frequencyBinCount : 1024
  }

  async function play() {
    if (!audioEl.value) return
    await ensureContext()
    await audioEl.value.play()
    store.isPlaying = true
  }

  function pause() {
    if (!audioEl.value) return
    audioEl.value.pause()
    store.isPlaying = false
  }

  function togglePlay() {
    if (!store.audioFile) { store.isPlaying = !store.isPlaying; return }
    if (store.isPlaying) pause()
    else play()
  }

  function seek(time) {
    if (!store.audioFile) { store.currentTime = clamp(time, 0, getTimelineDuration(store)); return }
    if (!audioEl.value) return
    audioEl.value.currentTime = clamp(time, 0, store.duration)
  }

  function toggleMute() {
    if (!audioEl.value) return
    store.isMuted = !store.isMuted
    audioEl.value.muted = store.isMuted
  }

  function setVolume(v) {
    if (!audioEl.value) return
    const volume = clamp(v, 0, 1)
    store.volume = volume
    audioEl.value.volume = volume
  }

  async function loadFile(file) {
    const version = ++loadVersion
    audioPeak = 0
    waveformData.value = null
    store.audioFile = file
    store.fileName = file.name
    store.isPlaying = false
    store.currentTime = 0
    store.duration = 0

    revokeObjectUrl()
    objectUrl = URL.createObjectURL(file)
    if (audioEl.value) {
      audioEl.value.src = objectUrl
      audioEl.value.load()
    }

    // Generate waveform
    const arrayBuffer = await file.arrayBuffer()
    await generateWaveform(arrayBuffer, version)
  }

  async function generateWaveform(arrayBuffer, version) {
    try {
      const offlineCtx = new OfflineAudioContext(1, 44100 * 30, 44100)
      const buffer = await offlineCtx.decodeAudioData(arrayBuffer.slice(0))
      if (version !== loadVersion) return
      const rawData = buffer.getChannelData(0)
      audioPeak = getAudioPeak(buffer)
      waveformData.value = buildWaveformSamples(rawData)
    } catch (e) {
      if (version !== loadVersion) return
      console.warn('Waveform generation failed:', e)
      waveformData.value = null
    }
  }

  function revokeObjectUrl() {
    if (!objectUrl) return
    URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }

  function dispose() {
    loadVersion++
    cleanupMediaListeners?.()
    cleanupMediaListeners = null
    revokeObjectUrl()
    sourceNode?.disconnect()
    analyserNode?.disconnect()
    if (audioCtx && audioCtx.state !== 'closed') audioCtx.close()
    sourceNode = null
    analyserNode = null
    audioCtx = null
  }

  return {
    audioEl,
    waveformData,
    setup,
    loadFile,
    play,
    pause,
    togglePlay,
    seek,
    toggleMute,
    setVolume,
    getFrequencyData,
    getTimeDomainData,
    getFrequencyBinCount,
    updateAnalyserSettings,
    dispose,
  }
}
