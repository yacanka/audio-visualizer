import { describe, expect, it } from 'vitest'
import { getLayerLayout, getRenderableLayers } from './layerLayout.js'

describe('visualizer layer layouts', () => {
  it.each([
    ['web', true, false, false],
    ['stack', false, true, false],
    ['combo', true, true, false],
    ['scale', false, false, true],
  ])('implements %s layout semantics', (mode, wider, taller, scaled) => {
    const front = getLayerLayout(mode, 0, 3, 100)
    const back = getLayerLayout(mode, 2, 3, 100)

    expect(back.widthScale > front.widthScale).toBe(wider)
    expect(back.heightScale > front.heightScale).toBe(taller)
    expect(back.overallScale > front.overallScale).toBe(scaled)
  })

  it('honors zero separation for every layout mode', () => {
    for (const mode of ['web', 'stack', 'combo', 'scale']) {
      expect(getLayerLayout(mode, 5, 7, 0)).toEqual({ widthScale: 1, heightScale: 1, overallScale: 1 })
    }
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
