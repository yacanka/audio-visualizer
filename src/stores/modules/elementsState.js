import { ref } from 'vue'

/** Create user-added visual element state and actions. */
export function createElementsState() {
  const elements = ref([])
  const selectedElementId = ref(null)
  const particleDirection = ref('right')
  const particleReactiveSpeed = ref(true)

  /** Add a movable text element to the canvas timeline. */
  function addTextElement() {
    const id = createElementId('text')
    elements.value.push({ id, type: 'text', text: 'NEW TEXT', x: 50, y: 50, size: 28, color: '#ffffff' })
    selectedElementId.value = id
  }

  /** Add a movable image element to the canvas timeline. */
  function addImageElement(src, name = 'Image') {
    const id = createElementId('image')
    elements.value.push({ id, type: 'image', name, src, x: 50, y: 50, size: 28, opacity: 1 })
    selectedElementId.value = id
  }

  /** Add a like and subscribe text preset. */
  function addSubscribeAnimation() {
    elements.value.push(createTextElement('LIKE', 38, 42, 36))
    const subscribe = createTextElement('SUBSCRIBE', 62, 42, 28)
    elements.value.push(subscribe)
    selectedElementId.value = subscribe.id
  }

  /** Add a particle layer element to the canvas timeline. */
  function addParticleElement() {
    const id = createElementId('particles')
    elements.value.push(createParticleElement(id))
    selectedElementId.value = id
  }

  /** Delete the currently selected timeline element. */
  function deleteSelectedElement() {
    elements.value = elements.value.filter(item => item.id !== selectedElementId.value)
    selectedElementId.value = elements.value[0]?.id || null
  }

  return {
    elements,
    selectedElementId,
    particleDirection,
    particleReactiveSpeed,
    addTextElement,
    addImageElement,
    addSubscribeAnimation,
    addParticleElement,
    deleteSelectedElement,
  }
}

function createElementId(prefix) {
  return globalThis.crypto?.randomUUID?.() || `${prefix}-${Date.now()}`
}

function createTextElement(text, x, y, size) {
  return { id: createElementId('text'), type: 'text', text, x, y, size, color: '#ffffff' }
}

function createParticleElement(id) {
  return { id, type: 'particles', name: 'Particles', x: 50, y: 50, size: 40, color: '#ffffff', count: 42 }
}
