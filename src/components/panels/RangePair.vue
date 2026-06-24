<template>
  <div class="range-pair">
    <div class="row">
      <label class="item-label">{{ label }}</label>
      <span class="value-label">{{ minimumValue }}{{ unit }} – {{ maximumValue }}{{ unit }}</span>
    </div>
    <div class="slider-pair">
      <input type="range" :aria-label="`${label} minimum`" :min="min" :max="max" :step="step" :value="minimumValue" @input="updateMinimum" />
      <input type="range" :aria-label="`${label} maximum`" :min="min" :max="max" :step="step" :value="maximumValue" @input="updateMaximum" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  label: { type: String, required: true },
  max: { type: Number, required: true },
  maximumValue: { type: Number, required: true },
  min: { type: Number, required: true },
  minimumValue: { type: Number, required: true },
  step: { type: Number, default: 1 },
  unit: { type: String, default: '' },
})

const emit = defineEmits(['update:minimumValue', 'update:maximumValue'])

function updateMinimum(event) {
  emit('update:minimumValue', Math.min(Number(event.target.value), props.maximumValue))
}

function updateMaximum(event) {
  emit('update:maximumValue', Math.max(Number(event.target.value), props.minimumValue))
}
</script>

<style scoped>
@import './panel-shared.css';
.range-pair + .range-pair { margin-top: 10px; }
.slider-pair { height: 18px; margin-top: 7px; position: relative; }
.slider-pair input { inset: 0; pointer-events: none; position: absolute; }
.slider-pair input::-webkit-slider-thumb { pointer-events: auto; }
.slider-pair input::-moz-range-thumb { pointer-events: auto; }
.value-label { color: var(--accent); font-size: 11px; font-weight: 600; }
</style>
