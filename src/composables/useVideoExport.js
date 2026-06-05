import { downloadBlob } from '../utils/download.js'
import { getSupportedVideoMimeType, wait } from '../utils/mediaRecorder.js'

/** Export the current canvas preview as a local WebM file. */
export function useVideoExport(store, getAudio, getCanvas) {
  async function exportVideo({ duration }) {
    const canvas = getCanvas()
    if (!canExport(canvas)) {
      store.exportStatus = 'This browser cannot export video.'
      return
    }

    store.exportStatus = 'Export in progress...'
    const stream = createExportStream(canvas, getAudio)
    const recorder = createRecorder(stream)
    const chunks = collectChunks(recorder)

    await prepareAudioForExport(store, getAudio)
    recorder.start()
    await wait(Math.max(1, duration) * 1000)
    recorder.stop()
    await waitForStop(recorder)

    getAudio()?.pause()
    downloadBlob(new Blob(chunks, { type: recorder.mimeType || 'video/webm' }), `specterr-export-${Date.now()}.webm`)
    stream.getTracks().forEach(track => track.stop())
    store.exportStatus = 'Video export completed.'
  }

  return { exportVideo }
}

function canExport(canvas) {
  return Boolean(canvas?.captureStream && window.MediaRecorder)
}

function createExportStream(canvas, getAudio) {
  const stream = canvas.captureStream(30)
  const audioStream = getAudio()?.audioEl?.value?.captureStream?.()
  audioStream?.getAudioTracks().forEach(track => stream.addTrack(track))
  return stream
}

function createRecorder(stream) {
  const mimeType = getSupportedVideoMimeType()
  return new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
}

function collectChunks(recorder) {
  const chunks = []
  recorder.ondataavailable = event => {
    if (event.data.size) chunks.push(event.data)
  }
  return chunks
}

function waitForStop(recorder) {
  return new Promise(resolve => { recorder.onstop = resolve })
}

async function prepareAudioForExport(store, getAudio) {
  const audio = getAudio()
  if (!audio || !store.audioFile) return
  audio.seek(store.startTime || 0)
  await audio.play()
}
