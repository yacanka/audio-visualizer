import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from '../stores/app.js'
import { applyTemplateToStore, createTemplateSettings, getTemplateById, videoTemplates } from './videoTemplates.js'
import { parseProject } from '../utils/project.js'
import { existsSync } from 'node:fs'

describe('preset integration', () => {
  beforeEach(() => setActivePinia(createPinia()))
  it('opts reference presets into LCH', () => {
    expect(createTemplateSettings(getTemplateById('default')).visualizerLayers.every(layer => layer.colorMix === 'lch')).toBe(true)
  })
  it('retains observed text anchors and artist weight in the flat Jungle Cat preset', () => {
    const settings = createTemplateSettings(getTemplateById('jungle-cat'))
    expect(settings).toMatchObject({ titleAlign: 'left', artistAlign: 'left', artistWeight: '700' })
  })
  it('keeps local video on preset changes and excludes runtime media from version-1 files', () => {
    const store = useAppStore()
    store.initializeHistory()
    const file = new File(['video'], 'loop.webm', { type: 'video/webm' })
    store.backdropVideoFile = file
    store.backdropVideoName = file.name
    store.backdropType = 'video'
    store.backdropVideoStatus = 'Loading video...'
    applyTemplateToStore(store, 'default')
    expect(store.backdropVideoFile).toBe(file)
    expect(store.backdropType).toBe('video')
    const snapshot = store.createSnapshot()
    expect(snapshot.backdropVideoName).toBe('loop.webm')
    for (const key of ['backdropVideoFile', 'backdropVideo', 'backdropVideoStatus']) expect(snapshot).not.toHaveProperty(key)
    store.restoreProject(parseProject(JSON.stringify({ app: 'audio-spectrum-visualizer', version: 1, settings: snapshot }), snapshot))
    expect(store.backdropType).toBe('video')
    expect(store.backdropVideoFile).toBeNull()
  })
  it('uses filled centers and disables unrelated whole-frame distortion for reference presets', () => {
    const settings = createTemplateSettings(getTemplateById('default'))
    expect(settings.visualizerHollowCenter).toBe(false)
    expect(settings.webglDisplacementEnabled).toBe(false)
    expect(createTemplateSettings(getTemplateById('soundvisible-gold')).visualizerHollowCenter).toBe(true)
  })
  it('ships the 85 observed free presets and all referenced local assets', () => {
    const presets = videoTemplates.filter(preset => preset.source === 'specterr')
    expect(presets).toHaveLength(85)
    expect(new Set(videoTemplates.map(preset => preset.id)).size).toBe(videoTemplates.length)
    for (const preset of presets) {
      const settings = createTemplateSettings(preset)
      expect(settings.visualizerLayers.length).toBeGreaterThan(0)
      expect(settings.visualizerLayers.length).toBeLessThanOrEqual(7)
      if (settings.backdropImageSrc) expect(existsSync(`public${settings.backdropImageSrc}`)).toBe(true)
      expect(existsSync(`public${settings.visualizerImageSrc}`)).toBe(true)
    }
  })
  it('resets design effects and layers without changing audio, user images or text', () => {
    const store = useAppStore()
    store.titleText = 'My track'
    store.artistText = 'My artist'
    store.backdropImageSrc = 'data:image/png;base64,AAAA'
    store.backdropImageIsPreset = false
    store.visualizerImageSrc = 'data:image/png;base64,BBBB'
    store.visualizerImageIsPreset = false
    const file = new File(['audio'], 'track.wav', { type: 'audio/wav' })
    store.audioFile = file
    store.currentTime = 15
    applyTemplateToStore(store, 'coil')
    expect(store.visualizerLayers).toHaveLength(7)
    store.fireEnabled = true
    applyTemplateToStore(store, 'default')
    expect(store.visualizerLayers).toHaveLength(2)
    expect(store.fireEnabled).toBe(false)
    expect(store.titleText).toBe('My track')
    expect(store.artistText).toBe('My artist')
    expect(store.backdropImageSrc).toBe('data:image/png;base64,AAAA')
    expect(store.visualizerImageSrc).toBe('data:image/png;base64,BBBB')
    expect(store.audioFile).toBe(file)
    expect(store.currentTime).toBe(15)
  })
  it('keeps catalog arrays immutable and retains user elements alongside preset particles', () => {
    const store = useAppStore()
    store.addTextElement()
    const id = store.selectedElementId
    applyTemplateToStore(store, 'default')
    store.visualizerLayers[0].fillColor = '#123456'
    expect(getTemplateById('default').settings.visualizerLayers[0].fillColor).toBe('#ffffff')
    expect(store.elements.some(element => element.id === id)).toBe(true)
    expect(store.elements.some(element => element.type === 'particles')).toBe(true)
  })
  it('round trips a preset through compatible version-1 project JSON', () => {
    const store = useAppStore()
    store.initializeHistory()
    applyTemplateToStore(store, 'coil')
    const settings = store.createSnapshot()
    const json = JSON.stringify({ app: 'audio-spectrum-visualizer', version: 1, settings })
    applyTemplateToStore(store, 'default')
    store.restoreProject(parseProject(json, store.createSnapshot()))
    expect(store.selectedTemplateId).toBe('coil')
    expect(store.visualizerLayers).toHaveLength(7)
    expect(store.backdropImageSrc).toBe(settings.backdropImageSrc)
    expect(store.isPlaying).toBe(false)
    expect(settings).not.toHaveProperty('selectedDuration')
    expect(settings).not.toHaveProperty('isExporting')
  })
  it('retains transparent fills, visible outlines and reactive colors in imported presets', () => {
    const purification = getTemplateById('purification').settings.visualizerLayers[0]
    expect(purification).toMatchObject({ opacity: 1, fillOpacity: 0, outlineOpacity: 1, outlineWidth: 3 })
    const northern = getTemplateById('northern-lights').settings.visualizerLayers[0]
    expect(northern).toMatchObject({ opacity: 1, fillOpacity: 0, secondaryFillColor: '#ffffff', secondaryFillOpacity: 0.31 })
    const store = useAppStore()
    for (const preset of videoTemplates) {
      applyTemplateToStore(store, preset)
      const json = JSON.stringify({ app: 'audio-spectrum-visualizer', version: 1, settings: store.createSnapshot() })
      expect(() => parseProject(json, store.createSnapshot()), preset.name).not.toThrow()
    }
  })
})
