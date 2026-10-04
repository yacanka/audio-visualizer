<template>
  <section class="section">
    <ToggleRow label="Glow" v-model="store.glowEnabled" />
    <template v-if="store.glowEnabled">
      <label class="section-label mt-label">Type</label>
      <div class="chip-group">
        <button v-for="type in glowTypes" :key="type" :class="['chip', { active: store.glowType === type }]" @click="store.glowType = type">
          {{ type }}
        </button>
      </div>
      <div class="row mt-8">
        <label class="item-label">Color</label>
        <input type="color" v-model="store.glowColor" />
      </div>
      <PanelRange label="Blur" v-model="store.glowAmount" :min="0" :max="50" />
      <PanelRange label="Scale" v-model="store.glowScale" :min="0" :max="50" />
    </template>
  </section>

  <section class="section">
    <ToggleRow label="Fire" v-model="store.fireEnabled" />
    <template v-if="store.fireEnabled">
      <PanelRange label="Fire Intensity" v-model="store.fireIntensity" :min="0" :max="100" />
      <PanelRange label="Fire Detail" v-model="store.fireDetail" :min="1" :max="5" />
    </template>
    <ToggleRow label="Shadow" v-model="store.shadowEnabled" />
    <template v-if="store.shadowEnabled">
      <PanelRange label="Shadow Blur" v-model="store.shadowBlur" :min="0" :max="30" />
      <PanelRange label="Shadow Opacity" v-model="store.shadowOpacity" :min="0" :max="100" />
    </template>
    <ToggleRow label="Progress Bar" v-model="store.showProgressBar" />
  </section>

  <section class="section">
    <ToggleRow label="WebGL Displacement" v-model="store.webglDisplacementEnabled" />
    <PanelRange
      v-if="store.webglDisplacementEnabled"
      label="Displacement"
      v-model="store.webglDisplacementIntensity"
      :min="0"
      :max="60"
    />
  </section>
</template>

<script setup>
import { useAppStore } from '../../../stores/app.js'
import PanelRange from '../PanelRange.vue'
import ToggleRow from '../ToggleRow.vue'

const store = useAppStore()
const glowTypes = ['outer', 'inner']
</script>

<style scoped>
@import '../panel-shared.css';

.mt-label {
  margin-top: 10px;
}
</style>
