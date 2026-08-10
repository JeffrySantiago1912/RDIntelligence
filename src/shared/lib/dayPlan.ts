import { BEACHES, type Beach } from '@/data/locations'
import { PARKS, type Park } from '@/data/parks'
import {
  fetchForecast,
  fetchMarine,
  type OpenMeteoForecast,
  weatherCodeLabel,
} from '@/shared/api/openMeteo'
import { getRdNowParts, getRdWeekdayOffset, isParkOpenOnWeekday } from '@/shared/lib/parkHours'
import { beachFlag, clamp, sargassumIndex, tourismScore } from '@/shared/lib/utils'

const RD_TZ = 'America/Santo_Domingo'

export type PlaceKind = 'park' | 'beach'

export type DayPlanFilters = {
  /** 0 = hoy, 1 = mañana, … */
  dayOffset: number
  kinds: PlaceKind[] | 'all'
  preferFree: boolean
  preferFamily: boolean
  preferCovered: boolean
  provinceHint: string | null
}

export type DayWeatherBrief = {
  date: string
  label: string
  tempMax: number
  tempMin: number
  precipMm: number
  precipProb: number | null
  uvMax: number
  windMax: number
  weatherCode: number
  weatherLabel: string
}

export type DayRecommendation = {
  id: string
  kind: PlaceKind
  name: string
  province: string
  lat: number
  lon: number
  score: number
  verdict: string
  whyGo: string[]
  bestWindow: string
  avoid: string | null
  tags: string[]
  href: string
  mapsLabel: string
  weather: DayWeatherBrief
  detail?: string
}

export type DayPlanResult = {
  filters: DayPlanFilters
  dayLabel: string
  hubWeather: DayWeatherBrief
  headline: string
  summary: string
  recommendations: DayRecommendation[]
  weekOutlook: { dayOffset: number; label: string; topName: string; score: number }[]
}

type WeatherHub = {
  id: string
  name: string
  lat: number
  lon: number
  coastal: boolean
}

const WEATHER_HUBS: WeatherHub[] = [
  { id: 'sd', name: 'Santo Domingo', lat: 18.4861, lon: -69.9312, coastal: true },
  { id: 'este', name: 'Este (Punta Cana)', lat: 18.582, lon: -68.405, coastal: true },
  { id: 'pp', name: 'Puerto Plata', lat: 19.7934, lon: -70.6884, coastal: true },
  { id: 'samana', name: 'Samaná', lat: 19.2056, lon: -69.3369, coastal: true },
  { id: 'barahona', name: 'Barahona', lat: 18.2085, lon: -71.1008, coastal: true },
  { id: 'santiago', name: 'Santiago / Cibao', lat: 19.4517, lon: -70.697, coastal: false },
  { id: 'cordillera', name: 'Cordillera Central', lat: 18.91, lon: -70.72, coastal: false },
]

function dist2(aLat: number, aLon: number, bLat: number, bLon: number) {
  const dLat = aLat - bLat
  const dLon = aLon - bLon
  return dLat * dLat + dLon * dLon
}

function nearestHub(lat: number, lon: number): WeatherHub {
  let best = WEATHER_HUBS[0]
  let bestD = Infinity
  for (const hub of WEATHER_HUBS) {
    const d = dist2(lat, lon, hub.lat, hub.lon)
    if (d < bestD) {
      bestD = d
      best = hub
    }
  }
  return best
}

function rdDateIso(dayOffset = 0, from = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: RD_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(from)
  const y = Number(parts.find((p) => p.type === 'year')?.value)
  const m = Number(parts.find((p) => p.type === 'month')?.value)
  const d = Number(parts.find((p) => p.type === 'day')?.value)
  const base = new Date(Date.UTC(y, m - 1, d + dayOffset))
  return base.toISOString().slice(0, 10)
}

function formatDayLabel(dayOffset: number, dateIso: string): string {
  const [, month, day] = dateIso.split('-')
  if (dayOffset === 0) return `Hoy · ${day}/${month}`
  if (dayOffset === 1) return `Mañana · ${day}/${month}`
  const weekday = getRdWeekdayOffset(dayOffset)
  const names = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return `${names[weekday]} · ${day}/${month}`
}

