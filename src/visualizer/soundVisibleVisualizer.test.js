import { describe, expect, it, vi } from 'vitest'
import { drawSoundVisibleVisualizer } from './soundVisibleVisualizer.js'

describe('soundVisible visualizer', () => {
  it('draws a glowing beam with mirrored spectrum lines and shards', () => {
    const context = createContext()

    drawSoundVisibleVisualizer(createStore(), context, new Uint8Array(64).fill(190), { w: 1280, h: 720 })

    expect(context.createLinearGradient).toHaveBeenCalled()
    expect(context.stroke.mock.calls.length).toBeLessThan(12)
    expect(context.lineTo.mock.calls.length).toBeGreaterThan(40)
    expect(context.fill.mock.calls.length).toBeGreaterThan(0)
  })

  it('can disable the shard layer independently from the beam', () => {
    const context = createContext()
    const store = createStore({ soundVisibleShardAmount: 0 })

    drawSoundVisibleVisualizer(store, context, new Uint8Array(64).fill(190), { w: 1280, h: 720 })

    expect(context.stroke).toHaveBeenCalledTimes(5)
    expect(context.fill).not.toHaveBeenCalled()
  })
})

function createStore(overrides = {}) {
  return {
    ...createBaseStore(),
    ...overrides,
  }
}

function createBaseStore() {
  return {
    barColor: '#f7d774', barColor2: '#fff4b8', barCount: 24, currentTime: 9,
    sensitivity: 1, soundVisibleGlow: 70, soundVisibleLineWidth: 2,
    soundVisibleShardAmount: 4, soundVisibleShardSize: 22, visualizerBaseHeight: 0,
    visualizerLayers: createLayers(), visualizerWaveHeight: 30, visualizerWidth: 90,
    vizInvert: false, vizSmooth: true, vizSpectrum: 'wide',
  }
}

function createLayers() {
  return [
    { fillColor: '#f7d774', visible: true },
    { fillColor: '#fff4b8', visible: true },
  ]
}

function createContext() {
  const gradient = { addColorStop: vi.fn() }
  return {
    beginPath: vi.fn(),
    closePath: vi.fn(),
    createLinearGradient: vi.fn(() => gradient),
    fill: vi.fn(),
    lineTo: vi.fn(),
    moveTo: vi.fn(),
    restore: vi.fn(),
    rotate: vi.fn(),
    save: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
  }
}
