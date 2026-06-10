import { describe, expect, it } from 'vitest'
import { createParticleOptions, getParticlePoint } from './particles.js'

const size = { w: 1000, h: 500 }
const element = { id: 'particle-test', count: 80 }

function createOptions(direction, time = 0) {
  return createParticleOptions(createStore(direction, time), element, size)
}

function createOptionsWithTimestamp(direction, timestamp) {
  return createParticleOptions(createStore(direction, 0), element, size, timestamp)
}

function createStore(direction, time) {
  return {
    currentTime: time,
    particleDirection: direction,
    particleMaxSize: 8,
    particleMinSize: 3,
    particleReactiveSpeed: false,
    particleSpeed: 1.2,
  }
}

describe('particles', () => {
  it('covers the full canvas width in horizontal edge modes', () => {
    expect(getBounds(createOptions('right')).minX).toBeLessThan(size.w * 0.05)
    expect(getBounds(createOptions('right')).maxX).toBeGreaterThan(size.w * 0.95)
    expect(getBounds(createOptions('left')).minX).toBeLessThan(size.w * 0.05)
    expect(getBounds(createOptions('left')).maxX).toBeGreaterThan(size.w * 0.95)
  })

  it('covers the full canvas height in vertical edge modes', () => {
    expect(getBounds(createOptions('up')).minY).toBeLessThan(size.h * 0.05)
    expect(getBounds(createOptions('up')).maxY).toBeGreaterThan(size.h * 0.95)
    expect(getBounds(createOptions('down')).minY).toBeLessThan(size.h * 0.05)
    expect(getBounds(createOptions('down')).maxY).toBeGreaterThan(size.h * 0.95)
  })

  it('uses frame timestamps for smooth per-frame movement', () => {
    const first = getParticlePoint(createOptionsWithTimestamp('right', 1000), 2)
    const next = getParticlePoint(createOptionsWithTimestamp('right', 1016), 2)
    expect(getDistance(first, next)).toBeGreaterThan(0)
    expect(getDistance(first, next)).toBeLessThan(20)
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

function getBounds(options) {
  const points = Array.from({ length: options.count }, (_, index) => getParticlePoint(options, index))
  return {
    minX: Math.min(...points.map(point => point.x)),
    maxX: Math.max(...points.map(point => point.x)),
    minY: Math.min(...points.map(point => point.y)),
    maxY: Math.max(...points.map(point => point.y)),
  }
}

function getDistance(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y)
}

function distanceFromCenter(point) {
  return Math.hypot(point.x - size.w / 2, point.y - size.h / 2)
}
