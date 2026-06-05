<template>
  <div class="panel">
    <h3 class="panel-title">General</h3>

    <section class="section">
      <div class="guide-header">
        <button class="guide-title" @click="store.stepGuideIndex = 0">Step Guide</button>
        <div class="guide-nav">
          <button class="chip" :disabled="isFirstStep" @click="moveStep(-1)">Back</button>
          <button class="chip" :disabled="isLastStep" @click="moveStep(1)">Next</button>
        </div>
      </div>

      <div class="step-list">
        <button
          v-for="(step, index) in templateSteps"
          :key="step.id"
          class="step"
          :class="{ active: index === store.stepGuideIndex }"
          @click="store.stepGuideIndex = index"
        >
          <span>{{ index + 1 }}</span>
          {{ step.label }}
        </button>
      </div>

      <div class="step-detail">
        <label class="section-label">{{ currentStep.label }}</label>
        <button v-if="currentStep.id === 'preset'" class="primary-btn" @click="$emit('preset')">
          Select Preset
        </button>
        <button v-else-if="currentStep.id === 'audio'" class="primary-btn" @click="$emit('upload')">
          Upload Audio
        </button>
        <p v-else class="hint">{{ stepHint }}</p>
      </div>
    </section>

    <section class="section">
      <label class="section-label">Current Preset</label>
      <div class="info-row">
        <span>{{ selectedTemplate.name }}</span>
        <button class="chip" @click="$emit('preset')">Change</button>
      </div>
    </section>

    <section class="section">
      <label class="section-label">Audio</label>
      <button class="primary-btn" @click="$emit('upload')">Upload Audio</button>
      <div class="info-row">
        <span>Selected Duration</span>
        <span>{{ formatTime(store.selectedDuration || store.duration) }}</span>
      </div>
    </section>

    <section class="section">
      <label class="section-label">Time Range</label>
      <div class="row">
        <label class="item-label">Start Time</label>
        <input type="number" min="0" step="0.1" v-model.number="store.startTime" />
      </div>
      <div class="row mt-8">
        <label class="item-label">End Time</label>
        <input type="number" min="0" step="0.1" v-model.number="store.endTime" />
      </div>
      <p class="hint">Export boş bırakılırsa tüm ses aralığını kullanır.</p>
    </section>

    <section class="section">
      <label class="section-label">Video</label>
      <div class="row">
        <span class="item-label">Privacy</span>
        <button class="chip" :class="{ active: store.isVideoPublic }" @click="store.isVideoPublic = !store.isVideoPublic">
          {{ store.isVideoPublic ? 'Public' : 'Private' }}
        </button>
      </div>
      <div class="row mt-8">
        <span class="item-label">Preview Quality</span>
        <select v-model.number="store.previewQuality">
          <option v-for="quality in qualities" :key="quality" :value="quality">{{ quality }}p</option>
        </select>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '../../stores/app.js'
import { getTemplateById, templateSteps } from '../../templates/videoTemplates.js'

const store = useAppStore()
const qualities = [720, 480, 360, 240]
defineEmits(['upload', 'preset'])

const currentStep = computed(() => templateSteps[store.stepGuideIndex])
const isFirstStep = computed(() => store.stepGuideIndex === 0)
const isLastStep = computed(() => store.stepGuideIndex === templateSteps.length - 1)
const selectedTemplate = computed(() => getTemplateById(store.selectedTemplateId))
const stepHint = computed(() => `Open the ${currentStep.value.label} tab to customize this step.`)

function moveStep(offset) {
  const nextIndex = store.stepGuideIndex + offset
  store.stepGuideIndex = Math.min(templateSteps.length - 1, Math.max(0, nextIndex))
}

function formatTime(value) {
  if (!value) return '0:00'
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
@import './panel-shared.css';

.guide-header,
.guide-nav,
.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.guide-title {
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 700;
}

.step-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
  margin: 10px 0;
}

.step {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 28px;
  padding: 5px 7px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 11px;
  text-align: left;
}

.step span {
  width: 18px;
  height: 18px;
  display: inline-grid;
  place-items: center;
  border-radius: 50%;
  background: var(--bg-hover);
  color: var(--text-muted);
  font-size: 10px;
}

.step.active {
  background: var(--accent-dim);
  color: var(--accent);
}

.primary-btn {
  width: 100%;
  padding: 9px;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: white;
  font-size: 11px;
  font-weight: 700;
}

.hint {
  margin-top: 6px;
  color: var(--text-muted);
  font-size: 10px;
}

.info-row {
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 11px;
}
</style>
