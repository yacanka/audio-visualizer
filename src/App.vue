<template>
  <div class="app">
    <TopBar @upload="triggerUpload" @save="handleSave" />

    <div class="app-body">
      <SideTabs />
      <SettingsPanel
        @smoothingChange="updateAnalyser"
        @fftChange="updateAnalyser"
        @volumeChange="handleVolume"
      />
      <VisualizerCanvas
        ref="vizCanvas"
        @upload="triggerUpload"
      />
    </div>

    <PlaybackBar
      :waveformData="waveformData"
      @togglePlay="togglePlay"
      @toggleMute="toggleMute"
      @seek="seek"
      @volumeChange="handleVolume"
    />

    <!-- Hidden file input -->
    <input ref="fileInput" type="file" accept="audio/*" style="display:none" @change="onFileSelected" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useAppStore } from './stores/app.js'
import TopBar from './components/TopBar.vue'
import SideTabs from './components/SideTabs.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import VisualizerCanvas from './components/VisualizerCanvas.vue'
import PlaybackBar from './components/PlaybackBar.vue'

const store = useAppStore()
const fileInput = ref(null)
const vizCanvas = ref(null)
const waveformData = ref(null)
let stopWaveformWatch = null

function getAudio() {
  return vizCanvas.value?.audio
}

function triggerUpload() {
  fileInput.value?.click()
}

async function onFileSelected(e) {
  const file = e.target.files[0]
  if (!file) return
  e.target.value = ''
  const audio = getAudio()
  if (!audio) return
  await audio.loadFile(file)
  waveformData.value = audio.waveformData.value

  stopWaveformWatch?.()
  stopWaveformWatch = watch(
    audio.waveformData,
    value => { waveformData.value = value },
    { immediate: true },
  )

  audio.play()
}

function togglePlay() {
  const audio = getAudio()
  if (!audio) return
  audio.togglePlay()
}

function toggleMute() {
  const audio = getAudio()
  if (!audio) return
  audio.toggleMute()
}

function seek(time) {
  const audio = getAudio()
  if (!audio) return
  audio.seek(time)
}

function handleVolume(v) {
  const audio = getAudio()
  if (!audio) return
  audio.setVolume(v)
}

function updateAnalyser() {
  const audio = getAudio()
  if (!audio) return
  audio.updateAnalyserSettings()
}

function handleSave() {
  if (!vizCanvas.value) return
  const canvas = vizCanvas.value.$el.querySelector('canvas')
  if (!canvas) return
  const link = document.createElement('a')
  link.download = `visualizer-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

function onKeydown(e) {
  if (e.target.tagName === 'INPUT') return
  if (e.code === 'Space') { e.preventDefault(); togglePlay() }
  if (e.code === 'KeyM') toggleMute()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  stopWaveformWatch?.()
})
</script>

<style scoped>
.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-primary);
}

.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>
