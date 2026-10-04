/** Resolve clip visibility and optional entrance/exit motion from audio time. */
export function getElementTiming(element, time) {
  const start = Number(element.startTime) || 0
  const end = Number(element.endTime) || Infinity
  if (time < start || time >= end) return { visible: false, opacity: 0, scale: 1 }
  const progress = Math.min(1, (time - start) / 0.4, (end - time) / 0.4)
  const animated = element.animation === 'fade' || element.animation === 'pop'
  return { visible: true, opacity: animated ? Math.max(0, progress) : 1,
    scale: element.animation === 'pop' ? 0.75 + 0.25 * Math.max(0, progress) : 1 }
}