function dailyIndexForOffset(forecast: OpenMeteoForecast, dayOffset: number): number {
  const target = rdDateIso(dayOffset)
  const idx = forecast.daily?.time.findIndex((t) => t === target) ?? -1
  if (idx >= 0) return idx
  return Math.min(dayOffset, (forecast.daily?.time.length ?? 1) - 1)
}

function briefFromForecast(forecast: OpenMeteoForecast, dayOffset: number): DayWeatherBrief {
  const i = dailyIndexForOffset(forecast, dayOffset)
  const daily = forecast.daily
  const date = daily?.time[i] ?? rdDateIso(dayOffset)
  const code = daily?.weather_code?.[i] ?? forecast.current?.weather_code ?? 0
  return {
    date,
    label: formatDayLabel(dayOffset, date),
    tempMax: daily?.temperature_2m_max[i] ?? forecast.current?.temperature_2m ?? 30,
    tempMin: daily?.temperature_2m_min[i] ?? 24,
    precipMm: daily?.precipitation_sum[i] ?? 0,
    precipProb: daily?.precipitation_probability_max?.[i] ?? null,
    uvMax: daily?.uv_index_max?.[i] ?? 8,
    windMax: daily?.wind_speed_10m_max[i] ?? forecast.current?.wind_speed_10m ?? 15,
    weatherCode: code,
    weatherLabel: weatherCodeLabel(code),
  }
}

function middayWave(marineHourly: { time: string[]; wave_height: number[] }, dayOffset: number) {
  const date = rdDateIso(dayOffset)
  const waves: number[] = []
  for (let i = 0; i < marineHourly.time.length; i += 1) {
    if (marineHourly.time[i]?.startsWith(date)) {
      waves.push(marineHourly.wave_height[i] ?? 0)
    }
  }
  if (!waves.length) return 1.2
  return waves.reduce((a, b) => a + b, 0) / waves.length
}

function parkIsFamilyFriendly(park: Park) {
  return (
    park.categories.includes('tematico') ||
    park.categories.includes('urbano') ||
    park.highlights.some((h) => /niñ|familia|infantil/i.test(h))
  )
}

function parkIsCoveredBias(park: Park) {
  return /acuario|cueva|faro|museo|zool/i.test(park.name) || park.id === 'tres-ojos'
}

export function defaultDayPlanFilters(): DayPlanFilters {
  return {
    dayOffset: 0,
    kinds: 'all',
    preferFree: false,
    preferFamily: false,
    preferCovered: false,
    provinceHint: null,
  }
}

/** Interpreta texto corto del usuario (no es chat libre). */
export function parseDayPlanQuery(raw: string, base: DayPlanFilters = defaultDayPlanFilters()): DayPlanFilters {
  const q = raw.trim().toLowerCase()
  const next: DayPlanFilters = { ...base }

  if (!q) return next

  if (/pasado\s*ma[nñ]ana/.test(q)) next.dayOffset = 2
  else if (/ma[nñ]ana/.test(q)) next.dayOffset = 1
  else if (/\bhoy\b/.test(q)) next.dayOffset = 0
  else if (/\+?\s*2\s*d[ií]as?/.test(q)) next.dayOffset = 2
  else if (/\+?\s*3\s*d[ií]as?/.test(q)) next.dayOffset = 3
  else if (/\+?\s*4\s*d[ií]as?/.test(q)) next.dayOffset = 4
  else if (/pr[oó]xim/.test(q) || /esta\s*semana/.test(q)) next.dayOffset = 2

  const wantBeach = /playa|ba[nñ]arse|mar|oleaje|sargazo|snorkel|costa/.test(q)
  const wantPark = /parque|jard[ií]n|caminar|trote|verde|mirador|zool|acuario|bot[aá]nico/.test(q)
  if (wantBeach && !wantPark) next.kinds = ['beach']
  else if (wantPark && !wantBeach) next.kinds = ['park']
  else if (wantBeach && wantPark) next.kinds = 'all'

  next.preferFree = /gratis|sin\s*pagar|econ[oó]mic/.test(q) || next.preferFree
  next.preferFamily = /familia|ni[nñ]os?|ni[nñ]as?|pareja/.test(q) || next.preferFamily
  next.preferCovered =
    /lluvia|mojar|techado|interior|acuario|cueva|cubierto/.test(q) || next.preferCovered

  const provinces = [
    'santo domingo',
    'distrito nacional',
    'santiago',
    'punta cana',
    'bávaro',
    'bavaro',
    'puerto plata',
    'samana',
    'samaná',
    'barahona',
    'la altagracia',
    'la romana',
  ]
  for (const p of provinces) {
    if (q.includes(p)) {
      next.provinceHint = p
      break
    }
  }

  return next
}

