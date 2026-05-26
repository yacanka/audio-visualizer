<template>
  <nav class="sidetabs">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      :class="['tab-btn', { active: store.activeTab === tab.id }]"
      :title="tab.label"
      @click="store.activeTab = tab.id"
    >
      <span class="tab-icon" v-html="tab.icon" />
      <span class="tab-label">{{ tab.label }}</span>
    </button>
  </nav>
</template>

<script setup>
import { useAppStore } from '../stores/app.js'

const store = useAppStore()

const tabs = [
  {
    id: 'visualizer',
    label: 'Visualizer',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5,21C13.5,21 12.31,16.76 11.05,12.28C10.14,9.04 9,5 7.5,5C4.11,5 4,11.93 4,12H2C2,11.63 2.06,3 7.5,3C10.5,3 11.71,7.25 12.97,11.74C13.83,14.8 15,19 16.5,19C19.94,19 20.03,12.07 20.03,12H22.03C22.03,12.37 21.97,21 16.5,21Z"/></svg>`
  },
  {
    id: 'audio',
    label: 'Ses',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 18c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1s-1 .45-1 1v10c0 .55.45 1 1 1m4 4c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1s-1 .45-1 1v18c0 .55.45 1 1 1m-8-8c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1m12 4c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1s-1 .45-1 1v10c0 .55.45 1 1 1m3-7v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1"/></svg>`
  },
  {
    id: 'backdrop',
    label: 'Arka Plan',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23 18V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2M8.9 12.98l2.1 2.53 3.1-3.99c.2-.26.6-.26.8.01l3.51 4.68c.25.33.01.8-.4.8H6.02c-.42 0-.65-.48-.39-.81L8.12 13c.19-.26.57-.27.78-.02"/></svg>`
  },
  {
    id: 'text',
    label: 'Metin',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 5.5C2.5 6.33 3.17 7 4 7h3.5v10.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V7H14c.83 0 1.5-.67 1.5-1.5S14.83 4 14 4H4c-.83 0-1.5.67-1.5 1.5M20 9h-6c-.83 0-1.5.67-1.5 1.5S13.17 12 14 12h1.5v5.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V12H20c.83 0 1.5-.67 1.5-1.5S20.83 9 20 9"/></svg>`
  },
]
</script>

<style scoped>
.sidetabs {
  width: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  gap: 4px;
  background: var(--bg-primary);
  border-right: 1px solid var(--border);
  flex-shrink: 0;
}

.tab-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  border-radius: var(--radius);
  width: 58px;
  color: var(--text-muted);
  transition: color 0.15s, background 0.15s;
  position: relative;
}

.tab-btn:hover {
  color: var(--text-secondary);
  background: var(--bg-hover);
}

.tab-btn.active {
  color: var(--accent);
  background: var(--accent-dim);
}

.tab-btn.active::before {
  content: '';
  position: absolute;
  left: -1px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background: var(--accent);
  border-radius: 0 2px 2px 0;
}

.tab-icon { display: flex; }
.tab-label { font-size: 9px; font-weight: 500; letter-spacing: 0.3px; text-align: center; line-height: 1.2; }
</style>
