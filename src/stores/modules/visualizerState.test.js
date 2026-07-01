import { describe, expect, it } from 'vitest'
import { createVisualizerState, MAX_VISUALIZER_LAYERS } from './visualizerState.js'

describe('visualizer layer state', () => {
  it('starts in classic mode with SoundVisible controls available', () => {
    const state = createVisualizerState()

    expect(state.visualizerMode.value).toBe('classic')
    expect(state.soundVisibleColor.value).toBe('#f6c453')
    expect(state.soundVisibleCoreColor.value).toBe('#fff4b8')
    expect(state.soundVisibleGlow.value).toBe(70)
    expect(state.soundVisibleLineWidth.value).toBe(2)
    expect(state.soundVisibleShardAmount.value).toBe(18)
    expect(state.soundVisibleShardFadeDistance.value).toBe(100)
    expect(state.soundVisibleShardTurbulence.value).toBe(45)
    expect(state.soundVisibleShardWindDirection.value).toBe(0)
  })

  it('adds unique layers up to the Specterr layer limit', () => {
    const state = createVisualizerState()

    while (state.visualizerLayers.value.length < MAX_VISUALIZER_LAYERS) {
      expect(state.addVisualizerLayer()).toBe(true)
    }

    expect(state.addVisualizerLayer()).toBe(false)
    expect(new Set(state.visualizerLayers.value.map(layer => layer.id)).size).toBe(MAX_VISUALIZER_LAYERS)
    expect(state.selectedVisualizerLayer.value).toBe('layer-7')
  })

  it('duplicates, reorders, hides, and removes serializable layers', () => {
    const state = createVisualizerState()

    expect(state.duplicateVisualizerLayer('layer-1')).toBe(true)
    const duplicate = state.visualizerLayers.value[1]
    expect(duplicate).toMatchObject({ fillColor: '#f85462', visible: true })
    expect(state.moveVisualizerLayer(duplicate.id, 1)).toBe(true)
    expect(state.updateVisualizerLayer(duplicate.id, { visible: false })).toBe(true)
    expect(state.removeVisualizerLayer(duplicate.id)).toBe(true)
    expect(state.visualizerLayers.value).toHaveLength(2)
  })

  it('keeps legacy template colors synchronized with the first two layers', () => {
    const state = createVisualizerState()

    state.barColor.value = '#123456'
    state.updateVisualizerLayer('layer-2', { fillColor: '#abcdef' })

    expect(state.visualizerLayers.value[0].fillColor).toBe('#123456')
    expect(state.barColor2.value).toBe('#abcdef')
  })

  it('never removes the final visualizer layer', () => {
    const state = createVisualizerState()

    expect(state.removeVisualizerLayer('layer-2')).toBe(true)
    expect(state.removeVisualizerLayer('layer-1')).toBe(false)
    expect(state.visualizerLayers.value).toHaveLength(1)
  })

  it('rejects unsafe layer properties and invalid colors', () => {
    const state = createVisualizerState()

    state.updateVisualizerLayer('layer-1', { fillColor: 'url(javascript:alert(1))', name: '<script>' })

    expect(state.visualizerLayers.value[0]).toMatchObject({
      name: 'Wave Layer 1',
      fillColor: '#f85462',
    })
  })
})
