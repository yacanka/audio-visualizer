import { beforeEach, describe, expect, it, vi } from 'vitest'
import { drawElements, drawParticleElements, drawTextOverlay } from './overlays.js'
import { drawParticleLayer } from './particles.js'

vi.mock('./particles.js', () => ({ drawParticleLayer: vi.fn() }))

describe('visualizer element layers', () => {
  beforeEach(() => vi.clearAllMocks())

  it('scales portrait title and artist text using the short canvas edge', () => {
    const context = { ...createContext(), canvas: { width: 720, height: 1280 } }
    const fonts = []
    context.fillText = () => fonts.push(context.font)
    drawTextOverlay({ showTitle: true, showArtist: true, titleText: 'TRACK NAME', artistText: 'ARTIST NAME',
      titleSize: 35, artistSize: 70, titleFont: 'Montserrat', artistFont: 'Montserrat',
      titleWeight: '400', artistWeight: '700', textPosition: 'custom',
      titleX: 9, titleY: 64, artistX: 9, artistY: 56, lyricsEnabled: false }, context, { w: 720, h: 1280 }, 0)
    expect(fonts).toEqual(["400 35px 'Montserrat', sans-serif", "700 70px 'Montserrat', sans-serif"])
  })

  it('keeps left-aligned artist text inside the frame and preserves its weight', () => {
    const context = { ...createContext(), canvas: { width: 1280, height: 720 } }
    const draws = []
    context.fillText = (text, x, y) => draws.push({ text, x, y, align: context.textAlign, font: context.font })
    drawTextOverlay({ showTitle: false, showArtist: true, artistText: 'ARTIST NAME', artistSize: 70,
      artistFont: 'Montserrat', artistWeight: '700', artistAlign: 'left', artistX: 9.12, artistY: 56,
      textPosition: 'custom', titleSize: 35, titleY: 64, lyricsEnabled: false }, context, { w: 1280, h: 720 }, 0)
    expect(draws[0]).toMatchObject({ align: 'left', font: "700 70px 'Montserrat', sans-serif" })
    expect(draws[0].x).toBeCloseTo(1280 * 0.0912)
  })

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
  return { fillText: vi.fn(), save: vi.fn(), restore: vi.fn(), translate: vi.fn(), scale: vi.fn() }
}
