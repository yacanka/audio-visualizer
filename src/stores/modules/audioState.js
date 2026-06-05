import { ref } from 'vue'

/** Create audio playback and analysis state refs. */
export function createAudioState() {
  return {
    audioFile: ref(null),
    fileName: ref(''),
    isPlaying: ref(false),
    isMuted: ref(false),
    currentTime: ref(0),
    duration: ref(0),
    volume: ref(1),
    fftSize: ref(2048),
    bassBoost: ref(false),
    normalize: ref(true),
  }
}
