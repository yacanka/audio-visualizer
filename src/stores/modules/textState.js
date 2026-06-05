import { ref } from 'vue'

/** Create title, artist, and lyrics state refs. */
export function createTextState() {
  return {
    showTitle: ref(true),
    titleText: ref(''),
    titleFont: ref('Orbitron'),
    titleColor: ref('#ffffff'),
    titleSize: ref(32),
    titleWeight: ref('700'),
    showArtist: ref(true),
    artistText: ref(''),
    artistFont: ref('Inter'),
    artistColor: ref('rgba(255,255,255,0.65)'),
    artistSize: ref(18),
    textPosition: ref('bottom'),
    showProgressBar: ref(true),
    lyricsEnabled: ref(false),
    lyricsText: ref(''),
    lyricSegments: ref([]),
  }
}
