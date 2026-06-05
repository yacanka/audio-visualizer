<template>
  <div class="preview-menu">
    <section>
      <div class="menu-title">Video Backgrounds</div>
      <button class="menu-item" :class="{ active: store.previewBackgroundMode === 'animate' }" @click="store.previewBackgroundMode = 'animate'">ANIMATE</button>
      <button class="menu-item" :class="{ active: store.previewBackgroundMode === 'pause' }" @click="store.previewBackgroundMode = 'pause'">PAUSE</button>
    </section>

    <section>
      <div class="menu-title">Preview Quality</div>
      <button v-for="quality in qualities" :key="quality" class="menu-item" :class="{ active: store.previewQuality === quality }" @click="store.previewQuality = quality">
        {{ quality }}p
      </button>
    </section>

    <section>
      <div class="menu-title">Audio Analysis</div>
      <button class="menu-item" :class="{ active: store.previewAudioAnalysisEnabled }" @click="store.previewAudioAnalysisEnabled = true">ENABLED</button>
      <button class="menu-item" :class="{ active: !store.previewAudioAnalysisEnabled }" @click="store.previewAudioAnalysisEnabled = false">DISABLED</button>
    </section>
  </div>
</template>

<script setup>
import { useAppStore } from '../stores/app.js'

const store = useAppStore()
const qualities = [720, 480, 360, 240]
</script>

<style scoped>
.preview-menu {
  position: absolute;
  right: 8px;
  bottom: 48px;
  width: 230px;
  padding: 8px;
  border-radius: var(--radius);
  background: var(--bg-panel);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  z-index: 50;
}
section + section { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); }
.menu-title { color: var(--text-primary); font-size: 12px; font-weight: 600; margin-bottom: 4px; }
.menu-item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 7px 8px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 12px;
}
.menu-item.active::before { content: '✓'; color: var(--accent); }
.menu-item:hover, .menu-item.active { background: var(--bg-hover); color: var(--text-primary); }
</style>
