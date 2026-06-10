import { describe, expect, it } from 'vitest'
import { getCanvasDimensions } from './dimensions.js'

describe('visualizer dimensions', () => {
  it('uses 16:9 dimensions for selected quality', () => {
    expect(getCanvasDimensions({ aspectRatio: '16:9', previewQuality: 720 })).toEqual({ w: 1280, h: 720 })
  })

  it('supports full HD export dimensions', () => {
    expect(getCanvasDimensions({ aspectRatio: '9:16', previewQuality: 1080 })).toEqual({ w: 1080, h: 1920 })
  })

  it('falls back to 480p when quality is unknown', () => {
    expect(getCanvasDimensions({ aspectRatio: '1:1', previewQuality: 999 })).toEqual({ w: 480, h: 480 })
  })

  it('falls back to landscape for unknown aspect ratio', () => {
    expect(getCanvasDimensions({ aspectRatio: '4:3', previewQuality: 360 })).toEqual({ w: 640, h: 360 })
  })
})
