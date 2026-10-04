<template>
  <section class="section">
    <div class="section-heading">
      <label class="section-label">Layers</label>
      <span class="layer-count">{{ store.visualizerLayers.length }}/{{ MAX_VISUALIZER_LAYERS }}</span>
    </div>

    <div v-for="(layer, index) in store.visualizerLayers" :key="layer.id" class="layer-row">
      <button
        class="layer-main"
        :class="{ active: store.selectedVisualizerLayer === layer.id }"
        :aria-pressed="store.selectedVisualizerLayer === layer.id"
        @click="store.selectedVisualizerLayer = layer.id"
      >
        <span class="color-swatch" :style="{ backgroundColor: layer.fillColor }" />
        <span>{{ layer.name }}</span>
        <span v-if="!layer.visible" class="hidden-label">Hidden</span>
      </button>
      <button class="icon-btn" :aria-label="`Toggle ${layer.name} visibility`" @click="toggleVisibility(layer)">
        {{ layer.visible ? '●' : '○' }}
      </button>
      <button class="icon-btn" :disabled="index === 0" :aria-label="`Move ${layer.name} forward`" @click="store.moveVisualizerLayer(layer.id, -1)">↑</button>
      <button class="icon-btn" :disabled="index === store.visualizerLayers.length - 1" :aria-label="`Move ${layer.name} backward`" @click="store.moveVisualizerLayer(layer.id, 1)">↓</button>
    </div>

    <button class="add-btn" :disabled="atLayerLimit" @click="store.addVisualizerLayer()">
      {{ atLayerLimit ? 'Layer Limit Reached' : 'Add Layer' }}
    </button>
  </section>

  <section v-if="selectedLayer" class="section">
    <label class="section-label">{{ selectedLayer.name }}</label>
    <div class="row">
      <label class="item-label" :for="`${selectedLayer.id}-fill`">Layer Color</label>
      <input :id="`${selectedLayer.id}-fill`" type="color" :value="selectedLayer.fillColor" @input="updateSelected({ fillColor: $event.target.value })" />
    </div>
    <div class="row mt-8">
      <label class="item-label" for="layer-color-mix">Color Mixing</label>
      <select id="layer-color-mix" :value="selectedLayer.colorMix || 'rgb'" @change="updateSelected({ colorMix: $event.target.value })">
        <option value="lch">LCH (Specterr)</option><option value="rgb">RGB (Legacy)</option>
      </select>
    </div>
    <PanelRange label="Fill Opacity" v-model="fillOpacity" :min="0" :max="100" />
    <ToggleRow label="Audio-reactive Fill" v-model="reactiveFill" />
    <template v-if="reactiveFill">
      <div class="row mt-8">
        <label class="item-label" :for="`${selectedLayer.id}-secondary-fill`">Loud Color</label>
        <input :id="`${selectedLayer.id}-secondary-fill`" type="color" :value="selectedLayer.secondaryFillColor" @input="updateSelected({ secondaryFillColor: $event.target.value })" />
      </div>
      <PanelRange label="Loud Fill Opacity" v-model="secondaryFillOpacity" :min="0" :max="100" />
    </template>
    <div class="row mt-8">
      <label class="item-label" :for="`${selectedLayer.id}-outline`">Outline Color</label>
      <input :id="`${selectedLayer.id}-outline`" type="color" :value="selectedLayer.outlineColor" @input="updateSelected({ outlineColor: $event.target.value })" />
    </div>
    <PanelRange label="Outline Width" v-model="outlineWidth" :min="0" :max="20" />
    <PanelRange label="Outline Opacity" v-model="outlineOpacity" :min="0" :max="100" />
    <ToggleRow label="Audio-reactive Outline" v-model="reactiveOutline" />
    <template v-if="reactiveOutline">
      <div class="row mt-8">
        <label class="item-label" :for="`${selectedLayer.id}-secondary-outline`">Loud Outline Color</label>
        <input :id="`${selectedLayer.id}-secondary-outline`" type="color" :value="selectedLayer.secondaryOutlineColor" @input="updateSelected({ secondaryOutlineColor: $event.target.value })" />
      </div>
      <PanelRange label="Loud Outline Opacity" v-model="secondaryOutlineOpacity" :min="0" :max="100" />
    </template>
    <PanelRange label="Opacity" v-model="opacity" :min="0" :max="100" />
    <ToggleRow label="Custom Shape" v-model="customEnabled" />
    <template v-if="customEnabled">
      <div class="row mt-8">
        <label class="item-label" for="layer-style">Style</label>
        <select id="layer-style" :value="layerSettings.vizStyle || store.vizStyle" @change="updateSettings({ vizStyle: $event.target.value })">
          <option value="solid">Solid</option><option value="bar">Bar</option><option value="point">Point</option>
        </select>
      </div>
      <PanelRange label="Wave Height" :model-value="layerSettings.visualizerWaveHeight ?? store.visualizerWaveHeight" @update:model-value="updateSettings({ visualizerWaveHeight: $event })" :min="0" :max="100" />
      <PanelRange label="Point Count" :model-value="layerSettings.barCount ?? store.barCount" @update:model-value="updateSettings({ barCount: $event })" :min="4" :max="200" />
      <PanelRange v-if="(layerSettings.vizStyle || store.vizStyle) === 'bar'" label="Bar Width" :model-value="layerSettings.visualizerBarWidth ?? store.visualizerBarWidth" @update:model-value="updateSettings({ visualizerBarWidth: $event })" :min="1" :max="100" />
      <PanelRange v-if="(layerSettings.vizStyle || store.vizStyle) === 'point'" label="Point Radius" :model-value="layerSettings.visualizerPointRadius ?? store.visualizerPointRadius" @update:model-value="updateSettings({ visualizerPointRadius: $event })" :min="1" :max="20" />
      <div class="row mt-8">
        <label class="item-label" for="layer-spectrum">Spectrum</label>
        <select id="layer-spectrum" :value="layerSettings.vizSpectrum || store.vizSpectrum" @change="updateSettings({ vizSpectrum: $event.target.value })">
          <option value="bass">Bass</option><option value="wide">Wide</option>
        </select>
      </div>
      <div class="row mt-8">
        <label class="item-label" for="layer-reflection">Reflection</label>
        <select id="layer-reflection" :value="layerSettings.vizReflection || store.vizReflection" @change="updateSettings({ vizReflection: $event.target.value })">
          <option v-for="reflection in reflections" :key="reflection" :value="reflection">{{ reflection }}</option>
        </select>
      </div>
      <ToggleRow label="Smooth" :model-value="layerSettings.vizSmooth ?? store.vizSmooth" @update:model-value="updateSettings({ vizSmooth: $event })" />
      <ToggleRow label="Invert" :model-value="layerSettings.vizInvert ?? store.vizInvert" @update:model-value="updateSettings({ vizInvert: $event })" />
      <PanelRange label="Layer Rotation" :model-value="layerSettings.visualizerRotation || 0" @update:model-value="updateSettings({ visualizerRotation: $event })" :min="-360" :max="360" />
      <div class="row mt-8">
        <label class="item-label" for="layer-movement">Layer Wave Direction</label>
        <select id="layer-movement" :value="layerSettings.visualizerMovement || store.visualizerMovement" @change="updateSettings({ visualizerMovement: $event.target.value })">
          <option value="outward">Outward</option><option value="inward">Inward</option>
        </select>
      </div>
      <ToggleRow v-if="store.vizShape === 'circular'" label="Layer Hollow Center" :model-value="layerSettings.visualizerHollowCenter ?? store.visualizerHollowCenter" @update:model-value="updateSettings({ visualizerHollowCenter: $event })" />
      <ToggleRow label="Layer Spin" :model-value="layerSettings.visualizerSpin ?? false" @update:model-value="updateSettings({ visualizerSpin: $event })" />
      <template v-if="layerSettings.visualizerSpin">
        <PanelRange label="Layer Spin Speed" :model-value="layerSettings.visualizerSpinSpeed ?? 24" @update:model-value="updateSettings({ visualizerSpinSpeed: $event })" :min="-180" :max="180" />
        <PanelRange label="Layer Audio Acceleration" :model-value="layerSettings.visualizerSpinAcceleration ?? 0" @update:model-value="updateSettings({ visualizerSpinAcceleration: $event })" :min="-180" :max="180" />
      </template>
    </template>
    <div class="layer-edit-actions">
      <button class="chip" :disabled="atLayerLimit" @click="store.duplicateVisualizerLayer(selectedLayer.id)">Duplicate</button>
      <button class="chip danger" :disabled="store.visualizerLayers.length === 1" @click="store.removeVisualizerLayer(selectedLayer.id)">Remove</button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '../../../stores/app.js'
