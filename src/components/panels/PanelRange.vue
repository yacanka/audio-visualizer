<template>
  <div class="range-control">
    <div class="row">
      <label class="item-label">{{ label }}</label>
      <input
        type="number"
        :min="min"
        :max="max"
        :step="step"
        :value="modelValue"
        @input="updateValue($event.target.value)"
      />
    </div>
    <div class="slider-row">
      <input
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :value="modelValue"
        @input="updateValue($event.target.value)"
        @change="$emit('change')"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  max: { type: Number, required: true },
  min: { type: Number, required: true },
  modelValue: { type: Number, required: true },
  step: { type: Number, default: 1 },
})

const emit = defineEmits(['update:modelValue', 'change'])

function updateValue(value) {
  emit('update:modelValue', Number(value))
}
</script>

<style scoped>
.range-control + .range-control {
  margin-top: 8px;
}
</style>
