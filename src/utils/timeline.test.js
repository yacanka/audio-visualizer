import { describe, expect, it } from 'vitest'
import { getTimelineDuration, getTimelineTime } from './timeline.js'

describe('video-only timeline', () => {
  const store = { backdropType: 'video', backdropVideoDuration: 30, currentTime: 20 }
  it('uses the background duration for silent playback and the audio duration when present', () => {
    expect(getTimelineDuration(store)).toBe(30)
    expect(getTimelineTime(store)).toBe(20)
    expect(getTimelineDuration({ ...store, audioFile: {}, duration: 65 })).toBe(65)
    expect(getTimelineDuration({ backdropType: 'solid' })).toBe(12)
  })
  it('keeps the preview playhead inside the timeline while export time remains continuous', () => {
    const looping = { ...store, currentTime: 41 }
    expect(getTimelineTime(looping)).toBe(11)
    expect(looping.currentTime).toBe(41)
  })
})
