import { markRaw, watch } from 'vue'

/** Own a muted, local video source for the shared preview/export canvas. */
export function useBackdropVideo(store) {
  let video = null, url = null, playPending = false, playBlocked = false
  const stopWatching = watch(() => store.backdropVideoFile, replaceVideo, { immediate: true, flush: 'sync' })

  function release() {
    if (video) {
      video.onloadeddata = null
      video.onerror = null
      video.ondurationchange = null
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
    if (url) URL.revokeObjectURL(url)
    video = null
    url = null
    playPending = false
    playBlocked = false
    store.backdropVideo = null
    store.backdropVideoDuration = 0
  }

  function replaceVideo(file) {
    release()
    store.backdropVideoStatus = ''
    if (!file) return
    video = document.createElement('video')
    video.muted = true
    video.loop = true
    video.playsInline = true
    video.preload = 'auto'
    const current = video
    store.backdropVideoStatus = 'Loading video...'
    video.onloadeddata = () => {
      if (video !== current) return
      store.backdropVideo = markRaw(current)
      store.backdropVideoStatus = ''
      updateDuration()
    }
    const updateDuration = () => {
      if (video === current) store.backdropVideoDuration = Number.isFinite(current.duration) ? current.duration : 0
    }
    video.ondurationchange = updateDuration
    video.onerror = () => {
      if (video !== current) return
      store.backdropVideo = null
      store.backdropVideoStatus = 'This browser cannot play this video. Choose an MP4 or WebM file.'
    }
    url = URL.createObjectURL(file)
    video.src = url
    video.load()
  }

  function sync(time) {
    if (!video || store.backdropVideo !== video || store.backdropType !== 'video') {
      video?.pause()
      return
    }
    const playing = store.isPlaying && store.previewBackgroundMode !== 'static'
    const target = getVideoTime(store, time, video.duration)
    if (!video.seeking && Math.abs(video.currentTime - target) > (playing ? 0.2 : 0.03)) video.currentTime = target
    if (!playing) { video.pause(); playBlocked = false; return }
    if (!video.paused || playPending || playBlocked) return
    playPending = true
    const current = video
    Promise.resolve(video.play()).catch(() => {
      if (video === current) {
        playBlocked = true
        store.backdropVideoStatus = 'Video playback was blocked. Pause, then press Play to retry.'
      }
    }).finally(() => { if (video === current) playPending = false })
  }

  return { sync, dispose() { stopWatching(); release() } }
}

/** Seek before recording so an old preview frame cannot become the first export frame. */
export async function prepareBackdropVideo(store, time, signal) {
  if (store.backdropType !== 'video') return
  const video = store.backdropVideo
  if (!video || video.readyState < 2 || !Number.isFinite(video.duration) || video.duration <= 0) {
    throw new Error('Select a playable video backdrop before exporting.')
  }
  if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError')
  video.pause()
  const target = getVideoTime(store, time, video.duration)
  if (!video.seeking && Math.abs(video.currentTime - target) < 0.01) return
  await waitForSeek(video, target, signal)
}

function getVideoTime(store, time, duration) {
  if (store.previewBackgroundMode === 'static' || !Number.isFinite(duration) || duration <= 0) return 0
  return Math.max(0, Number(time) || 0) % duration
}

function waitForSeek(video, target, signal) {
  return new Promise((resolve, reject) => {
    const finish = error => {
      clearTimeout(timer)
      video.removeEventListener('seeked', seeked)
      video.removeEventListener('error', failed)
      signal?.removeEventListener('abort', aborted)
      error ? reject(error) : resolve()
    }
    const seeked = () => finish()
    const failed = () => finish(new Error('Video backdrop seek failed.'))
    const aborted = () => finish(new DOMException('Cancelled', 'AbortError'))
    const timer = setTimeout(failed, 10000)
    video.addEventListener('seeked', seeked, { once: true })
    video.addEventListener('error', failed, { once: true })
    signal?.addEventListener('abort', aborted, { once: true })
    try { video.currentTime = target } catch (error) { finish(error) }
  })
}
