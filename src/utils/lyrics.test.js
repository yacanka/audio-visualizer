import { describe, expect, it } from 'vitest'
import { createLyricSegments, findCurrentLyric, parseSrt } from './lyrics.js'

describe('lyrics utilities', () => {
  it('creates evenly timed lyric segments from plain text', () => {
    expect(createLyricSegments('one\ntwo', 10)).toEqual([
      { id: 'lyric-0', start: 0, end: 5, text: 'one' },
      { id: 'lyric-1', start: 5, end: 10, text: 'two' },
    ])
  })

  it('parses SRT cue blocks', () => {
    const srt = '1\n00:00:01,000 --> 00:00:03,500\nHello world'
    expect(parseSrt(srt)).toEqual([
      { id: 'srt-1-3.5', start: 1, end: 3.5, text: 'Hello world' },
    ])
  })

  it('finds the active lyric segment', () => {
    const segments = createLyricSegments('one\ntwo', 10)
    expect(findCurrentLyric(segments, 6)?.text).toBe('two')
  })
})
