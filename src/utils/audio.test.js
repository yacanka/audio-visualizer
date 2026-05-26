import { describe, expect, it } from 'vitest'
import { buildWaveformSamples, clamp, normalizeSamples } from './audio.js'

describe('audio utilities', () => {
  it('clamps values to the given range', () => {
    expect(clamp(-1, 0, 1)).toBe(0)
    expect(clamp(2, 0, 1)).toBe(1)
    expect(clamp(0.5, 0, 1)).toBe(0.5)
  })

  it('normalizes silent samples without NaN values', () => {
    expect(normalizeSamples([0, 0, 0])).toEqual([0, 0, 0])
  })

  it('builds normalized waveform samples from PCM data', () => {
    const rawData = Float32Array.from([0, -0.5, 1, -1])
    expect(buildWaveformSamples(rawData, 2)).toEqual([0.25, 1])
  })

  it('returns empty waveform for empty PCM data', () => {
    expect(buildWaveformSamples(new Float32Array(), 10)).toEqual([])
  })
})
