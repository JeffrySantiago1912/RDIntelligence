import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

export function round(value: number, digits = 1) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export function formatNumber(value: number, digits = 1) {
  return new Intl.NumberFormat('es-DO', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

export function riskLabel(score: number): 'Bajo' | 'Moderado' | 'Alto' | 'Crítico' {
  if (score >= 80) return 'Crítico'
  if (score >= 60) return 'Alto'
  if (score >= 35) return 'Moderado'
  return 'Bajo'
}

export function riskTone(score: number) {
  if (score >= 80) return 'text-red-700 bg-red-50 border-red-200'
  if (score >= 60) return 'text-orange-700 bg-orange-50 border-orange-200'
  if (score >= 35) return 'text-amber-700 bg-amber-50 border-amber-200'
  return 'text-emerald-700 bg-emerald-50 border-emerald-200'
}

export function beachFlag(waveM: number, windKmh: number, uv: number) {
  if (waveM >= 2.2 || windKmh >= 45 || uv >= 11) {
    return { flag: 'Roja' as const, estado: 'Peligroso', tone: 'bg-red-500' }
  }
  if (waveM >= 1.3 || windKmh >= 30 || uv >= 9) {
    return { flag: 'Amarilla' as const, estado: 'Precaución', tone: 'bg-amber-400' }
  }
  return { flag: 'Verde' as const, estado: 'Excelente', tone: 'bg-emerald-500' }
}

/** Heurística estacional de sargazo (Caribe oriental). No es un sensor oficial. */
export function sargassumIndex(month: number, windDir: number, windSpeed: number) {
  const peakSeason = month >= 4 && month <= 9
  const onshore = windDir >= 45 && windDir <= 160
  let score = peakSeason ? 45 : 15
  if (onshore) score += Math.min(35, windSpeed * 0.8)
  if (month >= 5 && month <= 8) score += 15
  return clamp(score)
}

export function floodRiskFromPrecip(mmNext5h: number, intensityMax: number) {
  const volume = clamp((mmNext5h / 120) * 70)
  const intensity = clamp((intensityMax / 40) * 30)
  return clamp(volume + intensity)
}

export function outageRisk(precipMm: number, windKmh: number, thunderProb: number) {
  return clamp(precipMm * 0.35 + windKmh * 0.6 + thunderProb * 0.4)
}

export function dengueRisk(tempC: number, humidity: number, precipMm: number) {
  const tempFactor = tempC >= 24 && tempC <= 32 ? 35 : tempC > 32 ? 20 : 10
  const humFactor = clamp((humidity - 50) * 0.7, 0, 35)
  const rainFactor = clamp(precipMm * 0.5, 0, 30)
  return clamp(tempFactor + humFactor + rainFactor)
}

export function fireRisk(tempC: number, humidity: number, windKmh: number, precipMm: number) {
  const dry = clamp(100 - humidity)
  const heat = clamp((tempC - 20) * 3)
  const wind = clamp(windKmh * 0.8)
  const rainPenalty = clamp(precipMm * 2)
  return clamp(dry * 0.35 + heat * 0.35 + wind * 0.3 - rainPenalty)
}

export function tourismScore(opts: {
  tempC: number
  precipMm: number
  uv: number
  sargazo: number
  waveM: number
}) {
  let score = 78
  if (opts.tempC < 24 || opts.tempC > 33) score -= 12
  if (opts.precipMm > 8) score -= 15
  if (opts.uv >= 11) score -= 8
  score -= opts.sargazo * 0.25
  if (opts.waveM > 2) score -= 10
  return clamp(score)
}
