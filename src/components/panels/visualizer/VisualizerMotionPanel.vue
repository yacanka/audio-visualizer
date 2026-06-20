<template>
  <section class="section">
    <label class="section-label">Spectrum</label>
    <div class="chip-group">
      <button :class="['chip', { active: store.vizSpectrum === 'bass' }]" @click="store.vizSpectrum = 'bass'">Bass</button>
      <button :class="['chip', { active: store.vizSpectrum === 'wide' }]" @click="store.vizSpectrum = 'wide'">Wide</button>
    </div>
  </section>

  <section class="section">
    <ToggleRow label="Wave Delay" v-model="store.waveDelay" />
    <ToggleRow label="Drift" v-model="store.drift" />
    <PanelRange v-if="store.drift" label="Intensity" v-model="store.driftIntensity" :min="0" :max="100" />
    <ToggleRow v-if="store.drift" label="Custom" v-model="store.driftCustom" />
  </section>

  <section class="section">
    <PanelRange label="Rumble" v-model="store.visualizerRumble" :min="0" :max="100" />
    <PanelRange label="Bounce" v-model="store.visualizerBounce" :min="0" :max="100" />
    <ToggleRow label="Spin" v-model="store.visualizerSpin" />
  </section>

  <section class="section">
    <PanelRange label="Sensitivity" v-model="store.sensitivity" :min="0.1" :max="3" :step="0.1" />
    <PanelRange label="Smoothing" v-model="store.smoothing" :min="0" :max="0.99" :step="0.01" @change="$emit('smoothingChange')" />
  </section>
</template>

<script setup>
import { useAppStore } from '../../../stores/app.js'
import PanelRange from '../PanelRange.vue'
import ToggleRow from '../ToggleRow.vue'

const store = useAppStore()
defineEmits(['smoothingChange'])
</script>

<style scoped>
@import '../panel-shared.css';
</style>
