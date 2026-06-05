<template>
  <div class="presets">
    <button
      v-for="preset in presets"
      :key="preset.name"
      class="preset-swatch"
      :style="preset.style"
      :title="preset.name"
      @click="applyPreset(preset)"
    />
  </div>
</template>

<script setup>
import { useAppStore } from '../../../stores/app.js'

const store = useAppStore()
const presets = [
  createPreset('Space', '#0d0d1a', '#1a0d2e'),
  createPreset('Ocean', '#0a0e1a', '#0d2137'),
  createPreset('Night', '#12121e', '#1e1228'),
  createPreset('Red', '#1a0808', '#2a0d0d'),
  createPreset('Green', '#071a0d', '#0d2215'),
  createPreset('Black', '#000000', '#000000'),
  createPreset('Gray', '#111111', '#111111'),
  createPreset('Amber', '#1a0f00', '#2a1800'),
]

function createPreset(name, c1, c2) {
  const style = c1 === c2 ? `background:${c1}` : `background:linear-gradient(135deg,${c1},${c2})`
  return { name, c1, c2, style }
}

function applyPreset(preset) {
  store.backdropType = preset.c1 === preset.c2 ? 'solid' : 'gradient'
  store.backdropColor = preset.c1
  store.backdropGradient1 = preset.c1
  store.backdropGradient2 = preset.c2
}
</script>

<style scoped>
.presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.preset-swatch {
  width: 28px;
  height: 28px;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
}

.preset-swatch:hover {
  border-color: var(--border-hover);
}
</style>
