import { useAppStore } from '../stores/app.js'

export function useVisualizer() {
  const store = useAppStore()
  let driftOffset = 0
  let driftDir = 1
  let lastTime = 0

  function getCanvasDimensions() {
    switch (store.aspectRatio) {
      case '9:16': return { w: 480, h: 854 }
      case '1:1':  return { w: 640, h: 640 }
      default:     return { w: 854, h: 480 }
    }
  }

  function drawFrame(canvas, getFreqData, getTimeData, timestamp) {
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    const dt = timestamp - lastTime
    lastTime = timestamp

    // --- Background ---
    drawBackdrop(ctx, W, H)

    const freqData = getFreqData()
    const timeData = getTimeData()
    if (!freqData) return

    // --- Drift ---
    if (store.drift && store.isPlaying) {
      const speed = store.driftIntensity * 0.0003
      driftOffset += speed * driftDir * dt
      if (Math.abs(driftOffset) > 30) driftDir *= -1
    }

    // --- Glow setup ---
    if (store.glowEnabled) {
      ctx.shadowBlur = store.glowAmount
      ctx.shadowColor = store.glowColor
    } else {
      ctx.shadowBlur = 0
    }

    // --- Draw visualizer ---
    switch (store.vizShape) {
      case 'bars':     drawBars(ctx, freqData, W, H, false); break
      case 'mirror':   drawBars(ctx, freqData, W, H, true); break
      case 'wave':     drawWave(ctx, timeData, W, H); break
      case 'circular': drawCircular(ctx, freqData, W, H); break
      case 'filled':   drawFilled(ctx, freqData, W, H); break
    }

    // Reset shadow
    ctx.shadowBlur = 0

    // --- Text overlays ---
    drawText(ctx, W, H)

    // --- Progress bar ---
    if (store.showProgressBar && store.duration > 0) {
      drawProgressBar(ctx, W, H)
    }
  }

  function drawBackdrop(ctx, W, H) {
    if (store.backdropType === 'gradient') {
      const angle = (store.backdropGradientAngle * Math.PI) / 180
      const x1 = W / 2 - Math.cos(angle) * W
      const y1 = H / 2 - Math.sin(angle) * H
      const x2 = W / 2 + Math.cos(angle) * W
      const y2 = H / 2 + Math.sin(angle) * H
      const grad = ctx.createLinearGradient(x1, y1, x2, y2)
      grad.addColorStop(0, store.backdropGradient1)
      grad.addColorStop(1, store.backdropGradient2)
      ctx.fillStyle = grad
    } else if (store.backdropType === 'image' && store.backdropImage) {
      ctx.drawImage(store.backdropImage, 0, 0, W, H)
      return
    } else {
      ctx.fillStyle = store.backdropColor
    }
    ctx.fillRect(0, 0, W, H)
  }

  function getSpectrumSlice(freqData) {
    const binCount = freqData.length
    const limit = store.vizSpectrum === 'bass'
      ? Math.floor(binCount * 0.25)  // ~0–5kHz
      : Math.floor(binCount * 0.85)  // wide
    return { data: freqData, limit }
  }

  function getBarColor(ctx, x, y, barW, barH, W, H) {
    if (!store.useGradient) return store.barColor

    let grad
    if (store.gradientDir === 'vertical') {
      grad = ctx.createLinearGradient(x, y + barH, x, y)
    } else {
      grad = ctx.createLinearGradient(0, 0, W, 0)
    }
    grad.addColorStop(0, store.barColor)
    grad.addColorStop(1, store.barColor2)
    return grad
  }

  function drawBars(ctx, freqData, W, H, mirror) {
    const { data, limit } = getSpectrumSlice(freqData)
    const count = store.barCount
    const gap = store.barGap
    const totalGap = gap * (count - 1)
    const barW = Math.max(1, (W - totalGap) / count)
    const maxH = mirror ? H * 0.38 : H * 0.78
    const baseY = mirror ? H / 2 : H

    for (let i = 0; i < count; i++) {
      const dataIdx = Math.round((i / count) * limit)
      const raw = data[dataIdx] / 255
      const amp = raw * store.sensitivity
      const bh = Math.max(1, amp * maxH)
      const x = i * (barW + gap) + (W - (count * (barW + gap) - gap)) / 2
      const y = baseY - bh

      const color = getBarColor(ctx, x, y, barW, bh, W, H)
      ctx.fillStyle = color

      const r = Math.min(store.barRounding, barW / 2, bh / 2)
      ctx.beginPath()
      if (r > 0) {
        ctx.roundRect(x, y, barW, bh, [r, r, 0, 0])
      } else {
        ctx.rect(x, y, barW, bh)
      }
      ctx.fill()

      if (mirror && bh > 1) {
        ctx.beginPath()
        if (r > 0) {
          ctx.roundRect(x, baseY, barW, bh, [0, 0, r, r])
        } else {
          ctx.rect(x, baseY, barW, bh)
        }
        ctx.fill()
      }
    }
  }

  function drawWave(ctx, timeData, W, H) {
    if (!timeData) return
    const centerY = H / 2

    ctx.beginPath()
    ctx.lineWidth = 2.5
    ctx.strokeStyle = store.useGradient
      ? (() => {
          const g = ctx.createLinearGradient(0, 0, W, 0)
          g.addColorStop(0, store.barColor)
          g.addColorStop(1, store.barColor2)
          return g
        })()
      : store.barColor

    const step = W / timeData.length
    for (let i = 0; i < timeData.length; i++) {
      const v = (timeData[i] - 128) / 128
      const y = centerY + v * H * 0.35 * store.sensitivity
      if (i === 0) ctx.moveTo(0, y)
      else ctx.lineTo(i * step, y)
    }
    ctx.stroke()
  }

  function drawFilled(ctx, freqData, W, H) {
    const { data, limit } = getSpectrumSlice(freqData)
    const step = W / limit

    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, store.barColor)
    grad.addColorStop(1, store.useGradient ? store.barColor2 : store.barColor + '44')
    ctx.fillStyle = grad
    ctx.strokeStyle = store.barColor
    ctx.lineWidth = 2

    ctx.beginPath()
    ctx.moveTo(0, H)
    for (let i = 0; i < limit; i++) {
      const amp = (data[i] / 255) * store.sensitivity
      const y = H - amp * H * 0.78
      ctx.lineTo(i * step, y)
    }
    ctx.lineTo(W, H)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }

  function drawCircular(ctx, freqData, W, H) {
    const { data, limit } = getSpectrumSlice(freqData)
    const cx = W / 2 + driftOffset * 0.3
    const cy = H / 2
    const innerR = Math.min(W, H) * 0.18
    const count = store.barCount
    const maxBarH = Math.min(W, H) * 0.25

    for (let i = 0; i < count; i++) {
      const dataIdx = Math.round((i / count) * limit)
      const amp = (data[dataIdx] / 255) * store.sensitivity
      const bh = amp * maxBarH

      const angle = (i / count) * Math.PI * 2 - Math.PI / 2
      const x1 = cx + Math.cos(angle) * innerR
      const y1 = cy + Math.sin(angle) * innerR
      const x2 = cx + Math.cos(angle) * (innerR + bh)
      const y2 = cy + Math.sin(angle) * (innerR + bh)

      const t = i / count
      const color = store.useGradient
        ? lerpColor(store.barColor, store.barColor2, t)
        : store.barColor

      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = Math.max(1.5, (Math.PI * 2 * innerR / count) * 0.6)
      ctx.lineCap = 'round'
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }

    // Inner circle
    ctx.beginPath()
    ctx.arc(cx, cy, innerR - 2, 0, Math.PI * 2)
    ctx.strokeStyle = store.barColor + '66'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  function drawText(ctx, W, H) {
    const hasTitle = store.showTitle && store.titleText.trim()
    const hasArtist = store.showArtist && store.artistText.trim()

    let yBase
    switch (store.textPosition) {
      case 'top':    yBase = 48; break
      case 'center': yBase = H / 2 - (hasTitle && hasArtist ? 26 : 14); break
      default:       yBase = H - (hasArtist ? 70 : 50); break
    }

    if (hasTitle) {
      ctx.font = `${store.titleWeight} ${store.titleSize}px '${store.titleFont}', sans-serif`
      ctx.fillStyle = store.titleColor
      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      // Text shadow
      ctx.shadowColor = 'rgba(0,0,0,0.6)'
      ctx.shadowBlur = 8
      ctx.fillText(store.titleText, W / 2 + driftOffset * 0.1, yBase)
      ctx.shadowBlur = 0
    }

    if (hasArtist) {
      ctx.font = `400 ${store.artistSize}px '${store.artistFont}', sans-serif`
      ctx.fillStyle = store.artistColor
      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 6
      ctx.fillText(store.artistText, W / 2 + driftOffset * 0.08, yBase + store.titleSize + 8)
      ctx.shadowBlur = 0
    }
  }

  function drawProgressBar(ctx, W, H) {
    const progress = store.currentTime / store.duration
    const barH = 3
    const y = H - barH
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.fillRect(0, y, W, barH)
    ctx.fillStyle = store.barColor
    ctx.fillRect(0, y, W * progress, barH)
  }

  function lerpColor(c1, c2, t) {
    const parse = h => {
      const r = parseInt(h.slice(1, 3), 16)
      const g = parseInt(h.slice(3, 5), 16)
      const b = parseInt(h.slice(5, 7), 16)
      return [r, g, b]
    }
    const [r1, g1, b1] = parse(c1)
    const [r2, g2, b2] = parse(c2)
    const r = Math.round(r1 + (r2 - r1) * t)
    const g = Math.round(g1 + (g2 - g1) * t)
    const b = Math.round(b1 + (b2 - b1) * t)
    return `rgb(${r},${g},${b})`
  }

  return { drawFrame, getCanvasDimensions }
}
