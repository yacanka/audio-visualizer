<template>
  <div class="panel">
    <h3 class="panel-title">Metin Ayarları</h3>

    <!-- Position -->
    <section class="section">
      <label class="section-label">Metin Konumu</label>
      <div class="chip-group">
        <button :class="['chip', { active: store.textPosition === 'top' }]" @click="store.textPosition = 'top'">Üst</button>
        <button :class="['chip', { active: store.textPosition === 'center' }]" @click="store.textPosition = 'center'">Orta</button>
        <button :class="['chip', { active: store.textPosition === 'bottom' }]" @click="store.textPosition = 'bottom'">Alt</button>
      </div>
    </section>

    <!-- Title -->
    <section class="section">
      <div class="row">
        <label class="item-label" style="font-weight:600">Başlık</label>
        <label class="toggle">
          <input type="checkbox" v-model="store.showTitle" />
          <span class="track" />
        </label>
      </div>

      <template v-if="store.showTitle">
        <div class="mt-8">
          <input
            class="text-input"
            type="text"
            v-model="store.titleText"
            placeholder="Şarkı adını girin..."
          />
        </div>

        <div class="row mt-8">
          <label class="item-label">Renk</label>
          <input type="color" v-model="store.titleColor" />
        </div>

        <div class="row mt-8">
          <label class="item-label">Boyut</label>
          <input type="number" v-model.number="store.titleSize" min="12" max="80" />
        </div>
        <div class="slider-row">
          <input type="range" v-model.number="store.titleSize" min="12" max="80" />
        </div>

        <div class="row mt-8">
          <label class="item-label">Font</label>
          <select v-model="store.titleFont" style="width:auto">
            <option v-for="f in fonts" :key="f" :value="f">{{ f }}</option>
          </select>
        </div>

        <div class="row mt-8">
          <label class="item-label">Kalınlık</label>
          <div class="chip-group small">
            <button :class="['chip', { active: store.titleWeight === '400' }]" @click="store.titleWeight = '400'">Normal</button>
            <button :class="['chip', { active: store.titleWeight === '700' }]" @click="store.titleWeight = '700'">Kalın</button>
          </div>
        </div>
      </template>
    </section>

    <!-- Artist -->
    <section class="section">
      <div class="row">
        <label class="item-label" style="font-weight:600">Sanatçı</label>
        <label class="toggle">
          <input type="checkbox" v-model="store.showArtist" />
          <span class="track" />
        </label>
      </div>

      <template v-if="store.showArtist">
        <div class="mt-8">
          <input
            class="text-input"
            type="text"
            v-model="store.artistText"
            placeholder="Sanatçı adını girin..."
          />
        </div>

        <div class="row mt-8">
          <label class="item-label">Renk</label>
          <input type="color" :value="artistColorHex" @input="store.artistColor = $event.target.value" />
        </div>

        <div class="row mt-8">
          <label class="item-label">Boyut</label>
          <input type="number" v-model.number="store.artistSize" min="10" max="60" />
        </div>
        <div class="slider-row">
          <input type="range" v-model.number="store.artistSize" min="10" max="60" />
        </div>

        <div class="row mt-8">
          <label class="item-label">Font</label>
          <select v-model="store.artistFont" style="width:auto">
            <option v-for="f in fonts" :key="f" :value="f">{{ f }}</option>
          </select>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '../../stores/app.js'

const store = useAppStore()

const artistColorHex = computed(() => {
  const c = store.artistColor
  if (c.startsWith('#')) return c
  return '#ffffff'
})

const fonts = [
  'Inter', 'Orbitron', 'Montserrat', 'Oswald', 'Roboto',
  'Pacifico', 'Audiowide', 'PressStart2P', 'RubikMonoOne',
  'IndieFlower', 'DancingScript', 'PermanentMarker',
]
</script>

<style scoped>
@import './panel-shared.css';

.mt-8 { margin-top: 8px; }

.text-input {
  width: 100%;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 7px 10px;
  color: var(--text-primary);
  font-size: 12px;
  font-family: inherit;
  outline: none;
}
.text-input:focus { border-color: var(--accent); }
.text-input::placeholder { color: var(--text-muted); }
</style>
