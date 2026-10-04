<template>
  <ToggleRow label="Drift" v-model="enabled" />
  <template v-if="enabled">
    <ToggleRow label="Custom" v-model="custom" />
    <PanelRange v-if="!custom" label="Intensity" v-model="intensity" :min="0" :max="100" />
    <template v-else>
      <PanelRange v-for="control in controls" :key="control.key" :label="control.label"
        :model-value="store[field(control.key)]" @update:model-value="store[field(control.key)] = $event"
        :min="control.min ?? 0" :max="control.max" :step="control.step ?? 1" />
    </template>
  </template>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '../../stores/app.js'
import PanelRange from './PanelRange.vue'
import ToggleRow from './ToggleRow.vue'
const props = defineProps({ prefix: { type: String, default: '' } })
const store = useAppStore()
function field(name) { return props.prefix ? props.prefix + name[0].toUpperCase() + name.slice(1) : name }
function model(name) { return computed({ get: () => store[field(name)], set: value => { store[field(name)] = value } }) }
const enabled = model('drift')
const custom = model('driftCustom')
const intensity = model('driftIntensity')
const controls = [
  { key: 'driftX', label: 'X Distance', max: 25 }, { key: 'driftY', label: 'Y Distance', max: 25 },
  { key: 'driftRotation', label: 'Rotation', max: 30, step: 0.5 },
  { key: 'driftSpeed', label: 'Speed', max: 10, step: 0.1 },
  { key: 'driftScale', label: 'Zoom', max: 50 },
  { key: 'driftAcceleration', label: 'Audio Acceleration', min: -100, max: 100 },
]
</script>
