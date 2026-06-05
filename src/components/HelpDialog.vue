<template>
  <AppDialog title="Help" @close="$emit('close')">
    <div class="content">
      <p>Keyboard shortcuts</p>
      <div class="row"><kbd>Space</kbd><span>Pause / play preview</span></div>
      <div class="row"><kbd>M</kbd><span>Mute preview</span></div>
      <div class="row"><kbd>Del</kbd><span>Delete selected element</span></div>
      <p>Editor</p>
      <div class="row"><span>Undo / Redo</span><span>Restores visual settings</span></div>
      <div class="row"><span>Export Video</span><span>Downloads a WebM preview render</span></div>
    </div>
  </AppDialog>
</template>

<script setup>
import AppDialog from './AppDialog.vue'

defineEmits(['close'])
</script>

<style scoped>
.content { padding: 16px; display: grid; gap: 10px; }
p { color: var(--text-primary); font-weight: 600; margin-top: 4px; }
.row { display: flex; justify-content: space-between; gap: 16px; color: var(--text-secondary); font-size: 12px; }
kbd {
  min-width: 52px;
  text-align: center;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  padding: 2px 6px;
}
</style>
