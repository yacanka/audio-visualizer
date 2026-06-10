import { describe, expect, it } from 'vitest'
import { createParticleOptions, getParticlePoint } from './particles.js'

const size = { w: 1000, h: 500 }
const element = { id: 'particle-test', count: 20 }

function createOptions(direction, time = 0) {
  return createParticleOptions(createStore(direction, time), element, size)
}

function createStore(direction, time) {
  return {
    currentTime: time,
    particleDirection: direction,
    particleMaxSize: 8,
    particleMinSize: 3,
    particleReactiveSpeed: false,
    particleSpeed: 1,
  }
}

describe('particles', () => {
  it('spawns right-direction particles from the right boundary', () => {
    const point = getParticlePoint(createOptions('right'), 1)
    expect(point.x).toBeGreaterThan(size.w * 0.75)
  })

  it('spawns left-direction particles from the left boundary', () => {
    const point = getParticlePoint(createOptions('left'), 1)
    expect(point.x).toBeLessThan(size.w * 0.25)
  })

  it('moves center particles outward over time', () => {
    const start = getParticlePoint(createOptions('out', 0), 2)
    const later = getParticlePoint(createOptions('out', 2), 2)
    expect(distanceFromCenter(later)).toBeGreaterThan(distanceFromCenter(start))
  })

  it('keeps random particle radius inside configured bounds', () => {
    const point = getParticlePoint(createOptions('up'), 3)
    expect(point.radius).toBeGreaterThanOrEqual(3)
    expect(point.radius).toBeLessThanOrEqual(8)
  })
})

function distanceFromCenter(point) {
  return Math.hypot(point.x - size.w / 2, point.y - size.h / 2)
}