import { MAX_VISUALIZER_LAYERS } from '../../../stores/modules/visualizerState.js'
import ToggleRow from '../ToggleRow.vue'
import PanelRange from '../PanelRange.vue'

const store = useAppStore()
const atLayerLimit = computed(() => store.visualizerLayers.length >= MAX_VISUALIZER_LAYERS)
const selectedLayer = computed(() => (
  store.visualizerLayers.find(layer => layer.id === store.selectedVisualizerLayer) || store.visualizerLayers[0]
))
const outlineWidth = computed({
  get: () => selectedLayer.value?.outlineWidth || 0,
  set: value => updateSelected({ outlineWidth: value }),
})

const opacity = computed({ get: () => (selectedLayer.value?.opacity ?? 1) * 100, set: value => updateSelected({ opacity: value / 100 }) })
const fillOpacity = opacityModel('fillOpacity')
const outlineOpacity = opacityModel('outlineOpacity')
const secondaryFillOpacity = opacityModel('secondaryFillOpacity')
const secondaryOutlineOpacity = opacityModel('secondaryOutlineOpacity')
const reactiveFill = computed({ get: () => Boolean(selectedLayer.value?.secondaryFillColor), set: value => updateSelected({ secondaryFillColor: value ? selectedLayer.value.fillColor : null }) })
const reactiveOutline = computed({ get: () => Boolean(selectedLayer.value?.secondaryOutlineColor), set: value => updateSelected({ secondaryOutlineColor: value ? selectedLayer.value.outlineColor : null }) })
function opacityModel(key) { return computed({ get: () => (selectedLayer.value?.[key] ?? 1) * 100, set: value => updateSelected({ [key]: value / 100 }) }) }
const customEnabled = computed({ get: () => Boolean(selectedLayer.value?.customEnabled), set: value => updateSelected({ customEnabled: value }) })
const layerSettings = computed(() => selectedLayer.value?.settings || {})
const reflections = computed(() => store.vizShape === 'circular' ? ['none', 'vertical', 'across', '3-way', '4-way'] : ['none', 'one-side', 'two-side', 'combo'])
function updateSettings(settings) { updateSelected({ settings: { ...layerSettings.value, ...settings } }) }

