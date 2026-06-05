<template>
  <AppDialog title="Videos" @close="$emit('close')">
    <div class="content">
      <button class="video-row" @click="$emit('close')">
        <span>{{ store.fileName || 'New Video' }}</span>
        <small>{{ store.isVideoPublic ? 'Public' : 'Private' }}</small>
      </button>
      <div class="actions">
        <button @click="$emit('new')">Create New Video</button>
        <button @click="$emit('save')">Save Video</button>
        <button @click="$emit('export')">Export Video</button>
      </div>
    </div>
  </AppDialog>
</template>

<script setup>
import { useAppStore } from '../stores/app.js'
import AppDialog from './AppDialog.vue'

const store = useAppStore()
defineEmits(['close', 'new', 'save', 'export'])
</script>

<style scoped>
.content { padding: 16px; display: grid; gap: 12px; }
.video-row {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: var(--bg-card);
  border-radius: var(--radius);
  color: var(--text-primary);
}
small { color: var(--text-muted); }
.actions { display: flex; gap: 8px; flex-wrap: wrap; }
.actions button {
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  background: var(--bg-hover);
  color: var(--text-secondary);
}
</style>
