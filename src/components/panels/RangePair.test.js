import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RangePair from './RangePair.vue'

describe('RangePair', () => {
  it('prevents the minimum and maximum sliders from crossing', async () => {
    const wrapper = mount(RangePair, {
      props: { label: 'Opacity', min: 0, max: 100, minimumValue: 30, maximumValue: 70 },
    })
    const [minimumSlider, maximumSlider] = wrapper.findAll('input')

    await minimumSlider.setValue(90)
    await maximumSlider.setValue(10)

    expect(wrapper.emitted('update:minimumValue')[0]).toEqual([70])
    expect(wrapper.emitted('update:maximumValue')[0]).toEqual([30])
  })
})
