import { computed, ref } from 'vue'

/** Create snapshot-based undo/redo history for tracked refs. */
export function createHistoryState(trackedRefs, resetTransientState) {
  const history = ref([])
  const historyIndex = ref(-1)
  const isRestoringHistory = ref(false)
  const defaultSnapshot = {}
  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)
  const projectFingerprint = computed(() => JSON.stringify(createSnapshot()))

  function createSnapshot() {
    return Object.fromEntries(Object.entries(trackedRefs).map(([key, item]) => [key, cloneValue(item.value)]))
  }

  function applySnapshot(snapshot) {
    isRestoringHistory.value = true
    Object.entries(trackedRefs).forEach(([key, item]) => {
      if (Object.prototype.hasOwnProperty.call(snapshot, key)) item.value = cloneValue(snapshot[key])
    })
    queueMicrotask(() => { isRestoringHistory.value = false })
  }

  function initializeHistory() {
    if (history.value.length) return
    Object.assign(defaultSnapshot, createSnapshot())
    history.value = [createSnapshot()]
    historyIndex.value = 0
  }

  function commitHistory() {
    if (isRestoringHistory.value) return
    const snapshot = createSnapshot()
    if (JSON.stringify(history.value[historyIndex.value]) === JSON.stringify(snapshot)) return
    history.value.splice(historyIndex.value + 1)
    history.value.push(snapshot)
    if (history.value.length > 60) history.value.shift()
    historyIndex.value = history.value.length - 1
  }

  function undo() {
    if (!canUndo.value) return
    historyIndex.value -= 1
    applySnapshot(history.value[historyIndex.value])
  }

  function redo() {
    if (!canRedo.value) return
    historyIndex.value += 1
    applySnapshot(history.value[historyIndex.value])
  }

  function resetProject() {
    applySnapshot(defaultSnapshot)
    resetTransientState()
    history.value = [createSnapshot()]
    historyIndex.value = 0
  }

  return { canUndo, canRedo, isRestoringHistory, projectFingerprint, initializeHistory, commitHistory, undo, redo, resetProject, createSnapshot }
}

function cloneValue(value) {
  if (value === undefined || value === null) return value
  if (typeof value !== 'object') return value
  return JSON.parse(JSON.stringify(value))
}
