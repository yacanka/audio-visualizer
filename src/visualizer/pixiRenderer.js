import { Application, Container, Sprite } from 'pixi.js'
import { canUsePixiRenderer } from './pixiSupport.js'
import {
  createPixiDisplacementSurface,
  getPixiDisplacementFilters,
  updatePixiDisplacement,
} from './pixiDisplacement.js'

/** Create a PixiJS/WebGL compositor that renders the visualizer source canvas. */
export function createPixiVisualizerRenderer(store, sourceRenderer) {
  const surfaces = new WeakMap()
  const ownedSurfaces = new Set()

  async function prepare(canvas) {
    if (!canUsePixiRenderer(canvas)) return false
    const surface = getOrCreateSurface(canvas, surfaces, ownedSurfaces)
    return surface.ready || surface.promise
  }

  function drawFrame(canvas, getFrequencyData, getTimeData, timestamp) {
    const surface = getReadySurface(canvas, surfaces)
    if (!surface) return false
    renderPixiFrame(surface, store, sourceRenderer, getFrequencyData, getTimeData, timestamp)
    return true
  }

  function dispose() {
    ownedSurfaces.forEach(surface => destroySurface(surface, surfaces))
    ownedSurfaces.clear()
  }

  return { dispose, drawFrame, prepare }
}

function getOrCreateSurface(canvas, surfaces, ownedSurfaces) {
  if (surfaces.has(canvas)) return surfaces.get(canvas)
  const surface = createSurface(canvas)
  surfaces.set(canvas, surface)
  ownedSurfaces.add(surface)
  surface.promise = initializeSurface(surface, canvas)
  return surface
}

function getReadySurface(canvas, surfaces) {
  const surface = surfaces.get(canvas)
  return surface?.ready && !surface.failed ? surface : null
}

function createSurface(canvas) {
  const ownerDocument = canvas.ownerDocument
  return {
    app: new Application(), canvas, content: new Container(), failed: false,
    height: 0, ownerDocument, promise: null, ready: false,
    sourceCanvas: ownerDocument.createElement('canvas'), sourceSprite: null, width: 0,
  }
}

async function initializeSurface(surface, canvas) {
  try {
    await surface.app.init(getPixiOptions(canvas))
    completeSurfaceInitialization(surface)
    return true
  } catch {
    surface.failed = true
    return false
  }
}

function getPixiOptions(canvas) {
  return {
    antialias: true, autoDensity: false, autoStart: false, backgroundAlpha: 1,
    canvas, clearBeforeRender: true, height: canvas.height, preference: 'webgl',
    resolution: 1, width: canvas.width,
  }
}

function completeSurfaceInitialization(surface) {
  surface.sourceSprite = Sprite.from(surface.sourceCanvas, true)
  surface.displacement = createPixiDisplacementSurface(surface.ownerDocument)
  surface.content.addChild(surface.sourceSprite)
  surface.app.stage.addChild(surface.content, surface.displacement.sprite)
  surface.ready = true
}

function renderPixiFrame(surface, store, sourceRenderer, getFrequencyData, getTimeData, timestamp) {
  const readers = createFrameReaders(getFrequencyData, getTimeData)
  const size = resizeSurface(surface)
  sourceRenderer.drawFrame(surface.sourceCanvas, readers.frequency, readers.time, timestamp)
  surface.sourceSprite.texture.source.update()
  updatePixiDisplacement(surface.displacement, store, readers.frequency(), timestamp, size)
  surface.content.filters = getPixiDisplacementFilters(surface.displacement, store)
  surface.app.render()
}

function createFrameReaders(getFrequencyData, getTimeData) {
  let frequencyData = null
  let timeData = null
  return {
    frequency: () => { frequencyData ||= getFrequencyData(); return frequencyData },
    time: () => { timeData ||= getTimeData(); return timeData },
  }
}

function resizeSurface(surface) {
  const size = { w: surface.canvas.width, h: surface.canvas.height }
  if (surface.width === size.w && surface.height === size.h) return size
  surface.width = size.w
  surface.height = size.h
  resizeCanvas(surface.sourceCanvas, size)
  surface.app.renderer.resize(size.w, size.h, 1)
  surface.sourceSprite.texture.source.resize(size.w, size.h, 1)
  surface.sourceSprite.width = size.w
  surface.sourceSprite.height = size.h
  return size
}

function resizeCanvas(canvas, size) {
  canvas.width = size.w
  canvas.height = size.h
}

function destroySurface(surface, surfaces) {
  surface.app.destroy(false, { children: true, texture: true, textureSource: true, context: true })
  surfaces.delete(surface.canvas)
  surface.ready = false
}
