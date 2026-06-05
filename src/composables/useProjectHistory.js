import { onUnmounted, watch } from 'vue'

/** Debounce project history commits while store fields change. */
export function useProjectHistory(store) {
  let historyTimer = null

  store.initializeHistory()

  watch(
    () => store.projectFingerprint,
    () => {
      if (store.isRestoringHistory) return
      clearTimeout(historyTimer)
      historyTimer = setTimeout(() => store.commitHistory(), 250)
    },
  )

  onUnmounted(() => {
    clearTimeout(historyTimer)
  })
}
