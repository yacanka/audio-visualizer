/** Deterministic drift with independent translation, rotation and zoom controls. */
export function getDriftMotion(store, time, energy = 0, prefix = '') {
  const key = name => prefix ? `${prefix}${name[0].toUpperCase()}${name.slice(1)}` : name
  const read = (name, fallback) => Number(store[key(name)] ?? fallback)
  if (!store[key('drift')] || store.previewBackgroundMode === 'static') return { x: 0, y: 0, rotation: 0, scale: 1 }
  const custom = store[key('driftCustom')]
  const intensity = read('driftIntensity', 30) / 100
  const speed = custom ? read('driftSpeed', 1.5) : 0.3 + intensity * 1.2
  const phase = time * speed * 0.5
  const reactive = 1 + energy * (custom ? read('driftAcceleration', 0) / 100 : 0)
  const distanceX = custom ? read('driftX', 5) / 100 : intensity * 0.025
  const distanceY = custom ? read('driftY', 5) / 100 : intensity * 0.02
  return {
    x: Math.sin(phase * 0.73) * distanceX * reactive,
    y: Math.sin(phase * 0.51 + 0.6) * distanceY * reactive,
    rotation: Math.sin(phase * 0.39) * (custom ? read('driftRotation', 0.5) : intensity * 2),
    scale: 1 + (Math.sin(phase * 0.27) + 1) * (custom ? read('driftScale', 0) / 200 : 0),
  }
}

/** Advance spin only during playback, including bass acceleration and reverse spin. */
export function advanceSpin(store, angle, deltaTime, energy) {
  if (!store.visualizerSpin || !store.isPlaying) return angle
  const speed = Number(store.visualizerSpinSpeed ?? 24)
  const acceleration = Number(store.visualizerSpinAcceleration ?? 0)
  return (angle + (speed + acceleration * energy) * Math.min(100, Math.max(0, deltaTime)) / 1000) % 360
}

/** Keep per-layer spin transient so history and project files contain only controls. */
export function advanceLayerSpins(store, angles, deltaTime, energy) {
  return Object.fromEntries((store.visualizerLayers || []).map(layer => {
    const settings = layer.customEnabled ? layer.settings || {} : {}
    const angle = settings.visualizerSpin
      ? advanceSpin({ ...settings, isPlaying: store.isPlaying }, angles[layer.id] || 0, deltaTime, energy) : 0
    return [layer.id, angle]
  }))
}
