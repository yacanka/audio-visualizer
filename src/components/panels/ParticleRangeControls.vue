<template>
  <section class="particle-ranges">
    <RangePair
      label="Opacity"
      unit="%"
      :minimum-value="store.particleMinOpacity"
      :maximum-value="store.particleMaxOpacity"
      :min="0"
      :max="100"
      @update:minimum-value="store.particleMinOpacity = $event"
      @update:maximum-value="store.particleMaxOpacity = $event"
    />
    <RangePair
      label="Size"
      unit="px"
      :minimum-value="store.particleMinSize"
      :maximum-value="store.particleMaxSize"
      :min="1"
      :max="80"
      :step="0.5"
      @update:minimum-value="store.particleMinSize = $event"
      @update:maximum-value="store.particleMaxSize = $event"
    />
  </section>
</template>

<script setup>
import { useAppStore } from '../../stores/app.js'
import RangePair from './RangePair.vue'

const store = useAppStore()
</script>

<style scoped>
.particle-ranges { margin-top: 8px; }
</style>
