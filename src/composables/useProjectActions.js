import { downloadJson } from '../utils/download.js'

/** Provide project-level actions such as save and reset. */
export function useProjectActions(store, getAudio, clearWaveform) {
  function saveProject() {
    downloadJson(createProjectPayload(store), `specterr-project-${Date.now()}.json`)
    store.exportStatus = 'Video settings saved.'
  }

  function newVideo(onComplete) {
    const shouldReset = !store.fileName || window.confirm('Discard current video changes?')
    if (!shouldReset) return

    const audio = getAudio()
    audio?.pause()
    clearAudioSource(audio)
    clearWaveform()
    store.resetProject()
    onComplete?.()
  }

  return { saveProject, newVideo }
}

function createProjectPayload(store) {
  return {
    app: 'audio-spectrum-visualizer',
    version: 1,
    savedAt: new Date().toISOString(),
    fileName: store.fileName,
    settings: store.createSnapshot(),
  }
}

function clearAudioSource(audio) {
  if (!audio?.audioEl?.value) return
  audio.audioEl.value.removeAttribute('src')
  audio.audioEl.value.load()
}
