import { describe, expect, it } from 'vitest'
import { getLayerLayout, getRenderableLayers } from './layerLayout.js'

describe('visualizer layer layouts', () => {
  it('broadens rear Web layers without scaling their geometry', () => {
    const front = getLayerLayout('web', 0, 2, 40)
    const back = getLayerLayout('web', 1, 2, 40)

    expect(back.peakShiftPasses).toBeGreaterThan(front.peakShiftPasses)
    expect(back.smoothingPasses).toBeGreaterThan(front.smoothingPasses)
    expect(back.heightScale).toBe(front.heightScale)
    expect(back.overallScale).toBe(front.overallScale)
    expect(back).toMatchObject({ smoothingPasses: 20, peakShiftPasses: 12 })
  })

  it('makes rear Stack layers taller without broadening them', () => {
    const front = getLayerLayout('stack', 0, 3, 40)
    const back = getLayerLayout('stack', 2, 3, 40)

    expect(back.heightScale).toBeGreaterThan(front.heightScale)
    expect(back.peakShiftPasses).toBe(0)
    expect(back.overallScale).toBe(1)
    expect(back.heightScale).toBeCloseTo(0.65)
  })

  it('combines breadth and height changes in Combo mode', () => {
    const front = getLayerLayout('combo', 0, 3, 40)
    const back = getLayerLayout('combo', 2, 3, 40)

    expect(back.heightScale).toBeGreaterThan(front.heightScale)
    expect(back.peakShiftPasses).toBeGreaterThan(front.peakShiftPasses)
  })

  it('scales and offsets rear layers in Scale mode', () => {
    const front = getLayerLayout('scale', 0, 3, 40)
    const back = getLayerLayout('scale', 2, 3, 40)

    expect(back.overallScale).toBeGreaterThan(front.overallScale)
    expect(back.baseOffsetScale).toBeGreaterThan(front.baseOffsetScale)
    expect(back.overallScale).toBeCloseTo(1.16)
    expect(back.baseOffsetScale).toBeCloseTo(0.24)
  })

  it('collapses every mode to coincident layers at zero separation', () => {
    for (const mode of ['web', 'stack', 'combo', 'scale']) {
      expect(getLayerLayout(mode, 5, 7, 0)).toEqual(getLayerLayout(mode, 0, 7, 0))
    }
  })

  it('falls back to Web behavior for unknown legacy modes', () => {
    expect(getLayerLayout('unknown', 1, 2, 40)).toEqual(getLayerLayout('web', 1, 2, 40))
  })

  it('normalizes old project layers that only contain ids and names', () => {
    const store = {
      barColor: '#111111', barColor2: '#222222',
      visualizerLayers: [{ id: 'layer-1', name: 'Wave Layer 1' }],
    }

    expect(getRenderableLayers(store)).toEqual([{
      id: 'layer-1', fillColor: '#111111', outlineColor: '#000000', outlineWidth: 0, visible: true,
    }])
  })
})
