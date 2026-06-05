import { onMounted, onUnmounted } from 'vue'

/** Register editor keyboard shortcuts while the app is mounted. */
export function useKeyboardShortcuts(store, controls) {
  function onKeydown(event) {
    if (isTextInput(event.target)) return
    if (event.code === 'Space') {
      event.preventDefault()
      controls.togglePlay()
    }
    if (event.code === 'KeyM') controls.toggleMute()
    if (event.code === 'Delete') store.deleteSelectedElement()
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onUnmounted(() => window.removeEventListener('keydown', onKeydown))
}

function isTextInput(target) {
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}
