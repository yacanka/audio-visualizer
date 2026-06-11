import { describe, expect, it } from 'vitest'
import { forEachCircularBarAngle, getCircularReflectionSegmentCount } from './circularReflection.js'

const FULL_CIRCLE = Math.PI * 2

function collectAngles(reflection, barCount = 8) {
  const bars = []
  forEachCircularBarAngle(reflection, barCount, (angle, index, ratio) => bars.push({ angle, index, ratio }))
  return bars
}

function normalizeAngle(angle) {
  return ((angle % FULL_CIRCLE) + FULL_CIRCLE) % FULL_CIRCLE
}

describe('circular reflection geometry', () => {
  it('keeps the rendered bar count fixed for every reflection mode', () => {
    const modes = ['none', 'vertical', 'across', '3-way', '4-way']
    for (const mode of modes) expect(collectAngles(mode)).toHaveLength(8)
  })

  it('keeps none mode as one full circle pass', () => {
    const bars = collectAngles('none')
    expect(bars[0].angle).toBeCloseTo(-Math.PI / 2, 8)
    expect(bars.at(-1).angle).toBeCloseTo(-Math.PI / 2 + (7 / 8) * FULL_CIRCLE, 8)
    expect(getCircularReflectionSegmentCount('none')).toBe(1)
  })

  it('mirrors vertical mode across the y axis without adding bars', () => {
    const bars = collectAngles('vertical')
    expect(normalizeAngle(bars[0].angle + bars[4].angle)).toBeCloseTo(normalizeAngle(-Math.PI), 8)
    expect(bars[0].ratio).toBe(bars[4].ratio)
    expect(getCircularReflectionSegmentCount('vertical')).toBe(2)
  })

  it('duplicates across mode with origin symmetry without adding bars', () => {
    const bars = collectAngles('across')
    expect(bars[4].angle - bars[0].angle).toBeCloseTo(Math.PI, 8)
    expect(bars[0].ratio).toBe(bars[4].ratio)
    expect(getCircularReflectionSegmentCount('across')).toBe(2)
  })

  it('splits three-way mode into three 120 degree segments', () => {
    const bars = collectAngles('3-way', 9)
    expect(bars).toHaveLength(9)
    expect(bars[3].angle - bars[0].angle).toBeCloseTo(FULL_CIRCLE / 3, 8)
    expect(bars[6].angle - bars[3].angle).toBeCloseTo(FULL_CIRCLE / 3, 8)
    expect(getCircularReflectionSegmentCount('3-way')).toBe(3)
  })

  it('orders four-way as forward, reverse, forward, reverse around the circle', () => {
    const bars = collectAngles('4-way')
    expect(bars.map(bar => bar.ratio)).toEqual([0.25, 0.75, 0.75, 0.25, 0.25, 0.75, 0.75, 0.25])
    expect(getCircularReflectionSegmentCount('4-way')).toBe(4)
  })
})
