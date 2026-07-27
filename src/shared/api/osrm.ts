export type OsrmRouteSummary = {
  durationSec: number
  distanceM: number
  source: 'osrm' | 'haversine'
}

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving'

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

/** Estimación libre si OSRM no responde: distancia × velocidad urbana típica. */
function haversineFallback(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): OsrmRouteSummary {
  const distanceM = haversineM(lat1, lon1, lat2, lon2)
  const urbanKmh = 38
  const durationSec = (distanceM / 1000 / urbanKmh) * 3600
  return { durationSec, distanceM, source: 'haversine' }
}

type OsrmResponse = {
  code?: string
  routes?: { duration: number; distance: number }[]
}

/**
 * Tiempo/distancia de ruta sobre red OSM vía OSRM (servidor público).
 * Uso ligero: pocos corredores por carga de página.
 */
export async function fetchDrivingRoute(
  from: [number, number],
  to: [number, number],
): Promise<OsrmRouteSummary> {
  const [lat1, lon1] = from
  const [lat2, lon2] = to
  const url = `${OSRM_BASE}/${lon1},${lat1};${lon2},${lat2}?overview=false`

  try {
    const res = await fetch(url)
    if (!res.ok) return haversineFallback(lat1, lon1, lat2, lon2)
    const data = (await res.json()) as OsrmResponse
    const route = data.routes?.[0]
    if (!route || data.code !== 'Ok') return haversineFallback(lat1, lon1, lat2, lon2)
    return {
      durationSec: route.duration,
      distanceM: route.distance,
      source: 'osrm',
    }
  } catch {
    return haversineFallback(lat1, lon1, lat2, lon2)
  }
}
