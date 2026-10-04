import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useVideoExport } from './useVideoExport.js'
import { downloadBlob } from '../utils/download.js'

vi.mock('../utils/download.js', () => ({ downloadBlob: vi.fn() }))
vi.mock('../visualizer/images.js', () => ({ prepareImages: vi.fn(async () => {}) }))

let recorders
class Recorder {
  static isTypeSupported() { return true }
  constructor(stream) { this.stream = stream; this.state = 'inactive'; this.mimeType = 'video/webm'; recorders.push(this) }
  start() { this.state = 'recording' }
  stop() { this.state = 'inactive'; this.ondataavailable({ data: new Blob(['recorded']) }); this.onstop() }
}
function fixture() {
  const videoTrack = { stop: vi.fn() }, audioTrack = { stop: vi.fn() }
  const tracks = [videoTrack]
  const stream = { getTracks: () => tracks, addTrack: vi.fn(track => tracks.push(track)) }
  const element = { loop: true, captureStream: vi.fn(() => ({ getAudioTracks: () => [audioTrack] })) }
  const audio = { audioEl: { value: element }, play: vi.fn(async () => {}), pause: vi.fn(), seek: vi.fn() }
  const canvas = { captureStream: vi.fn(() => stream) }
  const store = { isExporting: false, audioFile: {}, startTime: 2 }
  return { store, audio, canvas, videoTrack, audioTrack, stream, exporter: useVideoExport(store, () => audio, () => canvas) }
}

describe('WebM export lifecycle', () => {
  beforeEach(() => { recorders = []; vi.useFakeTimers(); vi.clearAllMocks(); vi.stubGlobal('MediaRecorder', Recorder) })
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })
  it('captures canvas first, adds audio, downloads, and releases tracks', async () => {
    const f = fixture()
    const pending = f.exporter.exportVideo({ duration: 1 })
    await vi.advanceTimersByTimeAsync(1001)
    await pending
    expect(f.canvas.captureStream).toHaveBeenCalledWith(30)
    expect(f.stream.addTrack).toHaveBeenCalledWith(f.audioTrack)
    expect(f.canvas.captureStream.mock.invocationCallOrder[0]).toBeLessThan(f.audio.audioEl.value.captureStream.mock.invocationCallOrder[0])
    expect(f.audio.seek).toHaveBeenCalledWith(2)
    expect(downloadBlob).toHaveBeenCalledOnce()
    expect(f.videoTrack.stop).toHaveBeenCalledOnce()
    expect(f.audioTrack.stop).toHaveBeenCalledOnce()
    expect(f.audio.audioEl.value.loop).toBe(true)
    expect(f.store.isExporting).toBe(false)
    expect(f.store.exportProgress).toBe(100)
  })
  it('cancels without a download and ignores a second export', async () => {
    const f = fixture()
    const pending = f.exporter.exportVideo({ duration: 5 })
    await f.exporter.exportVideo({ duration: 5 })
    await vi.advanceTimersByTimeAsync(1)
    expect(recorders).toHaveLength(1)
    f.exporter.cancelExport()
    await pending
    expect(downloadBlob).not.toHaveBeenCalled()
    expect(f.videoTrack.stop).toHaveBeenCalledOnce()
    expect(f.audioTrack.stop).toHaveBeenCalledOnce()
    expect(f.store.exportStatus).toBe('Video export cancelled.')
  })
  it('releases video tracks if audio playback fails', async () => {
    const f = fixture()
    f.audio.play.mockRejectedValue(new Error('Cannot play'))
    await f.exporter.exportVideo({ duration: 1 })
    expect(f.videoTrack.stop).toHaveBeenCalledOnce()
    expect(f.store.isExporting).toBe(false)
    expect(downloadBlob).not.toHaveBeenCalled()
  })
  it('exports a silent canvas if audio capture is not supported', async () => {
    const f = fixture()
    delete f.audio.audioEl.value.captureStream
    const pending = f.exporter.exportVideo({ duration: 1 })
    await vi.advanceTimersByTimeAsync(1001)
    await pending
    expect(downloadBlob).toHaveBeenCalledOnce()
    expect(f.stream.addTrack).not.toHaveBeenCalled()
  })
  it('rejects an invalid duration before creating capture tracks', async () => {
    const f = fixture()
    await f.exporter.exportVideo({ duration: NaN })
    expect(f.canvas.captureStream).not.toHaveBeenCalled()
    expect(f.store.isExporting).toBe(false)
  })
  it('rejects a missing video backdrop without downloading a fallback-only video', async () => {
    const f = fixture()
    f.store.backdropType = 'video'
    await f.exporter.exportVideo({ duration: 1 })
    expect(downloadBlob).not.toHaveBeenCalled()
    expect(f.canvas.captureStream).not.toHaveBeenCalled()
    expect(f.store.exportStatus).toContain('video backdrop')
    expect(f.store.isExporting).toBe(false)
  })
})
