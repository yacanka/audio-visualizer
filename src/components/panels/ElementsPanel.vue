<template>
  <div class="panel">
    <h3 class="panel-title">Elements</h3>

    <section class="section">
      <label class="section-label">Timeline actions</label>
      <div class="actions">
        <button class="chip" @click="store.addTextElement()">Add Text</button>
        <button class="chip" @click="mediaInput?.click()">Select Media</button>
      </div>
      <input ref="mediaInput" type="file" accept="image/png,image/jpeg,image/webp" hidden @change="onMedia" />
    </section>

    <section class="section">
      <button class="wide-action" @click="store.addSubscribeAnimation()">Like & Subscribe Animation</button>
    </section>

    <section class="section">
      <label class="section-label">Particles</label>
      <label class="section-label subtle">Direction</label>
      <div class="chip-group">
        <button
          v-for="direction in directions"
          :key="direction"
          :class="['chip', { active: store.particleDirection === direction }]"
          @click="store.particleDirection = direction"
        >
          {{ direction }}
        </button>
      </div>
      <div class="row mt-8">
        <label class="item-label">Reactive Speed</label>
        <label class="toggle">
          <input type="checkbox" v-model="store.particleReactiveSpeed" />
          <span class="track" />
        </label>
      </div>
      <div class="row mt-8" v-if="store.particleReactiveSpeed">
        <label class="item-label">Particle Punch</label>
        <span class="value-label">{{ store.particleAttackSensitivity }}%</span>
      </div>
      <input
        v-if="store.particleReactiveSpeed"
        class="slider-row"
        type="range"
        min="0"
        max="100"
        step="1"
        v-model.number="store.particleAttackSensitivity"
      />
      <div class="row mt-8">
        <label class="item-label">Fade In</label>
        <label class="toggle">
          <input type="checkbox" v-model="store.particleFadeIn" />
          <span class="track" />
        </label>
      </div>
      <div class="row mt-8">
        <label class="item-label">Fade Out</label>
        <label class="toggle">
          <input type="checkbox" v-model="store.particleFadeOut" />
          <span class="track" />
        </label>
      </div>
      <div class="row mt-8">
        <label class="item-label">Scatter Speed</label>
        <input type="number" min="0.1" max="4" step="0.1" v-model.number="store.particleSpeed" />
      </div>
      <ParticleRangeControls />
      <div class="row mt-8">
        <label class="item-label">Wander</label>
        <input type="number" min="0" max="100" step="1" v-model.number="store.particleWander" />
      </div>
      <button class="wide-action secondary" @click="store.addParticleElement()">Add Particles</button>
    </section>

    <section class="section" v-if="selected">
      <label class="section-label">{{ selectedLabel }}</label>
      <input v-if="selected.type === 'text'" class="text-input" v-model="selected.text" />
      <div class="row mt-8" v-if="selected.type !== 'particles'">
        <label class="item-label">X Position</label>
        <input type="number" min="0" max="100" v-model.number="selected.x" />
      </div>
      <div class="row mt-8" v-if="selected.type !== 'particles'">
        <label class="item-label">Y Position</label>
        <input type="number" min="0" max="100" v-model.number="selected.y" />
      </div>
      <div class="row mt-8" v-if="selected.type !== 'particles'">
        <label class="item-label">Scale</label>
        <input type="number" min="8" max="120" v-model.number="selected.size" />
      </div>
      <div class="row mt-8" v-if="selected.type === 'text'">
        <label class="item-label">Color</label>
        <input type="color" v-model="selected.color" />
      </div>
      <div class="row mt-8" v-if="selected.type === 'particles'">
        <label class="item-label">Color</label>
        <input type="color" v-model="selected.color" />
      </div>
      <div class="row mt-8" v-if="selected.type === 'particles'">
        <label class="item-label">Particle Count</label>
        <input type="number" min="1" max="500" v-model.number="selected.count" />
      </div>
      <button class="remove-btn" @click="store.deleteSelectedElement()">Delete Selected</button>
    </section>

    <section class="section" v-if="store.elements.length">
      <label class="section-label">Layers</label>
      <button
        v-for="element in store.elements"
        :key="element.id"
        class="layer"
        :class="{ active: element.id === store.selectedElementId }"
        @click="store.selectedElementId = element.id"
      >
        {{ element.text || element.name }}
      </button>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAppStore } from '../../stores/app.js'
import ParticleRangeControls from './ParticleRangeControls.vue'

const store = useAppStore()
const mediaInput = ref(null)
const selected = computed(() => store.elements.find(item => item.id === store.selectedElementId))
const selectedLabel = computed(() => getElementLabel(selected.value))
const directions = ['right', 'left', 'up', 'down', 'out']

function getElementLabel(element) {
  if (!element) return ''
  if (element.type === 'particles') return 'Particles'
  return element.type === 'text' ? 'Text' : 'Image'
}

function onMedia(event) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => store.addImageElement(reader.result, file.name)
  reader.readAsDataURL(file)
  event.target.value = ''
}
</script>

<style scoped>
@import './panel-shared.css';

.actions { display: flex; gap: 6px; flex-wrap: wrap; }
.subtle { margin-top: 8px; color: var(--text-muted); }
.value-label { font-size: 11px; color: var(--accent); font-weight: 600; }
.text-input {
  width: 100%;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  padding: 7px;
}
.layer {
  width: 100%;
  text-align: left;
  padding: 7px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}
.layer.active, .layer:hover { background: var(--accent-dim); color: var(--accent); }
.remove-btn { width: 100%; margin-top: 8px; padding: 7px; color: #ff8585; }
.wide-action {
  width: 100%;
  padding: 8px;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}
.wide-action.secondary {
  margin-top: 10px;
  background: var(--bg-hover);
  color: var(--text-secondary);
}
</style>
