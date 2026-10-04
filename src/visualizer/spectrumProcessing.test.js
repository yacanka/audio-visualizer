import { describe, expect, it } from 'vitest'
import { createSpectrumMagnitudes } from './spectrumProcessing.js'

const baseLayout = { peakShiftPasses: 0, smoothingPasses: 4 }

describe('spectrum processing', () => {
  it('linearly resamples analyser bins to the requested point count', () => {
    const store = createStore({ vizSmooth: false })
    const magnitudes = createSpectrumMagnitudes(store, createRamp(), 20, baseLayout)

    expect(magnitudes).toHaveLength(20)
    expect(new Set(magnitudes).size).toBeGreaterThan(6)
  })

  it('rounds isolated peaks with repeated smoothing passes', () => {
    const data = new Uint8Array([0, 0, 0, 255, 0, 0, 0, 0])
    const raw = createSpectrumMagnitudes(createStore({ vizSmooth: false }), data, 12, baseLayout)
    const smooth = createSpectrumMagnitudes(createStore(), data, 12, baseLayout)

    expect(Math.max(...smooth)).toBeLessThan(Math.max(...raw))
    expect(smooth.filter(value => value > 0).length).toBeGreaterThan(raw.filter(value => value > 0).length)
  })

  it('widens peaks for rear Web and Combo layers', () => {
    const data = new Uint8Array([0, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0])
    const narrow = createSpectrumMagnitudes(createStore({ vizSmooth: false }), data, 10, baseLayout)
    const wideLayout = { ...baseLayout, peakShiftPasses: 4 }
    const wide = createSpectrumMagnitudes(createStore({ vizSmooth: false }), data, 10, wideLayout)

    expect(wide.filter(value => value > 0.1).length).toBeGreaterThan(narrow.filter(value => value > 0.1).length)
  })

  it('wraps smoothing around a complete circular spectrum', () => {
    const data = new Uint8Array([0, 0, 0, 0, 0, 255, 0, 0])
    const flat = createSpectrumMagnitudes(createStore(), data, 6, baseLayout, false)
    const circular = createSpectrumMagnitudes(createStore(), data, 6, baseLayout, true)

    expect(circular[0]).toBeGreaterThan(flat[0])
  })
  it('inverts the selected bass band without replacing it with silent treble bins', () => {
    const data = new Uint8Array([255, 128, 0, 0, 0, 0, 0, 0])
    const store = createStore({ vizSmooth: false, vizSpectrum: 'bass' })
    const original = createSpectrumMagnitudes(store, data, 4, baseLayout)
    const inverted = createSpectrumMagnitudes({ ...store, vizInvert: true }, data, 4, baseLayout)
    expect(inverted).toEqual([...original].reverse())
    expect(Math.max(...inverted)).toBe(1)
  })
})

function createStore(overrides = {}) {
  return { sensitivity: 1, vizSmooth: true, vizSpectrum: 'wide', ...overrides }
}

function createRamp() {
  return new Uint8Array([0, 40, 80, 120, 160, 200, 240, 255])
}
