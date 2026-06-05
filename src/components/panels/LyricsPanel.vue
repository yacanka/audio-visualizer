<template>
  <div class="panel">
    <h3 class="panel-title">Lyrics</h3>

    <section class="section">
      <div class="row">
        <label class="item-label">Lyrics</label>
        <label class="toggle">
          <input type="checkbox" v-model="store.lyricsEnabled" />
          <span class="track" />
        </label>
      </div>
      <textarea v-model="store.lyricsText" class="lyrics-input" placeholder="Paste some text here" />
      <div class="actions">
        <button class="chip" @click="applyText">Add Lyrics</button>
        <button class="chip" @click="sampleLyrics">Sample Lyrics</button>
      </div>
    </section>

    <section class="section">
      <label class="section-label">Auto Detection</label>
      <button class="upload-btn" @click="applyText">Auto Detect Lyrics (BETA)</button>
      <p class="hint">Yerel sürüm metni satırlara böler ve ses süresine eşit dağıtır.</p>
    </section>

    <section class="section">
      <label class="section-label">Upload SRT</label>
      <input type="file" accept=".srt,text/plain" @change="onSrtUpload" />
      <button class="remove-btn" @click="clearLyrics">Remove Lyrics</button>
    </section>
  </div>
</template>

<script setup>
import { useAppStore } from '../../stores/app.js'
import { createLyricSegments, parseSrt } from '../../utils/lyrics.js'

const store = useAppStore()

function applyText() {
  store.lyricSegments = createLyricSegments(store.lyricsText, store.duration || 30)
  store.lyricsEnabled = true
}

function sampleLyrics() {
  store.lyricsText = 'Slow energy in the night\nLights are moving with the sound\nEvery wave becomes a line'
  applyText()
}

async function onSrtUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  store.lyricsText = await file.text()
  store.lyricSegments = parseSrt(store.lyricsText)
  store.lyricsEnabled = true
  event.target.value = ''
}

function clearLyrics() {
  store.lyricsText = ''
  store.lyricSegments = []
  store.lyricsEnabled = false
}
</script>

<style scoped>
@import './panel-shared.css';

.lyrics-input {
  width: 100%;
  min-height: 120px;
  resize: vertical;
  margin-top: 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 8px;
  font: inherit;
}
.actions { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
.hint { margin-top: 6px; color: var(--text-muted); font-size: 10px; }
.upload-btn, .remove-btn {
  width: 100%;
  padding: 8px;
  border-radius: var(--radius-sm);
  background: var(--bg-hover);
  color: var(--text-secondary);
  font-size: 11px;
}
.remove-btn { margin-top: 8px; color: #ff8585; }
</style>
