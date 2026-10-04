const images = new Map()
const MAX_CACHED_IMAGES = 96

/** Load export-safe local/data images once; callers draw only decoded images. */
export function getCachedImage(src) {
  if (!isLocalImageSource(src) || typeof Image === 'undefined') return null
  if (images.has(src)) return images.get(src)
  const image = new Image()
  image.src = src
  images.set(src, image)
  if (images.size > MAX_CACHED_IMAGES) images.delete(images.keys().next().value)
  return image
}

export function isLocalImageSource(src) {
  return typeof src === 'string' && ((/^\/(?!\/)/.test(src) && !/[\\\u0000-\u0020]/.test(src))
    || /^data:image\/(png|jpeg|webp|gif);base64,/.test(src))
}

/** Await media before a thumbnail or export captures its first frame. */
export async function prepareImages(store) {
  const sources = [store.backdropImageSrc, store.visualizerImageSrc,
    ...(store.elements || []).filter(element => element.type === 'image').map(element => element.src)]
  await Promise.all(sources.filter(Boolean).map(async src => {
    const image = getCachedImage(src)
    if (!image) throw new Error('Unsupported image source.')
    await image.decode()
  }))
}
