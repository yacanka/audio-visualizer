<template>
  <div class="row mt-8">
    <label class="item-label">{{ label }}</label>
    <label class="toggle">
      <input type="checkbox" :checked="modelValue" @change="$emit('update:modelValue', $event.target.checked)" />
      <span class="track" />
    </label>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  modelValue: { type: Boolean, required: true },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
@import './panel-shared.css';
</style>
