<template>
  <div class="canvas-wrapper">
    <!-- Drop zone overlay -->
    <div v-if="!store.audioFile" class="drop-zone" :class="{ dragging }" @click="$emit('upload')" @dragover.prevent="dragging = true" @dragleave="dragging = false" @drop.prevent="onDrop">
      <div class="drop-content">
        <div class="drop-icon">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" stroke="var(--accent)" stroke-width="1" stroke-dasharray="4 2" opacity="0.6"/>
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" fill="var(--accent)" opacity="0.8"/>
          </svg>
        </div>
        <p class="drop-title">Ses Dosyası Yükle</p>
        <p class="drop-sub">Sürükle bırak veya tıkla · MP3, WAV, FLAC, OGG</p>
      </div>
    </div>

    <!-- Canvas -->
    <div class="canvas-container" :style="containerStyle">
      <canvas ref="canvasRef" :width="dims.w" :height="dims.h" class="viz-canvas" />
    </div>

    <!-- Hidden audio element -->
    <audio ref="audioEl" loop preload="auto" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '../stores/app.js'
import { useAudio } from '../composables/useAudio.js'
import { useVisualizer } from '../composables/useVisualizer.js'

const store = useAppStore()
const audio = useAudio()
const viz = useVisualizer()

const canvasRef = ref(null)
const audioEl = ref(null)
const dragging = ref(false)

const dims = computed(() => viz.getCanvasDimensions())

const containerStyle = computed(() => {
  const { w, h } = dims.value
  const ratio = w / h
  return {
    aspectRatio: `${w} / ${h}`,
    maxWidth: ratio >= 1 ? '100%' : `${(h / w) * 100}%`,
  }
})

let animId = null

function loop(ts) {
  if (!canvasRef.value) return
  viz.drawFrame(canvasRef.value, audio.getFrequencyData, audio.getTimeDomainData, ts)
  animId = requestAnimationFrame(loop)
}

onMounted(() => {
  audio.setup(audioEl.value)
  animId = requestAnimationFrame(loop)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
  audio.dispose()
})

function getCanvas() {
  return canvasRef.value
}

// Expose methods
defineExpose({ audio, getCanvas })

// Watch smoothing change
watch(() => store.smoothing, audio.updateAnalyserSettings)
watch(() => store.fftSize, audio.updateAnalyserSettings)

const emit = defineEmits(['upload'])

async function onDrop(e) {
  dragging.value = false
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('audio/')) {
    await audio.loadFile(file)
    audio.play()
  }
}
</script>

<style scoped>
.canvas-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.drop-zone {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s;
}

.drop-zone.dragging {
  background: rgba(248, 84, 98, 0.08);
}

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  user-select: none;
}

.drop-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.drop-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.drop-sub {
  font-size: 12px;
  color: var(--text-muted);
}

.canvas-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
}

.viz-canvas {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
