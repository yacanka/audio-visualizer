import { toRgba } from './colors.js'

const SHARD_SEEDS = Array.from({ length: 80 }, (_, index) => fract(Math.sin(index * 91.7) * 43758.5453))
const MIN_SPAWN_ENERGY = 0.04

/** Draw peak-reactive shards that keep their initial velocity after emission. */
export function drawSoundVisibleShards(ctx, magnitudes, metrics, getLineHeight, state = null, deltaTime = 16) {
  if (!metrics.shardCount) return
  const shardState = state || { particles: [] }
  syncParticleSlots(shardState, metrics.shardCount)
  const deltaSeconds = getDeltaSeconds(deltaTime)
  shardState.particles.forEach((particle, index) => {
    updateParticle(particle, createSpawnContext(magnitudes, metrics, getLineHeight, index), deltaSeconds)
    drawParticle(ctx, particle, metrics)
  })
}

function syncParticleSlots(state, count) {
  state.particles.length = count
  for (let index = 0; index < count; index++) state.particles[index] ||= { active: false }
}

function createSpawnContext(magnitudes, metrics, getLineHeight, index) {
  const seed = SHARD_SEEDS[index % SHARD_SEEDS.length]
  const source = getShardSource(magnitudes, metrics, index)
  const side = seed > 0.5 ? 1 : -1
  const lineHeight = getLineHeight(source.energy, source.peakIndex, metrics)
  return { ...source, index, lineHeight, metrics, seed, side }
}

function updateParticle(particle, spawnContext, deltaSeconds) {
  if (!particle.active || particle.age >= particle.life) spawnParticle(particle, spawnContext)
  if (!particle.active) return
  particle.age += deltaSeconds
  particle.x += particle.velocityX * deltaSeconds
  particle.y += particle.velocityY * deltaSeconds
}

function spawnParticle(particle, context) {
  if (context.energy < MIN_SPAWN_ENERGY) return resetParticle(particle)
  const velocity = getInitialVelocity(context)
  Object.assign(particle, getInitialParticle(context, velocity))
}

function getInitialParticle(context, velocity) {
  const originY = context.metrics.centerY + context.side * context.lineHeight * 0.35
  return {
    active: true, age: 0, energy: context.energy, life: getLife(context),
    originX: context.sourceX, originY, phase: context.seed * Math.PI * 2,
    side: context.side, size: getShardSize(context), spin: getSpin(context),
    velocityX: velocity.x, velocityY: velocity.y, x: context.sourceX, y: originY,
  }
}

function getInitialVelocity(context) {
  const travelDistance = getExitDistance(context.metrics, context.side)
  const speed = travelDistance / getLife(context) * (0.35 + context.energy * 0.55)
  const wind = getWindVelocity(context.metrics, context.side)
  const scatter = (context.seed - 0.5) * context.metrics.width * 0.05
  const velocityY = keepOutwardVelocity(context.side * speed + wind.y, context.side, speed)
  return { x: wind.x + scatter, y: velocityY }
}

function keepOutwardVelocity(velocityY, side, speed) {
  if (Math.sign(velocityY) === side) return velocityY
  return side * speed * 0.2
}

function getShardSource(magnitudes, metrics, index) {
  const range = getShardRange(magnitudes.length, metrics.shardCount, index)
  const peakIndex = findPeakIndex(magnitudes, range.start, range.end)
  const energy = magnitudes[peakIndex] || 0
  const ratio = magnitudes.length <= 1 ? 0.5 : peakIndex / (magnitudes.length - 1)
  return { energy, peakIndex, sourceX: metrics.startX + ratio * metrics.width }
}

function getShardRange(length, shardCount, index) {
  const start = Math.floor((index * length) / shardCount)
  const end = Math.max(start + 1, Math.floor(((index + 1) * length) / shardCount))
  return { start, end: Math.min(length, end) }
}

