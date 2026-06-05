import { useAppStore } from '../stores/app.js'
import { getCanvasDimensions } from '../visualizer/dimensions.js'
import { createVisualizerRenderer } from '../visualizer/renderer.js'

/** Create the visualizer drawing adapter used by Vue components. */
export function useVisualizer() {
  const store = useAppStore()
  const renderer = createVisualizerRenderer(store)

  return {
    drawFrame: renderer.drawFrame,
    getCanvasDimensions: () => getCanvasDimensions(store),
  }
}
