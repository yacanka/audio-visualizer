import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPixiVisualizerRenderer } from './pixiRenderer.js'

const pixi = vi.hoisted(() => {
  const apps = []
  const filters = []
  const sprites = []

  class Container {
    constructor() {
      this.children = []
      this.filters = null
    }

    addChild(...children) {
      this.children.push(...children)
      return children[0]
    }
  }

  class Application {
    constructor() {
      this.stage = new Container()
      this.renderer = { resize: vi.fn() }
      this.render = vi.fn()
      this.destroy = vi.fn()
      this.init = vi.fn(async options => { this.options = options })
      apps.push(this)
    }
  }

  class Sprite {
    constructor(resource) {
      this.position = { set: vi.fn() }
      this.texture = { source: { resize: vi.fn(), update: vi.fn() } }
      this.resource = resource
      sprites.push(this)
    }

    static from(resource) {
      return new Sprite(resource)
    }
  }

  class DisplacementFilter {
    constructor(options) {
      this.padding = 0
      this.scale = { x: options.scale.x, y: options.scale.y }
      this.sprite = options.sprite
      this.sprite.renderable = false
      filters.push(this)
    }
  }

  return { Application, Container, DisplacementFilter, Sprite, apps, filters, sprites }
})

vi.mock('pixi.js', () => ({
  Application: pixi.Application,
  Container: pixi.Container,
  DisplacementFilter: pixi.DisplacementFilter,
  Sprite: pixi.Sprite,
}))

describe('Pixi visualizer renderer', () => {
  beforeEach(() => {
    pixi.apps.length = 0
    pixi.filters.length = 0
    pixi.sprites.length = 0
    vi.clearAllMocks()
  })

  it('renders the 2D visualizer source through a PixiJS displacement filter', async () => {
    const sourceRenderer = { drawFrame: vi.fn() }
    const renderer = createPixiVisualizerRenderer(createStore(), sourceRenderer)
    const canvas = createTargetCanvas()

    await expect(renderer.prepare(canvas)).resolves.toBe(true)
    expect(pixi.apps[0].options).toMatchObject({ canvas, preference: 'webgl', autoStart: false })

    expect(renderer.drawFrame(canvas, getHotFrequencyData, getTimeData, 1000)).toBe(true)

    expect(sourceRenderer.drawFrame.mock.calls[0][0]).toMatchObject({ width: 640, height: 360 })
    expect(pixi.apps[0].renderer.resize).toHaveBeenCalledWith(640, 360, 1)
    expect(pixi.sprites[0].texture.source.update).toHaveBeenCalled()
    expect(pixi.sprites[1].texture.source.update).toHaveBeenCalled()
    expect(pixi.apps[0].stage.children[0].filters).toEqual([pixi.filters[0]])
    expect(pixi.filters[0].scale.x).toBeGreaterThan(10)
    expect(pixi.apps[0].render).toHaveBeenCalled()
  })

  it('removes the displacement filter when the effect is disabled', async () => {
    const store = { ...createStore(), webglDisplacementEnabled: false }
    const renderer = createPixiVisualizerRenderer(store, { drawFrame: vi.fn() })
    const canvas = createTargetCanvas()

    await renderer.prepare(canvas)
    renderer.drawFrame(canvas, getHotFrequencyData, getTimeData, 1000)

    expect(pixi.apps[0].stage.children[0].filters).toBeNull()
    expect(pixi.filters[0].scale.x).toBe(0)
  })

  it('reports unavailable PixiJS support without touching the target canvas', async () => {
    const renderer = createPixiVisualizerRenderer(createStore(), { drawFrame: vi.fn() })
    const canvas = createTargetCanvas(false)

    await expect(renderer.prepare(canvas)).resolves.toBe(false)

    expect(renderer.drawFrame(canvas, getHotFrequencyData, getTimeData, 1000)).toBe(false)
    expect(pixi.apps).toHaveLength(0)
  })

  it('disposes PixiJS resources without removing the preview canvas', async () => {
    const renderer = createPixiVisualizerRenderer(createStore(), { drawFrame: vi.fn() })

    await renderer.prepare(createTargetCanvas())
    renderer.dispose()

    expect(pixi.apps[0].destroy).toHaveBeenCalledWith(false, {
      children: true, context: true, texture: true, textureSource: true,
    })
  })
})

function createStore() {
  return { isPlaying: true, webglDisplacementEnabled: true, webglDisplacementIntensity: 10 }
}

function createTargetCanvas(webglSupported = true) {
  const ownerDocument = createOwnerDocument(webglSupported)
  return { height: 360, ownerDocument, width: 640 }
}

function createOwnerDocument(webglSupported) {
  return { createElement: vi.fn(() => createCanvasElement(webglSupported)) }
}

function createCanvasElement(webglSupported) {
  return {
    getContext: vi.fn(type => getCanvasContext(type, webglSupported)),
    height: 0,
    width: 0,
  }
}

function getCanvasContext(type, webglSupported) {
  if (type.startsWith('webgl')) return webglSupported ? {} : null
  if (type === '2d') return createImageContext()
  return null
}

function createImageContext() {
  return {
    createImageData: (width, height) => ({ data: new Uint8ClampedArray(width * height * 4) }),
    putImageData: vi.fn(),
  }
}

function getHotFrequencyData() {
  return new Uint8Array(32).fill(255)
}

function getTimeData() {
  return new Uint8Array(32).fill(128)
}
