<template>
  <div class="dialog-backdrop" @click.self="$emit('close')">
    <section class="dialog">
      <header class="dialog-header">
        <h2>{{ title }}</h2>
        <button class="close-btn" @click="$emit('close')" aria-label="Close">×</button>
      </header>
      <slot />
    </section>
  </div>
</template>

<script setup>
defineProps({ title: { type: String, required: true } })
defineEmits(['close'])
</script>

<style scoped>
.dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
}
.dialog {
  width: min(520px, calc(100vw - 28px));
  max-height: calc(100vh - 40px);
  overflow: auto;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
}
h2 { font-size: 15px; font-weight: 600; }
.close-btn { font-size: 22px; color: var(--text-muted); padding: 0 4px; }
.close-btn:hover { color: var(--text-primary); }
</style>
