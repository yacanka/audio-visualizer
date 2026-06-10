import { describe, expect, it } from 'vitest'
import { createParticleOptions, getParticleFrameMotion, getParticlePoint } from './particles.js'

const size = { w: 1000, h: 500 }
const element = { id: 'particle-test', count: 80 }

function createOptions(direction, time = 0, overrides = {}) {
  return createParticleOptions(createStore(direction, time, overrides), element, size, 0, overrides.frequencyData)
}

function createOptionsWithTimestamp(direction, timestamp) {
  return createParticleOptions(createStore(direction, 0), element, size, timestamp)
}

function createStore(direction, time, overrides = {}) {
  return {
    currentTime: time,
    particleDirection: direction,
    particleFadeIn: true,
    particleFadeOut: true,
    particleMaxSize: 8,
    particleWander: 0,
    particleMinSize: 3,
    particleReactiveSpeed: false,
    particleAttackSensitivity: 60,
    particleSpeed: 1.2,
    vizSpectrum: 'wide',
    ...overrides,
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

  it('lets artists disable fade in and fade out independently', () => {
    const faded = getParticlePoint(createOptions('right', 0), 2)
    const visible = getParticlePoint(createOptions('right', 0, { particleFadeIn: false, particleFadeOut: false }), 2)
    expect(visible.alpha).toBeGreaterThan(faded.alpha)
  })

  it('adds randomized sideways wander when intensity is configured', () => {
    const straight = getParticlePoint(createOptions('right', 1, { particleWander: 0 }), 2)
    const wandering = getParticlePoint(createOptions('right', 1, { particleWander: 100 }), 2)
    expect(getDistance(straight, wandering)).toBeGreaterThan(1)
  })

  it('increases the reactive frame boost for stronger bass spectrum energy', () => {
    const quiet = createStore('right', 0, { particleReactiveSpeed: true, vizSpectrum: 'bass' })
    const loud = createStore('right', 0, { particleReactiveSpeed: true, vizSpectrum: 'bass' })
    const loudMotion = getParticleFrameMotion(loud, createFrequency(230))
    const quietMotion = getParticleFrameMotion(quiet, createFrequency(12))
    expect(loudMotion.boost).toBeGreaterThan(quietMotion.boost)
  })

  it('adds attack acceleration when audio energy rises quickly', () => {
    const store = createStore('right', 0, { particleReactiveSpeed: true, vizSpectrum: 'bass' })
    const steadyLoud = getParticleFrameMotion(store, createFrequency(230), 230 / 255)
    const loudAttack = getParticleFrameMotion(store, createFrequency(230), 12 / 255)
    const decayedAttack = getParticleFrameMotion(store, createFrequency(230), 230 / 255, loudAttack.impulse)
    expect(loudAttack.boost).toBeGreaterThan(steadyLoud.boost)
    expect(decayedAttack.boost).toBeGreaterThan(steadyLoud.boost)
    expect(decayedAttack.boost).toBeLessThan(loudAttack.boost)
  })

  it('lets artists disable attack acceleration without disabling level boost', () => {
    const store = createStore('right', 0, {
      particleAttackSensitivity: 0,
      particleReactiveSpeed: true,
      vizSpectrum: 'bass',
    })
    const steadyLoud = getParticleFrameMotion(store, createFrequency(230), 230 / 255)
    const loudAttack = getParticleFrameMotion(store, createFrequency(230), 12 / 255)
    expect(loudAttack.boost).toBe(steadyLoud.boost)
  })

  it('keeps reactive particle movement moving forward when audio energy drops', () => {
    const loudFrequency = createFrequency(230)
    const quietFrequency = createFrequency(12)
    const firstTime = 1
    const quietMotion = getParticleFrameMotion(createStore('right', firstTime, {
      particleReactiveSpeed: true,
      vizSpectrum: 'bass',
    }), quietFrequency, 230 / 255)
    const nextTime = firstTime + 0.016 * quietMotion.boost
    const first = getParticlePoint(createOptions('right', firstTime, {
      frequencyData: loudFrequency,
      particleReactiveSpeed: true,
      vizSpectrum: 'bass',
    }), 2)
    const next = getParticlePoint(createOptions('right', nextTime, {
      frequencyData: quietFrequency,
      particleReactiveSpeed: true,
      vizSpectrum: 'bass',
    }), 2)

    expect(next.x).toBeLessThan(first.x)
  })

  it('uses wide spectrum energy when wide mode is selected', () => {
    const data = new Uint8Array(100).fill(0)
    data.fill(240, 50)
    const bass = createStore('right', 0, { particleReactiveSpeed: true, vizSpectrum: 'bass' })
    const wide = createStore('right', 0, { particleReactiveSpeed: true, vizSpectrum: 'wide' })
    expect(getParticleFrameMotion(wide, data).boost).toBeGreaterThan(
      getParticleFrameMotion(bass, data).boost,
    )
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

function createFrequency(value) {
  return new Uint8Array(100).fill(value)
}

function getDistance(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y)
}

function distanceFromCenter(point) {
  return Math.hypot(point.x - size.w / 2, point.y - size.h / 2)
}