function matchesProvinceHint(name: string, province: string, hint: string | null) {
  if (!hint) return true
  const hay = `${name} ${province}`.toLowerCase()
  if (hint.includes('punta cana') || hint.includes('bavaro') || hint.includes('bávaro')) {
    return /punta cana|b[aá]varo|bayah|altagracia|romana|este/i.test(hay)
  }
  if (hint.includes('santo domingo') || hint.includes('distrito')) {
    return /santo domingo|distrito|colonial|este/i.test(hay)
  }
  return hay.includes(hint)
}

function scorePark(
  park: Park,
  weather: DayWeatherBrief,
  dayOffset: number,
  filters: DayPlanFilters,
): DayRecommendation | null {
  if (filters.kinds !== 'all' && !filters.kinds.includes('park')) return null
  if (!matchesProvinceHint(park.name, park.province, filters.provinceHint)) return null
  if (filters.preferFree && park.access !== 'gratis') return null
  if (filters.preferFamily && !parkIsFamilyFriendly(park)) return null

  const weekday = getRdWeekdayOffset(dayOffset)
  const scheduledOpen = isParkOpenOnWeekday(park.schedule, weekday)
  if (!scheduledOpen) return null

  let score = 72
  const whyGo: string[] = []
  const tags: string[] = [...park.categories]
  if (park.access === 'gratis') tags.push('gratis')

  if (weather.precipMm <= 3) {
    score += 12
    whyGo.push(`Poca lluvia prevista (${weather.precipMm.toFixed(0)} mm)`)
  } else if (weather.precipMm <= 10) {
    score += 2
    whyGo.push(`Lluvia moderada (${weather.precipMm.toFixed(0)} mm): mejor en la mañana`)
  } else {
    score -= 18
    if (parkIsCoveredBias(park) || filters.preferCovered) {
      score += 14
      whyGo.push('Opción más resguardada si llueve')
    } else {
      whyGo.push('Día lluvioso: prioriza techado o acorta la visita')
    }
  }

  if (weather.tempMax >= 24 && weather.tempMax <= 32) {
    score += 8
    whyGo.push(`Temperatura agradable (${Math.round(weather.tempMax)}°C máx.)`)
  } else if (weather.tempMax > 33) {
    score -= 8
    whyGo.push('Hará calor: hidrátate y evita el mediodía')
  }

  if (weather.uvMax >= 9) {
    score -= 4
    whyGo.push(`UV alto (${Math.round(weather.uvMax)}): usa protector`)
  }

  if (filters.preferCovered && parkIsCoveredBias(park)) score += 10
  if (park.access === 'gratis') score += 4
  if (dayOffset === 0) {
    const { hour } = getRdNowParts()
    const openMin = park.schedule.openHour * 60 + park.schedule.openMinute
    const closeMin = park.schedule.closeHour * 60 + park.schedule.closeMinute
    const nowMin = hour * 60
    if (nowMin >= closeMin - 60) score -= 15
    if (nowMin < openMin - 30) whyGo.push(`Abre a las ${park.schedule.openHour}:${String(park.schedule.openMinute).padStart(2, '0')}`)
  }

  score = clamp(score)
  const avoid =
    weather.precipMm >= 15
      ? 'Evita horas de tormenta; confirma operación si hay alerta'
      : weather.uvMax >= 10
        ? 'Evita 11:00 a.m. – 3:00 p.m. por UV extremo'
        : null

  const bestWindow =
    weather.precipMm > 8
      ? 'Ventana matutina (antes de la lluvia típica de tarde)'
      : weather.tempMax >= 33
        ? 'Mejor temprano (8–11 a.m.) o al atardecer'
        : `Durante el horario: ${park.schedule.label}`

  const verdict =
    score >= 80 ? 'Muy recomendado' : score >= 65 ? 'Buena opción' : score >= 50 ? 'Con reservas' : 'Mejor otro día'

  return {
    id: `park-${park.id}`,
    kind: 'park',
    name: park.name,
    province: park.province,
    lat: park.lat,
    lon: park.lon,
    score,
    verdict,
    whyGo: whyGo.slice(0, 3),
    bestWindow,
    avoid,
    tags,
    href: `/parques?lugar=${park.id}`,
    mapsLabel: park.name,
    weather,
    detail: park.summary,
  }
}

