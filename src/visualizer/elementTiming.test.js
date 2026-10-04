import { describe, expect, it } from 'vitest'
import { getElementTiming } from './elementTiming.js'
describe('element timing', () => {
  it('preserves the always-visible behavior of old elements', () => {
    expect(getElementTiming({}, 0)).toEqual({ visible: true, opacity: 1, scale: 1 })
    expect(getElementTiming({}, 999).visible).toBe(true)
  })
  it('hides clips outside their audio interval', () => {
    const clip = { startTime: 2, endTime: 4 }
    expect(getElementTiming(clip, 1).visible).toBe(false)
    expect(getElementTiming(clip, 3).visible).toBe(true)
    expect(getElementTiming(clip, 4).visible).toBe(false)
  })
  it('animates both entry and exit without going beyond the clip', () => {
    const clip = { startTime: 2, endTime: 4, animation: 'pop' }
    expect(getElementTiming(clip, 2).opacity).toBe(0)
    expect(getElementTiming(clip, 2.2).scale).toBeCloseTo(0.875)
    expect(getElementTiming(clip, 3).scale).toBe(1)
    expect(getElementTiming(clip, 3.8).opacity).toBeCloseTo(0.5)
  })
})
