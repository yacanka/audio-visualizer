import { ref } from 'vue'

/** Create background image, color, and reactive motion state refs. */
export function createBackdropState() {
  return {
    mirrorH: ref(false),
    backdropType: ref('solid'),
    backdropColor: ref('#0d0d1a'),
    backdropGradient1: ref('#0d0d1a'),
    backdropGradient2: ref('#1a0d2e'),
    backdropGradientAngle: ref(135),
    backdropImage: ref(null),
    backdropImageFit: ref('cover'),
    backdropReactive: ref(false),
    backdropReactiveIntensity: ref(20),
    backdropReflection: ref('none'),
    backdropRotate: ref(false),
    backdropRotationSpeed: ref(0),
    backdropDrift: ref(false),
    backdropDriftIntensity: ref(0),
    backdropDriftCustom: ref(false),
    backdropRumble: ref('none'),
    backdropHue: ref(0),
    backdropSaturation: ref(50),
    backdropLightness: ref(50),
    backdropColorize: ref(false),
    backdropColorizeIntensity: ref(100),
  }
}
