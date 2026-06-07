import type { ColorGradingState, ColorWheelValue, CurvePoint, FilmLutName } from "@/lib/types"

const lutLooks: Record<FilmLutName, { contrast: number; saturation: number; brightness: number; hue: number; sepia: number }> = {
  Natural: { contrast: 0, saturation: 0, brightness: 0, hue: 0, sepia: 0 },
  Noir: { contrast: 22, saturation: -72, brightness: -4, hue: 0, sepia: 6 },
  "Teal/Orange": { contrast: 12, saturation: 16, brightness: 2, hue: -8, sepia: 8 },
  "Bleach Bypass": { contrast: 28, saturation: -36, brightness: 4, hue: 0, sepia: 10 },
  "Faded Film": { contrast: -14, saturation: -18, brightness: 8, hue: 2, sepia: 18 },
  "High Contrast": { contrast: 34, saturation: 8, brightness: -2, hue: 0, sepia: 0 },
  "Soft Glow": { contrast: -8, saturation: 10, brightness: 10, hue: 0, sepia: 4 },
  Cyberpunk: { contrast: 18, saturation: 34, brightness: 0, hue: 18, sepia: 0 },
  Vintage: { contrast: -4, saturation: -12, brightness: 5, hue: 8, sepia: 28 }
}

export function applyCurve(points: CurvePoint[], value: number) {
  const sorted = [...points].sort((a, b) => a.x - b.x)
  const x = clamp(value, 0, 1)
  const rightIndex = sorted.findIndex((point) => point.x >= x)
  if (rightIndex <= 0) return 1 - (sorted[0]?.y ?? 1)
  const left = sorted[rightIndex - 1]
  const right = sorted[rightIndex]
  const span = Math.max(0.001, right.x - left.x)
  const t = (x - left.x) / span
  return 1 - (left.y + (right.y - left.y) * t)
}

export function colorWheelToAdjustments(wheel: ColorWheelValue) {
  const radians = (wheel.hue * Math.PI) / 180
  const chroma = wheel.saturation / 100
  return {
    brightness: wheel.luminance * 0.18,
    saturation: wheel.saturation * 0.16,
    hue: Math.sin(radians) * chroma * 18,
    warmth: Math.cos(radians) * chroma * 10
  }
}

export function computePreviewFilter(color: ColorGradingState) {
  const lut = lutLooks[color.lut.name]
  const lutMix = color.lut.intensity / 100
  const lift = colorWheelToAdjustments(color.lift)
  const gamma = colorWheelToAdjustments(color.gamma)
  const gain = colorWheelToAdjustments(color.gain)
  const masterMid = applyCurve(color.curves.master, 0.5)
  const redMid = applyCurve(color.curves.red, 0.5)
  const blueMid = applyCurve(color.curves.blue, 0.5)
  const greenMid = applyCurve(color.curves.green, 0.5)
  const curveBrightness = (masterMid - 0.5) * 38
  const curveContrast = Math.abs(masterMid - 0.5) * 18
  const channelHue = (redMid - blueMid) * 22 + (greenMid - 0.5) * 8
  const temperatureShift = (color.manual.temperature - 6500) / 350

  const brightness = 100 + color.manual.exposure * 15 + color.manual.highlights * 0.08 + color.manual.shadows * 0.05 + lut.brightness * lutMix + lift.brightness + gamma.brightness + gain.brightness + curveBrightness
  const contrast = 100 + color.manual.contrast + lut.contrast * lutMix + curveContrast
  const saturation = 100 + color.manual.saturation + lut.saturation * lutMix + lift.saturation + gamma.saturation + gain.saturation
  const hue = color.manual.tint + temperatureShift + lut.hue * lutMix + lift.hue + gamma.hue + gain.hue + channelHue
  const sepia = Math.max(0, lut.sepia * lutMix + Math.max(0, temperatureShift) * 0.9)

  return [
    `brightness(${clamp(brightness, 20, 220).toFixed(1)}%)`,
    `contrast(${clamp(contrast, 20, 240).toFixed(1)}%)`,
    `saturate(${clamp(saturation, 0, 260).toFixed(1)}%)`,
    `hue-rotate(${clamp(hue, -180, 180).toFixed(1)}deg)`,
    `sepia(${clamp(sepia, 0, 80).toFixed(1)}%)`
  ].join(" ")
}

export function computeGradeOverlay(color: ColorGradingState) {
  const lift = colorWheelToAdjustments(color.lift)
  const gain = colorWheelToAdjustments(color.gain)
  const warmth = (color.manual.temperature - 6500) / 3500 + (lift.warmth + gain.warmth) / 100
  const tint = color.manual.tint / 50
  return {
    background: `linear-gradient(135deg, rgba(255,184,0,${clamp(warmth, 0, 1) * 0.14}), rgba(0,229,255,${clamp(-warmth, 0, 1) * 0.14})), linear-gradient(45deg, rgba(155,89,255,${clamp(tint, 0, 1) * 0.12}), rgba(0,255,148,${clamp(-tint, 0, 1) * 0.1}))`,
    opacity: color.previewMode === "before" ? 0 : 1
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
