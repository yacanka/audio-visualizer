<template>
  <AppDialog title="Select a preset for your video" @close="$emit('close')">
    <div class="gallery-tools">
      <input v-model="search" type="search" aria-label="Search presets" placeholder="Search presets…" />
      <span>{{ filteredTemplates.length }} presets</span>
    </div>
    <div class="template-grid">
      <article
        v-for="template in visibleTemplates"
        :key="template.id"
        class="template-card"
        :class="{ selected: template.id === selectedTemplateId }"
      >
        <button
          class="preview"
          :aria-label="`Preview ${template.name}`"
          @mouseenter="previewing = template.id"
          @mouseleave="previewing = null"
          @focus="previewing = template.id"
          @blur="previewing = null"
          @click="previewing = previewing === template.id ? null : template.id"
        >
          <TemplatePreview :template="template" :playing="previewing === template.id" />
          <span class="preview-label">{{ previewing === template.id ? 'Previewing' : 'Preview' }}</span>
        </button>
        <p>{{ template.name }}</p>
        <small v-if="template.backdropFallback">Gradient backdrop</small>
        <button :aria-label="`Select ${template.name}`" class="select-btn" @click="$emit('select', template)">Select</button>
      </article>
    </div>

    <p v-if="!filteredTemplates.length" class="empty">No presets match your search.</p>
    <button v-if="visibleCount < filteredTemplates.length" class="show-more" @click="visibleCount += 12">Show More</button>
  </AppDialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import TemplatePreview from './TemplatePreview.vue'
import AppDialog from './AppDialog.vue'
import { videoTemplates } from '../templates/videoTemplates.js'

defineProps({
  selectedTemplateId: { type: String, required: true },
})

defineEmits(['close', 'select'])

const search = ref('')
const previewing = ref(null)
const visibleCount = ref(12)
const filteredTemplates = computed(() => videoTemplates.filter(template => template.name.toLowerCase().includes(search.value.trim().toLowerCase())))
const visibleTemplates = computed(() => filteredTemplates.value.slice(0, visibleCount.value))
watch(search, () => { visibleCount.value = 12 })
</script>

<style scoped>
:deep(.dialog) {
  width: min(1100px, calc(100vw - 64px));
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  padding: 16px;
}

.template-card {
  min-width: 0;
}

.preview { width: 100%; aspect-ratio: 16 / 9; position: relative; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-secondary); }
.preview-label { position: absolute; right: 8px; bottom: 8px; background: #000a; color: #fff; padding: 3px 7px; border-radius: 4px; font-size: 10px; opacity: 0; }
.preview:hover .preview-label, .preview:focus .preview-label { opacity: 1; }
.gallery-tools { display: flex; align-items: center; gap: 16px; padding: 16px 16px 0; }
.gallery-tools input { flex: 1; min-width: 0; padding: 10px 12px; border: 1px solid var(--border); border-radius: 4px; color: var(--text-primary); background: var(--bg-secondary); }
.gallery-tools span, small, .empty { color: var(--text-muted); font-size: 11px; }
.empty { padding: 24px; text-align: center; }

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
  background: transparent;
  border: 1px solid var(--border-hover);
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
