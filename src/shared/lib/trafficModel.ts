import { clamp } from '@/shared/lib/utils'

export type CongestionLevel = 'Fluido' | 'Lento' | 'Congestionado' | 'Crítico'

/** Curva de hora pico RD (0–40) según hora local y día de semana. */
export function rushHourPressure(hour: number, minute: number, day: number) {
  const t = hour + minute / 60
  const weekend = day === 0 || day === 6

  const morning = gaussian(t, weekend ? 10.5 : 7.75, weekend ? 1.4 : 1.1)
  const midday = gaussian(t, 12.5, 1.2) * (weekend ? 0.55 : 0.35)
  const evening = gaussian(t, weekend ? 18.5 : 18.0, weekend ? 1.6 : 1.25)
  const nightPenalty = t >= 22 || t < 5 ? -8 : 0

  const weekdayBoost = weekend ? 0.72 : 1
  const fridayEvening = day === 5 && t >= 16 && t <= 20 ? 1.12 : 1

  return clamp((morning * 38 + midday * 18 + evening * 40) * weekdayBoost * fridayEvening + nightPenalty, 0, 42)
}

function gaussian(x: number, mean: number, sigma: number) {
  const z = (x - mean) / sigma
  return Math.exp(-0.5 * z * z)
}

/** Impacto del clima vivo en congestión urbana. */
export function weatherTrafficPenalty(precipMm: number, windKmh: number) {
  const rain = clamp(precipMm * 9, 0, 28)
  const wind = windKmh >= 35 ? clamp((windKmh - 35) * 0.35, 0, 8) : 0
  return rain + wind
}

export function congestionScore(opts: {
  hour: number
  minute: number
  day: number
  chronic: number
  precipMm: number
  windKmh: number
}) {
  const rush = rushHourPressure(opts.hour, opts.minute, opts.day)
  const weather = weatherTrafficPenalty(opts.precipMm, opts.windKmh)
  return clamp(28 + opts.chronic + rush + weather, 0, 100)
}

export function congestionLevel(score: number): CongestionLevel {
  if (score >= 80) return 'Crítico'
  if (score >= 62) return 'Congestionado'
  if (score >= 42) return 'Lento'
  return 'Fluido'
}

export function congestionColor(score: number) {
  if (score >= 80) return '#b91c1c'
  if (score >= 62) return '#f07167'
  if (score >= 42) return '#e9a825'
  return '#3d8b6e'
}

/** Multiplicador sobre tiempo libre de flujo (OSRM). */
export function travelMultiplier(score: number) {
  return 1 + (score / 100) * 1.85
}

export function formatMinutes(sec: number) {
  const m = Math.max(1, Math.round(sec / 60))
  return `${m} min`
}

export function advanceRdClock(hour: number, minute: number, addMinutes: number) {
  const total = hour * 60 + minute + addMinutes
  const wrapped = ((total % (24 * 60)) + 24 * 60) % (24 * 60)
  return { hour: Math.floor(wrapped / 60), minute: wrapped % 60 }
}

export function travelAdvice(scoreNow: number, score45: number, raining: boolean) {
  if (raining && scoreNow >= 55) {
    return 'Hay lluvia y la vía ya va cargada: suma margen extra o espera a que baje el aguacero si puedes.'
  }
  if (score45 > scoreNow + 8) {
    return 'La proyección a 45 min sube: si debes moverte, sal ya o espera pasado el pico.'
  }
  if (score45 < scoreNow - 8) {
    return 'En ~45 min debería aliviarse un poco: puedes esperar si el viaje no es urgente.'
  }
  if (scoreNow >= 80) {
    return 'Congestión crítica estimada. Considera otra vía, transporte alterno o reprogramar.'
  }
  if (scoreNow >= 62) {
    return 'Va lento. Evita giros innecesarios y revisa Waze/Google por incidentes puntuales.'
  }
  if (scoreNow >= 42) {
    return 'Tráfico moderado. Tiempo de viaje algo por encima del flujo libre.'
  }
  return 'Flujo aceptable en este corredor. Buen momento relativo para cruzarlo.'
}