function scoreBeach(
  beach: Beach,
  weather: DayWeatherBrief,
  waveM: number,
  dayOffset: number,
  filters: DayPlanFilters,
  windDir: number,
  windSpeed: number,
): DayRecommendation | null {
  if (filters.kinds !== 'all' && !filters.kinds.includes('beach')) return null
  if (filters.preferCovered) return null
  if (!matchesProvinceHint(beach.name, beach.province, filters.provinceHint)) return null

  const month = Number(weather.date.slice(5, 7))
  const sargazo = sargassumIndex(month, windDir, windSpeed)
  const flag = beachFlag(waveM, weather.windMax, weather.uvMax)
  const tScore = tourismScore({
    tempC: (weather.tempMax + weather.tempMin) / 2,
    precipMm: weather.precipMm,
    uv: weather.uvMax,
    sargazo,
    waveM,
  })

  let score = tScore
  const whyGo: string[] = []
  const tags = ['playa', flag.flag.toLowerCase()]

  whyGo.push(`Bandera orientativa: ${flag.flag} (${flag.estado})`)
  if (weather.precipMm <= 5) whyGo.push(`Clima favorable · ${weather.weatherLabel.toLowerCase()}`)
  else whyGo.push(`Lluvia posible (${weather.precipMm.toFixed(0)} mm): lleva plan B`)
  if (sargazo < 35) whyGo.push('Presión de sargazo estimada baja–moderada')
  else if (sargazo >= 55) {
    score -= 12
    whyGo.push('Sargazo estacional más probable: elige tramos limpios')
  }
  if (waveM <= 1.2) whyGo.push(`Oleaje suave (~${waveM.toFixed(1)} m)`)
  else if (waveM >= 2) {
    score -= 10
    whyGo.push(`Oleaje fuerte (~${waveM.toFixed(1)} m): precaución al bañarse`)
  }

  if (filters.preferFamily && waveM > 1.6) score -= 8
  score = clamp(score)

  const avoid =
    flag.flag === 'Roja'
      ? 'No te bañes si el mar está peligroso; consulta guardavidas'
      : weather.precipMm >= 20
        ? 'Si hay tormenta eléctrica, sal del agua y busca refugio'
        : null

  const bestWindow =
    weather.precipMm > 8
      ? 'Mañana temprano, antes de chubascos'
      : 'Media mañana (menos UV extremo que al mediodía)'

  const verdict =
    score >= 80 ? 'Excelente para playa' : score >= 65 ? 'Buena para visitar' : score >= 50 ? 'Aceptable' : 'Desfavorable'

  void dayOffset

  return {
    id: `beach-${beach.id}`,
    kind: 'beach',
    name: beach.name,
    province: beach.province,
    lat: beach.lat,
    lon: beach.lon,
    score,
    verdict,
    whyGo: whyGo.slice(0, 3),
    bestWindow,
    avoid,
    tags,
    href: `/playas?lugar=${beach.id}`,
    mapsLabel: `Playa ${beach.name}`,
    weather,
    detail: `Destino costero · oleaje ~${waveM.toFixed(1)} m · sargazo estimado ${Math.round(sargazo)}/100`,
  }
}

function buildHeadline(recs: DayRecommendation[], weather: DayWeatherBrief, dayLabel: string) {
  if (!recs.length) {
    return {
      headline: `Sin coincidencias claras para ${dayLabel.toLowerCase()}`,
      summary: 'Prueba otro día, quita filtros o escribe “playas mañana” / “parques gratis hoy”.',
    }
  }
  const top = recs[0]
  const rainy = weather.precipMm >= 10
  return {
    headline: rainy
      ? `${dayLabel}: prioriza opciones resguardadas o ventanas cortas`
      : `${dayLabel}: buen día para ${top.kind === 'beach' ? 'costa' : 'salir'}`,
    summary: `Top pick: ${top.name} (${top.verdict}). ${weather.weatherLabel}, ${Math.round(weather.tempMin)}–${Math.round(weather.tempMax)}°C, lluvia ~${weather.precipMm.toFixed(0)} mm.`,
  }
}

