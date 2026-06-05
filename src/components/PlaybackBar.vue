<template>
  <div class="playback-bar">
    <!-- Controls left -->
    <div class="controls-left">
      <button class="ctrl-btn play-btn" @click="$emit('togglePlay')" :disabled="!store.audioFile" :title="store.isPlaying ? 'Durdur' : 'Oynat'">
        <svg v-if="!store.isPlaying" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      </button>

      <button class="ctrl-btn" @click="$emit('toggleMute')" :disabled="!store.audioFile" :title="store.isMuted ? 'Sesi Aç' : 'Sesi Kapat'">
        <svg v-if="!store.isMuted" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02M5 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L9 9H6c-.55 0-1 .45-1 1"/>
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="m16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"/>
        </svg>
      </button>

      <span class="time-display">{{ formatTime(store.currentTime) }} / {{ formatTime(store.duration) }}</span>
    </div>

    <!-- Waveform scrubber -->
    <div class="waveform-wrap" ref="waveformWrap" @click="onScrub" @mousemove="onHover" @mouseleave="hoverX = null">
      <canvas ref="waveformCanvas" class="waveform-canvas" />
      <div class="playhead" :style="{ left: playheadX + 'px' }" />
      <div v-if="hoverX !== null" class="hover-line" :style="{ left: hoverX + 'px' }" />
    </div>

    <!-- Controls right -->
    <div class="controls-right">
      <div class="vol-wrap">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--text-muted)">
          <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02M5 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L9 9H6c-.55 0-1 .45-1 1"/>
        </svg>
        <input type="range" class="vol-slider" v-model.number="store.volume" min="0" max="1" step="0.01" @input="$emit('volumeChange', store.volume)" />
      </div>
      <button class="ctrl-btn" title="Preview Settings" @click="settingsOpen = !settingsOpen">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.5 12c0-.23-.01-.45-.03-.68l1.86-1.41c.4-.3.51-.86.26-1.3l-1.87-3.23c-.25-.44-.79-.62-1.25-.42l-2.15.91c-.37-.26-.76-.49-1.17-.68l-.29-2.31c-.06-.5-.49-.88-.99-.88h-3.73c-.51 0-.94.38-1 .88l-.29 2.31c-.41.19-.8.42-1.17.68l-2.15-.91c-.46-.2-1-.02-1.25.42L2.41 8.62c-.25.44-.14.99.26 1.3l1.86 1.41c-.02.22-.03.44-.03.67s.01.45.03.68l-1.86 1.41c-.4.3-.51.86-.26 1.3l1.87 3.23c.25.44.79.62 1.25.42l2.15-.91c.37.26.76.49 1.17.68l.29 2.31c.06.5.49.88.99.88h3.73c.5 0 .93-.38.99-.88l.29-2.31c.41-.19.8-.42 1.17-.68l2.15.91c.46.2 1 .02 1.25-.42l1.87-3.23c.25-.44.14-.99-.26-1.3l-1.86-1.41c.03-.23.04-.45.04-.68m-7.46 3.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5"/>
        </svg>
      </button>
      <button class="ctrl-btn" title="Help" @click="$emit('help')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m1 17h-2v-2h2zm2.07-7.75-.9.92c-.5.51-.86.97-1.04 1.69-.08.32-.13.68-.13 1.14h-2v-.5c0-.46.08-.9.22-1.31.2-.58.53-1.1.95-1.52l1.24-1.26c.46-.44.68-1.1.55-1.8-.13-.72-.69-1.33-1.39-1.53-1.11-.31-2.14.32-2.47 1.27-.12.37-.43.65-.82.65h-.3C8.4 9 8 8.44 8.16 7.88c.43-1.47 1.68-2.59 3.23-2.83 1.52-.24 2.97.55 3.87 1.8 1.18 1.63.83 3.38-.19 4.4"/>
        </svg>
      </button>
      <PreviewSettingsMenu v-if="settingsOpen" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useAppStore } from '../stores/app.js'
