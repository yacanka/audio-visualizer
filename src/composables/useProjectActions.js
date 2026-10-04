import { parseProject } from '../utils/project.js'
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

  async function openProject(file) {
    if (!file) return false
    try {
      if (file.size > 100 * 1024 * 1024) throw new Error('The project is too large.')
      const snapshot = parseProject(await file.text(), store.createSnapshot())
      const audio = getAudio()
      audio?.pause()
      clearAudioSource(audio)
      clearWaveform()
      store.restoreProject(snapshot)
      store.exportStatus = store.backdropType === 'video'
        ? 'Project opened. Reselect the original audio and background video files to continue.'
        : 'Project opened. Upload the original audio file to continue.'
      return true
    } catch (error) {
      store.exportStatus = error instanceof SyntaxError ? 'The project file is not valid JSON.' : error.message
      return false
    }
  }

  return { saveProject, newVideo, openProject }
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