function findPeakIndex(magnitudes, start, end) {
  let peakIndex = start
  for (let index = start + 1; index < end; index++) {
    if ((magnitudes[index] || 0) > (magnitudes[peakIndex] || 0)) peakIndex = index
  }
  return peakIndex
}

function drawParticle(ctx, particle, metrics) {
  if (!particle.active) return
  const point = getParticlePoint(particle, metrics)
  if (point.opacity <= 0.01) return
  ctx.save()
  ctx.globalAlpha = point.opacity
  ctx.translate(point.x, point.y)
  ctx.rotate(particle.phase + particle.spin * particle.age + point.tumble)
  drawShardPath(ctx, point.size)
  paintShard(ctx, particle, metrics)
  ctx.restore()
}

function getParticlePoint(particle, metrics) {
  const progress = Math.min(1, particle.age / particle.life)
  const drift = getOrganicDrift(particle, metrics, progress)
  return {
    opacity: getOpacity(progress, particle.energy), size: particle.size,
    tumble: Math.sin(progress * Math.PI * 2 + particle.phase) * 0.45,
    x: particle.x + drift.x, y: particle.y + drift.y,
  }
}

function getOrganicDrift(particle, metrics, progress) {
  const turbulence = getTurbulence(metrics)
  const wave = Math.sin(particle.age * (1.4 + particle.energy) + particle.phase)
  const flutter = Math.sin(progress * Math.PI * 3 + particle.phase * 0.7)
  return {
    x: wave * metrics.width * 0.035 * turbulence * progress,
    y: flutter * metrics.height * 0.1 * turbulence * progress * particle.side,
  }
}

function paintShard(ctx, particle, metrics) {
  ctx.fillStyle = toRgba(metrics.colorA, 0.03 + particle.energy * 0.07)
  ctx.strokeStyle = toRgba(metrics.colorB, 0.18 + particle.energy * 0.34)
  ctx.lineWidth = 1
  ctx.fill()
  ctx.stroke()
}

function drawShardPath(ctx, size) {
  ctx.beginPath()
  ctx.moveTo(0, -size)
  ctx.lineTo(size * 0.68, size * 0.1)
  ctx.lineTo(size * 0.18, size * 0.72)
  ctx.lineTo(-size * 0.55, size * 0.22)
  ctx.closePath()
}

function getExitDistance(metrics, side) {
  const edgeDistance = side < 0 ? metrics.centerY : metrics.canvasHeight - metrics.centerY
  return (edgeDistance + metrics.shardSize * 3) * getFadeScale(metrics)
}

function getWindVelocity(metrics, side) {
  const angle = (metrics.shardWindDirection * Math.PI) / 180
  const speed = metrics.width * 0.04 * getFadeScale(metrics)
  return { x: Math.sin(angle) * speed, y: Math.cos(angle) * speed * side }
}

function getLife(context) {
  return 4.6 + context.seed * 1.8 + (1 - context.energy) * 1.2
}

function getShardSize(context) {
  return context.metrics.shardSize * (0.18 + context.seed * 0.46) * (0.45 + context.energy)
}

function getSpin(context) {
  return 0.35 + context.energy * 1.1 + context.seed * 0.4
}

function getOpacity(progress, energy) {
  const fade = 1 - smoothstep(0.72, 1, progress)
  return Math.min(1, Math.max(0, fade * (0.35 + energy * 0.65)))
}

function getDeltaSeconds(deltaTime) {
  return Math.min(80, Math.max(0, Number(deltaTime) || 16)) / 1000
}

function resetParticle(particle) {
  Object.assign(particle, { active: false, age: 0, life: 0 })
}

function getTurbulence(metrics) {
  return (metrics.shardTurbulence ?? 45) / 45
}

function getFadeScale(metrics) {
  return (metrics.shardFadeDistance ?? 100) / 100
}

function fract(value) {
  return value - Math.floor(value)
}

function smoothstep(edge0, edge1, value) {
  const amount = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)))
  return amount * amount * (3 - 2 * amount)
}
