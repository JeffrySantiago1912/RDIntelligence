/** Enlaces externos para ubicar un destino y trazar ruta. */

export function googleMapsPlaceUrl(lat: number, lon: number, label?: string) {
  const query = label ? `${label} ${lat},${lon}` : `${lat},${lon}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

/** Ruta en Google Maps. Sin origen: Maps usa “Mi ubicación” si el usuario lo permite. */
export function googleMapsDirectionsUrl(lat: number, lon: number, label?: string) {
  const params = new URLSearchParams({
    api: '1',
    destination: label ? `${label} (${lat}, ${lon})` : `${lat},${lon}`,
    travelmode: 'driving',
  })
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

export function googleMapsDirectionsFromOriginUrl(
  originLat: number,
  originLon: number,
  destLat: number,
  destLon: number,
) {
  const params = new URLSearchParams({
    api: '1',
    origin: `${originLat},${originLon}`,
    destination: `${destLat},${destLon}`,
    travelmode: 'driving',
  })
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

/** Recorrer un tramo A → B (útil para corredores de tráfico). */
export function googleMapsCorridorUrl(
  from: [number, number],
  to: [number, number],
  fromLabel?: string,
  toLabel?: string,
) {
  const origin = fromLabel ? `${fromLabel}` : `${from[0]},${from[1]}`
  const destination = toLabel ? `${toLabel}` : `${to[0]},${to[1]}`
  const params = new URLSearchParams({
    api: '1',
    origin: `${origin} @${from[0]},${from[1]}`,
    destination: `${destination} @${to[0]},${to[1]}`,
    travelmode: 'driving',
  })
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

export function wazeNavigateUrl(lat: number, lon: number) {
  return `https://waze.com/ul?ll=${lat}%2C${lon}&navigate=yes`
}

export function appleMapsDirectionsUrl(lat: number, lon: number, label?: string) {
  const params = new URLSearchParams({
    daddr: `${lat},${lon}`,
    dirflg: 'd',
  })
  if (label) params.set('q', label)
  return `https://maps.apple.com/?${params.toString()}`
}

export function appleMapsCorridorUrl(from: [number, number], to: [number, number]) {
  return `https://maps.apple.com/?saddr=${from[0]},${from[1]}&daddr=${to[0]},${to[1]}&dirflg=d`
}
