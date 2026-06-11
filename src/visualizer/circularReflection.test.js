import { describe, expect, it } from 'vitest'
import { forEachCircularBarAngle, getCircularReflectionMultiplier } from './circularReflection.js'

const FULL_CIRCLE = Math.PI * 2

function collectAngles(reflection, barCount = 4) {
  const bars = []
  forEachCircularBarAngle(reflection, barCount, (angle, index, ratio) => bars.push({ angle, index, ratio }))
  return bars
}

function normalizeAngle(angle) {
  return ((angle % FULL_CIRCLE) + FULL_CIRCLE) % FULL_CIRCLE
}

function expectMirroredAcrossAxis(first, second, axisAngle) {
  expect(normalizeAngle(first.angle + second.angle)).toBeCloseTo(normalizeAngle(axisAngle * 2), 8)
  expect(first.index).toBe(second.index)
  expect(first.ratio).toBe(second.ratio)
}

describe('circular reflection geometry', () => {
  it('keeps none mode as one full circle pass', () => {
    const bars = collectAngles('none')
    expect(bars).toHaveLength(4)
    expect(bars[0].angle).toBeCloseTo(-Math.PI / 2, 8)
    expect(bars.at(-1).angle).toBeCloseTo(Math.PI, 8)
    expect(getCircularReflectionMultiplier('none')).toBe(1)
  })

  it('mirrors vertical mode across the y axis', () => {
    const bars = collectAngles('vertical')
    expect(bars).toHaveLength(8)
    expectMirroredAcrossAxis(bars[0], bars[1], -Math.PI / 2)
    expect(getCircularReflectionMultiplier('vertical')).toBe(2)
  })

  it('mirrors across mode on a 45 degree axis', () => {
    const bars = collectAngles('across')
    expect(bars).toHaveLength(8)
    expectMirroredAcrossAxis(bars[0], bars[1], Math.PI / 4)
    expect(getCircularReflectionMultiplier('across')).toBe(2)
  })

  it('repeats circular bars in three 120 degree phases', () => {
    const firstSourceBars = collectAngles('3-way').filter(bar => bar.index === 0)
    expect(firstSourceBars).toHaveLength(3)
    expect(firstSourceBars[1].angle - firstSourceBars[0].angle).toBeCloseTo(FULL_CIRCLE / 3, 8)
    expect(firstSourceBars[2].angle - firstSourceBars[1].angle).toBeCloseTo(FULL_CIRCLE / 3, 8)
    expect(getCircularReflectionMultiplier('3-way')).toBe(3)
  })

  it('repeats circular bars in four 90 degree phases', () => {
    const firstSourceBars = collectAngles('4-way').filter(bar => bar.index === 0)
    expect(firstSourceBars).toHaveLength(4)
    expect(firstSourceBars[1].angle - firstSourceBars[0].angle).toBeCloseTo(FULL_CIRCLE / 4, 8)
    expect(firstSourceBars[3].angle - firstSourceBars[2].angle).toBeCloseTo(FULL_CIRCLE / 4, 8)
    expect(getCircularReflectionMultiplier('4-way')).toBe(4)
  })
})
