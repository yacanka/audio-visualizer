import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // Audio file state
  const audioFile = ref(null)
  const fileName = ref('')
  const isPlaying = ref(false)
  const isMuted = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(1)

  // UI state
  const activeTab = ref('visualizer') // general | audio | visualizer | backdrop | text
  const aspectRatio = ref('16:9')    // 16:9 | 9:16 | 1:1

  // Visualizer settings
  const vizShape = ref('bars')        // bars | mirror | wave | circular | filled
  const vizSpectrum = ref('bass')     // bass | wide
  const barCount = ref(80)
  const barGap = ref(2)
  const barRounding = ref(4)
  const barColor = ref('#f85462')
  const barColor2 = ref('#7b2ff7')
  const useGradient = ref(true)
  const gradientDir = ref('vertical')  // vertical | horizontal
  const smoothing = ref(0.82)
  const glowEnabled = ref(true)
  const glowAmount = ref(15)
  const glowColor = ref('#f85462')
  const sensitivity = ref(1.0)
  const waveDelay = ref(false)
  const drift = ref(true)
  const driftIntensity = ref(50)
  const mirrorH = ref(false)

  // Backdrop settings
  const backdropType = ref('solid')    // solid | gradient | image
  const backdropColor = ref('#0d0d1a')
  const backdropGradient1 = ref('#0d0d1a')
  const backdropGradient2 = ref('#1a0d2e')
  const backdropGradientAngle = ref(135)
  const backdropImage = ref(null)
  const backdropImageFit = ref('cover') // cover | contain | fill

  // Text settings
  const showTitle = ref(true)
  const titleText = ref('')
  const titleFont = ref('Orbitron')
  const titleColor = ref('#ffffff')
  const titleSize = ref(32)
  const titleWeight = ref('700')

  const showArtist = ref(true)
  const artistText = ref('')
  const artistFont = ref('Inter')
  const artistColor = ref('rgba(255,255,255,0.65)')
  const artistSize = ref(18)

  const textPosition = ref('bottom')   // top | center | bottom
  const showProgressBar = ref(true)

  // Audio settings
  const fftSize = ref(2048)
  const bassBoost = ref(false)
  const normalize = ref(true)

  return {
    audioFile, fileName, isPlaying, isMuted, currentTime, duration, volume,
    activeTab, aspectRatio,
    vizShape, vizSpectrum, barCount, barGap, barRounding,
    barColor, barColor2, useGradient, gradientDir,
    smoothing, glowEnabled, glowAmount, glowColor,
    sensitivity, waveDelay, drift, driftIntensity, mirrorH,
    backdropType, backdropColor, backdropGradient1, backdropGradient2,
    backdropGradientAngle, backdropImage, backdropImageFit,
    showTitle, titleText, titleFont, titleColor, titleSize, titleWeight,
    showArtist, artistText, artistFont, artistColor, artistSize,
    textPosition, showProgressBar,
    fftSize, bassBoost, normalize,
  }
})
