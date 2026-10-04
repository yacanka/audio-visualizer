import { describe, expect, it } from 'vitest'
import { createWaveDelay } from './waveDelay.js'

const spectrum = value => new Uint8Array(32).fill(value)
function createStore() { return { waveDelay: true, isPlaying: true, currentTime: 0, audioFile: {}, visualizerLayers: [{}, {}, {}] } }

describe('wave layer delay', () => {
  it('trails the front layer using earlier audio samples without retaining mutable analyser buffers', () => {
    const store = createStore(), sample = createWaveDelay(), first = spectrum(20)
    sample(store, first, 0)
    first.fill(255)
    store.currentTime = 0.05
    sample(store, spectrum(100), 50)
    store.currentTime = 0.1
    const result = sample(store, spectrum(200), 100)
    expect(result.map(data => data[0])).toEqual([200, 100, 20])
  })
  it('clears old audio on a seek and source replacement', () => {
    const store = createStore(), sample = createWaveDelay()
    sample(store, spectrum(10), 0)
    store.currentTime = 0.2
    sample(store, spectrum(200), 200)
    store.currentTime = 0
    expect(sample(store, spectrum(50), 300).map(data => data[0])).toEqual([50, 50, 50])
    store.audioFile = {}
    expect(sample(store, spectrum(80), 400).map(data => data[0])).toEqual([80, 80, 80])
  })
  it('uses current data for every layer when disabled', () => {
    const store = createStore(), sample = createWaveDelay()
    sample(store, spectrum(10), 0)
    store.waveDelay = false
    expect(sample(store, spectrum(80), 200).map(data => data[0])).toEqual([80, 80, 80])
  })
})
