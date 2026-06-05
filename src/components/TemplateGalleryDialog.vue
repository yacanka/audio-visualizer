<template>
  <AppDialog title="Select a preset for your video" @close="$emit('close')">
    <div class="template-grid">
      <article
        v-for="template in visibleTemplates"
        :key="template.id"
        class="template-card"
        :class="{ selected: template.id === selectedTemplateId }"
      >
        <button
          class="preview"
          :style="getPreviewStyle(template)"
          :aria-label="`View example video for ${template.name}`"
          @click="$emit('select', template)"
        >
          <span v-if="template.pro" class="badge">Pro</span>
          <span class="pulse" />
        </button>
        <p>{{ template.name }}</p>
        <button class="select-btn" @click="$emit('select', template)">Select</button>
      </article>
    </div>

    <button v-if="!expanded" class="show-more" @click="expanded = true">Show More</button>
  </AppDialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import AppDialog from './AppDialog.vue'
import { videoTemplates } from '../templates/videoTemplates.js'

defineProps({
  selectedTemplateId: { type: String, required: true },
})

defineEmits(['close', 'select'])

const expanded = ref(false)
const visibleTemplates = computed(() => expanded.value ? videoTemplates : videoTemplates.slice(0, 12))

function getPreviewStyle(template) {
  const [bg1, bg2] = template.preview.backdrop
  const [a1, a2] = template.preview.accent
  return `--bg1:${bg1};--bg2:${bg2};--a1:${a1};--a2:${a2}`
}
</script>

<style scoped>
:deep(.dialog) {
  width: min(920px, calc(100vw - 32px));
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  padding: 16px;
}

.template-card {
  min-width: 0;
}

.preview {
  width: 100%;
  aspect-ratio: 16 / 10;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background:
    radial-gradient(circle at 50% 52%, var(--a1), transparent 18%),
    linear-gradient(135deg, var(--bg1), var(--bg2));
}

.preview::before {
  content: '';
  position: absolute;
  inset: 18% 14%;
  border: 2px solid color-mix(in srgb, var(--a2), transparent 20%);
  border-radius: 50%;
  box-shadow: 0 0 24px var(--a1);
}

.pulse {
  position: absolute;
  left: 14%;
  right: 14%;
  bottom: 18%;
  height: 26%;
  background: repeating-linear-gradient(
    90deg,
    var(--a1) 0 4px,
    transparent 4px 9px
  );
  opacity: 0.82;
}

.badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
}

p {
  margin-top: 8px;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 600;
}

.select-btn,
.show-more {
  width: 100%;
  margin-top: 8px;
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.show-more {
  width: calc(100% - 32px);
  margin: 0 16px 16px;
  background: var(--bg-hover);
  color: var(--text-secondary);
}

.template-card.selected .preview {
  border-color: var(--accent);
}
</style>
