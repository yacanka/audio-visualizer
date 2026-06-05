/** Return the best supported WebM MIME type for canvas export. */
export function getSupportedVideoMimeType() {
  const types = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
  return types.find(type => MediaRecorder.isTypeSupported(type))
}

/** Wait for a fixed number of milliseconds. */
export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
