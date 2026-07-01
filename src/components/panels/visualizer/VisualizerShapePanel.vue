<template>
  <section class="section">
    <label class="section-label">Mode</label>
    <div class="chip-group">
      <button
        v-for="option in modes"
        :key="option.value"
        :class="['chip', { active: store.visualizerMode === option.value }]"
        @click="store.visualizerMode = option.value"
      >
        {{ option.label }}
      </button>
    </div>
  </section>

  <template v-if="isClassic">
    <section class="section">
      <label class="section-label">Shape</label>
      <div class="chip-group">
        <button v-for="option in shapes" :key="option.value" :class="['chip', { active: store.vizShape === option.value }]" @click="setShape(option.value)">
          {{ option.label }}
        </button>
      </div>
    </section>

    <section class="section">
      <label class="section-label">Style</label>
      <div class="chip-group">
        <button v-for="option in styles" :key="option.value" :class="['chip', { active: store.vizStyle === option.value }]" @click="store.vizStyle = option.value">
          {{ option.label }}
        </button>
      </div>
      <PanelRange :label="countLabel" v-model="store.barCount" :min="4" :max="200" :step="4" />
      <PanelRange v-if="store.vizStyle === 'bar'" label="Bar Width" v-model="store.visualizerBarWidth" :min="1" :max="100" />
      <PanelRange v-if="store.vizStyle === 'point'" label="Point Radius" v-model="store.visualizerPointRadius" :min="1" :max="20" />
    </section>

    <section class="section">
      <label class="section-label">Reflection</label>
      <div class="chip-group">
        <button v-for="option in reflectionOptions" :key="option.value" :class="['chip', { active: store.vizReflection === option.value }]" @click="store.vizReflection = option.value">
          {{ option.label }}
        </button>
      </div>
    </section>

    <section class="section">
      <label class="section-label">Layers</label>
      <div class="chip-group">
        <button
          v-for="option in layerModes"
          :key="option.value"
          :title="option.description"
          :class="['chip', { active: store.vizLayerMode === option.value }]"
          @click="store.vizLayerMode = option.value"
        >
          {{ option.label }}
        </button>
      </div>
      <p class="mode-description">{{ activeLayerMode.description }}</p>
      <ModeToggles />
    </section>
  </template>

  <section v-else class="section">
    <label class="section-label">SoundVisible</label>
    <div class="row">
      <label class="item-label">Beam Color</label>
      <input type="color" v-model="store.soundVisibleColor" />
    </div>
    <div class="row mt-8">
      <label class="item-label">Core Color</label>
      <input type="color" v-model="store.soundVisibleCoreColor" />
    </div>
    <PanelRange label="Line Count" v-model="store.barCount" :min="16" :max="200" :step="4" />
    <PanelRange label="Line Width" v-model="store.soundVisibleLineWidth" :min="1" :max="12" />
    <PanelRange label="Beam Glow" v-model="store.soundVisibleGlow" :min="0" :max="100" />
    <PanelRange label="Shards" v-model="store.soundVisibleShardAmount" :min="0" :max="48" />
    <PanelRange label="Shard Size" v-model="store.soundVisibleShardSize" :min="4" :max="60" />
    <PanelRange label="Wind Direction" v-model="store.soundVisibleShardWindDirection" :min="-180" :max="180" />
    <PanelRange label="Turbulence" v-model="store.soundVisibleShardTurbulence" :min="0" :max="100" />
    <PanelRange label="Fade Distance" v-model="store.soundVisibleShardFadeDistance" :min="40" :max="180" />
    <ModeToggles />
  </section>

  <section class="section">
    <template v-if="isClassic && store.vizShape === 'circular'">
      <PanelRange label="Diameter" v-model="store.visualizerDiameter" :min="10" :max="90" />
      <PanelRange label="Image Size" v-model="store.visualizerImageSize" :min="10" :max="160" />
    </template>
    <template v-else>
      <PanelRange label="Width" v-model="store.visualizerWidth" :min="10" :max="100" />
      <PanelRange label="Base Height" v-model="store.visualizerBaseHeight" :min="-50" :max="50" />
    </template>
    <PanelRange label="X Position" v-model="store.visualizerXPosition" :min="-50" :max="50" />
    <PanelRange label="Y Position" v-model="store.visualizerYPosition" :min="-50" :max="50" />
    <PanelRange :label="heightLabel" v-model="store.visualizerWaveHeight" :min="5" :max="80" />
    <PanelRange v-if="isClassic" label="Separation" v-model="store.visualizerSeparation" :min="0" :max="100" />
    <PanelRange label="Rotation" v-model="store.visualizerRotation" :min="0" :max="360" />
    <PanelRange v-if="isClassic && store.vizShape === 'circular'" label="Center Cutout" v-model="store.centerCutout" :min="0" :max="80" />
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '../../../stores/app.js'
import PanelRange from '../PanelRange.vue'
import ModeToggles from './ModeToggles.vue'

const store = useAppStore()
const modes = [{ value: 'classic', label: 'Classic' }, { value: 'soundvisible', label: 'SoundVisible' }]
const shapes = [{ value: 'circular', label: 'Circle' }, { value: 'bars', label: 'Flat' }]
const styles = [{ value: 'solid', label: 'Solid' }, { value: 'bar', label: 'Bar' }, { value: 'point', label: 'Point' }]
const circleReflections = ['none', 'vertical', 'across', '3-way', '4-way'].map(toOption)
const flatReflections = [
  { value: 'none', label: 'None' }, { value: 'one-side', label: '1 Side' },
  { value: 'two-side', label: '2 Sides' }, { value: 'combo', label: 'Combo' },
]
const layerModes = [
  { value: 'web', label: 'Web', description: 'Equal wave height; layers farther back become wider.' },
  { value: 'stack', label: 'Stack', description: 'Equal width; layers farther back become taller.' },
  { value: 'combo', label: 'Combo', description: 'Layers farther back become both wider and taller.' },
  { value: 'scale', label: 'Scale', description: 'Layers farther back are scaled copies of the front layer.' },
]
const reflectionOptions = computed(() => store.vizShape === 'circular' ? circleReflections : flatReflections)
const activeLayerMode = computed(() => layerModes.find(option => option.value === store.vizLayerMode) || layerModes[0])
const countLabel = computed(() => store.vizStyle === 'bar' ? 'Bar Count' : 'Point Count')
const isClassic = computed(() => store.visualizerMode !== 'soundvisible')
const heightLabel = computed(() => isClassic.value ? 'Wave Height' : 'Beam Height')

function setShape(shape) {
  store.vizShape = shape
  const allowed = shape === 'circular' ? circleReflections : flatReflections
  if (!allowed.some(option => option.value === store.vizReflection)) store.vizReflection = 'none'
}

function toOption(value) {
  return { value, label: value.split('-').map(part => part[0].toUpperCase() + part.slice(1)).join('-') }
}
</script>

<style scoped>
@import '../panel-shared.css';

.range-control { margin-top: 10px; }
.row + .range-control { margin-top: 10px; }
.mode-description { margin-top: 8px; color: var(--text-muted); font-size: 10px; line-height: 1.4; }
</style>
