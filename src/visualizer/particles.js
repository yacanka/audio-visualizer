const DEFAULT_PARTICLE_COUNT = 42
const DEFAULT_PARTICLE_SPEED = 1.2
const DEFAULT_PARTICLE_MIN_SIZE = 2
const DEFAULT_PARTICLE_MAX_SIZE = 5
const DEFAULT_PARTICLE_WANDER = 0
const EDGE_MARGIN_RATIO = 0.04
const FADE_DISTANCE = 0.18
const MAX_ALPHA = 0.85
const MAX_SPECTRUM_BOOST = 2.4
const MAX_WANDER_RATIO = 0.18

/** Draw a deterministic, natural particle layer for the current frame. */
export function drawParticleLayer(store, ctx, element, size, timestamp = 0, frequencyData = null) {
  const options = createParticleOptions(store, element, size, timestamp, frequencyData)
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
export function createParticleOptions(store, element, size, timestamp = 0, frequencyData = null) {
  return {
    count: clamp(Math.round(element.count || DEFAULT_PARTICLE_COUNT), 1, 500),
    direction: store.particleDirection || 'right',
    minSize: getMinParticleSize(store),
    fadeIn: store.particleFadeIn !== false,
    fadeOut: store.particleFadeOut !== false,
    maxSize: getMaxParticleSize(store),
    wander: getParticleWander(store),
    seedKey: element.id || element.name || 'particles',
    speed: getParticleSpeed(store, frequencyData),
    time: getAnimationTime(store, timestamp),
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

function getParticleWander(store) {
  const value = Number(store.particleWander) || DEFAULT_PARTICLE_WANDER
  return clamp(value, 0, 100) / 100
}

function getParticleSpeed(store, frequencyData) {
  const baseSpeed = Number(store.particleSpeed) || DEFAULT_PARTICLE_SPEED
  const spectrumBoost = getSpectrumBoost(store, frequencyData)
  return clamp(baseSpeed, 0.1, 4) * spectrumBoost
}

function getSpectrumBoost(store, frequencyData) {
  if (!store.particleReactiveSpeed) return 1
  const energy = getSpectrumEnergy(frequencyData, store.vizSpectrum)
  return 1 + energy * MAX_SPECTRUM_BOOST
}

function getSpectrumEnergy(frequencyData, spectrumMode = 'wide') {
  if (!frequencyData?.length) return 0.25
  const sampleCount = getSpectrumSampleCount(frequencyData, spectrumMode)
  return getAverageEnergy(frequencyData, sampleCount)
}

function getSpectrumSampleCount(frequencyData, spectrumMode) {
  if (spectrumMode === 'bass') return Math.max(1, Math.floor(frequencyData.length * 0.18))
  return frequencyData.length
}

function getAverageEnergy(frequencyData, sampleCount) {
  let total = 0
  for (let index = 0; index < sampleCount; index++) total += frequencyData[index] || 0
  return clamp(total / sampleCount / 255, 0, 1)
}

function getParticlePhase(options, seed) {
  return (options.time * options.speed * 0.22 + random(seed, 0)) % 1
}

function getAnimationTime(store, timestamp) {
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp / 1000 : store.currentTime || 0
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
  if (options.direction === 'left') return { x: getHorizontalTravel(options), y: getCrossDrift(options, seed) }
  if (options.direction === 'right') return { x: -getHorizontalTravel(options), y: getCrossDrift(options, seed) }
  if (options.direction === 'up') return { x: getCrossDrift(options, seed), y: getVerticalTravel(options) }
  return { x: getCrossDrift(options, seed), y: -getVerticalTravel(options) }
}

function createParticlePoint(base, travel, phase, options, seed) {
  const eased = easeOutSine(phase)
  const radius = interpolate(options.minSize, options.maxSize, random(seed, 4))
  const wander = getWanderOffset(options, seed, phase, travel)
  return { x: base.x + travel.x * eased + wander.x, y: base.y + travel.y * eased + wander.y, radius, alpha: getAlpha(phase, options) }
}

function getWanderOffset(options, seed, phase, travel) {
  if (!options.wander) return { x: 0, y: 0 }
  const normal = getNormalVector(travel)
  const wave = Math.sin(phase * Math.PI * 2 * getWanderFrequency(seed) + random(seed, 6) * Math.PI * 2)
  const amount = options.wander * Math.min(options.w, options.h) * MAX_WANDER_RATIO * wave * Math.sin(Math.PI * phase)
  return { x: normal.x * amount, y: normal.y * amount }
}

function getNormalVector(travel) {
  const length = Math.hypot(travel.x, travel.y) || 1
  return { x: -travel.y / length, y: travel.x / length }
}

function getWanderFrequency(seed) {
  return 1.2 + random(seed, 5) * 2.4
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

function getHorizontalTravel(options) { return options.w + getMargin(options) * 2 }
function getVerticalTravel(options) { return options.h + getMargin(options) * 2 }
function getCrossDrift(options, seed) { return getSigned(seed, 2) * Math.min(options.w, options.h) * 0.08 }
function getMargin(options) { return Math.min(options.w, options.h) * EDGE_MARGIN_RATIO }

function getAlpha(phase, options) {
  const fadeIn = options.fadeIn ? getFadeRatio(phase) : 1
  const fadeOut = options.fadeOut ? getFadeRatio(1 - phase) : 1
  return MAX_ALPHA * Math.min(fadeIn, fadeOut)
}

function getFadeRatio(distance) { return clamp(distance / FADE_DISTANCE, 0, 1) }
function easeOutSine(value) { return Math.sin((value * Math.PI) / 2) }
function interpolate(minimum, maximum, amount) { return minimum + (maximum - minimum) * amount }
function getSigned(seed, salt) { return random(seed, salt) * 2 - 1 }
function getParticleSeed(seedKey, index) { return hashString(`${seedKey}:${index}`) }

function random(seed, salt) {
  const value = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453
  return value - Math.floor(value)
}

function hashString(value) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index++) hash = updateHash(hash, value.charCodeAt(index))
  return hash >>> 0
}

function updateHash(hash, code) { return Math.imul(hash ^ code, 16777619) }
function clamp(value, minimum, maximum) { return Math.min(maximum, Math.max(minimum, value)) }
