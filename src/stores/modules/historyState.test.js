import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { createHistoryState } from './historyState.js'

describe('history state', () => {
  it('commits snapshots and restores with undo/redo', () => {
    const tracked = { label: ref('initial') }
    const history = createHistoryState(tracked, () => {})

    history.initializeHistory()
    tracked.label.value = 'changed'
    history.commitHistory()
    history.undo()
    expect(tracked.label.value).toBe('initial')
    history.redo()
    expect(tracked.label.value).toBe('changed')
  })

  it('runs transient reset when project resets', () => {
    const tracked = { label: ref('initial') }
    let resetCalled = false
    const history = createHistoryState(tracked, () => { resetCalled = true })

    history.initializeHistory()
    tracked.label.value = 'changed'
    history.resetProject()
    expect(tracked.label.value).toBe('initial')
    expect(resetCalled).toBe(true)
  })
})
