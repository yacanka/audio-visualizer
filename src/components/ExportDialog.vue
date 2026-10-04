<template>
  <AppDialog title="Export Video" @close="close">
    <div class="content">
      <div class="summary">
        <span>{{ store.previewQuality }}p</span>
        <span>{{ store.aspectRatio }}</span>
        <span>{{ formatTime(exportDuration) }}</span>
      </div>
      <p>{{ exportCopy }}</p>
      <button class="primary" :disabled="store.isExporting" @click="startExport">
        {{ store.isExporting ? 'Export in progress...' : 'Start Export' }}
      </button>
      <progress v-if="store.isExporting" :value="store.exportProgress" max="100" aria-label="Export progress" />
      <button v-if="store.isExporting" class="cancel" @click="$emit('cancel')">Cancel Export</button>
      <p v-if="store.exportStatus" role="status" class="status">{{ store.exportStatus }}</p>
    </div>
  </AppDialog>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '../stores/app.js'
import AppDialog from './AppDialog.vue'

const emit = defineEmits(['close', 'start', 'cancel'])
const store = useAppStore()
const exportDuration = computed(() => store.selectedDuration || store.duration || (store.backdropType === 'video' && store.backdropVideoDuration) || 5)
const exportCopy = computed(() => `${formatTime(exportDuration.value)} of audio will be exported.`)

function close() {
  if (store.isExporting) emit('cancel')
  emit('close')
}

function startExport() {
  emit('start', { duration: exportDuration.value })
}

function formatTime(value) {
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.content { padding: 16px; display: grid; gap: 14px; }
.summary { display: flex; gap: 8px; }
.summary span {
  padding: 5px 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}
p { color: var(--text-secondary); font-size: 12px; }
.primary {
  padding: 10px;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: white;
  font-weight: 600;
}
.primary:disabled { opacity: 0.6; cursor: wait; }
progress { width: 100%; accent-color: var(--accent); }
.cancel { color: var(--text-secondary); padding: 8px; }
.status { color: var(--accent); }
</style>
