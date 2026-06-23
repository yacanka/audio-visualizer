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
      <label class="item-label" :for="`${selectedLayer.id}-outline`">Outline Color</label>
      <input :id="`${selectedLayer.id}-outline`" type="color" :value="selectedLayer.outlineColor" @input="updateSelected({ outlineColor: $event.target.value })" />
    </div>
    <PanelRange label="Outline Width" v-model="outlineWidth" :min="0" :max="20" />
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
