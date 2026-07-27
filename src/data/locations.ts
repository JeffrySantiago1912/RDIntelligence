export type Province = {
  id: string
  name: string
  lat: number
  lon: number
  /** Tiene costa caribeña/atlántica relevante para playas y sargazo. */
  coastal: boolean
}

export type Beach = {
  id: string
  name: string
  province: string
  lat: number
  lon: number
}

export type CitySector = {
  id: string
  name: string
  city: string
  lat: number
  lon: number
  floodBias: number
}

export const RD_CENTER = { lat: 18.7357, lon: -70.1627 }

export const PROVINCES: Province[] = [
  { id: 'distrito-nacional', name: 'Distrito Nacional', lat: 18.4861, lon: -69.9312, coastal: true },
  { id: 'santiago', name: 'Santiago', lat: 19.4517, lon: -70.697, coastal: false },
  { id: 'la-altagracia', name: 'La Altagracia', lat: 18.6159, lon: -68.7075, coastal: true },
  { id: 'puerto-plata', name: 'Puerto Plata', lat: 19.7934, lon: -70.6884, coastal: true },
  { id: 'la-romana', name: 'La Romana', lat: 18.4273, lon: -68.9728, coastal: true },
  { id: 'san-pedro', name: 'San Pedro de Macorís', lat: 18.4539, lon: -69.3088, coastal: true },
  { id: 'barahona', name: 'Barahona', lat: 18.2085, lon: -71.1008, coastal: true },
  { id: 'samana', name: 'Samaná', lat: 19.2056, lon: -69.3369, coastal: true },
  { id: 'san-cristobal', name: 'San Cristóbal', lat: 18.4167, lon: -70.1, coastal: true },
  { id: 'duarte', name: 'Duarte', lat: 19.2167, lon: -70.25, coastal: false },
]

export const BEACHES: Beach[] = [
  { id: 'bayahibe', name: 'Bayahíbe', province: 'La Altagracia', lat: 18.3667, lon: -68.8333 },
  { id: 'bavaro', name: 'Bávaro', province: 'La Altagracia', lat: 18.68, lon: -68.45 },
  { id: 'punta-cana', name: 'Punta Cana', province: 'La Altagracia', lat: 18.582, lon: -68.405 },
  { id: 'sosua', name: 'Sosúa', province: 'Puerto Plata', lat: 19.757, lon: -70.518 },
  { id: 'cabarete', name: 'Cabarete', province: 'Puerto Plata', lat: 19.75, lon: -70.408 },
  { id: 'las-terrenas', name: 'Las Terrenas', province: 'Samaná', lat: 19.321, lon: -69.543 },
  { id: 'juan-dolio', name: 'Juan Dolio', province: 'San Pedro', lat: 18.427, lon: -69.287 },
  { id: 'boca-chica', name: 'Boca Chica', province: 'Santo Domingo', lat: 18.45, lon: -69.606 },
]

export const FLOOD_SECTORS: CitySector[] = [
  { id: 'gazcue', name: 'Gazcue', city: 'Santo Domingo', lat: 18.47, lon: -69.91, floodBias: 0.2 },
  { id: 'zona-colonial', name: 'Zona Colonial', city: 'Santo Domingo', lat: 18.473, lon: -69.884, floodBias: 0.35 },
  { id: 'naco', name: 'Naco', city: 'Santo Domingo', lat: 18.472, lon: -69.935, floodBias: 0.15 },
  { id: 'mirafores', name: 'Miraflores', city: 'Santo Domingo', lat: 18.46, lon: -69.92, floodBias: 0.55 },
  { id: 'villa-mella', name: 'Villa Mella', city: 'Santo Domingo Norte', lat: 18.55, lon: -69.9, floodBias: 0.65 },
  { id: 'herrera', name: 'Herrera', city: 'Santo Domingo Oeste', lat: 18.46, lon: -70.0, floodBias: 0.45 },
  { id: 'los-alcarrizos', name: 'Los Alcarrizos', city: 'Santo Domingo Oeste', lat: 18.52, lon: -70.02, floodBias: 0.7 },
  { id: 'santiago-centro', name: 'Centro', city: 'Santiago', lat: 19.45, lon: -70.69, floodBias: 0.4 },
]

export const OUTAGE_SECTORS = [
  { id: 'dn-norte', name: 'Distrito Nacional Norte', lat: 18.5, lon: -69.93 },
  { id: 'dn-sur', name: 'Distrito Nacional Sur', lat: 18.45, lon: -69.92 },
  { id: 'sdo-este', name: 'Santo Domingo Este', lat: 18.48, lon: -69.85 },
  { id: 'sdo-oeste', name: 'Santo Domingo Oeste', lat: 18.48, lon: -70.0 },
  { id: 'santiago', name: 'Santiago', lat: 19.45, lon: -70.7 },
  { id: 'la-vega', name: 'La Vega', lat: 19.22, lon: -70.53 },
  { id: 'san-francisco', name: 'San Francisco de Macorís', lat: 19.3, lon: -70.25 },
  { id: 'higüey', name: 'Higüey', lat: 18.62, lon: -68.71 },
]
