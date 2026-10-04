import { describe, expect, it } from 'vitest'
import { parseProject } from './project.js'
const defaults = { barCount: 80, titleText: '', visualizerLayers: [], elements: [], visualizerImageSrc: '', visualizerRumble: 0 }
const file = settings => JSON.stringify({ app: 'audio-spectrum-visualizer', version: 1, settings })
describe('project import', () => {
  it('round trips LCH and rejects invalid color interpolation modes', () => {
    const snapshot = { visualizerLayers: [{ id: 'layer-1', colorMix: 'lch' }] }
    expect(parseProject(file(snapshot), defaults)).toEqual(snapshot)
    expect(() => parseProject(file({ visualizerLayers: [{ id: 'layer-1', colorMix: 'unknown' }] }), defaults)).toThrow()
  })
  it('round trips custom layer movement and spin in version 1', () => {
    const settings = { visualizerMovement: 'inward', visualizerHollowCenter: false,
      visualizerSpin: true, visualizerSpinSpeed: -40, visualizerSpinAcceleration: 60 }
    const snapshot = { visualizerLayers: [{ id: 'layer-1', customEnabled: true, settings }] }
    expect(parseProject(file(snapshot), defaults)).toEqual(snapshot)
    expect(() => parseProject(file({ visualizerLayers: [{ id: 'layer-1', settings: { visualizerSpin: 'yes' } }] }), defaults)).toThrow()
  })
  it('rejects a foreign format and invalid settings without applying a partial project', () => {
    expect(() => parseProject('{"version":2}', defaults)).toThrow()
    expect(() => parseProject(file({ barCount: 'lots' }), defaults)).toThrow()
  })
  it('ignores unknown top-level properties and bounds expensive rendering controls', () => {
    expect(parseProject(file({ barCount: 100000, unknown: 'ignored' }), defaults)).toEqual({ barCount: 200 })
  })
  it('rejects remote image sources and malformed custom layers', () => {
    expect(() => parseProject(file({ visualizerImageSrc: 'https://example.com/image.png' }), defaults)).toThrow()
    expect(() => parseProject(file({ visualizerImageSrc: '/\\example.com/image.png' }), defaults)).toThrow()
    expect(() => parseProject(file({ visualizerImageSrc: '/\n/example.com/image.png' }), defaults)).toThrow()
    expect(() => parseProject(file({ visualizerLayers: [{ id: 'layer-1', settings: { barCount: 'bad' } }] }), defaults)).toThrow()
    expect(() => parseProject(file({ visualizerLayers: [{ id: 'layer-1', settings: { constructor: {} } }] }), defaults)).toThrow()
  })
  it('accepts local images and legacy rumble values', () => {
    expect(parseProject(file({ visualizerImageSrc: '/presets/spectraviz-logo.svg', visualizerRumble: 'medium' }), defaults))
      .toEqual({ visualizerImageSrc: '/presets/spectraviz-logo.svg', visualizerRumble: 50 })
  })
})
