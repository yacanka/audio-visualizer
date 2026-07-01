export const templateSteps = [
  { id: 'preset', label: 'Preset' },
  { id: 'audio', label: 'Audio' },
  { id: 'images', label: 'Images' },
  { id: 'text', label: 'Text' },
  { id: 'colors', label: 'Colors' },
  { id: 'elements', label: 'Elements' },
  { id: 'export', label: 'Export' },
]

const baseSettings = {
  activeTab: 'general',
  aspectRatio: '16:9',
  backdropType: 'gradient',
  barCount: 128,
  barGap: 2,
  glowEnabled: true,
  previewQuality: 720,
  selectedVisualizerLayer: 'layer-1',
  showArtist: true,
  showProgressBar: true,
  showTitle: true,
  soundVisibleColor: '#f6c453',
  soundVisibleCoreColor: '#fff4b8',
  soundVisibleGlow: 70,
  soundVisibleLineWidth: 2,
  soundVisibleShardFadeDistance: 100,
  soundVisibleShardAmount: 18,
  soundVisibleShardSize: 22,
  soundVisibleShardTurbulence: 45,
  soundVisibleShardWindDirection: 0,
  textPosition: 'bottom',
  useGradient: true,
  visualizerMode: 'classic',
  visualizerSubTab: 'layers',
  vizSpectrum: 'wide',
}

