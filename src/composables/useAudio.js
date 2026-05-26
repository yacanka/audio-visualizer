import { ref, shallowRef } from 'vue'
import { useAppStore } from '../stores/app.js'
import { buildWaveformSamples, clamp } from '../utils/audio.js'

let audioCtx = null
let analyserNode = null
let sourceNode = null
let cleanupMediaListeners = null
let objectUrl = null

export function useAudio() {
  const store = useAppStore()
  const audioEl = shallowRef(null)
  const waveformData = ref(null)

  async function ensureContext() {
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume()
    }
  }

  function setup(el) {
    audioEl.value = el
    ensureContext()

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
    const updateDuration = () => { store.duration = el.duration }
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
    return data
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
    if (store.isPlaying) pause()
    else play()
  }

  function seek(time) {
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
    await generateWaveform(arrayBuffer)
  }

  async function generateWaveform(arrayBuffer) {
    try {
      const offlineCtx = new OfflineAudioContext(1, 44100 * 30, 44100)
      const buffer = await offlineCtx.decodeAudioData(arrayBuffer.slice(0))
      const rawData = buffer.getChannelData(0)
      waveformData.value = buildWaveformSamples(rawData)
    } catch (e) {
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
    cleanupMediaListeners?.()
    cleanupMediaListeners = null
    revokeObjectUrl()
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
