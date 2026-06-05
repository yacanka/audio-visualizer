import { ref } from 'vue'

/** Create preset selection and guide state refs. */
export function createTemplateState() {
  return {
    selectedTemplateId: ref('default'),
    stepGuideIndex: ref(0),
    templateGalleryExpanded: ref(false),
  }
}