export const videoTemplates = [
  createTemplate('forest-lights', 'Forest of Lights', true, ['#05140f', '#123a24'], ['#9cff9c', '#fff6a8'], {
    backdropGradient1: '#06130d', backdropGradient2: '#173b2a', barColor: '#9cff9c',
    barColor2: '#fff6a8', glowColor: '#7cff97', titleText: 'Forest of Lights',
    artistText: 'Specterr Preset', vizShape: 'circular', vizStyle: 'bar',
  }),
  createTemplate('purgatory', 'Purgatory', true, ['#190405', '#3f080c'], ['#ff463d', '#ffd166'], {
    backdropGradient1: '#190405', backdropGradient2: '#3f080c', barColor: '#ff463d',
    barColor2: '#ffd166', glowAmount: 24, glowColor: '#ff463d', vizShape: 'filled',
  }),
  createTemplate('datascape', 'Datascape', true, ['#030b18', '#0c2f54'], ['#45f3ff', '#6b7cff'], {
    backdropGradient1: '#030b18', backdropGradient2: '#0c2f54', barColor: '#45f3ff',
    barColor2: '#6b7cff', titleFont: 'Orbitron', vizShape: 'bars',
  }),
  createTemplate('soundvisible-gold', 'SoundVisible Gold', false, ['#130804', '#3a1606'], ['#f6c453', '#fff4b8'], {
    artistText: 'ARTIST NAME', backdropGradient1: '#130804', backdropGradient2: '#3a1606',
    backdropGradientAngle: 90, barColor: '#f6c453', barColor2: '#fff4b8',
    glowEnabled: false, showProgressBar: true, soundVisibleColor: '#f6c453',
    soundVisibleCoreColor: '#fff4b8', soundVisibleGlow: 64, soundVisibleLineWidth: 2,
    soundVisibleShardAmount: 18, soundVisibleShardFadeDistance: 120,
    soundVisibleShardTurbulence: 55, soundVisibleShardWindDirection: 0,
    textPosition: 'bottom', titleSize: 30, titleText: 'MUSIC TRACK NAME',
    visualizerMode: 'soundvisible', visualizerSubTab: 'shape',
    visualizerWaveHeight: 34, visualizerWidth: 95,
  }),
  createTemplate('jungle-cat', 'Jungle Cat', false, ['#101205', '#353a0d'], ['#f2c94c', '#27ae60'], {
    backdropGradient1: '#101205', backdropGradient2: '#353a0d', barColor: '#f2c94c',
    barColor2: '#27ae60', driftIntensity: 65, vizShape: 'mirror',
  }),
  createTemplate('default', 'Default', false, ['#0d0d1a', '#1a0d2e'], ['#f85462', '#7b2ff7'], {
    backdropGradient1: '#0d0d1a', backdropGradient2: '#1a0d2e', barColor: '#f85462',
    barColor2: '#7b2ff7', titleText: 'Track Name', artistText: 'Artist Name',
    vizShape: 'bars',
  }),
  createTemplate('coil', 'Coil', false, ['#090714', '#2b114a'], ['#ff6bd6', '#8c5cff'], {
    backdropGradient1: '#090714', backdropGradient2: '#2b114a', barColor: '#ff6bd6',
    barColor2: '#8c5cff', vizShape: 'circular', visualizerRotation: 18,
  }),
  createTemplate('neon-tunnel', 'Neon Tunnel', false, ['#02050a', '#071f2d'], ['#00e5ff', '#ff3df0'], {
    backdropGradient1: '#02050a', backdropGradient2: '#071f2d', barColor: '#00e5ff',
    barColor2: '#ff3df0', glowAmount: 30, vizShape: 'mirror',
  }),
  createTemplate('magma', 'Magma', false, ['#160404', '#401100'], ['#ff3d00', '#ffb000'], {
    backdropGradient1: '#160404', backdropGradient2: '#401100', barColor: '#ff3d00',
    barColor2: '#ffb000', glowColor: '#ff6b00', vizShape: 'filled',
  }),
  createTemplate('red-planet', 'Red Planet', false, ['#150708', '#3b1712'], ['#ff735c', '#f3c15f'], {
    backdropGradient1: '#150708', backdropGradient2: '#3b1712', barColor: '#ff735c',
    barColor2: '#f3c15f', backdropGradientAngle: 45, vizShape: 'circular',
  }),
  createTemplate('beyond-space', 'Beyond Space', false, ['#030512', '#151942'], ['#73f5ff', '#ffffff'], {
    backdropGradient1: '#030512', backdropGradient2: '#151942', barColor: '#73f5ff',
    barColor2: '#ffffff', textPosition: 'center', vizShape: 'wave',
  }),
  createTemplate('chromatic-current', 'Chromatic Current', false, ['#070711', '#181a2d'], ['#ff4fd8', '#4dffca'], {
    backdropGradient1: '#070711', backdropGradient2: '#181a2d', barColor: '#ff4fd8',
    barColor2: '#4dffca', gradientDir: 'horizontal', vizShape: 'mirror',
  }),
  createTemplate('eclipse', 'Eclipse', false, ['#030303', '#241b08'], ['#f7d774', '#ffffff'], {
    backdropGradient1: '#030303', backdropGradient2: '#241b08', barColor: '#f7d774',
    barColor2: '#ffffff', centerCutout: 30, vizShape: 'circular',
  }),
  createTemplate('aurora', 'Aurora', false, ['#041414', '#1b3150'], ['#7cffcb', '#b892ff'], {
    backdropGradient1: '#041414', backdropGradient2: '#1b3150', barColor: '#7cffcb',
    barColor2: '#b892ff', vizShape: 'bars',
  }),
  createTemplate('solar-pulse', 'Solar Pulse', false, ['#120801', '#442100'], ['#ffbe55', '#ff4d00'], {
    backdropGradient1: '#120801', backdropGradient2: '#442100', barColor: '#ffbe55',
    barColor2: '#ff4d00', vizShape: 'mirror',
  }),
]

/** Return a template by stable id. */
export function getTemplateById(id) {
  return videoTemplates.find(template => template.id === id) || getDefaultTemplate()
}

function getDefaultTemplate() {
  return videoTemplates.find(template => template.id === 'default') || videoTemplates[0]
}

/** Apply a selected template to the Pinia store-like target. */
export function applyTemplateToStore(store, template) {
  const selectedTemplate = typeof template === 'string' ? getTemplateById(template) : template
  if (!selectedTemplate) return false
  applySettings(store, selectedTemplate.settings)
  store.selectedTemplateId = selectedTemplate.id
  return true
}

function createTemplate(id, name, pro, backdrop, accent, settings) {
  return {
    id,
    name,
    pro,
    preview: { accent, backdrop },
    settings: { ...baseSettings, ...settings },
  }
}

function applySettings(store, settings) {
  Object.entries(settings).forEach(([key, value]) => applySetting(store, key, value))
}

function applySetting(store, key, value) {
  if (key === 'elements') return replaceElements(store, value)
  if (key in store) store[key] = value
}

function replaceElements(store, elements = []) {
  store.elements = elements.map((element, index) => ({ ...element, id: `template-${element.id}-${index}` }))
  store.selectedElementId = store.elements[0]?.id || null
}
