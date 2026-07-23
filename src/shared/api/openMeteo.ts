export type OpenMeteoForecast = {
  latitude: number
  longitude: number
  timezone: string
  current?: {
    time: string
    temperature_2m: number
    relative_humidity_2m: number
    precipitation: number
    weather_code: number
    wind_speed_10m: number
    wind_direction_10m: number
    uv_index?: number
  }
  hourly: {
    time: string[]
    temperature_2m: number[]
    precipitation: number[]
    precipitation_probability?: number[]
    relative_humidity_2m: number[]
    wind_speed_10m: number[]
    wind_direction_10m: number[]
    weather_code: number[]
    uv_index?: number[]
    soil_moisture_0_to_7cm?: number[]
    soil_temperature_0cm?: number[]
  }
  daily?: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_sum: number[]
    precipitation_probability_max?: number[]
    wind_speed_10m_max: number[]
    uv_index_max?: number[]
    weather_code?: number[]
  }
}

export type OpenMeteoMarine = {
  hourly: {
    time: string[]
    wave_height: number[]
    wave_direction?: number[]
    wave_period?: number[]
  }
}

export type OpenMeteoAir = {
  current?: {
    time: string
    european_aqi?: number
    pm10?: number
    pm2_5?: number
    dust?: number
    uv_index?: number
  }
  hourly: {
    time: string[]
    pm10: number[]
    pm2_5: number[]
    dust: number[]
    european_aqi?: number[]
    uv_index?: number[]
  }
}

const FORECAST = 'https://api.open-meteo.com/v1/forecast'
const MARINE = 'https://marine-api.open-meteo.com/v1/marine'
const AIR = 'https://air-quality-api.open-meteo.com/v1/air-quality'

export type RainDay = {
  date: string
  label: string
  mm: number
  probability: number | null
  weatherCode: number | null
  kind: 'pasado' | 'hoy' | 'pronostico'
}

export type RainOutlook = {
  days: RainDay[]
  pastTotalMm: number
  nextTotalMm: number
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Error HTTP ${res.status} al consultar ${url}`)
  }
  return res.json() as Promise<T>
}

/** Últimos N días + próximos N días de lluvia diaria (Open-Meteo). */
export async function fetchRainOutlook(lat: number, lon: number, pastDays = 7, forecastDays = 7) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    daily: 'precipitation_sum,precipitation_probability_max,weather_code',
    timezone: 'America/Santo_Domingo',
    past_days: String(pastDays),
    forecast_days: String(forecastDays),
  })
  const data = await getJson<{
    daily: {
      time: string[]
      precipitation_sum: number[]
      precipitation_probability_max?: number[]
      weather_code?: number[]
    }
  }>(`${FORECAST}?${params}`)

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santo_Domingo' })
  const days: RainDay[] = data.daily.time.map((date, i) => {
    const kind: RainDay['kind'] =
      date < today ? 'pasado' : date === today ? 'hoy' : 'pronostico'
    const [, month, day] = date.split('-')
    return {
      date,
      label: `${day}/${month}`,
      mm: data.daily.precipitation_sum[i] ?? 0,
      probability: data.daily.precipitation_probability_max?.[i] ?? null,
      weatherCode: data.daily.weather_code?.[i] ?? null,
      kind,
    }
  })

  return {
    days,
    pastTotalMm: days.filter((d) => d.kind === 'pasado').reduce((a, d) => a + d.mm, 0),
    nextTotalMm: days
      .filter((d) => d.kind === 'hoy' || d.kind === 'pronostico')
      .reduce((a, d) => a + d.mm, 0),
  } satisfies RainOutlook
}

export async function fetchForecast(lat: number, lon: number) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current:
      'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m',
    hourly:
      'temperature_2m,precipitation,precipitation_probability,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,uv_index,soil_moisture_0_to_7cm,soil_temperature_0cm',
    daily:
      'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max,weather_code',
    timezone: 'America/Santo_Domingo',
    forecast_days: '7',
  })
  return getJson<OpenMeteoForecast>(`${FORECAST}?${params}`)
}

export async function fetchMarine(lat: number, lon: number) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: 'wave_height,wave_direction,wave_period',
    timezone: 'America/Santo_Domingo',
    forecast_days: '3',
    models: 'ncep_gfswave016',
  })
  return getJson<OpenMeteoMarine>(`${MARINE}?${params}`)
}

export async function fetchAirQuality(lat: number, lon: number) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'european_aqi,pm10,pm2_5,dust,uv_index',
    hourly: 'pm10,pm2_5,dust,european_aqi,uv_index',
    timezone: 'America/Santo_Domingo',
    forecast_days: '3',
  })
  return getJson<OpenMeteoAir>(`${AIR}?${params}`)
}

export function weatherCodeLabel(code: number) {
  if (code === 0) return 'Despejado'
  if (code <= 3) return 'Parcialmente nublado'
  if (code <= 48) return 'Niebla'
  if (code <= 57) return 'Llovizna'
  if (code <= 67) return 'Lluvia'
  if (code <= 77) return 'Nieve/granizo'
  if (code <= 82) return 'Chubascos'
  if (code <= 99) return 'Tormenta'
  return 'Desconocido'
}

export function sumNextHours(values: number[], hours: number, fromIndex = 0) {
  return values.slice(fromIndex, fromIndex + hours).reduce((a, b) => a + (b || 0), 0)
}

export function maxNextHours(values: number[], hours: number, fromIndex = 0) {
  const slice = values.slice(fromIndex, fromIndex + hours)
  return slice.length ? Math.max(...slice) : 0
}

export function currentHourIndex(times: string[]) {
  const now = Date.now()
  let best = 0
  for (let i = 0; i < times.length; i += 1) {
    if (new Date(times[i]).getTime() <= now) best = i
  }
  return best
}
