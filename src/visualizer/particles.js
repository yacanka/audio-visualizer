const DEFAULT_PARTICLE_COUNT = 42
const DEFAULT_PARTICLE_SPEED = 0.8
const DEFAULT_PARTICLE_MIN_SIZE = 2
const DEFAULT_PARTICLE_MAX_SIZE = 5
const EDGE_MARGIN_RATIO = 0.04

/** Draw a deterministic, natural particle layer for the current frame. */
export function drawParticleLayer(store, ctx, element, size) {
  const options = createParticleOptions(store, element, size)
  ctx.fillStyle = element.color || '#ffffff'
  for (let index = 0; index < options.count; index++) drawParticle(ctx, options, index)
  ctx.globalAlpha = 1
}

/** Return a particle point for a layer, useful for rendering and tests. */
export function getParticlePoint(options, index) {
  const seed = getParticleSeed(options.seedKey, index)
  const phase = getParticlePhase(options, seed)
  const base = getBasePoint(options, seed)
  const travel = getTravelVector(options, seed)
  return createParticlePoint(base, travel, phase, options, seed)
}

/** Return normalized particle settings with safe min/max bounds. */
export function createParticleOptions(store, element, size) {
  return {
    count: clamp(Math.round(element.count || DEFAULT_PARTICLE_COUNT), 1, 500),
    direction: store.particleDirection || 'right',
    minSize: getMinParticleSize(store),
    maxSize: getMaxParticleSize(store),
    seedKey: element.id || element.name || 'particles',
    speed: getParticleSpeed(store),
    time: store.currentTime || 0,
    w: size.w,
    h: size.h,
  }
}

function drawParticle(ctx, options, index) {
  const point = getParticlePoint(options, index)
  ctx.globalAlpha = point.alpha
  ctx.beginPath()
  ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2)
  ctx.fill()
}

function getMinParticleSize(store) {
  return clamp(Number(store.particleMinSize) || DEFAULT_PARTICLE_MIN_SIZE, 1, 40)
}

function getMaxParticleSize(store) {
  const minSize = getMinParticleSize(store)
  return clamp(Number(store.particleMaxSize) || DEFAULT_PARTICLE_MAX_SIZE, minSize, 80)
}

function getParticleSpeed(store) {
  const baseSpeed = Number(store.particleSpeed) || DEFAULT_PARTICLE_SPEED
  const reactiveMultiplier = store.particleReactiveSpeed ? 1.6 : 1
  return clamp(baseSpeed, 0.1, 4) * reactiveMultiplier
}

function getParticlePhase(options, seed) {
  const offset = random(seed, 0) * options.count * 0.021
  return (options.time * options.speed * 0.16 + offset) % 1
}

function getBasePoint(options, seed) {
  if (options.direction === 'out') return getCenterPoint(options, seed)
  if (options.direction === 'left') return { x: -getMargin(options), y: random(seed, 1) * options.h }
  if (options.direction === 'right') return { x: options.w + getMargin(options), y: random(seed, 1) * options.h }
  if (options.direction === 'up') return { x: random(seed, 1) * options.w, y: -getMargin(options) }
  return { x: random(seed, 1) * options.w, y: options.h + getMargin(options) }
}

function getTravelVector(options, seed) {
  if (options.direction === 'out') return getOutwardTravel(options, seed)
  if (options.direction === 'left') return { x: options.w * 0.42, y: getCrossDrift(options, seed) }
  if (options.direction === 'right') return { x: -options.w * 0.42, y: getCrossDrift(options, seed) }
  if (options.direction === 'up') return { x: getCrossDrift(options, seed), y: options.h * 0.42 }
  return { x: getCrossDrift(options, seed), y: -options.h * 0.42 }
}

function createParticlePoint(base, travel, phase, options, seed) {
  const eased = easeOutSine(phase)
  const radius = interpolate(options.minSize, options.maxSize, random(seed, 4))
  return { x: base.x + travel.x * eased, y: base.y + travel.y * eased, radius, alpha: getAlpha(phase) }
}

function getCenterPoint(options, seed) {
  const jitter = Math.min(options.w, options.h) * 0.06
  return { x: options.w / 2 + getSigned(seed, 1) * jitter, y: options.h / 2 + getSigned(seed, 2) * jitter }
}

function getOutwardTravel(options, seed) {
  const angle = random(seed, 3) * Math.PI * 2
  const distance = Math.hypot(options.w, options.h) * 0.62
  return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance }
}

function getCrossDrift(options, seed) {
  return getSigned(seed, 2) * Math.min(options.w, options.h) * 0.14
}

function getMargin(options) {
  return Math.min(options.w, options.h) * EDGE_MARGIN_RATIO
}

function getAlpha(phase) {
  return 0.15 + Math.sin(Math.PI * phase) * 0.7
}

function easeOutSine(value) {
  return Math.sin((value * Math.PI) / 2)
}

function interpolate(minimum, maximum, amount) {
  return minimum + (maximum - minimum) * amount
}

function getSigned(seed, salt) {
  return random(seed, salt) * 2 - 1
}

function getParticleSeed(seedKey, index) {
  return hashString(`${seedKey}:${index}`)
}

function random(seed, salt) {
  const value = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453
  return value - Math.floor(value)
}

function hashString(value) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index++) hash = updateHash(hash, value.charCodeAt(index))
  return hash >>> 0
}

function updateHash(hash, code) {
  return Math.imul(hash ^ code, 16777619)
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value))
}
