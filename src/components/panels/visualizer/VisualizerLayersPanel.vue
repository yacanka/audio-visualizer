<template>
  <section class="section">
    <label class="section-label">Layers</label>
    <button
      v-for="layer in store.visualizerLayers"
      :key="layer.id"
      class="layer"
      :class="{ active: store.selectedVisualizerLayer === layer.id }"
      @click="store.selectedVisualizerLayer = layer.id"
    >
      {{ layer.name }}
    </button>
    <button class="add-btn" @click="store.addVisualizerLayer()">Add Layer</button>
  </section>

  <section class="section">
    <label class="section-label">Shape</label>
    <div class="chip-group">
      <button
        v-for="shape in shapes"
        :key="shape.value"
        :class="['chip', { active: store.vizShape === shape.value }]"
        @click="store.vizShape = shape.value"
      >
        {{ shape.label }}
      </button>
    </div>
  </section>

  <section class="section" v-if="store.vizShape !== 'wave'">
    <PanelRange label="Bar Count" v-model="store.barCount" :min="16" :max="256" :step="8" />
    <PanelRange label="Bar Gap" v-model="store.barGap" :min="0" :max="10" :step="0.5" />
    <PanelRange
      v-if="store.vizShape !== 'circular'"
      label="Rounding"
      v-model="store.barRounding"
      :min="0"
      :max="20"
    />
  </section>
</template>

<script setup>
import { useAppStore } from '../../../stores/app.js'
import PanelRange from '../PanelRange.vue'

const store = useAppStore()

const shapes = [
  { value: 'bars', label: 'Flat' },
  { value: 'mirror', label: 'Mirror' },
  { value: 'wave', label: 'Wave' },
  { value: 'filled', label: 'Filled' },
  { value: 'circular', label: 'Circle' },
]
</script>

<style scoped>
@import '../panel-shared.css';

.layer {
  width: 100%;
  margin-bottom: 5px;
  padding: 7px;
  border-radius: var(--radius-sm);
  background: var(--bg-hover);
  color: var(--text-secondary);
  text-align: left;
}

.layer.active {
  background: var(--accent-dim);
  color: var(--accent);
}

.add-btn {
  width: 100%;
  margin-top: 5px;
  padding: 8px;
  border-radius: var(--radius-sm);
  border: 1px dashed var(--border);
  color: var(--text-secondary);
  font-size: 11px;
}
</style>