export async function loadDayPlan(filters: DayPlanFilters): Promise<DayPlanResult> {
  const dayOffset = clamp(filters.dayOffset, 0, 6)
  const effective: DayPlanFilters = { ...filters, dayOffset }

  const hubForecasts = await Promise.all(
    WEATHER_HUBS.map(async (hub) => {
      const forecast = await fetchForecast(hub.lat, hub.lon)
      let waveByDay: number[] = []
      let windDir = forecast.current?.wind_direction_10m ?? 90
      let windSpeed = forecast.current?.wind_speed_10m ?? 15
      if (hub.coastal) {
        try {
          const marine = await fetchMarine(hub.lat, hub.lon)
          waveByDay = [0, 1, 2].map((d) => middayWave(marine.hourly, d))
        } catch {
          waveByDay = [1.2, 1.2, 1.2]
        }
      }
      const idx = dailyIndexForOffset(forecast, 0)
      windDir = forecast.hourly.wind_direction_10m?.[idx * 24 + 12] ?? windDir
      windSpeed = forecast.daily?.wind_speed_10m_max?.[dayOffset] ?? windSpeed
      return { hub, forecast, waveByDay, windDir, windSpeed }
    }),
  )

  const byHubId = new Map(hubForecasts.map((h) => [h.hub.id, h]))

  const sd = byHubId.get('sd')!
  const hubWeather = briefFromForecast(sd.forecast, dayOffset)
  const dayLabel = formatDayLabel(dayOffset, hubWeather.date)

  const recommendations: DayRecommendation[] = []

  for (const park of PARKS) {
    const hub = nearestHub(park.lat, park.lon)
    const pack = byHubId.get(hub.id)!
    const weather = briefFromForecast(pack.forecast, dayOffset)
    const rec = scorePark(park, weather, dayOffset, effective)
    if (rec) recommendations.push(rec)
  }

  for (const beach of BEACHES) {
    const hub = nearestHub(beach.lat, beach.lon)
    const pack = byHubId.get(hub.id)!
    const weather = briefFromForecast(pack.forecast, dayOffset)
    const wave =
      pack.waveByDay[Math.min(dayOffset, pack.waveByDay.length - 1)] ??
      pack.waveByDay[0] ??
      1.2
    const rec = scoreBeach(
      beach,
      weather,
      wave,
      dayOffset,
      effective,
      pack.windDir,
      pack.windSpeed,
    )
    if (rec) recommendations.push(rec)
  }

  recommendations.sort((a, b) => b.score - a.score)
  const top = recommendations.slice(0, 8)
  const { headline, summary } = buildHeadline(top, hubWeather, dayLabel)

  const weekOutlook = [0, 1, 2, 3, 4].map((offset) => {
    const dayRecs: DayRecommendation[] = []
    const dayFilters: DayPlanFilters = { ...effective, dayOffset: offset }
    for (const park of PARKS) {
      const hub = nearestHub(park.lat, park.lon)
      const pack = byHubId.get(hub.id)!
      const weather = briefFromForecast(pack.forecast, offset)
      const rec = scorePark(park, weather, offset, dayFilters)
      if (rec) dayRecs.push(rec)
    }
    for (const beach of BEACHES) {
      const hub = nearestHub(beach.lat, beach.lon)
      const pack = byHubId.get(hub.id)!
      const weather = briefFromForecast(pack.forecast, offset)
      const wave =
        pack.waveByDay[Math.min(offset, pack.waveByDay.length - 1)] ?? pack.waveByDay[0] ?? 1.2
      const rec = scoreBeach(
        beach,
        weather,
        wave,
        offset,
        dayFilters,
        pack.windDir,
        pack.windSpeed,
      )
      if (rec) dayRecs.push(rec)
    }
    dayRecs.sort((a, b) => b.score - a.score)
    const best = dayRecs[0]
    const date = rdDateIso(offset)
    return {
      dayOffset: offset,
      label: formatDayLabel(offset, date),
      topName: best?.name ?? '—',
      score: best?.score ?? 0,
    }
  })

  return {
    filters: effective,
    dayLabel,
    hubWeather,
    headline,
    summary,
    recommendations: top,
    weekOutlook,
  }
}
