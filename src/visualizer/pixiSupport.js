/** Return true when PixiJS can safely create a WebGL renderer in this document. */
export function canUsePixiRenderer(canvas) {
  const probe = canvas?.ownerDocument?.createElement?.('canvas')
  if (!probe?.getContext) return false
  const context = getWebGlContext(probe)
  releaseContext(context)
  return Boolean(context)
}

function getWebGlContext(canvas) {
  const contextNames = ['webgl2', 'webgl', 'experimental-webgl']
  for (const contextName of contextNames) {
    const context = getContext(canvas, contextName)
    if (context) return context
  }
  return null
}

function getContext(canvas, contextName) {
  try {
    return canvas.getContext(contextName)
  } catch {
    return null
  }
}

function releaseContext(context) {
  context?.getExtension?.('WEBGL_lose_context')?.loseContext?.()
}
