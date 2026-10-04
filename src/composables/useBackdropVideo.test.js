import { reactive } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useBackdropVideo, prepareBackdropVideo } from './useBackdropVideo.js'

afterEach(() => vi.restoreAllMocks())

function fixture() {
  const video = document.createElement('video')
  Object.defineProperties(video, { duration: { value: 3 }, readyState: { value: 2 }, paused: { value: true } })
  video.play = vi.fn(async () => {})
  video.pause = vi.fn()
  video.load = vi.fn()
  vi.spyOn(document, 'createElement').mockReturnValue(video)
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:local-video')
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  const store = reactive({ backdropVideoFile: null, backdropVideo: null, backdropType: 'video', isPlaying: true })
  const controller = useBackdropVideo(store)
  store.backdropVideoFile = new File(['video'], 'background.webm', { type: 'video/webm' })
  video.dispatchEvent(new Event('loadeddata'))
  return { store, video, controller }
}

describe('local video backdrop', () => {
  it('loops against the audio playhead, stays muted and releases owned resources', () => {
    const { store, video, controller } = fixture()
    controller.sync(7)
    expect(video.currentTime).toBe(1)
    expect(video.muted).toBe(true)
    expect(video.play).toHaveBeenCalledOnce()
    store.isPlaying = false
    controller.sync(8)
    expect(video.currentTime).toBe(2)
    expect(video.pause).toHaveBeenCalled()
    controller.dispose()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:local-video')
    expect(store.backdropVideo).toBeNull()
  })

  it('freezes at frame zero for static preview and pauses when another backdrop is selected', () => {
    const { store, video, controller } = fixture()
    store.previewBackgroundMode = 'static'
    controller.sync(7)
    expect(video.currentTime).toBe(0)
    expect(video.play).not.toHaveBeenCalled()
    store.backdropType = 'solid'
    controller.sync(8)
    expect(video.pause).toHaveBeenCalled()
    controller.dispose()
  })

  it('reports decoding errors and refuses export without a usable video', async () => {
    const { store, video, controller } = fixture()
    video.dispatchEvent(new Event('error'))
    expect(store.backdropVideoStatus).toContain('cannot')
    await expect(prepareBackdropVideo(store, 0)).rejects.toThrow()
    controller.dispose()
  })

  it('waits for a seek before export and supports cancellation', async () => {
    const { store, video, controller } = fixture()
    const abort = new AbortController()
    const pending = prepareBackdropVideo(store, 5, abort.signal)
    expect(video.currentTime).toBe(2)
    video.dispatchEvent(new Event('seeked'))
    await expect(pending).resolves.toBeUndefined()
    const cancelled = prepareBackdropVideo(store, 4, abort.signal)
    abort.abort()
    await expect(cancelled).rejects.toMatchObject({ name: 'AbortError' })
    controller.dispose()
  })
})
