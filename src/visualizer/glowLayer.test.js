import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createGlowLayerRenderer } from './glowLayer.js'
import { drawVisualizerShape } from './shapes.js'

vi.mock('./shapes.js', () => ({ drawVisualizerShape: vi.fn() }))

describe('glow layer renderer', () => {
  beforeEach(() => vi.clearAllMocks())

  it('updates glow at 30 fps while compositing every frame', () => {
    const layers = []
    const canvas = createCanvas(layers)
    const targetContext = { drawImage: vi.fn() }
    const renderer = createGlowLayerRenderer(canvas)

    renderer.draw(createStore(), targetContext, createFrameData(), createSize(), createMotion(), 100)
    renderer.draw(createStore(), targetContext, createFrameData(), createSize(), createMotion(), 110)

    expect(drawVisualizerShape).toHaveBeenCalledTimes(1)
    expect(layers[1].context.filter).toBe('blur(9.5px)')
    expect(targetContext.drawImage).toHaveBeenCalledTimes(2)
  })

  it('renders large canvases through a reduced-resolution layer', () => {
    const layers = []
    const renderer = createGlowLayerRenderer(createCanvas(layers))

    renderer.draw(createStore(), { drawImage: vi.fn() }, createFrameData(), createSize(), createMotion(), 100)

    expect(layers[0]).toMatchObject({ width: 960, height: 540 })
    expect(layers[0].context.scale).toHaveBeenCalledWith(0.5, 0.5)
  })

  it('skips the generic glow pass for SoundVisible mode', () => {
    const renderer = createGlowLayerRenderer(createCanvas([]))

    renderer.draw(
      { ...createStore(), visualizerMode: 'soundvisible' },
      { drawImage: vi.fn() },
      createFrameData(),
      createSize(),
      createMotion(),
      100,
    )

    expect(drawVisualizerShape).not.toHaveBeenCalled()
  })
})

function createCanvas(layers) {
  return {
    ownerDocument: {
      createElement: () => {
        const layer = createLayer()
        layers.push(layer)
        return layer
      },
    },
  }
}

function createLayer() {
  const context = {
    clearRect: vi.fn(), drawImage: vi.fn(), fillRect: vi.fn(), restore: vi.fn(),
    save: vi.fn(), scale: vi.fn(), setTransform: vi.fn(), filter: 'none',
  }
  return { width: 0, height: 0, context, getContext: () => context }
}

function createStore() {
  return {
    fireEnabled: false, glowAmount: 15, glowColor: '#f85462',
    glowEnabled: true, glowScale: 10, shadowEnabled: false,
  }
}

function createFrameData() {
  return { frequency: new Uint8Array(32), time: new Uint8Array(32) }
}

function createSize() {
  return { w: 1920, h: 1080 }
}

function createMotion() {
  return { driftOffset: 0, rumbleScale: 1 }
}
