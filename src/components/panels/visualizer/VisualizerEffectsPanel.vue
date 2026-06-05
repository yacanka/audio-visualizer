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
    <ToggleRow label="Shadow" v-model="store.shadowEnabled" />
    <ToggleRow label="Progress Bar" v-model="store.showProgressBar" />
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
