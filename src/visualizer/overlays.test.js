import { beforeEach, describe, expect, it, vi } from 'vitest'
import { drawElements, drawParticleElements } from './overlays.js'
import { drawParticleLayer } from './particles.js'

vi.mock('./particles.js', () => ({ drawParticleLayer: vi.fn() }))

describe('visualizer element layers', () => {
  beforeEach(() => vi.clearAllMocks())

  it('keeps particles out of the foreground element layer', () => {
    const context = createContext()

    drawElements(createStore(), context, { w: 1280, h: 720 })

    expect(context.fillText).toHaveBeenCalledOnce()
    expect(drawParticleLayer).not.toHaveBeenCalled()
  })

  it('draws only particles in the background particle layer', () => {
    const store = createStore()
    const context = createContext()
    const size = { w: 1280, h: 720 }

    drawParticleElements(store, context, size, 100, new Uint8Array(32))

    expect(drawParticleLayer).toHaveBeenCalledOnce()
    expect(drawParticleLayer).toHaveBeenCalledWith(
      store, context, store.elements[0], size, 100, expect.any(Uint8Array),
    )
  })
})

function createStore() {
  return {
    elements: [
      { id: 'particles', type: 'particles', color: '#ffffff' },
      { id: 'caption', type: 'text', text: 'Caption', x: 50, y: 50, size: 24, color: '#ffffff' },
    ],
  }
}

function createContext() {
  return { fillText: vi.fn() }
}
