/** Audio owns the timeline; a silent video backdrop uses its own clip duration. */
export function getTimelineDuration(store) {
  if (store.audioFile) return store.duration || 12
  const duration = store.backdropType === 'video' ? store.backdropVideoDuration : 0
  return Number.isFinite(duration) && duration > 0 ? duration : 12
}

/** Display the current loop without changing the continuous export clock. */
export function getTimelineTime(store) {
  const duration = getTimelineDuration(store)
  const time = Math.max(0, store.currentTime || 0)
  if (!store.audioFile && time > duration) return time % duration
  return Math.min(time, duration)
}
