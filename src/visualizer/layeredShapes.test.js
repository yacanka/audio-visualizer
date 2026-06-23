import { describe, expect, it, vi } from 'vitest'
import { drawLayeredVisualizer } from './layeredShapes.js'

describe('layered visualizer styles', () => {
  it.each([
    ['solid', 'fill'],
    ['bar', 'stroke'],
    ['point', 'arc'],
  ])('draws circular %s layers', (style, expectedMethod) => {
    const context = createContext()
    drawLayeredVisualizer(createStore(style), context, new Uint8Array(32).fill(128), { w: 800, h: 600 }, 0)

    expect(context[expectedMethod]).toHaveBeenCalled()
  })

  it('skips hidden layers without dropping layout depth', () => {
    const context = createContext()
    const store = createStore('bar')
    store.visualizerLayers[0].visible = false

    drawLayeredVisualizer(store, context, new Uint8Array(32).fill(128), { w: 800, h: 600 }, 0)

    expect(context.stroke).toHaveBeenCalledTimes(store.barCount)
  })
})

function createStore(style) {
  return {
    barColor: '#f85462', barColor2: '#7b2ff7', barCount: 8, centerCutout: 0,
    sensitivity: 1, visualizerBarWidth: 75, visualizerDiameter: 40,
    visualizerPointRadius: 5, visualizerSeparation: 40, vizLayerMode: 'web',
    vizReflection: 'none', vizShape: 'circular', vizSmooth: true, vizSpectrum: 'bass', vizStyle: style,
    visualizerLayers: [
      { id: 'layer-1', fillColor: '#f85462', outlineColor: '#000000', outlineWidth: 0, visible: true },
      { id: 'layer-2', fillColor: '#7b2ff7', outlineColor: '#000000', outlineWidth: 0, visible: true },
    ],
  }
}

function createContext() {
  return {
    arc: vi.fn(), beginPath: vi.fn(), closePath: vi.fn(), fill: vi.fn(), fillRect: vi.fn(),
    lineTo: vi.fn(), moveTo: vi.fn(), stroke: vi.fn(), strokeRect: vi.fn(),
  }
}
