import { describe, expect, it } from 'vitest'
import { applyTemplateToStore, getTemplateById, templateSteps, videoTemplates } from './videoTemplates.js'

describe('videoTemplates', () => {
  it('contains the observed Specterr preset names', () => {
    expect(videoTemplates.map(template => template.name)).toContain('Forest of Lights')
    expect(videoTemplates.map(template => template.name)).toContain('Default')
    expect(videoTemplates.map(template => template.name)).toContain('Eclipse')
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
    const store = { selectedTemplateId: '', backdropGradient1: '', barColor: '', vizShape: '' }

    expect(applyTemplateToStore(store, 'default')).toBe(true)

    expect(store.selectedTemplateId).toBe('default')
    expect(store.backdropGradient1).toBe('#0d0d1a')
    expect(store.barColor).toBe('#f85462')
    expect(store.vizShape).toBe('bars')
  })

  it('falls back to default when an unknown template id is requested', () => {
    expect(getTemplateById('missing').id).toBe('default')
  })
})
