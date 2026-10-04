import { mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createVisualizerState } from '../../../stores/modules/visualizerState.js'
import VisualizerLayersPanel from './VisualizerLayersPanel.vue'
import { getRenderableLayers } from '../../../visualizer/layerLayout.js'
import { getLayerPaint } from '../../../visualizer/layerPaint.js'
import VisualizerShapePanel from './VisualizerShapePanel.vue'

let store

vi.mock('../../../stores/app.js', () => ({ useAppStore: () => store }))

describe('visualizer panels', () => {
  beforeEach(() => { store = reactive(createVisualizerState()) })

  it('switches legacy layer color mixing and passes the selection into rendered paint', async () => {
    const wrapper = mount(VisualizerLayersPanel)
    expect(wrapper.get('#layer-color-mix').element.value).toBe('rgb')
    store.updateVisualizerLayer('layer-1', { fillColor: '#ff0000', secondaryFillColor: '#0000ff' })
    await wrapper.get('#layer-color-mix').setValue('lch')
    expect(getLayerPaint(getRenderableLayers(store)[0], 0.5).fillColor).toBe('rgba(250,0,128,1)')
    await wrapper.get('#layer-color-mix').setValue('rgb')
    expect(getLayerPaint(getRenderableLayers(store)[0], 0.5).fillColor).toBe('rgba(128,0,128,1)')
  })
  it('adds a selectable, editable visualizer layer', async () => {
    const wrapper = mount(VisualizerLayersPanel)

    await wrapper.get('.add-btn').trigger('click')
    await wrapper.get('input[type="color"]').setValue('#123456')

    expect(store.visualizerLayers).toHaveLength(3)
    expect(store.selectedVisualizerLayer).toBe('layer-3')
    expect(store.visualizerLayers[2].fillColor).toBe('#123456')
  })

  it('edits layer movement and spin without changing global motion', async () => {
    const wrapper = mount(VisualizerLayersPanel)
    await wrapper.get('input[aria-label="Custom Shape"]').setValue(true)
    await wrapper.get('#layer-movement').setValue('inward')
    await wrapper.get('input[aria-label="Layer Spin"]').setValue(true)
    await wrapper.get('input[type="number"][aria-label="Layer Spin Speed"]').setValue(-35)
    expect(store.visualizerLayers[0].settings).toMatchObject({ visualizerMovement: 'inward', visualizerSpin: true, visualizerSpinSpeed: -35 })
    expect(store.visualizerSpin).toBe(false)
  })

  it('selects point style and scale layout from the Shape tab', async () => {
    const wrapper = mount(VisualizerShapePanel)

    const pointButton = wrapper.findAll('button').find(button => button.text() === 'Point')
    const scaleButton = wrapper.findAll('button').find(button => button.text() === 'Scale')
    await pointButton.trigger('click')
    await scaleButton.trigger('click')

    expect(store.vizStyle).toBe('point')
    expect(store.vizLayerMode).toBe('scale')
    expect(wrapper.text()).toContain('Point Radius')
  })

  it('switches the Shape tab into SoundVisible mode controls', async () => {
    const wrapper = mount(VisualizerShapePanel)

    const soundVisibleButton = wrapper.findAll('button').find(button => button.text() === 'SoundVisible')
    await soundVisibleButton.trigger('click')

    expect(store.visualizerMode).toBe('soundvisible')
    expect(wrapper.text()).toContain('Beam Color')
    expect(wrapper.text()).toContain('Beam Glow')
    expect(wrapper.text()).toContain('Wind Direction')
    expect(wrapper.text()).toContain('Turbulence')
    expect(wrapper.text()).toContain('Fade Distance')
    expect(wrapper.text()).not.toContain('Reflection')
  })
})
