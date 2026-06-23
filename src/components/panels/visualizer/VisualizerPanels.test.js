import { mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createVisualizerState } from '../../../stores/modules/visualizerState.js'
import VisualizerLayersPanel from './VisualizerLayersPanel.vue'
import VisualizerShapePanel from './VisualizerShapePanel.vue'

let store

vi.mock('../../../stores/app.js', () => ({ useAppStore: () => store }))

describe('visualizer panels', () => {
  beforeEach(() => { store = reactive(createVisualizerState()) })

  it('adds a selectable, editable visualizer layer', async () => {
    const wrapper = mount(VisualizerLayersPanel)

    await wrapper.get('.add-btn').trigger('click')
    await wrapper.get('input[type="color"]').setValue('#123456')

    expect(store.visualizerLayers).toHaveLength(3)
    expect(store.selectedVisualizerLayer).toBe('layer-3')
    expect(store.visualizerLayers[2].fillColor).toBe('#123456')
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
})
