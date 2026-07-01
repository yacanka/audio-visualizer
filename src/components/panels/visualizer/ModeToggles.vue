<template>
  <div class="row mt-8">
    <label class="item-label">Smooth</label>
    <label class="toggle"><input type="checkbox" v-model="store.vizSmooth" /><span class="track" /></label>
  </div>
  <div class="row mt-8">
    <label class="item-label">Invert</label>
    <label class="toggle"><input type="checkbox" v-model="store.vizInvert" /><span class="track" /></label>
  </div>
</template>

<script setup>
import { useAppStore } from '../../../stores/app.js'

const store = useAppStore()
</script>

<style scoped>
@import '../panel-shared.css';
</style>
