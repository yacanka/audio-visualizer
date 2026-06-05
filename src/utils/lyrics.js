/** Parse simple SRT text into timed lyric segments. */
export function parseSrt(text) {
  return text
    .replace(/\r/g, '')
    .split(/\n\n+/)
    .map(parseSrtBlock)
    .filter(Boolean)
}

/** Build evenly timed lyric segments from plain text lines. */
export function createLyricSegments(text, duration = 30) {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean)
  if (!lines.length) return []

  const step = Math.max(1, duration / lines.length)
  return lines.map((line, index) => ({
    id: `lyric-${index}`,
    start: Number((index * step).toFixed(2)),
    end: Number(((index + 1) * step).toFixed(2)),
    text: line,
  }))
}

/** Return the lyric segment active at the current playback time. */
export function findCurrentLyric(segments, currentTime) {
  return segments.find(segment => currentTime >= segment.start && currentTime < segment.end)
}

function parseSrtBlock(block) {
  const lines = block.split('\n').map(line => line.trim()).filter(Boolean)
  const timeLine = lines.find(line => line.includes('-->'))
  if (!timeLine) return null

  const [start, end] = timeLine.split('-->').map(value => parseSrtTime(value.trim()))
  const text = lines.slice(lines.indexOf(timeLine) + 1).join(' ')
  if (!text || start === null || end === null) return null
  return { id: `srt-${start}-${end}`, start, end, text }
}

function parseSrtTime(value) {
  const match = value.match(/(?:(\d+):)?(\d{2}):(\d{2})[,.](\d{3})/)
  if (!match) return null
  const [, hours = '0', minutes, seconds, milliseconds] = match
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(milliseconds) / 1000
}
