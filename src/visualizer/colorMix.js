// CIELCh with the D65 white point used by the reference's chroma.js renderer.
// CSS lch() uses D50, so delegating this conversion to canvas would change colors.
const WHITE = [0.95047, 1, 1.08883]
const EPSILON = 216 / 24389
const KAPPA = 24389 / 27

/** Mix sRGB bytes in LCH, using the shortest hue arc and clipping to sRGB. */
export function mixLch(first, second, amount) {
  // Specterr replaces pure black only when a secondary color is present.
  const start = first.every(channel => channel === 0) ? [1, 1, 1] : first
  const end = second.every(channel => channel === 0) ? [1, 1, 1] : second
  if (amount === 0) return start
  if (amount === 1) return end
  const [light1, chroma1, hue1] = rgbToLch(start)
  const [light2, chroma2, hue2] = rgbToLch(end)
  const startHue = Number.isNaN(hue1) ? hue2 : hue1
  const endHue = Number.isNaN(hue2) ? startHue : hue2
  let arc = endHue - startHue
  if (arc > 180) arc -= 360
  if (arc < -180) arc += 360
  const hue = (Number.isNaN(startHue) ? 0 : startHue + arc * amount) * Math.PI / 180
  const chroma = chroma1 + (chroma2 - chroma1) * amount
  return labToRgb(light1 + (light2 - light1) * amount, chroma * Math.cos(hue), chroma * Math.sin(hue))
}

function rgbToLch(rgb) {
  const [red, green, blue] = rgb.map(value => {
    const channel = value / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  const xyz = [
    red * 0.4124564 + green * 0.3575761 + blue * 0.1804375,
    red * 0.2126729 + green * 0.7151522 + blue * 0.072175,
    red * 0.0193339 + green * 0.119192 + blue * 0.9503041,
  ].map((value, index) => {
    const ratio = value / WHITE[index]
    return ratio > EPSILON ? Math.cbrt(ratio) : (KAPPA * ratio + 16) / 116
  })
  const a = 500 * (xyz[0] - xyz[1])
  const b = 200 * (xyz[1] - xyz[2])
  const chroma = Math.hypot(a, b)
  // Hue is undefined for neutrals; inherit the other endpoint's hue.
  const hue = Math.round(chroma * 10000) === 0 ? NaN : (Math.atan2(b, a) * 180 / Math.PI + 360) % 360
  return [Math.max(0, 116 * xyz[1] - 16), chroma, hue]
}

function labToRgb(light, a, b) {
  const y = (light + 16) / 116
  const xyz = [y + a / 500, y, y - b / 200].map((value, index) => (
    WHITE[index] * (value ** 3 > EPSILON ? value ** 3 : (116 * value - 16) / KAPPA)
  ))
  const [x, luminance, z] = xyz
  return [
    3.2404542 * x - 1.5371385 * luminance - 0.4985314 * z,
    -0.969266 * x + 1.8760108 * luminance + 0.041556 * z,
    0.0556434 * x - 0.2040259 * luminance + 1.0572252 * z,
  ].map(value => {
    const channel = value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055
    return Math.round(Math.max(0, Math.min(1, channel)) * 255)
  })
}
