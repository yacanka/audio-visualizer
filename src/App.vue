<template>
  <div class="app">
    <TopBar
      :inert="store.isExporting"
      @videos="videosOpen = true"
      @undo="store.undo"
      @redo="store.redo"
      @new="handleNewVideo"
      @save="saveProject"
      @export="exportOpen = true"
    />

    <div class="app-body" :inert="store.isExporting">
      <SideTabs />
      <SettingsPanel
        @smoothingChange="updateAnalyser"
        @fftChange="updateAnalyser"
        @volumeChange="setVolume"
        @upload="triggerUpload"
        @preset="templateOpen = true"
        @export="exportOpen = true"
      />
      <VisualizerCanvas
        ref="vizCanvas"
        @upload="triggerUpload"
        @audio-drop="loadAudioFile"
      />
    </div>

    <PlaybackBar
      :inert="store.isExporting"
      :waveformData="waveformData"
      @togglePlay="togglePlay"
      @toggleMute="toggleMute"
      @seek="seek"
      @volumeChange="setVolume"
      @help="helpOpen = true"
    />

    <input ref="projectInput" type="file" accept="application/json,.json" hidden @change="loadProject" />
    <input ref="fileInput" type="file" accept="audio/*" style="display:none" @change="loadSelectedFile" />
    <ExportDialog v-if="exportOpen" @close="exportOpen = false" @start="exportVideo" @cancel="cancelExport" />
    <HelpDialog v-if="helpOpen" @close="helpOpen = false" />
    <TemplateGalleryDialog
      v-if="templateOpen"
      :selected-template-id="store.selectedTemplateId"
      @close="templateOpen = false"
      @select="selectTemplate"
    />
    <VideosDialog
      v-if="videosOpen"
      @close="videosOpen = false"
      @new="handleNewVideo"
      @save="saveProject"
      @open="projectInput?.click()"
      @export="openExportFromVideos"
    />
  </div>
</template>

<script setup>
import { onUnmounted, ref } from 'vue'
import { useAppStore } from './stores/app.js'
import { useAudioController } from './composables/useAudioController.js'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts.js'
import { useProjectActions } from './composables/useProjectActions.js'
import { useProjectHistory } from './composables/useProjectHistory.js'
import { useVideoExport } from './composables/useVideoExport.js'
import TopBar from './components/TopBar.vue'
import SideTabs from './components/SideTabs.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import VisualizerCanvas from './components/VisualizerCanvas.vue'
import PlaybackBar from './components/PlaybackBar.vue'
import ExportDialog from './components/ExportDialog.vue'
import HelpDialog from './components/HelpDialog.vue'
import TemplateGalleryDialog from './components/TemplateGalleryDialog.vue'
import VideosDialog from './components/VideosDialog.vue'
import { applyTemplateToStore } from './templates/videoTemplates.js'

const store = useAppStore()
const fileInput = ref(null)
const projectInput = ref(null)
const vizCanvas = ref(null)
const exportOpen = ref(false)
const helpOpen = ref(false)
const videosOpen = ref(false)
const templateOpen = ref(true)

const {
  waveformData,
  loadAudioFile,
  loadSelectedFile,
  togglePlay,
  toggleMute,
  seek,
  setVolume,
  updateAnalyser,
  clearWaveform,
  dispose,
} = useAudioController(getAudio)

const { saveProject, newVideo, openProject } = useProjectActions(store, getAudio, clearWaveform)
const { exportVideo, cancelExport } = useVideoExport(store, getAudio, getCanvas)

applyTemplateToStore(store, 'default')
useProjectHistory(store)
useKeyboardShortcuts(store, { togglePlay, toggleMute })

async function loadProject(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (await openProject(file)) templateOpen.value = false
}

function getAudio() {
  return vizCanvas.value?.audio
}

function getCanvas() {
  return vizCanvas.value?.getCanvas()
}

function handleNewVideo() {
  newVideo(() => {
    videosOpen.value = false
    templateOpen.value = true
  })
}

function openExportFromVideos() {
  videosOpen.value = false
  exportOpen.value = true
}

function selectTemplate(template) {
  applyTemplateToStore(store, template)
  templateOpen.value = false
}

function triggerUpload() {
  fileInput.value?.click()
}

onUnmounted(() => {
  cancelExport()
  dispose()
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
