<template>
  <div class="panel">
    <h3 class="panel-title">Visualizer</h3>

    <button class="media-btn" @click="mediaInput?.click()">Select Media</button>
    <input ref="mediaInput" hidden type="file" accept="image/png,image/jpeg,image/webp" @change="onMedia" />

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="chip"
        :class="{ active: store.visualizerSubTab === tab.value }"
        @click="store.visualizerSubTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <VisualizerLayersPanel v-if="store.visualizerSubTab === 'layers'" />
    <VisualizerShapePanel v-else-if="store.visualizerSubTab === 'shape'" />
    <VisualizerMotionPanel v-else-if="store.visualizerSubTab === 'motion'" @smoothingChange="$emit('smoothingChange')" />
    <VisualizerEffectsPanel v-else />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAppStore } from '../../stores/app.js'
import VisualizerEffectsPanel from './visualizer/VisualizerEffectsPanel.vue'
import VisualizerLayersPanel from './visualizer/VisualizerLayersPanel.vue'
import VisualizerMotionPanel from './visualizer/VisualizerMotionPanel.vue'
import VisualizerShapePanel from './visualizer/VisualizerShapePanel.vue'

const store = useAppStore()
const mediaInput = ref(null)
defineEmits(['smoothingChange'])

const tabs = [
  { value: 'layers', label: 'Layers' },
  { value: 'shape', label: 'Shape' },
  { value: 'motion', label: 'Motion' },
  { value: 'effects', label: 'Effects' },
]

function onMedia(event) {
  const file = event.target.files[0]
  if (!file) return
  addImageFromFile(file)
  event.target.value = ''
}

function addImageFromFile(file) {
  const reader = new FileReader()
  reader.onload = () => store.addImageElement(reader.result, file.name)
  reader.readAsDataURL(file)
}
</script>

<style scoped>
@import './panel-shared.css';

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}

.media-btn {
  width: 100%;
  margin-bottom: 10px;
  padding: 9px;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}
</style>
