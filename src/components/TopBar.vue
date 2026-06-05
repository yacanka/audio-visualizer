<template>
  <header class="topbar">
    <div class="topbar__left">
      <button class="btn-text" @click="$emit('videos')">
        <IconBack />
        Videos
      </button>
      <div class="logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 3v18M6 6v12M18 6v12M3 9v6M21 9v6" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span class="logo-text">SpectraViz</span>
      </div>
    </div>

    <div class="topbar__center">
      <span class="filename">{{ store.fileName || 'Dosya yüklenmedi' }}</span>
    </div>

    <div class="topbar__right">
      <button class="btn-icon" title="Undo" :disabled="!store.canUndo" @click="$emit('undo')">
        <IconUndo />
      </button>
      <button class="btn-icon" title="Redo" :disabled="!store.canRedo" @click="$emit('redo')">
        <IconRedo />
      </button>

      <div class="divider" />

      <div class="aspect-btns" role="group">
        <button
          v-for="r in ratios"
          :key="r.value"
          :class="['aspect-btn', { active: store.aspectRatio === r.value }]"
          :title="r.label"
          @click="store.aspectRatio = r.value"
        >
          <component :is="r.icon" />
        </button>
      </div>

      <div class="divider" />

      <button class="btn-icon" title="Create New Video" @click="$emit('new')">
        <IconNew />
      </button>

      <button class="btn-icon" title="Save Video" @click="$emit('save')">
        <IconSave />
      </button>

      <button class="btn-primary" @click="$emit('export')">
        Export Video
      </button>
    </div>
  </header>
</template>

<script setup>
import { useAppStore } from '../stores/app.js'

const store = useAppStore()
defineEmits(['videos', 'undo', 'redo', 'new', 'save', 'export'])

const ratios = [
  { value: '16:9', label: 'Yatay (16:9)', icon: IconLandscape },
  { value: '9:16', label: 'Dikey (9:16)',  icon: IconPortrait },
  { value: '1:1',  label: 'Kare (1:1)',   icon: IconSquare },
]
</script>

<script>
import { h } from 'vue'
function IconBack() { return h('svg', { width:18, height:18, viewBox:'0 0 24 24', fill:'currentColor' }, [h('path', { d:'M11.67 3.87 9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z' })]) }
function IconUndo() { return h('svg', { width:18, height:18, viewBox:'0 0 24 24', fill:'currentColor' }, [h('path', { d:'M12.5 8c-2.65 0-5.05.99-6.9 2.6L3.71 8.71C3.08 8.08 2 8.52 2 9.41V15c0 .55.45 1 1 1h5.59c.89 0 1.34-1.08.71-1.71l-1.91-1.91c1.39-1.16 3.16-1.88 5.12-1.88 3.16 0 5.89 1.84 7.19 4.5.27.56.91.84 1.5.64.71-.23 1.07-1.04.75-1.72C20.23 10.42 16.65 8 12.5 8' })]) }
function IconRedo() { return h('svg', { width:18, height:18, viewBox:'0 0 24 24', fill:'currentColor' }, [h('path', { d:'M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.16 0-7.74 2.42-9.44 5.93-.32.67.04 1.47.75 1.71.59.2 1.23-.08 1.5-.64 1.3-2.66 4.03-4.5 7.19-4.5 1.95 0 3.73.72 5.12 1.88l-1.91 1.91c-.63.63-.19 1.71.7 1.71H21c.55 0 1-.45 1-1V9.41c0-.89-1.08-1.34-1.71-.71z' })]) }
function IconNew() { return h('svg', { width:18, height:18, viewBox:'0 0 24 24', fill:'currentColor' }, [h('path', { d:'M3 6c-.55 0-1 .45-1 1v13c0 1.1.9 2 2 2h13c.55 0 1-.45 1-1s-.45-1-1-1H5c-.55 0-1-.45-1-1V7c0-.55-.45-1-1-1m17-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m-2 9h-3v3c0 .55-.45 1-1 1s-1-.45-1-1v-3h-3c-.55 0-1-.45-1-1s.45-1 1-1h3V6c0-.55.45-1 1-1s1 .45 1 1v3h3c.55 0 1 .45 1 1s-.45 1-1 1' })]) }
function IconLandscape() { return h('svg', { width:18, height:18, viewBox:'0 0 24 24', fill:'currentColor' }, [h('path', { d:'M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14z' })]) }
function IconPortrait() { return h('svg', { width:18, height:18, viewBox:'0 0 24 24', fill:'currentColor' }, [h('path', { d:'M17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H8c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h8c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1' })]) }
function IconSquare() { return h('svg', { width:18, height:18, viewBox:'0 0 24 24', fill:'currentColor' }, [h('path', { d:'M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 14H7c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h10c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1' })]) }
function IconSave() { return h('svg', { width:18, height:18, viewBox:'0 0 24 24', fill:'currentColor' }, [h('path', { d:'M17.59 3.59c-.38-.38-.89-.59-1.42-.59H5c-1.11 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7.83c0-.53-.21-1.04-.59-1.41zM12 19c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3m1-10H7c-1.1 0-2-.9-2-2s.9-2 2-2h6c1.1 0 2 .9 2 2s-.9 2-2 2' })]) }
export default { components: { IconBack, IconUndo, IconRedo, IconNew, IconLandscape, IconPortrait, IconSquare, IconSave } }
</script>

<style scoped>
.topbar {
  height: 52px;
  background: var(--bg-panel);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 14px;
  gap: 12px;
  flex-shrink: 0;
  z-index: 10;
}

.topbar__left { display: flex; align-items: center; gap: 10px; min-width: 250px; }
.topbar__center { flex: 1; display: flex; justify-content: center; }
.topbar__right { display: flex; align-items: center; gap: 8px; justify-content: flex-end; }

.logo { display: flex; align-items: center; gap: 8px; }
.logo-text {
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.5px;
}

.filename {
  font-size: 12px;
  color: var(--text-secondary);
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.aspect-btns {
  display: flex;
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  overflow: hidden;
}

.aspect-btn {
  padding: 5px 8px;
  color: var(--text-muted);
  transition: color 0.15s, background 0.15s;
  display: flex;
  align-items: center;
}
.aspect-btn:hover { color: var(--text-primary); background: var(--bg-hover); }
.aspect-btn.active { color: var(--accent); background: var(--accent-dim); }

.divider {
  width: 1px;
  height: 24px;
  background: var(--border);
  margin: 0 4px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  transition: color 0.15s, background 0.15s;
}
.btn-icon:hover { color: var(--text-primary); background: var(--bg-hover); }
.btn-icon:disabled { opacity: 0.35; cursor: not-allowed; }

.btn-text {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  font-size: 12px;
}
.btn-text:hover { color: var(--text-primary); background: var(--bg-hover); }

.btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: var(--accent);
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: var(--radius-sm);
  transition: background 0.15s, transform 0.1s;
}
.btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }
</style>
