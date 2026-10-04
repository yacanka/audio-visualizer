import { describe, expect, it } from 'vitest'
import { advanceSpin, advanceLayerSpins, getDriftMotion } from './motion.js'

describe('visualizer motion', () => {
  it('advances only enabled custom layer spins and removes deleted layers', () => {
    const store = { isPlaying: true, visualizerLayers: [
      { id: 'a', customEnabled: true, settings: { visualizerSpin: true, visualizerSpinSpeed: -20, visualizerSpinAcceleration: 10 } },
      { id: 'b', customEnabled: false, settings: { visualizerSpin: true, visualizerSpinSpeed: 40 } },
    ] }
    const angles = advanceLayerSpins(store, { a: 10, deleted: 90 }, 100, 1)
    expect(angles).toEqual({ a: 9, b: 0 })
    store.isPlaying = false
    expect(advanceLayerSpins(store, angles, 100, 1)).toEqual(angles)
  })
  it('uses custom axes, rotation, scale and audio acceleration', () => {
    const store = { drift: true, driftCustom: true, driftX: 20, driftY: 0, driftSpeed: 2, driftRotation: 10, driftScale: 20, driftAcceleration: 100 }
    const quiet = getDriftMotion(store, 1, 0)
    const loud = getDriftMotion(store, 1, 1)
    expect(quiet.x).toBeGreaterThan(0)
    expect(quiet.y).toBe(0)
    expect(loud.x).toBeCloseTo(quiet.x * 2)
    expect(quiet.rotation).toBeGreaterThan(0)
    expect(quiet.scale).toBeGreaterThan(1)
  })
  it('uses independent backdrop settings', () => {
    expect(getDriftMotion({ drift: true, backdropDrift: false }, 1, 1, 'backdrop')).toEqual({ x: 0, y: 0, rotation: 0, scale: 1 })
  })
  it('supports reverse spin and freezes when paused', () => {
    const store = { visualizerSpin: true, visualizerSpinSpeed: -20, visualizerSpinAcceleration: 10, isPlaying: true }
    expect(advanceSpin(store, 0, 100, 0)).toBe(-2)
    expect(advanceSpin(store, 0, 100, 1)).toBe(-1)
    store.isPlaying = false
    expect(advanceSpin(store, 42, 100, 1)).toBe(42)
  })
})
