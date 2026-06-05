import { ref } from 'vue'

/** Create visualizer shape, color, and motion state refs. */
export function createVisualizerState() {
  const visualizerLayers = ref([
    { id: 'layer-1', name: 'Wave Layer 1' },
    { id: 'layer-2', name: 'Wave Layer 2' },
  ])

  /** Add another editable visualizer layer entry. */
  function addVisualizerLayer() {
    const index = visualizerLayers.value.length + 1
    visualizerLayers.value.push({ id: `layer-${index}`, name: `Wave Layer ${index}` })
  }

  return {
    visualizerLayers,
    selectedVisualizerLayer: ref('layer-1'),
    vizShape: ref('bars'),
    vizStyle: ref('bar'),
    vizReflection: ref('none'),
    vizLayerMode: ref('web'),
    vizSpectrum: ref('bass'),
    barCount: ref(80),
    barGap: ref(2),
    barRounding: ref(4),
    barColor: ref('#f85462'),
    barColor2: ref('#7b2ff7'),
    useGradient: ref(true),
    gradientDir: ref('vertical'),
    smoothing: ref(0.82),
    glowEnabled: ref(true),
    glowAmount: ref(15),
    glowColor: ref('#f85462'),
    sensitivity: ref(1),
    vizSmooth: ref(true),
    vizInvert: ref(false),
    visualizerDiameter: ref(40),
    visualizerImageSize: ref(95),
    visualizerXPosition: ref(0),
    visualizerYPosition: ref(0),
    visualizerWaveHeight: ref(30),
    visualizerSeparation: ref(40),
    visualizerRotation: ref(0),
    centerCutout: ref(0),
    waveDelay: ref(false),
    drift: ref(true),
    driftIntensity: ref(50),
    driftCustom: ref(false),
    visualizerRumble: ref('none'),
    visualizerBounce: ref(20),
    visualizerSpin: ref(false),
    glowType: ref('outer'),
    glowScale: ref(10),
    fireEnabled: ref(false),
    shadowEnabled: ref(false),
    addVisualizerLayer,
  }
}
