<template>
  <div class="image-upload">
    <button class="media-button" @click="input?.click()">{{ label }}</button>
    <input ref="input" hidden type="file" accept="image/png,image/jpeg,image/webp,image/gif" @change="load" />
    <div v-if="modelValue" class="uploaded-image">
      <img :src="modelValue" alt="Selected image" />
      <button @click="$emit('update:modelValue', ''); $emit('loaded', '')">Remove image</button>
    </div>
    <p v-if="error" role="alert">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
defineProps({ modelValue: { type: String, default: '' }, label: { type: String, default: 'Select Media' } })
const emit = defineEmits(['update:modelValue', 'loaded'])
const input = ref(null)
const error = ref('')
let request = 0

async function load(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  const current = ++request
  error.value = ''
  if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type) || file.size > 20 * 1024 * 1024) {
    error.value = 'Choose a PNG, JPEG, WebP or GIF image under 20 MB.'
    return
  }
  try {
    const source = await readFile(file)
    const image = new Image()
    image.src = source
    await image.decode()
    if (current !== request) return
    emit('update:modelValue', source)
    emit('loaded', source)
  } catch {
    if (current === request) error.value = 'This image could not be opened.'
  }
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
</script>

<style scoped>
.media-button { width: 100%; padding: 10px; border: 1px solid var(--border-hover); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 12px; }
.media-button:hover { background: var(--bg-hover); }
.uploaded-image { display: flex; align-items: center; gap: 12px; margin-top: 10px; }
img { width: 56px; height: 40px; object-fit: contain; background: var(--bg-secondary); border-radius: 4px; }
.uploaded-image button { color: var(--text-secondary); font-size: 11px; }
p { margin-top: 8px; color: #ff8585; font-size: 11px; }
</style>
