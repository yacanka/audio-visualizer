<template>
  <div v-if="store.backdropType === 'solid'" class="row mt-8">
    <label class="item-label">Color</label>
    <input type="color" v-model="store.backdropColor" />
  </div>

  <template v-if="store.backdropType === 'gradient'">
    <div class="row mt-8">
      <label class="item-label">Color 1</label>
      <input type="color" v-model="store.backdropGradient1" />
    </div>
    <div class="row mt-8">
      <label class="item-label">Color 2</label>
      <input type="color" v-model="store.backdropGradient2" />
    </div>
  </template>
</template>

<script setup>
import { useAppStore } from '../../../stores/app.js'

const store = useAppStore()
</script>

<style scoped>
@import '../panel-shared.css';
</style>
