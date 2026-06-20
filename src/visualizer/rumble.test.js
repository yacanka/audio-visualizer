import { describe, expect, it } from 'vitest'
import { getVisualizerRumbleMotion } from './rumble.js'

const loudMotion = { energy: 0.9, impulse: 0.35 }

function createStore(overrides = {}) {
  return {
    isPlaying: true,
    previewAudioAnalysisEnabled: true,
    visualizerBounce: 20,
    visualizerRumble: 50,
    ...overrides,
  }
}

describe('visualizer rumble', () => {
  it('keeps the original size when rumble or analysis is disabled', () => {
    const noRumble = createStore({ visualizerRumble: 0 })
    const noAnalysis = createStore({ previewAudioAnalysisEnabled: false })
    expect(getFrame(noRumble, loudMotion).scale).toBe(1)
    expect(getFrame(noAnalysis, loudMotion).scale).toBe(1)
  })

  it('rises smoothly without periodic vibration', () => {
    const scales = getFrames(createStore(), loudMotion, 8).map(frame => frame.scale)
    expect(scales[0]).toBeGreaterThan(1)
    expect(scales.every((scale, index) => index === 0 || scale > scales[index - 1])).toBe(true)
  })

  it('releases gradually after an audio hit', () => {
    const peak = getFrames(createStore(), loudMotion, 8).at(-1)
    const released = getFrame(createStore(), { energy: 0, impulse: 0 }, peak.envelope)
    expect(released.scale).toBeLessThan(peak.scale)
    expect(released.scale).toBeGreaterThan(1)
  })

  it('gives sudden attacks more movement than steady audio', () => {
    const attack = getFrame(createStore(), { energy: 0.45, impulse: 0.35 })
    const steady = getFrame(createStore(), { energy: 0.45, impulse: 0 })
    expect(attack.scale).toBeGreaterThan(steady.scale)
  })

  it('uses bounce to control the maximum size increase', () => {
    const lowBounce = getFrames(createStore({ visualizerBounce: 20 }), loudMotion, 20).at(-1)
    const highBounce = getFrames(createStore({ visualizerBounce: 100 }), loudMotion, 20).at(-1)
    expect(highBounce.scale - 1).toBeCloseTo((lowBounce.scale - 1) * 5)
  })

  it('supports legacy project rumble names', () => {
    const legacy = getFrame(createStore({ visualizerRumble: 'medium' }), loudMotion)
    const numeric = getFrame(createStore({ visualizerRumble: 50 }), loudMotion)
    expect(legacy.scale).toBeCloseTo(numeric.scale)
  })
})

function getFrame(store, audioMotion, previousEnvelope = 0) {
  return getVisualizerRumbleMotion(store, audioMotion, previousEnvelope, 16)
}

function getFrames(store, audioMotion, count) {
  const frames = []
  for (let index = 0; index < count; index++) {
    frames.push(getFrame(store, audioMotion, frames.at(-1)?.envelope))
  }
  return frames
}
