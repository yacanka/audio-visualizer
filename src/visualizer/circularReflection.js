const FULL_CIRCLE = Math.PI * 2
const HALF_PI = Math.PI / 2

const SEGMENTED_REFLECTIONS = {
  none: 1,
  across: 2,
  '3-way': 3,
  '4-way': 4,
}

const MIRRORED_REFLECTIONS = {
  vertical: -HALF_PI,
}

/** Visit exactly barCount rendered circular bar angles for the requested reflection mode. */
export function forEachCircularBarAngle(reflection, barCount, visitAngle) {
  const safeBarCount = getSafeBarCount(barCount)
  if (reflection in MIRRORED_REFLECTIONS) {
    visitMirroredAngles(MIRRORED_REFLECTIONS[reflection], safeBarCount, visitAngle)
    return
  }
  visitSegmentedAngles(getSegmentCount(reflection), safeBarCount, visitAngle)
}

/** Return how many symmetry segments a circular reflection mode uses. */
export function getCircularReflectionSegmentCount(reflection) {
  if (reflection in MIRRORED_REFLECTIONS) return 2
  return getSegmentCount(reflection)
}

function getSafeBarCount(barCount) {
  return Math.max(1, Math.floor(Number(barCount) || 1))
}

function getSegmentCount(reflection) {
  return SEGMENTED_REFLECTIONS[reflection] || SEGMENTED_REFLECTIONS.none
}

function visitSegmentedAngles(segmentCount, barCount, visitAngle) {
  for (let outputIndex = 0; outputIndex < barCount; outputIndex++) {
    visitSegmentedAngle(segmentCount, barCount, outputIndex, visitAngle)
  }
}

function visitSegmentedAngle(segmentCount, barCount, outputIndex, visitAngle) {
  const segment = getSegmentInfo(segmentCount, barCount, outputIndex)
  const ratio = getSegmentedSourceRatio(segment, segmentCount, outputIndex, barCount)
  const angle = -HALF_PI + getOutputRatio(outputIndex, barCount) * FULL_CIRCLE
  visitAngle(angle, getSourceIndex(ratio, barCount), ratio)
}

function getSegmentedSourceRatio(segment, segmentCount, outputIndex, barCount) {
  if (segmentCount === 1) return getOutputRatio(outputIndex, barCount)
  return getSegmentRatio(segment, segmentCount)
}

function getSegmentRatio(segment, segmentCount) {
  const ratio = (segment.localIndex + 0.5) / segment.count
  if (segmentCount === 4 && segment.index % 2 === 1) return 1 - ratio
  return ratio
}

function visitMirroredAngles(axisAngle, barCount, visitAngle) {
  for (let outputIndex = 0; outputIndex < barCount; outputIndex++) {
    visitMirroredAngle(axisAngle, barCount, outputIndex, visitAngle)
  }
}

function visitMirroredAngle(axisAngle, barCount, outputIndex, visitAngle) {
  const segment = getSegmentInfo(2, barCount, outputIndex)
  const ratio = (segment.localIndex + 0.5) / segment.count
  const angle = axisAngle + ratio * Math.PI
  const mirroredAngle = axisAngle * 2 - angle
  visitAngle(segment.index === 0 ? angle : mirroredAngle, getSourceIndex(ratio, barCount), ratio)
}

function getSegmentInfo(segmentCount, barCount, outputIndex) {
  const index = Math.min(segmentCount - 1, Math.floor((outputIndex * segmentCount) / barCount))
  const start = Math.ceil((index * barCount) / segmentCount)
  const end = Math.ceil(((index + 1) * barCount) / segmentCount)
  return { index, localIndex: outputIndex - start, count: end - start }
}

function getOutputRatio(outputIndex, barCount) {
  return barCount === 1 ? 0 : outputIndex / barCount
}

function getSourceIndex(ratio, barCount) {
  return Math.min(barCount - 1, Math.floor(ratio * barCount))
}
