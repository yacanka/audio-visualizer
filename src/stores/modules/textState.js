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
    titleAlign: ref('center'),
    showArtist: ref(true),
    artistText: ref(''),
    artistFont: ref('Inter'),
    artistColor: ref('rgba(255,255,255,0.65)'),
    artistSize: ref(18),
    artistWeight: ref('400'),
    artistAlign: ref('center'),
    textPosition: ref('bottom'),
    titleX: ref(50), titleY: ref(85), artistX: ref(50), artistY: ref(78),
    showProgressBar: ref(true),
    lyricsEnabled: ref(false),
    lyricsText: ref(''),
    lyricSegments: ref([]),
  }
}
