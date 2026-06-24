import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createVisualizerRenderer } from './renderer.js'
import { getVisualizerRumbleMotion } from './rumble.js'
import { drawVisualizerShape } from './shapes.js'
import { createGlowLayerRenderer } from './glowLayer.js'
import { drawElements, drawParticleElements } from './overlays.js'

vi.mock('./audioData.js', () => ({
  getRenderableFrequencyData: (_store, data) => data,
  getRenderableTimeData: (_store, data) => data,
}))
vi.mock('./backdrop.js', () => ({ drawBackdrop: vi.fn() }))
vi.mock('./shapes.js', () => ({ drawVisualizerShape: vi.fn() }))
vi.mock('./overlays.js', () => ({
  drawElements: vi.fn(),
  drawParticleElements: vi.fn(),
  drawProgressBar: vi.fn(),
  drawTextOverlay: vi.fn(),
}))
vi.mock('./particles.js', () => ({
  getParticleFrameMotion: () => ({ boost: 1, energy: 0.8, impulse: 0.2 }),
}))
vi.mock('./rumble.js', () => ({
  getVisualizerRumbleMotion: vi.fn(() => ({ scale: 1.08, envelope: 0.6 })),
}))
vi.mock('./glowLayer.js', () => ({
  createGlowLayerRenderer: vi.fn(() => ({ draw: vi.fn() })),
}))

describe('visualizer renderer', () => {
  beforeEach(() => vi.clearAllMocks())

  it('draws the visualizer shape with the calculated rumble scale', () => {
    const store = createStore()
    const renderer = createVisualizerRenderer(store)
    const canvas = createCanvas()

    expect(() => renderer.drawFrame(canvas, createFrequency, createFrequency, 100)).not.toThrow()
    expect(getVisualizerRumbleMotion).toHaveBeenCalledWith(
      store,
      { boost: 1, energy: 0.8, impulse: 0.2 },
      0,
      0,
    )
    expect(drawVisualizerShape).toHaveBeenCalledWith(
      expect.any(Object),
      canvas.context,
      expect.any(Object),
      { w: 1280, h: 720 },
      0,
      1.08,
    )
    expect(createGlowLayerRenderer).toHaveBeenCalledWith(canvas)
  })

  it('draws particles behind the visualizer and other elements', () => {
    const renderer = createVisualizerRenderer(createStore())

    renderer.drawFrame(createCanvas(), createFrequency, createFrequency, 100)

    expect(drawParticleElements.mock.invocationCallOrder[0])
      .toBeLessThan(drawVisualizerShape.mock.invocationCallOrder[0])
    expect(drawVisualizerShape.mock.invocationCallOrder[0])
      .toBeLessThan(drawElements.mock.invocationCallOrder[0])
  })

  it('stops advancing particles when music playback stops', () => {
    const store = createStore()
    store.isPlaying = true
    const renderer = createVisualizerRenderer(store)
    const canvas = createCanvas()

    renderer.drawFrame(canvas, createFrequency, createFrequency, 100)
    renderer.drawFrame(canvas, createFrequency, createFrequency, 1100)
    store.isPlaying = false
    renderer.drawFrame(canvas, createFrequency, createFrequency, 2100)

    expect(drawParticleElements.mock.calls[1][3]).toBe(1000)
    expect(drawParticleElements.mock.calls[2][3]).toBe(1000)
  })
})

function createStore() {
  return {
    drift: false,
    fireEnabled: false,
    glowEnabled: false,
    shadowEnabled: false,
  }
}

function createCanvas() {
  const context = {}
  return { width: 1280, height: 720, context, getContext: () => context }
}

function createFrequency() {
  return new Uint8Array(32)
}
