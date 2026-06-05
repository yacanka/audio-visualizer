import { defineStore } from 'pinia'
import { createAudioState } from './modules/audioState.js'
import { createBackdropState } from './modules/backdropState.js'
import { createElementsState } from './modules/elementsState.js'
import { createHistoryState } from './modules/historyState.js'
import { createProjectState } from './modules/projectState.js'
import { createTemplateState } from './modules/templateState.js'
import { createTextState } from './modules/textState.js'
import { createVisualizerState } from './modules/visualizerState.js'

export const useAppStore = defineStore('app', () => {
  const audio = createAudioState()
  const project = createProjectState(audio)
  const template = createTemplateState()
  const visualizer = createVisualizerState()
  const backdrop = createBackdropState()
  const text = createTextState()
  const elements = createElementsState()
  const trackedRefs = createTrackedRefs({ audio, project, template, visualizer, backdrop, text, elements })
  const history = createHistoryState(trackedRefs, () => resetTransientState(audio, project))

  return {
    ...audio,
    ...project,
    ...template,
    ...visualizer,
    ...backdrop,
    ...text,
    ...elements,
    ...history,
  }
})

function createTrackedRefs(domains) {
  const excludedKeys = new Set(['audioFile', 'fileName', 'currentTime', 'duration', 'exportStatus', 'backdropImage'])
  return Object.fromEntries(
    Object.entries(flattenDomains(domains))
      .filter(([key, value]) => value && 'value' in value && !excludedKeys.has(key)),
  )
}

function flattenDomains(domains) {
  return Object.assign(
    {},
    domains.audio,
    domains.project,
    domains.template,
    domains.visualizer,
    domains.backdrop,
    domains.text,
    domains.elements,
  )
}

function resetTransientState(audio, project) {
  audio.audioFile.value = null
  audio.fileName.value = ''
  audio.currentTime.value = 0
  audio.duration.value = 0
  project.exportStatus.value = ''
}
