import { describe, expect, it } from 'vitest'
import { getLayerPaint } from './layerPaint.js'

describe('audio-reactive layer paint', () => {
  it('mixes LCH hue across the short arc instead of muddy RGB purple', () => {
    const paint = getLayerPaint({ fillColor: '#ff0000', secondaryFillColor: '#0000ff', colorMix: 'lch',
      fillOpacity: 0, secondaryFillOpacity: 0.8, outlineColor: '#ffffff' }, 0.5)
    expect(paint.fillColor).toBe('rgba(250,0,128,0.4)')
  })
  it('keeps neutral transitions neutral and applies the reference black floor only in LCH mixing', () => {
    const neutral = { fillColor: '#000000', secondaryFillColor: '#ffffff', colorMix: 'lch' }
    expect(getLayerPaint(neutral, 0).fillColor).toBe('rgba(1,1,1,1)')
    expect(getLayerPaint(neutral, 0.5).fillColor).toBe('rgba(119,119,119,1)')
    expect(getLayerPaint(neutral, 1).fillColor).toBe('rgba(255,255,255,1)')
    expect(getLayerPaint({ fillColor: '#000000', colorMix: 'lch' }, 0.5).fillColor).toBe('#000000')
  })
  it('uses LCH independently for outline colors and clamps audio magnitude', () => {
    const paint = { fillColor: '#123456', outlineColor: '#0000ff', secondaryOutlineColor: '#ff0000',
      outlineOpacity: 0.2, secondaryOutlineOpacity: 0.6, colorMix: 'lch' }
    expect(getLayerPaint(paint, 0.5).outlineColor).toBe('rgba(250,0,128,0.4)')
    expect(getLayerPaint(paint, -2).outlineColor).toBe('rgba(0,0,255,0.2)')
    expect(getLayerPaint(paint, 2).outlineColor).toBe('rgba(255,0,0,0.6)')
  })
  // Fixed chroma-js 2.4.2 / D65 reference values, independent of our converter.
  it.each([
    ['#00ff00', '#0000ff', 0.5, '0,186,255'],
    ['#ffffff', '#ff0000', 0.5, '255,158,129'],
    ['#808080', '#00ff00', 0.5, '112,191,93'],
    ['#000000', '#ff0000', 0.25, '64,21,9'],
    ['#00ffff', '#ffff00', 0.75, '183,255,99'],
    ['#ff00ff', '#ff0000', 0.25, '255,0,191'],
  ])('matches reference interpolation from %s to %s at %s', (fillColor, secondaryFillColor, amount, expected) => {
    expect(getLayerPaint({ fillColor, secondaryFillColor, colorMix: 'lch' }, amount).fillColor).toBe(`rgba(${expected},1)`)
  })
  const layer = { fillColor: '#ff0000', outlineColor: '#ffffff', fillOpacity: 0, outlineOpacity: 1 }
  it('retains an opaque outline when the fill is fully transparent', () => {
    expect(getLayerPaint(layer, 1)).toMatchObject({ fillColor: 'rgba(255,0,0,0)', outlineColor: '#ffffff' })
  })
  it('reveals the secondary fill with sound, including presets with a silent transparent fill', () => {
    const reactive = { ...layer, secondaryFillColor: '#0000ff', secondaryFillOpacity: 0.8 }
    expect(getLayerPaint(reactive, 0).fillColor).toBe('rgba(255,0,0,0)')
    expect(getLayerPaint(reactive, 0.5).fillColor).toBe('rgba(128,0,128,0.4)')
    expect(getLayerPaint(reactive, 2).fillColor).toBe('rgba(0,0,255,0.8)')
  })
})
