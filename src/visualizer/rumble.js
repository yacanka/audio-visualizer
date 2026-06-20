const LEGACY_INTENSITIES = { none: 0, medium: 50, high: 100 }
const MAX_BOUNCE_SCALE = 0.35
const ENERGY_FLOOR = 0.08
const ENERGY_RANGE = 0.72
const ATTACK_IMPULSE_BOOST = 120
const ATTACK_RATE = 48
const RELEASE_RATE = 12
const DEFAULT_FRAME_TIME = 1000 / 60
const MAX_FRAME_TIME = 100

/** Return smooth audio-reactive scale and envelope state for one frame. */
export function getVisualizerRumbleMotion(store, audioMotion, previousEnvelope = 0, deltaTime = 0) {
  if (!isRumbleEnabled(store)) return { scale: 1, envelope: 0 }

  const target = getTargetEnvelope(audioMotion)
  const envelope = smoothEnvelope(previousEnvelope, target, deltaTime)
  const intensity = getNormalizedControl(store.visualizerRumble, LEGACY_INTENSITIES)
  const bounce = getNormalizedControl(store.visualizerBounce)
  return { scale: 1 + MAX_BOUNCE_SCALE * intensity * bounce * envelope, envelope }
}

function isRumbleEnabled(store) {
  return getNormalizedControl(store.visualizerRumble, LEGACY_INTENSITIES) > 0
    && getNormalizedControl(store.visualizerBounce) > 0
    && store.isPlaying
    && store.previewAudioAnalysisEnabled
}

function getTargetEnvelope(audioMotion) {
  const energy = clamp((audioMotion.energy - ENERGY_FLOOR) / ENERGY_RANGE, 0, 1)
  const attack = Math.max(0, audioMotion.impulse) * ATTACK_IMPULSE_BOOST
  return clamp(energy + attack, 0, 1)
}

function smoothEnvelope(previousEnvelope, target, deltaTime) {
  const rate = target > previousEnvelope ? ATTACK_RATE : RELEASE_RATE
  const frameTime = clamp(Number(deltaTime) || DEFAULT_FRAME_TIME, 0, MAX_FRAME_TIME)
  const blend = 1 - Math.exp(-rate * frameTime / 1000)
  return previousEnvelope + (target - previousEnvelope) * blend
}

function getNormalizedControl(value, legacyValues = {}) {
  const normalizedValue = legacyValues[value] ?? Number(value)
  return Number.isFinite(normalizedValue) ? clamp(normalizedValue, 0, 100) / 100 : 0
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value))
}
