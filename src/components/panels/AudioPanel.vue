<template>
  <div class="panel">
    <h3 class="panel-title">Ses Ayarları</h3>

    <section class="section">
      <label class="section-label">FFT Boyutu</label>
      <div class="chip-group">
        <button v-for="f in fftOptions" :key="f" :class="['chip', { active: store.fftSize === f }]" @click="store.fftSize = f; $emit('fftChange')">
          {{ f }}
        </button>
      </div>
      <p class="hint">Büyük değer = daha fazla frekans detayı</p>
    </section>

    <section class="section">
      <div class="row">
        <label class="item-label">Ses Düzeyi</label>
        <span class="value-badge">{{ Math.round(store.volume * 100) }}%</span>
      </div>
      <div class="slider-row">
        <input type="range" v-model.number="store.volume" min="0" max="1" step="0.01" @input="$emit('volumeChange', store.volume)" />
      </div>
    </section>

    <section class="section">
      <div class="row">
        <label class="item-label">Normalleştir</label>
        <label class="toggle">
          <input type="checkbox" v-model="store.normalize" />
          <span class="track" />
        </label>
      </div>
      <p class="hint">Frekans yoğunluğunu otomatik dengeler</p>
    </section>

    <section v-if="!store.audioFile" class="empty-state">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--text-muted)">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
      </svg>
      <p>Ses dosyası yüklenmedi</p>
    </section>

    <section class="section" v-if="store.audioFile">
      <label class="section-label">Dosya Bilgisi</label>
      <div class="info-row">
        <span class="info-label">Dosya</span>
        <span class="info-value">{{ store.fileName }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Süre</span>
        <span class="info-value">{{ formatTime(store.duration) }}</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useAppStore } from '../../stores/app.js'

const store = useAppStore()
defineEmits(['fftChange', 'volumeChange'])

const fftOptions = [512, 1024, 2048, 4096]

function formatTime(s) {
  if (!s) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}
</script>

<style scoped>
@import './panel-shared.css';

.hint {
  margin-top: 6px;
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1.4;
}

.value-badge {
  font-size: 11px;
  color: var(--accent);
  font-weight: 600;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  color: var(--text-muted);
  font-size: 12px;
  background: var(--bg-card);
  border-radius: var(--radius);
  border: 1px dashed var(--border);
  margin-bottom: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid var(--border);
}
.info-row:last-child { border-bottom: none; }
.info-label { font-size: 11px; color: var(--text-muted); }
.info-value { font-size: 11px; color: var(--text-secondary); max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
