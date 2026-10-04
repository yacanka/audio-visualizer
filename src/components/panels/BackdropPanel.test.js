import { mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createBackdropState } from '../../stores/modules/backdropState.js'
import BackdropPanel from './BackdropPanel.vue'

let store
vi.mock('../../stores/app.js', () => ({ useAppStore: () => store }))

describe('video backdrop controls', () => {
  beforeEach(() => { store = reactive(createBackdropState()) })
  it('selects a local video and exposes the fit controls', async () => {
    const wrapper = mount(BackdropPanel)
    const input = wrapper.get('input[accept="video/mp4,video/webm"]')
    const file = new File(['video'], 'loop.webm', { type: 'video/webm' })
    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('change')
    expect(store.backdropVideoFile).toBe(file)
    expect(store.backdropType).toBe('video')
    expect(wrapper.text()).toContain('loop.webm')
    expect(wrapper.text()).toContain('contain')
  })
  it('rejects unsupported file types without replacing the current backdrop', async () => {
    const wrapper = mount(BackdropPanel)
    const input = wrapper.get('input[accept="video/mp4,video/webm"]')
    Object.defineProperty(input.element, 'files', { value: [new File(['text'], 'bad.txt', { type: 'text/plain' })] })
    await input.trigger('change')
    expect(store.backdropType).toBe('solid')
    expect(store.backdropVideoFile).toBeNull()
    expect(wrapper.text()).toContain('Choose an MP4 or WebM')
  })
})
