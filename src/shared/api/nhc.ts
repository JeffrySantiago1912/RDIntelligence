export type ActiveStorm = {
  id: string
  name: string
  classification: string
  intensity: number
  latitudeNumeric: number
  longitudeNumeric: number
  lastUpdate: string
  basin: 'Atlántico' | 'Pacífico' | 'Otro'
  track: { lat: number; lon: number; date: string; knots: number | null }[]
  sourceUrl: string
  sourceLabel: string
}

export type StormsResponse = {
  activeStorms: ActiveStorm[]
  provider: 'NASA EONET'
}

type EonetGeometry = {
  magnitudeValue?: number | null
  magnitudeUnit?: string | null
  date: string
  type: string
  coordinates: [number, number]
}

type EonetEvent = {
  id: string
  title: string
  link: string
  sources?: { id: string; url: string }[]
  geometry: EonetGeometry[]
}

type EonetResponse = {
  events: EonetEvent[]
}

function classifyFromTitle(title: string) {
  const t = title.toLowerCase()
  if (t.includes('major hurricane') || t.includes('category')) return 'HU'
  if (t.includes('hurricane') || t.includes('huracán')) return 'HU'
  if (t.includes('tropical storm') || t.includes('tormenta')) return 'TS'
  if (t.includes('tropical depression') || t.includes('depresión')) return 'TD'
  if (t.includes('post-tropical') || t.includes('extratropical')) return 'PT'
  return 'LO'
}

function extractName(title: string) {
  const cleaned = title
    .replace(/^(Tropical Storm|Hurricane|Tropical Depression|Post-Tropical Cyclone|Typhoon)\s+/i, '')
    .trim()
  return cleaned || title
}

function basinFromLon(lon: number): ActiveStorm['basin'] {
  // Atlántico / Caribe: típico lon > -100; Pacífico oriental < -100
  if (lon <= -100) return 'Pacífico'
  if (lon > -100 && lon < -20) return 'Atlántico'
  return 'Otro'
}

function mapEvent(event: EonetEvent): ActiveStorm | null {
  if (!event.geometry?.length) return null
  const latest = event.geometry[event.geometry.length - 1]
  const [lon, lat] = latest.coordinates
  const nhc = event.sources?.find((s) => s.id === 'NOAA_NHC')
  const jtwc = event.sources?.find((s) => s.id === 'JTWC')

  return {
    id: event.id,
    name: extractName(event.title),
    classification: classifyFromTitle(event.title),
    intensity: Number(latest.magnitudeValue ?? 0),
    latitudeNumeric: lat,
    longitudeNumeric: lon,
    lastUpdate: latest.date,
    basin: basinFromLon(lon),
    track: event.geometry.map((g) => ({
      lat: g.coordinates[1],
      lon: g.coordinates[0],
      date: g.date,
      knots: g.magnitudeValue ?? null,
    })),
    sourceUrl: nhc?.url ?? jtwc?.url ?? event.link,
    sourceLabel: nhc ? 'NOAA NHC' : jtwc ? 'JTWC' : 'NASA EONET',
  }
}

/**
 * NASA EONET expone CORS (`Access-Control-Allow-Origin: *`),
 * por eso funciona en local y en hosting estático sin backend.
 * NHC CurrentStorms.json no permite CORS y el proxy Vite a veces responde 502.
 */
export async function fetchActiveStorms(): Promise<StormsResponse> {
  const res = await fetch(
    'https://eonet.gsfc.nasa.gov/api/v3/events?category=severeStorms&status=open',
  )
  if (!res.ok) throw new Error(`EONET HTTP ${res.status}`)
  const json = (await res.json()) as EonetResponse
  const activeStorms = (json.events ?? [])
    .map(mapEvent)
    .filter((s): s is ActiveStorm => s !== null)
    .sort((a, b) => b.intensity - a.intensity)

  return { activeStorms, provider: 'NASA EONET' }
}

export function stormClassLabel(code: string) {
  const map: Record<string, string> = {
    TD: 'Depresión tropical',
    TS: 'Tormenta tropical',
    HU: 'Huracán',
    MH: 'Huracán mayor',
    PT: 'Ciclón post-tropical',
    LO: 'Sistema de baja presión',
    DB: 'Perturbación',
    WV: 'Onda tropical',
  }
  return map[code] ?? code
}

export function distanceToSantoDomingoKm(lat: number, lon: number) {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const lat1 = toRad(18.4861)
  const lon1 = toRad(-69.9312)
  const lat2 = toRad(lat)
  const lon2 = toRad(lon)
  const dLat = lat2 - lat1
  const dLon = lon2 - lon1
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return Math.round(2 * R * Math.asin(Math.sqrt(a)))
}
