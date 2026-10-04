<template>
  <canvas ref="canvas" width="480" height="270" aria-hidden="true" />
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { createTemplateSettings } from '../templates/videoTemplates.js'
import { createCanvasVisualizerRenderer } from '../visualizer/canvasRenderer.js'
import { prepareImages } from '../visualizer/images.js'
const props = defineProps({ template: { type: Object, required: true }, playing: Boolean })
const canvas = ref(null)
let renderer, settings, observer, frame, disposed = false, visible = false
let time = 0
let previousTimestamp = 0

function draw(timestamp = 0) {
  if (!canvas.value || !renderer || disposed) return
  settings.isPlaying = props.playing
  if (props.playing && previousTimestamp) time += Math.min(100, Math.max(0, timestamp - previousTimestamp)) / 1000
  previousTimestamp = timestamp
  settings.currentTime = time
  renderer.drawFrame(canvas.value, () => null, () => null, timestamp)
  if (props.playing && visible) frame = requestAnimationFrame(draw)
}

async function initialize() {
  if (renderer) { previousTimestamp = 0; draw(); return }
  settings = { ...createTemplateSettings(props.template), previewAudioAnalysisEnabled: true, duration: 0, currentTime: 0, isPlaying: false }
  renderer = createCanvasVisualizerRenderer(settings)
  draw()
  try { await prepareImages(settings) } catch { /* A missing backdrop keeps the preset's base color. */ }
  if (!disposed) { cancelAnimationFrame(frame); draw() }
}

watch(() => props.playing, () => { cancelAnimationFrame(frame); if (visible) draw() })
onMounted(() => {
  observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting
    if (visible) initialize()
    else cancelAnimationFrame(frame)
  })
  observer.observe(canvas.value)
})
onUnmounted(() => { disposed = true; observer?.disconnect(); cancelAnimationFrame(frame) })
</script>

<style scoped>
canvas { display: block; width: 100%; height: 100%; object-fit: cover; }
</style>
