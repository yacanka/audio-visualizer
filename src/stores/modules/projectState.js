import { computed, ref } from 'vue'

/** Create editor shell, preview, and project state refs. */
export function createProjectState(audio) {
  const startTime = ref(0)
  const endTime = ref(0)
  const duration = audio.duration

  return {
    activeTab: ref('general'),
    visualizerSubTab: ref('layers'),
    backdropSubTab: ref('reflection'),
    aspectRatio: ref('16:9'),
    previewQuality: ref(720),
    previewBackgroundMode: ref('animate'),
    previewAudioAnalysisEnabled: ref(true),
    exportStatus: ref(''),
    startTime,
    endTime,
    isVideoPublic: ref(false),
    selectedDuration: computed(() => Math.max(0, (endTime.value || duration.value) - startTime.value)),
  }
}
