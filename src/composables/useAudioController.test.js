import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useAudioController } from './useAudioController.js'

describe('useAudioController', () => {
  it('loads and plays every dropped audio file', async () => {
    const audio = createAudio()
    const controller = useAudioController(() => audio)
    const firstFile = new File(['first'], 'first.mp3', { type: 'audio/mpeg' })
    const secondFile = new File(['second'], 'second.mp3', { type: 'audio/mpeg' })

    await controller.loadAudioFile(firstFile)
    await controller.loadAudioFile(secondFile)

    expect(audio.loadFile).toHaveBeenNthCalledWith(1, firstFile)
    expect(audio.loadFile).toHaveBeenNthCalledWith(2, secondFile)
    expect(audio.play).toHaveBeenCalledTimes(2)
    controller.dispose()
  })
})

function createAudio() {
  return {
    waveformData: ref(null),
    loadFile: vi.fn(),
    play: vi.fn(),
  }
}
