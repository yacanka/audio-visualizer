<template>
  <header class="topbar">
    <div class="topbar__left">
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

      <button class="btn-icon" title="Kaydet" @click="$emit('save')">
        <IconSave />
      </button>

      <button class="btn-primary" @click="$emit('upload')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
        </svg>
        Ses Yükle
      </button>
    </div>
  </header>
</template>

<script setup>
import { useAppStore } from '../stores/app.js'

const store = useAppStore()
defineEmits(['save', 'upload'])

const ratios = [
  { value: '16:9', label: 'Yatay (16:9)', icon: IconLandscape },
  { value: '9:16', label: 'Dikey (9:16)',  icon: IconPortrait },
  { value: '1:1',  label: 'Kare (1:1)',   icon: IconSquare },
]
</script>

<script>
import { h } from 'vue'
function IconLandscape() { return h('svg', { width:18, height:18, viewBox:'0 0 24 24', fill:'currentColor' }, [h('path', { d:'M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14z' })]) }
function IconPortrait() { return h('svg', { width:18, height:18, viewBox:'0 0 24 24', fill:'currentColor' }, [h('path', { d:'M17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H8c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h8c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1' })]) }
function IconSquare() { return h('svg', { width:18, height:18, viewBox:'0 0 24 24', fill:'currentColor' }, [h('path', { d:'M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 14H7c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h10c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1' })]) }
function IconSave() { return h('svg', { width:18, height:18, viewBox:'0 0 24 24', fill:'currentColor' }, [h('path', { d:'M17.59 3.59c-.38-.38-.89-.59-1.42-.59H5c-1.11 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7.83c0-.53-.21-1.04-.59-1.41zM12 19c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3m1-10H7c-1.1 0-2-.9-2-2s.9-2 2-2h6c1.1 0 2 .9 2 2s-.9 2-2 2' })]) }
export default { components: { IconLandscape, IconPortrait, IconSquare, IconSave } }
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

.topbar__left { display: flex; align-items: center; width: 180px; }
.topbar__center { flex: 1; display: flex; justify-content: center; }
.topbar__right { display: flex; align-items: center; gap: 8px; width: 280px; justify-content: flex-end; }

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
