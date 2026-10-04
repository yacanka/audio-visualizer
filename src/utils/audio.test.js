import { describe, expect, it } from 'vitest'
import { applySpectrumOptions, buildWaveformSamples, clamp, getAudioPeak, normalizeSamples } from './audio.js'

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

  it('measures the loudest channel for track-wide normalization', () => {
    const channels = [[0, 0.2], [-0.9, 0.1]]
    expect(getAudioPeak({ numberOfChannels: 2, getChannelData: index => channels[index] })).toBe(0.9)
  })

  it('normalizes quiet tracks without creating sound in silent bins or overflowing', () => {
    const input = Uint8Array.from([0, 100, 250])
    const output = applySpectrumOptions(input, { normalize: true, bassBoost: false, peak: 0.1, binHertz: 100, decibelRange: 70 })
    expect([...output]).toEqual([0, 144, 255])
    expect([...input]).toEqual([0, 100, 250])
    expect([...applySpectrumOptions(input, { normalize: true, peak: 0, decibelRange: 70 })]).toEqual([...input])
  })

  it('boosts bass progressively less toward higher frequencies and supports bypass', () => {
    const input = Uint8Array.from([100, 100, 100])
    const output = applySpectrumOptions(input, { normalize: false, bassBoost: true, binHertz: 250, decibelRange: 70 })
    expect(output[0]).toBeGreaterThan(output[1])
    expect(output[1]).toBeGreaterThan(output[2])
    expect(output[2]).toBeGreaterThan(100)
    expect(applySpectrumOptions(input, { normalize: false, bassBoost: false })).toBe(input)
  })
})
