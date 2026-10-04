import { describe, expect, it, vi } from 'vitest'
import { drawLayeredVisualizer } from './layeredShapes.js'

describe('layered visualizer styles', () => {
  it('fills the circular center only when hollow center is disabled', () => {
    const store = { ...createStore('solid'), visualizerHollowCenter: false }
    store.visualizerLayers = [store.visualizerLayers[0]]
    const context = createContext()
    drawLayeredVisualizer(store, context, new Uint8Array(32).fill(128), { w: 800, h: 600 }, 0)
    expect(context.lineTo).toHaveBeenCalledTimes(store.barCount - 1)
    context.lineTo.mockClear()
    store.visualizerHollowCenter = true
    drawLayeredVisualizer(store, context, new Uint8Array(32).fill(128), { w: 800, h: 600 }, 0)
    expect(context.lineTo.mock.calls.length).toBeGreaterThan(store.barCount)
  })

  it.each(['circular', 'bars'])('draws inward %s points toward the center or below the baseline', shape => {
    const store = { ...createStore('point'), vizShape: shape, visualizerMovement: 'inward', visualizerWidth: 90, visualizerBaseHeight: 0 }
    store.visualizerLayers = [store.visualizerLayers[0]]
    const context = createContext()
    drawLayeredVisualizer(store, context, new Uint8Array(32).fill(255), { w: 800, h: 600 }, 0)
    for (const [x, y] of context.arc.mock.calls) {
      if (shape === 'circular') expect(Math.hypot(x - 400, y - 300)).toBeLessThan(600 * 40 / 220)
      else expect(y).toBeGreaterThan(300)
    }
  })

  it('keeps point size proportional at thumbnail and export resolutions', () => {
    const store = createStore('point')
    const small = createContext(), large = createContext()
    drawLayeredVisualizer(store, small, new Uint8Array(32).fill(128), { w: 480, h: 270 }, 0)
    drawLayeredVisualizer(store, large, new Uint8Array(32).fill(128), { w: 1920, h: 1080 }, 0)
    expect(large.arc.mock.calls[0][2]).toBeCloseTo(small.arc.mock.calls[0][2] * 4)
  })

  it('applies a custom layer spin independently of the other layers', () => {
    const store = createStore('bar')
    store.visualizerLayers[0].customEnabled = true
    store.visualizerLayers[0].settings = { visualizerRotation: 10, visualizerSpin: true }
    const context = createContext()
    drawLayeredVisualizer(store, context, new Uint8Array(32).fill(128), { w: 800, h: 600 }, 0, null, { 'layer-1': 20 })
    expect(context.rotate).toHaveBeenCalledTimes(1)
    expect(context.rotate).toHaveBeenCalledWith(Math.PI / 6)
  })
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
    sensitivity: 1, visualizerWaveHeight: 30, visualizerBarWidth: 75, visualizerDiameter: 40,
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
    translate: vi.fn(), rotate: vi.fn(),
    save: vi.fn(), restore: vi.fn(), arc: vi.fn(), beginPath: vi.fn(), closePath: vi.fn(), fill: vi.fn(), fillRect: vi.fn(),
    lineTo: vi.fn(), moveTo: vi.fn(), stroke: vi.fn(), strokeRect: vi.fn(),
  }
}
