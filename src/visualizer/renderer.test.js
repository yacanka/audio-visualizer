import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createVisualizerRenderer } from './renderer.js'
import { getVisualizerRumbleMotion } from './rumble.js'
import { drawVisualizerShape } from './shapes.js'
import { createGlowLayerRenderer } from './glowLayer.js'

vi.mock('./audioData.js', () => ({
  getRenderableFrequencyData: (_store, data) => data,
  getRenderableTimeData: (_store, data) => data,
}))
vi.mock('./backdrop.js', () => ({ drawBackdrop: vi.fn() }))
vi.mock('./shapes.js', () => ({ drawVisualizerShape: vi.fn() }))
vi.mock('./overlays.js', () => ({
  drawElements: vi.fn(),
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
