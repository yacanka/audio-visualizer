<template>
  <div class="panel">
    <h3 class="panel-title">Visualizer</h3>

    <!-- Shape -->
    <section class="section">
      <label class="section-label">Şekil</label>
      <div class="chip-group">
        <button
          v-for="s in shapes"
          :key="s.value"
          :class="['chip', { active: store.vizShape === s.value }]"
          @click="store.vizShape = s.value"
        >{{ s.label }}</button>
      </div>
    </section>

    <!-- Spectrum -->
    <section class="section">
      <label class="section-label">Spektrum</label>
      <div class="chip-group">
        <button :class="['chip', { active: store.vizSpectrum === 'bass' }]" @click="store.vizSpectrum = 'bass'">Bass</button>
        <button :class="['chip', { active: store.vizSpectrum === 'wide' }]" @click="store.vizSpectrum = 'wide'">Geniş</button>
      </div>
    </section>

    <!-- Bar settings -->
    <section class="section" v-if="store.vizShape !== 'wave'">
      <div class="row">
        <label class="item-label">Bar Sayısı</label>
        <input type="number" v-model.number="store.barCount" min="16" max="256" step="8" />
      </div>
      <div class="slider-row">
        <input type="range" v-model.number="store.barCount" min="16" max="256" step="8" />
      </div>

      <div class="row mt-8">
        <label class="item-label">Bar Aralığı</label>
        <input type="number" v-model.number="store.barGap" min="0" max="10" step="1" />
      </div>
      <div class="slider-row">
        <input type="range" v-model.number="store.barGap" min="0" max="10" step="0.5" />
      </div>

      <div class="row mt-8" v-if="store.vizShape !== 'circular'">
        <label class="item-label">Köşe Yuvarlama</label>
        <input type="number" v-model.number="store.barRounding" min="0" max="20" step="1" />
      </div>
      <div class="slider-row" v-if="store.vizShape !== 'circular'">
        <input type="range" v-model.number="store.barRounding" min="0" max="20" step="1" />
      </div>
    </section>

    <!-- Colors -->
    <section class="section">
      <div class="row">
        <label class="item-label">Renk</label>
        <input type="color" v-model="store.barColor" />
      </div>

      <div class="row mt-8">
        <label class="item-label">Gradient</label>
        <div class="toggle-wrap">
          <label class="toggle">
            <input type="checkbox" v-model="store.useGradient" />
            <span class="track" />
          </label>
        </div>
      </div>

      <template v-if="store.useGradient">
        <div class="row mt-8">
          <label class="item-label">Renk 2</label>
          <input type="color" v-model="store.barColor2" />
        </div>
        <div class="row mt-8" v-if="store.vizShape === 'bars' || store.vizShape === 'mirror'">
          <label class="item-label">Yön</label>
          <div class="chip-group small">
            <button :class="['chip', { active: store.gradientDir === 'vertical' }]" @click="store.gradientDir = 'vertical'">Dikey</button>
            <button :class="['chip', { active: store.gradientDir === 'horizontal' }]" @click="store.gradientDir = 'horizontal'">Yatay</button>
          </div>
        </div>
      </template>
    </section>

    <!-- Glow -->
    <section class="section">
      <div class="row">
        <label class="item-label">Glow Efekti</label>
        <label class="toggle">
          <input type="checkbox" v-model="store.glowEnabled" />
          <span class="track" />
        </label>
      </div>
      <template v-if="store.glowEnabled">
        <div class="row mt-8">
          <label class="item-label">Glow Rengi</label>
          <input type="color" v-model="store.glowColor" />
        </div>
        <div class="row mt-8">
          <label class="item-label">Yoğunluk</label>
          <input type="number" v-model.number="store.glowAmount" min="0" max="50" />
        </div>
        <div class="slider-row">
          <input type="range" v-model.number="store.glowAmount" min="0" max="50" />
        </div>
      </template>
    </section>

    <!-- Motion -->
    <section class="section">
      <div class="row">
        <label class="item-label">Drift</label>
        <label class="toggle">
          <input type="checkbox" v-model="store.drift" />
          <span class="track" />
        </label>
      </div>
      <template v-if="store.drift">
        <div class="row mt-8">
          <label class="item-label">Drift Yoğunluğu</label>
          <input type="number" v-model.number="store.driftIntensity" min="0" max="100" />
        </div>
        <div class="slider-row">
          <input type="range" v-model.number="store.driftIntensity" min="0" max="100" />
        </div>
      </template>

      <div class="row mt-8">
        <label class="item-label">Hassasiyet</label>
        <input type="number" v-model.number="store.sensitivity" min="0.1" max="3" step="0.1" />
      </div>
      <div class="slider-row">
        <input type="range" v-model.number="store.sensitivity" min="0.1" max="3" step="0.1" />
      </div>
    </section>

    <!-- Smoothing -->
    <section class="section">
      <div class="row">
        <label class="item-label">Yumuşatma</label>
        <input type="number" v-model.number="store.smoothing" min="0" max="0.99" step="0.01" />
      </div>
      <div class="slider-row">
        <input type="range" v-model.number="store.smoothing" min="0" max="0.99" step="0.01" @change="$emit('smoothingChange')" />
      </div>
    </section>

    <!-- Progress bar -->
    <section class="section">
      <div class="row">
        <label class="item-label">İlerleme Çubuğu</label>
        <label class="toggle">
          <input type="checkbox" v-model="store.showProgressBar" />
          <span class="track" />
        </label>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useAppStore } from '../../stores/app.js'

const store = useAppStore()
defineEmits(['smoothingChange'])

const shapes = [
  { value: 'bars',     label: 'Barlar' },
  { value: 'mirror',   label: 'Ayna' },
  { value: 'wave',     label: 'Dalga' },
  { value: 'filled',   label: 'Dolu' },
  { value: 'circular', label: 'Dairesel' },
]
</script>

<style scoped>
@import './panel-shared.css';
</style>
