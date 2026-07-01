import { describe, expect, it } from 'vitest'
import { applyTemplateToStore, getTemplateById, templateSteps, videoTemplates } from './videoTemplates.js'

describe('videoTemplates', () => {
  it('contains the observed Specterr preset names', () => {
    expect(videoTemplates.map(template => template.name)).toContain('Forest of Lights')
    expect(videoTemplates.map(template => template.name)).toContain('Default')
    expect(videoTemplates.map(template => template.name)).toContain('Eclipse')
    expect(videoTemplates.map(template => template.name)).toContain('SoundVisible Gold')
  })

  it('keeps the Specterr step guide order', () => {
    expect(templateSteps.map(step => step.label)).toEqual([
      'Preset',
      'Audio',
      'Images',
      'Text',
      'Colors',
      'Elements',
      'Export',
    ])
  })

  it('applies selected template settings to a store-like object', () => {
    const store = {
      selectedTemplateId: '', backdropGradient1: '', barColor: '',
      soundVisibleColor: '#ffffff', visualizerMode: 'soundvisible', vizShape: '',
    }

    expect(applyTemplateToStore(store, 'default')).toBe(true)

    expect(store.selectedTemplateId).toBe('default')
    expect(store.backdropGradient1).toBe('#0d0d1a')
    expect(store.barColor).toBe('#f85462')
    expect(store.soundVisibleColor).toBe('#f6c453')
    expect(store.visualizerMode).toBe('classic')
    expect(store.vizShape).toBe('bars')
  })

  it('falls back to default when an unknown template id is requested', () => {
    expect(getTemplateById('missing').id).toBe('default')
  })

  it('provides a one-click SoundVisible gold preset', () => {
    const store = { glowEnabled: true, selectedTemplateId: '', visualizerMode: '' }

    expect(applyTemplateToStore(store, 'soundvisible-gold')).toBe(true)

    expect(store.glowEnabled).toBe(false)
    expect(store.selectedTemplateId).toBe('soundvisible-gold')
    expect(store.visualizerMode).toBe('soundvisible')
  })
})
