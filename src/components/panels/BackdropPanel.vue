<template>
  <div class="panel">
    <h3 class="panel-title">Backdrop</h3>
    <ImageUpload v-model="store.backdropImageSrc" @loaded="onImageLoaded" />
    <button class="media-btn" :disabled="store.isExporting" @click="videoInput?.click()">Select Background Video</button>
    <input ref="videoInput" type="file" accept="video/mp4,video/webm" hidden @change="onVideoSelected" />
    <p v-if="store.backdropVideoFile || store.backdropVideoName" class="media-note">{{ store.backdropVideoFile?.name || store.backdropVideoName }}</p>
    <p v-if="store.backdropType === 'video'" class="media-note">Muted, looping video follows your audio. Reselect the video after opening a saved project.</p>
    <p v-if="store.backdropType === 'video' && !store.backdropVideoFile" role="status" class="media-note">Select the original background video to continue.</p>
    <p v-if="store.backdropVideoStatus" role="status" class="media-note">{{ store.backdropVideoStatus }}</p>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="chip"
        :class="{ active: store.backdropSubTab === tab.value }"
        @click="store.backdropSubTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <section class="section">
      <label class="section-label">Type</label>
      <div class="chip-group">
        <button v-for="type in types" :key="type" :class="['chip', { active: store.backdropType === type }]" @click="selectType(type)">
          {{ type }}
        </button>
      </div>

    </section>

    <section v-if="isTab('reflection')" class="section">
      <label class="section-label">Reflection</label>
      <div class="chip-group">
        <button v-for="option in reflections" :key="option" :class="['chip', { active: store.backdropReflection === option }]" @click="store.backdropReflection = option">
          {{ option }}
        </button>
      </div>
      <ColorControls />
      <PresetSwatches />
    </section>

    <section v-if="isTab('rotate')" class="section">
      <ToggleRow label="Rotate" v-model="store.backdropRotate" />
      <PanelRange label="Speed" v-model="store.backdropRotationSpeed" :min="-100" :max="100" />
      <PanelRange label="Angle" v-model="store.backdropGradientAngle" :min="0" :max="360" :step="5" />
    </section>

    <section v-if="isTab('filter') || isTab('adjust')" class="section">
      <PanelRange label="Hue" v-model="store.backdropHue" :min="-180" :max="180" />
      <PanelRange label="Saturation" v-model="store.backdropSaturation" :min="0" :max="100" />
      <PanelRange label="Lightness" v-model="store.backdropLightness" :min="0" :max="100" />
      <ToggleRow label="Colorize" v-model="store.backdropColorize" />
      <PanelRange v-if="store.backdropColorize" label="Intensity" v-model="store.backdropColorizeIntensity" :min="0" :max="100" />
    </section>

    <section v-if="isTab('drift')" class="section">
      <DriftControls prefix="backdrop" />
    </section>

    <section v-if="isTab('rumble')" class="section">
      <label class="section-label">Rumble</label>
      <div class="chip-group">
        <button v-for="option in rumbles" :key="option" :class="['chip', { active: store.backdropRumble === option }]" @click="store.backdropRumble = option">
          {{ option }}
        </button>
      </div>
    </section>

    <section class="section">
      <ToggleRow label="Mirror Background" v-model="store.mirrorH" />
      <ToggleRow label="Reactive Speed" v-model="store.backdropReactive" />
      <PanelRange v-if="store.backdropReactive" label="Intensity" v-model="store.backdropReactiveIntensity" :min="0" :max="100" />
      <div v-if="['image', 'video'].includes(store.backdropType)" class="chip-group fit-row">
        <button v-for="fit in fits" :key="fit" :class="['chip', { active: store.backdropImageFit === fit }]" @click="store.backdropImageFit = fit">
          {{ fit }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAppStore } from '../../stores/app.js'
import DriftControls from './DriftControls.vue'
import ImageUpload from './ImageUpload.vue'
import ColorControls from './backdrop/ColorControls.vue'
import PresetSwatches from './backdrop/PresetSwatches.vue'
import PanelRange from './PanelRange.vue'
import ToggleRow from './ToggleRow.vue'

const store = useAppStore()
const videoInput = ref(null)
const fits = ['cover', 'contain', 'fill']
const reflections = ['none', '2-way', '4-way']
const rumbles = ['none', 'medium', 'high']
const types = ['solid', 'gradient', 'image', 'video']
const tabs = [
  { value: 'reflection', label: 'Reflection' },
  { value: 'rotate', label: 'Rotate' },
  { value: 'filter', label: 'Filter' },
  { value: 'drift', label: 'Drift' },
  { value: 'rumble', label: 'Rumble' },
  { value: 'adjust', label: 'Adjust' },
]

function isTab(value) {
  return store.backdropSubTab === value
}

function selectType(type) {
  store.backdropType = type
}

function onImageLoaded(src) {
  store.backdropImageIsPreset = false
  store.backdropImage = null
  store.backdropType = src ? 'image' : 'solid'
}

function onVideoSelected(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file || store.isExporting) return
  if (!['video/mp4', 'video/webm'].includes(file.type)) {
    store.backdropVideoStatus = 'Choose an MP4 or WebM video.'
    return
  }
  store.backdropVideoFile = file
  store.backdropVideoName = file.name
  store.backdropType = 'video'
}
</script>

<style scoped>
@import './panel-shared.css';

.media-note { color: var(--text-secondary); font-size: 11px; line-height: 1.5; margin-bottom: 10px; overflow-wrap: anywhere; }

.tabs,
.fit-row {
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

.img-preview {
  width: 100%;
  height: 74px;
  margin-top: 10px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.img-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
