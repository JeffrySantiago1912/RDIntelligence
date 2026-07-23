export type QuakeFeature = {
  id: string
  properties: {
    mag: number | null
    place: string | null
    time: number
    url: string
    title: string
  }
  geometry: {
    type: 'Point'
    coordinates: [number, number, number?]
  }
}

export type QuakeFeed = {
  features: QuakeFeature[]
  metadata: { count: number; title: string; generated: number }
}

/**
 * Caja aproximada de RD + cercanías:
 * La Española, costa, Canal de la Mona (sin todo el Caribe).
 */
const RD_NEAR_BBOX = {
  minlatitude: 17.2,
  maxlatitude: 20.3,
  minlongitude: -72.5,
  maxlongitude: -67.8,
}

export async function fetchRdQuakes(days = 30, minmagnitude = 2.0) {
  const end = new Date()
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
  const params = new URLSearchParams({
    format: 'geojson',
    starttime: start.toISOString().slice(0, 10),
    endtime: end.toISOString().slice(0, 10),
    minmagnitude: String(minmagnitude),
    orderby: 'time',
    ...Object.fromEntries(Object.entries(RD_NEAR_BBOX).map(([k, v]) => [k, String(v)])),
  })

  const res = await fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?${params}`)
  if (!res.ok) throw new Error(`USGS HTTP ${res.status}`)
  return res.json() as Promise<QuakeFeed>
}

/** @deprecated Usar fetchRdQuakes */
export const fetchCaribbeanQuakes = fetchRdQuakes
