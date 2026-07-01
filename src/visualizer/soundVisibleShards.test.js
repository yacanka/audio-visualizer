import { describe, expect, it, vi } from 'vitest'
import { drawSoundVisibleShards } from './soundVisibleShards.js'

describe('SoundVisible shards', () => {
  it('emits shards from the x positions of high-energy spectrum peaks', () => {
    const leftContext = createContext()
    const rightContext = createContext()

    drawSoundVisibleShards(leftContext, createMagnitudes(2), createMetrics(), getLineHeight, createState(), 16)
    drawSoundVisibleShards(rightContext, createMagnitudes(14), createMetrics(), getLineHeight, createState(), 16)

    expect(getAverageTranslateX(rightContext)).toBeGreaterThan(getAverageTranslateX(leftContext))
  })

  it('moves shards outward from the visualizer line over their lifetime', () => {
    const earlyContext = createContext()
    const laterContext = createContext()
    const state = createState()

    drawSoundVisibleShards(earlyContext, createMagnitudes(0), { ...createMetrics(), shardCount: 1 }, getLineHeight, state, 16)
    drawSoundVisibleShards(laterContext, createMagnitudes(0), { ...createMetrics(), shardCount: 1 }, getLineHeight, state, 1000)

    expect(getFirstTranslateY(laterContext)).toBeLessThan(getFirstTranslateY(earlyContext))
  })

  it('keeps shards moving away from both sides of the visualizer line', () => {
    const earlyContext = createContext()
    const laterContext = createContext()
    const state = createState()

    drawSoundVisibleShards(earlyContext, createMagnitudes(8), createMetrics(), getLineHeight, state, 16)
    const upperIndex = state.particles.findIndex(particle => particle.side < 0)
    const lowerIndex = state.particles.findIndex(particle => particle.side > 0)
    drawSoundVisibleShards(laterContext, createMagnitudes(8), createMetrics(), getLineHeight, state, 1000)

    expect(getTranslateY(laterContext, upperIndex)).toBeLessThan(getTranslateY(earlyContext, upperIndex))
    expect(getTranslateY(laterContext, lowerIndex)).toBeGreaterThan(getTranslateY(earlyContext, lowerIndex))
  })

  it('uses wind direction to push shards sideways', () => {
    const neutralContext = createContext()
    const windyContext = createContext()

    drawSoundVisibleShards(neutralContext, createMagnitudes(8), createMetrics(), getLineHeight, createState(), 1000)
    drawSoundVisibleShards(windyContext, createMagnitudes(8), { ...createMetrics(), shardWindDirection: 90 }, getLineHeight, createState(), 1000)

    expect(getAverageTranslateX(windyContext)).toBeGreaterThan(getAverageTranslateX(neutralContext))
  })

  it('uses turbulence to increase organic horizontal spread', () => {
    const calmContext = createContext()
    const turbulentContext = createContext()

    drawSoundVisibleShards(calmContext, createMagnitudes(8), { ...createMetrics(), shardCount: 1, shardTurbulence: 0 }, getLineHeight, createState(), 1000)
    drawSoundVisibleShards(turbulentContext, createMagnitudes(8), { ...createMetrics(), shardCount: 1, shardTurbulence: 100 }, getLineHeight, createState(), 1000)

    expect(getFirstTranslateX(turbulentContext)).not.toBeCloseTo(getFirstTranslateX(calmContext))
  })

  it('uses fade distance to carry shards farther toward the screen edge', () => {
    const shortContext = createContext()
    const longContext = createContext()

    drawSoundVisibleShards(shortContext, createMagnitudes(0), { ...createMetrics(), shardCount: 1, shardFadeDistance: 40 }, getLineHeight, createState(), 1000)
    drawSoundVisibleShards(longContext, createMagnitudes(0), { ...createMetrics(), shardCount: 1, shardFadeDistance: 180 }, getLineHeight, createState(), 1000)

    expect(getFirstTranslateY(longContext)).toBeLessThan(getFirstTranslateY(shortContext))
  })

  it('continues with its initial velocity after spectrum energy drops', () => {
    const state = createState()
    const firstContext = createContext()
    const secondContext = createContext()

    drawSoundVisibleShards(firstContext, createMagnitudes(0), { ...createMetrics(), shardCount: 1 }, getLineHeight, state, 16)
    drawSoundVisibleShards(secondContext, createMagnitudes(15, 0), { ...createMetrics(), shardCount: 1 }, getLineHeight, state, 1000)

    expect(getFirstTranslateY(secondContext)).toBeLessThan(getFirstTranslateY(firstContext))
    expect(state.particles[0].energy).toBe(1)
  })
})

function createMagnitudes(peakIndex, peakValue = 1) {
  return Array.from({ length: 16 }, (_, index) => index === peakIndex ? peakValue : 0.05)
}

function createMetrics() {
  return {
    canvasHeight: 720, centerY: 360, colorA: '#f6c453', colorB: '#fff4b8', height: 160,
    shardCount: 6, shardFadeDistance: 100, shardSize: 20, shardTurbulence: 45,
    shardWindDirection: 0, startX: 100, time: 3, width: 1000,
  }
}

function getLineHeight(energy) {
  return 12 + energy * 100
}

function getAverageTranslateX(context) {
  const calls = context.translate.mock.calls
  return calls.reduce((total, [x]) => total + x, 0) / calls.length
}

function getFirstTranslateY(context) {
  return context.translate.mock.calls[0][1]
}

function getFirstTranslateX(context) {
  return context.translate.mock.calls[0][0]
}

function getTranslateY(context, index) {
  return context.translate.mock.calls[index][1]
}

function createState() {
  return { particles: [] }
}

function createContext() {
  return {
    beginPath: vi.fn(), closePath: vi.fn(), fill: vi.fn(), lineTo: vi.fn(),
    moveTo: vi.fn(), restore: vi.fn(), rotate: vi.fn(), save: vi.fn(),
    stroke: vi.fn(), translate: vi.fn(),
  }
}