function toggleVisibility(layer) {
  store.updateVisualizerLayer(layer.id, { visible: !layer.visible })
}

function updateSelected(properties) {
  if (!selectedLayer.value) return
  store.updateVisualizerLayer(selectedLayer.value.id, properties)
}
</script>

<style scoped>
@import '../panel-shared.css';

.section-heading,
.layer-row,
.layer-edit-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.section-heading { justify-content: space-between; }
.section-heading .section-label { margin-bottom: 8px; }
.layer-count, .hidden-label { color: var(--text-muted); font-size: 9px; }
.layer-row + .layer-row { margin-top: 5px; }

.layer-main {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px;
  border-radius: var(--radius-sm);
  background: var(--bg-hover);
  color: var(--text-secondary);
  text-align: left;
}

.layer-main.active { background: var(--accent-dim); color: var(--accent); }
.hidden-label { margin-left: auto; }
.color-swatch { width: 12px; height: 12px; border-radius: 50%; border: 1px solid var(--border-hover); }
.icon-btn { width: 24px; height: 28px; color: var(--text-secondary); border-radius: var(--radius-sm); }
.icon-btn:hover:not(:disabled) { background: var(--bg-hover); color: var(--text-primary); }
.icon-btn:disabled, .chip:disabled, .add-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.add-btn {
  width: 100%;
  margin-top: 8px;
  padding: 8px;
  border-radius: var(--radius-sm);
  border: 1px dashed var(--border);
  color: var(--text-secondary);
  font-size: 11px;
}

.layer-edit-actions { margin-top: 10px; }
.layer-edit-actions .chip { flex: 1; }
.chip.danger { color: #ff6b6b; }
</style>
