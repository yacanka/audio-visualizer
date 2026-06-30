import { createCanvasVisualizerRenderer } from './canvasRenderer.js'
import { createPixiVisualizerRenderer } from './pixiRenderer.js'

/** Create the visualizer renderer, preferring PixiJS/WebGL with a 2D fallback. */
export function createVisualizerRenderer(store) {
  const canvasRenderer = createCanvasVisualizerRenderer(store)
  const pixiRenderer = createPixiVisualizerRenderer(store, canvasRenderer)

  async function prepare(canvas) {
    return pixiRenderer.prepare(canvas)
  }

  function drawFrame(canvas, getFrequencyData, getTimeData, timestamp) {
    if (pixiRenderer.drawFrame(canvas, getFrequencyData, getTimeData, timestamp)) return
    canvasRenderer.drawFrame(canvas, getFrequencyData, getTimeData, timestamp)
  }

  function dispose() {
    pixiRenderer.dispose()
  }

  return { dispose, drawFrame, prepare }
}
