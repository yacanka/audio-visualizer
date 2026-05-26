<template>
  <div class="panel">
    <h3 class="panel-title">Arka Plan</h3>

    <section class="section">
      <label class="section-label">Tür</label>
      <div class="chip-group">
        <button :class="['chip', { active: store.backdropType === 'solid' }]" @click="store.backdropType = 'solid'">Düz Renk</button>
        <button :class="['chip', { active: store.backdropType === 'gradient' }]" @click="store.backdropType = 'gradient'">Gradient</button>
        <button :class="['chip', { active: store.backdropType === 'image' }]" @click="triggerImageUpload">Görsel</button>
      </div>
      <input ref="imgInput" type="file" accept="image/*" style="display:none" @change="onImageLoad" />
    </section>

    <section class="section" v-if="store.backdropType === 'solid'">
      <div class="row">
        <label class="item-label">Renk</label>
        <input type="color" v-model="store.backdropColor" />
      </div>
    </section>

    <section class="section" v-if="store.backdropType === 'gradient'">
      <div class="row">
        <label class="item-label">Renk 1</label>
        <input type="color" v-model="store.backdropGradient1" />
      </div>
      <div class="row mt-8">
        <label class="item-label">Renk 2</label>
        <input type="color" v-model="store.backdropGradient2" />
      </div>
      <div class="row mt-8">
        <label class="item-label">Açı (°)</label>
        <input type="number" v-model.number="store.backdropGradientAngle" min="0" max="360" step="15" />
      </div>
      <div class="slider-row">
        <input type="range" v-model.number="store.backdropGradientAngle" min="0" max="360" step="5" />
      </div>
    </section>

    <section class="section" v-if="store.backdropType === 'image' && store.backdropImage">
      <div class="img-preview">
        <img :src="previewUrl" alt="backdrop" />
      </div>
      <div class="row mt-8">
        <label class="item-label">Uyum</label>
        <div class="chip-group small">
          <button :class="['chip', { active: store.backdropImageFit === 'cover' }]" @click="store.backdropImageFit = 'cover'">Cover</button>
          <button :class="['chip', { active: store.backdropImageFit === 'contain' }]" @click="store.backdropImageFit = 'contain'">Contain</button>
          <button :class="['chip', { active: store.backdropImageFit === 'fill' }]" @click="store.backdropImageFit = 'fill'">Fill</button>
        </div>
      </div>
      <button class="remove-btn" @click="store.backdropImage = null; previewUrl = null">Görseli Kaldır</button>
    </section>

    <section class="section" v-if="store.backdropType === 'image' && !store.backdropImage">
      <button class="upload-btn" @click="triggerImageUpload">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
        </svg>
        Görsel Yükle
      </button>
    </section>

    <!-- Presets -->
    <section class="section">
      <label class="section-label">Ön Ayarlar</label>
      <div class="presets">
        <button
          v-for="p in presets"
          :key="p.name"
          class="preset-swatch"
          :style="p.style"
          :title="p.name"
          @click="applyPreset(p)"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAppStore } from '../../stores/app.js'

const store = useAppStore()
const imgInput = ref(null)
const previewUrl = ref(null)

function triggerImageUpload() {
  store.backdropType = 'image'
  imgInput.value?.click()
}

function onImageLoad(e) {
  const file = e.target.files[0]
  if (!file) return
  previewUrl.value = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => { store.backdropImage = img }
  img.src = previewUrl.value
}

const presets = [
  { name: 'Uzay', style: 'background: linear-gradient(135deg, #0d0d1a, #1a0d2e)', c1: '#0d0d1a', c2: '#1a0d2e', angle: 135 },
  { name: 'Okyanus', style: 'background: linear-gradient(135deg, #0a0e1a, #0d2137)', c1: '#0a0e1a', c2: '#0d2137', angle: 135 },
  { name: 'Gece', style: 'background: linear-gradient(135deg, #12121e, #1e1228)', c1: '#12121e', c2: '#1e1228', angle: 135 },
  { name: 'Kızıl', style: 'background: linear-gradient(135deg, #1a0808, #2a0d0d)', c1: '#1a0808', c2: '#2a0d0d', angle: 135 },
  { name: 'Yeşil', style: 'background: linear-gradient(135deg, #071a0d, #0d2215)', c1: '#071a0d', c2: '#0d2215', angle: 135 },
  { name: 'Siyah', style: 'background: #000', c1: '#000000', c2: '#000000', angle: 0 },
  { name: 'Koyu Gri', style: 'background: #111', c1: '#111111', c2: '#111111', angle: 0 },
  { name: 'Turuncu', style: 'background: linear-gradient(135deg, #1a0f00, #2a1800)', c1: '#1a0f00', c2: '#2a1800', angle: 135 },
]

function applyPreset(p) {
  if (p.c1 === p.c2) {
    store.backdropType = 'solid'
    store.backdropColor = p.c1
  } else {
    store.backdropType = 'gradient'
    store.backdropGradient1 = p.c1
    store.backdropGradient2 = p.c2
    store.backdropGradientAngle = p.angle
  }
}
</script>

<style scoped>
@import './panel-shared.css';

.img-preview {
  width: 100%;
  height: 80px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border);
}
.img-preview img { width: 100%; height: 100%; object-fit: cover; }

.upload-btn {
  width: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
  font-size: 12px;
  transition: all 0.15s;
  font-family: inherit;
  cursor: pointer;
  background: none;
}
.upload-btn:hover { color: var(--text-primary); border-color: var(--accent); }

.remove-btn {
  margin-top: 8px;
  width: 100%;
  padding: 6px;
  background: rgba(255,50,50,0.1);
  border: 1px solid rgba(255,50,50,0.3);
  border-radius: var(--radius-sm);
  color: #ff6b6b;
  font-size: 11px;
  cursor: pointer;
  font-family: inherit;
}

.presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.preset-swatch {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--border);
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s;
}
.preset-swatch:hover { transform: scale(1.15); border-color: var(--border-hover); }
</style>
