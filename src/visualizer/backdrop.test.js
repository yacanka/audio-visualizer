import { describe, expect, it, vi } from 'vitest'
import { drawBackdrop } from './backdrop.js'
function context() { return { canvas: {}, save: vi.fn(), restore: vi.fn(), fillRect: vi.fn(), translate: vi.fn(), rotate: vi.fn(), scale: vi.fn(), drawImage: vi.fn() } }
const store = { backdropType: 'solid', backdropColor: '#000000', backdropReflection: 'none' }

describe('backdrop rendering', () => {
  it('fits decoded video frames using intrinsic video dimensions and retains reflection', () => {
    const video = { readyState: 2, videoWidth: 200, videoHeight: 100, width: 0, height: 0 }
    const ctx = context()
    drawBackdrop({ ...store, backdropType: 'video', backdropVideo: video, backdropImageFit: 'contain', backdropReflection: '2-way' }, ctx, 400, 400)
    expect(ctx.drawImage).toHaveBeenNthCalledWith(1, video, 0, 100, 400, 200)
    expect(ctx.drawImage).toHaveBeenCalledTimes(2)
    ctx.drawImage.mockClear()
    video.readyState = 0
    drawBackdrop({ ...store, backdropType: 'video', backdropVideo: video }, ctx, 400, 400)
    expect(ctx.drawImage).not.toHaveBeenCalled()
  })
  it('clears contain-mode letterboxing before drawing the next image', () => {
    const ctx = context(), image = { width: 200, height: 100 }
    drawBackdrop({ ...store, backdropType: 'image', backdropImage: image, backdropImageFit: 'contain' }, ctx, 400, 400)
    expect(ctx.fillRect.mock.invocationCallOrder[0]).toBeLessThan(ctx.drawImage.mock.invocationCallOrder[0])
    expect(ctx.drawImage).toHaveBeenCalledWith(image, 0, 100, 400, 200)
  })
  it('reflects exact halves without translucent ghost images', () => {
    const ctx = context()
    drawBackdrop({ ...store, backdropReflection: '4-way' }, ctx, 400, 200)
    expect(ctx.drawImage).toHaveBeenNthCalledWith(1, ctx.canvas, 0, 0, 200, 200, 0, 0, 200, 200)
    expect(ctx.drawImage).toHaveBeenNthCalledWith(2, ctx.canvas, 0, 0, 400, 100, 0, 0, 400, 100)
    expect(ctx.globalAlpha).toBeUndefined()
  })
  it('reacts to actual audio energy instead of applying constant zoom', () => {
    const quiet = context(), loud = context()
    const reactive = { ...store, isPlaying: true, previewAudioAnalysisEnabled: true, backdropReactive: true, backdropReactiveIntensity: 100 }
    drawBackdrop(reactive, quiet, 400, 200, { energy: 0 }, 1)
    drawBackdrop(reactive, loud, 400, 200, { energy: 1 }, 1)
    expect(quiet.scale).toHaveBeenCalledWith(1, 1)
    expect(loud.scale).toHaveBeenCalledWith(1.2, 1.2)
  })
})
