const FULL_CIRCLE = Math.PI * 2
const HALF_PI = Math.PI / 2

const PHASED_REFLECTIONS = {
  none: { copies: 1, span: FULL_CIRCLE },
  '3-way': { copies: 3, span: FULL_CIRCLE / 3 },
  '4-way': { copies: 4, span: FULL_CIRCLE / 4 },
}

const MIRRORED_REFLECTIONS = {
  vertical: -HALF_PI,
  across: Math.PI / 4,
}

/** Visit each rendered circular bar angle for the requested reflection mode. */
export function forEachCircularBarAngle(reflection, barCount, visitAngle) {
  const safeBarCount = getSafeBarCount(barCount)
  if (reflection in MIRRORED_REFLECTIONS) {
    visitMirroredAngles(MIRRORED_REFLECTIONS[reflection], safeBarCount, visitAngle)
    return
  }
  visitPhasedAngles(getPhasedLayout(reflection), safeBarCount, visitAngle)
}

/** Return how many angular copies a circular reflection mode renders. */
export function getCircularReflectionMultiplier(reflection) {
  if (reflection in MIRRORED_REFLECTIONS) return 2
  return getPhasedLayout(reflection).copies
}

function getSafeBarCount(barCount) {
  return Math.max(1, Math.floor(Number(barCount) || 1))
}

function getPhasedLayout(reflection) {
  return PHASED_REFLECTIONS[reflection] || PHASED_REFLECTIONS.none
}

function visitPhasedAngles(layout, barCount, visitAngle) {
  for (let index = 0; index < barCount; index++) {
    visitPhaseCopies(layout, barCount, index, visitAngle)
  }
}

function visitPhaseCopies(layout, barCount, index, visitAngle) {
  const ratio = getSourceRatio(layout, barCount, index)
  const angle = -HALF_PI + ratio * layout.span
  for (let copy = 0; copy < layout.copies; copy++) {
    visitAngle(angle + copy * layout.span, index, ratio)
  }
}

function getSourceRatio(layout, barCount, index) {
  if (layout.copies === 1) return index / barCount
  return (index + 0.5) / barCount
}

function visitMirroredAngles(axisAngle, barCount, visitAngle) {
  for (let index = 0; index < barCount; index++) {
    visitMirroredPair(axisAngle, barCount, index, visitAngle)
  }
}

function visitMirroredPair(axisAngle, barCount, index, visitAngle) {
  const ratio = (index + 0.5) / barCount
  const angle = axisAngle + ratio * Math.PI
  visitAngle(angle, index, ratio)
  visitAngle(axisAngle * 2 - angle, index, ratio)
}
