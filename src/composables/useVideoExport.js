import { downloadBlob } from '../utils/download.js'
import { getSupportedVideoMimeType } from '../utils/mediaRecorder.js'
import { prepareImages } from '../visualizer/images.js'
import { prepareBackdropVideo } from './useBackdropVideo.js'

/** Export a local WebM, owning and releasing every capture track even on failure. */
export function useVideoExport(store, getAudio, getCanvas) {
  let controller = null

  async function exportVideo({ duration }) {
    if (store.isExporting) return
    const canvas = getCanvas()
    if (!canvas?.captureStream || !globalThis.MediaRecorder) {
      store.exportStatus = 'This browser cannot export video.'
      return
    }
    const seconds = Number(duration)
    if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 7200) {
      store.exportStatus = 'Choose a duration between 0 and 7200 seconds.'
      return
    }
    const audio = getAudio()
    const audioElement = audio?.audioEl?.value
    const previousLoop = audioElement?.loop
    controller = new AbortController()
    store.isExporting = true
    store.exportProgress = 0
    store.exportStatus = 'Preparing video...'
    let stream
    try {
      audio?.pause()
      store.isPlaying = false
      store.currentTime = store.audioFile ? (store.startTime || 0) : 0
      await prepareImages(store)
      await prepareBackdropVideo(store, store.currentTime, controller.signal)
      if (controller.signal.aborted) throw new DOMException('Cancelled', 'AbortError')
      // Keep the canvas stream first; attach optional audio after playback has started.
      stream = canvas.captureStream(30)
      if (audioElement) audioElement.loop = false
      await prepareAudioForExport(store, audio)
      if (controller.signal.aborted) throw new DOMException('Cancelled', 'AbortError')
      const audioStream = audioElement?.captureStream?.() || audioElement?.mozCaptureStream?.()
      audioStream?.getAudioTracks().forEach(track => stream.addTrack(track))
      const mimeType = getSupportedVideoMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      store.exportStatus = 'Export in progress...'
      const chunks = await record(recorder, seconds, controller.signal, value => { store.exportProgress = value })
      downloadBlob(new Blob(chunks, { type: recorder.mimeType || 'video/webm' }), `specterr-export-${Date.now()}.webm`)
      store.exportProgress = 100
      store.exportStatus = 'Video export completed.'
    } catch (error) {
      store.exportStatus = error.name === 'AbortError' ? 'Video export cancelled.' : 'Video export failed. Check that your audio, images and video backdrop can be played.'
    } finally {
      audio?.pause()
      store.isPlaying = false
      if (audioElement) audioElement.loop = previousLoop
      stream?.getTracks().forEach(track => track.stop())
      store.isExporting = false
      controller = null
    }
  }

  return { exportVideo, cancelExport: () => controller?.abort() }
}

function record(recorder, seconds, signal, onProgress) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let failure = null, timer, progressTimer
    const stop = () => { if (recorder.state !== 'inactive') recorder.stop() }
    const abort = () => { failure = new DOMException('Cancelled', 'AbortError'); stop() }
    const cleanup = () => { clearTimeout(timer); clearInterval(progressTimer); signal.removeEventListener('abort', abort) }
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data) }
    recorder.onerror = () => {
      failure = new Error('Recording failed')
      cleanup()
      stop()
      reject(failure)
    }
    recorder.onstop = () => { cleanup(); failure ? reject(failure) : resolve(chunks) }
    signal.addEventListener('abort', abort, { once: true })
    try {
      if (signal.aborted) throw new DOMException('Cancelled', 'AbortError')
      recorder.start(250)
      const start = Date.now()
      timer = setTimeout(stop, seconds * 1000)
      progressTimer = setInterval(() => onProgress(Math.min(99, (Date.now() - start) / (seconds * 10))), 200)
    } catch (error) {
      cleanup()
      reject(error)
    }
  })
}

async function prepareAudioForExport(store, audio) {
  if (!audio || !store.audioFile) { store.currentTime = 0; store.isPlaying = true; return }
  audio.seek(store.startTime || 0)
  await audio.play()
}
