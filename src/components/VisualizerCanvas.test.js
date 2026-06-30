import { mount } from '@vue/test-utils'
import { reactive, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import VisualizerCanvas from './VisualizerCanvas.vue'

const store = reactive({ audioFile: null, smoothing: 0.8, fftSize: 2048 })
const audio = {
  setup: vi.fn(),
  dispose: vi.fn(),
  getFrequencyData: vi.fn(),
  getTimeDomainData: vi.fn(),
  updateAnalyserSettings: vi.fn(),
}
const visualizer = {
  dispose: vi.fn(),
  drawFrame: vi.fn(),
  getCanvasDimensions: () => ({ w: 1920, h: 1080 }),
  prepare: vi.fn(() => Promise.resolve(true)),
}

vi.mock('../stores/app.js', () => ({ useAppStore: () => store }))
vi.mock('../composables/useAudio.js', () => ({ useAudio: () => audio }))
vi.mock('../composables/useVisualizer.js', () => ({ useVisualizer: () => visualizer }))

describe('VisualizerCanvas', () => {
  beforeEach(() => {
    store.audioFile = null
    vi.clearAllMocks()
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
  })

  it('accepts audio drops after an audio file is already loaded', async () => {
    const wrapper = mount(VisualizerCanvas)
    const firstFile = new File(['first'], 'first.mp3', { type: 'audio/mpeg' })
    const secondFile = new File(['second'], 'second.mp3', { type: 'audio/mpeg' })

    await dropFile(wrapper, firstFile)
    store.audioFile = firstFile
    await dropFile(wrapper, secondFile)

    expect(wrapper.emitted('audio-drop')).toEqual([[firstFile], [secondFile]])
  })
})

async function dropFile(wrapper, file) {
  await wrapper.find('.canvas-wrapper').trigger('drop', {
    dataTransfer: { files: [file] },
  })
}
