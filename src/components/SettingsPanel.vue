<template>
  <div class="settings-panel">
    <div class="panel-scroll">
      <GeneralPanel v-if="store.activeTab === 'general'" @upload="$emit('upload')" @preset="$emit('preset')" />
      <VisualizerPanel v-else-if="store.activeTab === 'visualizer'" @smoothingChange="$emit('smoothingChange')" />
      <AudioPanel v-else-if="store.activeTab === 'audio'" @fftChange="$emit('fftChange')" @volumeChange="v => $emit('volumeChange', v)" />
      <BackdropPanel v-else-if="store.activeTab === 'backdrop'" />
      <TextPanel v-else-if="store.activeTab === 'text'" />
      <LyricsPanel v-else-if="store.activeTab === 'lyrics'" />
      <ElementsPanel v-else-if="store.activeTab === 'elements'" />
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '../stores/app.js'
import GeneralPanel from './panels/GeneralPanel.vue'
import VisualizerPanel from './panels/VisualizerPanel.vue'
import AudioPanel from './panels/AudioPanel.vue'
import BackdropPanel from './panels/BackdropPanel.vue'
import TextPanel from './panels/TextPanel.vue'
import LyricsPanel from './panels/LyricsPanel.vue'
import ElementsPanel from './panels/ElementsPanel.vue'

const store = useAppStore()
defineEmits(['smoothingChange', 'fftChange', 'volumeChange', 'upload', 'preset'])
</script>

<style scoped>
.settings-panel {
  width: 220px;
  flex-shrink: 0;
  background: var(--bg-panel);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