import PreviewSettingsMenu from './PreviewSettingsMenu.vue'

const store = useAppStore()
const emit = defineEmits(['togglePlay', 'toggleMute', 'seek', 'volumeChange', 'help'])

const waveformWrap = ref(null)
const waveformCanvas = ref(null)
const hoverX = ref(null)
const settingsOpen = ref(false)

const playheadX = computed(() => {
  if (!store.duration || !waveformWrap.value) return 0
  const w = waveformWrap.value.clientWidth
  return (store.currentTime / store.duration) * w
})

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function onScrub(e) {
  if (!store.duration || !waveformWrap.value) return
  const rect = waveformWrap.value.getBoundingClientRect()
  const ratio = (e.clientX - rect.left) / rect.width
  emit('seek', ratio * store.duration)
}

function onHover(e) {
  if (!waveformWrap.value) return
  const rect = waveformWrap.value.getBoundingClientRect()
  hoverX.value = e.clientX - rect.left
}

// Draw waveform
watch(() => [store.audioFile], drawWaveform, { flush: 'post' })

// Also watch waveformData from parent
const props = defineProps({ waveformData: Array })
watch(() => props.waveformData, drawWaveformFromData, { flush: 'post' })

function drawWaveform() {
  if (!waveformCanvas.value || !waveformWrap.value) return
  const canvas = waveformCanvas.value
  const wrap = waveformWrap.value
  canvas.width = wrap.clientWidth * devicePixelRatio
  canvas.height = wrap.clientHeight * devicePixelRatio
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

function drawWaveformFromData(data) {
  if (!waveformCanvas.value || !waveformWrap.value || !data) return
  const canvas = waveformCanvas.value
  const wrap = waveformWrap.value
  const dpr = window.devicePixelRatio || 1
  canvas.width = wrap.clientWidth * dpr
  canvas.height = wrap.clientHeight * dpr
  canvas.style.width = wrap.clientWidth + 'px'
  canvas.style.height = wrap.clientHeight + 'px'

  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height
  const cx = W / 2
  const cy = H / 2

  ctx.clearRect(0, 0, W, H)

  const step = W / data.length
  ctx.fillStyle = 'rgba(255,255,255,0.18)'

  for (let i = 0; i < data.length; i++) {
    const amp = data[i]
    const h = Math.max(1, amp * cy * 1.8)
    ctx.fillRect(i * step, cy - h, Math.max(1, step - 0.5), h * 2)
  }
}

onMounted(() => {
  if (waveformWrap.value && waveformCanvas.value) {
    const canvas = waveformCanvas.value
    const wrap = waveformWrap.value
    canvas.width = wrap.clientWidth
    canvas.height = wrap.clientHeight
  }
})
</script>

<style scoped>
.playback-bar {
  height: 60px;
  background: var(--bg-panel);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 14px;
  gap: 14px;
  flex-shrink: 0;
}

.controls-left {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 200px;
  flex-shrink: 0;
}

.ctrl-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--text-secondary);
  transition: color 0.15s, background 0.15s;
}
.ctrl-btn:hover:not(:disabled) { color: var(--text-primary); background: var(--bg-hover); }
.ctrl-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.play-btn {
  background: var(--accent-dim);
  color: var(--accent);
  border: 1px solid rgba(248, 84, 98, 0.3);
}
.play-btn:hover:not(:disabled) {
  background: var(--accent);
  color: white;
}

.time-display {
  font-size: 11px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.waveform-wrap {
  flex: 1;
  height: 36px;
  position: relative;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
}

.waveform-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.playhead {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background: var(--accent);
  border-radius: 1px;
  pointer-events: none;
  box-shadow: 0 0 6px var(--accent);
  transition: left 0.1s linear;
}

.hover-line {
  position: absolute;
  top: 0;
  width: 1px;
  height: 100%;
  background: rgba(255,255,255,0.3);
  pointer-events: none;
}

.controls-right {
  width: 210px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  position: relative;
}

.vol-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 120px;
}

.vol-slider {
  flex: 1;
}
</style>
