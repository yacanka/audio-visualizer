<template>
  <section class="section">
    <label class="section-label">Shape</label>
    <div class="chip-group">
      <button :class="['chip', { active: store.vizShape === 'circular' }]" @click="store.vizShape = 'circular'">Circle</button>
      <button :class="['chip', { active: store.vizShape !== 'circular' }]" @click="store.vizShape = 'bars'">Flat</button>
    </div>
  </section>

  <section class="section">
    <label class="section-label">Style</label>
    <div class="chip-group">
      <button v-for="option in styles" :key="option" :class="['chip', { active: store.vizStyle === option }]" @click="store.vizStyle = option">
        {{ option }}
      </button>
    </div>
  </section>

  <section class="section">
    <PanelRange label="Point Count" v-model="store.barCount" :min="16" :max="256" :step="8" />
    <PanelRange label="Diameter" v-model="store.visualizerDiameter" :min="10" :max="90" />
    <PanelRange label="Image Size" v-model="store.visualizerImageSize" :min="10" :max="160" />
    <PanelRange label="X Position" v-model="store.visualizerXPosition" :min="-50" :max="50" />
    <PanelRange label="Y Position" v-model="store.visualizerYPosition" :min="-50" :max="50" />
    <PanelRange label="Wave Height" v-model="store.visualizerWaveHeight" :min="5" :max="80" />
    <PanelRange label="Separation" v-model="store.visualizerSeparation" :min="0" :max="100" />
    <PanelRange label="Rotation" v-model="store.visualizerRotation" :min="0" :max="360" />
    <PanelRange label="Center Cutout" v-model="store.centerCutout" :min="0" :max="80" />
  </section>

  <section class="section">
    <label class="section-label">Reflection</label>
    <div class="chip-group">
      <button v-for="option in reflections" :key="option" :class="['chip', { active: store.vizReflection === option }]" @click="store.vizReflection = option">
        {{ option }}
      </button>
    </div>
  </section>

  <section class="section">
    <label class="section-label">Layers</label>
    <div class="chip-group">
      <button v-for="option in layerModes" :key="option" :class="['chip', { active: store.vizLayerMode === option }]" @click="store.vizLayerMode = option">
        {{ option }}
      </button>
    </div>
    <div class="row mt-8">
      <label class="item-label">Smooth</label>
      <label class="toggle"><input type="checkbox" v-model="store.vizSmooth" /><span class="track" /></label>
    </div>
    <div class="row mt-8">
      <label class="item-label">Invert</label>
      <label class="toggle"><input type="checkbox" v-model="store.vizInvert" /><span class="track" /></label>
    </div>
  </section>
</template>

<script setup>
import { useAppStore } from '../../../stores/app.js'
import PanelRange from '../PanelRange.vue'

const store = useAppStore()
const styles = ['solid', 'bar', 'point']
const reflections = ['none', 'vertical', 'across', '3-way', '4-way']
const layerModes = ['web', 'stack', 'combo', 'scale']
</script>

<style scoped>
@import '../panel-shared.css';
</style>
