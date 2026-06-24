import { describe, expect, it } from 'vitest'
import { createParticleOpacityOptions, getParticleAlpha } from './particleOpacity.js'

describe('particle opacity', () => {
  it('fades particles as they approach their exit edge', () => {
    const options = createOptions('right')

    const centerAlpha = getParticleAlpha({ x: 50, y: 50 }, 0.5, options, 0.8)
    const edgeAlpha = getParticleAlpha({ x: 5, y: 50 }, 0.5, options, 0.8)

    expect(edgeAlpha).toBeLessThan(centerAlpha)
    expect(edgeAlpha).toBeCloseTo(0.8 * (5 / 18))
  })

  it('uses safe defaults for projects without opacity settings', () => {
    expect(createParticleOpacityOptions({})).toEqual({ minOpacity: 0.35, maxOpacity: 0.85 })
  })
})

function createOptions(direction) {
  return { direction, fadeIn: false, fadeOut: true, w: 100, h: 100 }
}
