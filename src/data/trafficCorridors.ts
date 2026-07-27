export type TrafficCity = 'santo-domingo' | 'santiago'

export type TrafficCorridor = {
  id: string
  name: string
  city: TrafficCity
  cityLabel: string
  /** Extremo A del tramo (lat, lon) */
  from: [number, number]
  /** Extremo B del tramo (lat, lon) */
  to: [number, number]
  fromLabel: string
  toLabel: string
  /** Carga crónica del corredor (0–30) */
  chronic: number
  note: string
  summary: string
  landmarks: string[]
  tip: string
}

/** Corredores urbanos reales usados como referencia (no es cobertura nacional). */
export const TRAFFIC_CORRIDORS: TrafficCorridor[] = [
  {
    id: '27feb',
    name: 'Av. 27 de Febrero',
    city: 'santo-domingo',
    cityLabel: 'Santo Domingo',
    from: [18.472, -69.968],
    to: [18.468, -69.912],
    fromLabel: '27 de Febrero · cerca Winston Churchill',
    toLabel: '27 de Febrero · cerca Máximo Gómez',
    chronic: 22,
    note: 'Eje este–oeste de alta demanda laboral',
    summary:
      'Una de las arterias más transitadas del Gran Santo Domingo. Conecta el oeste con el centro-este y suele saturarse en entradas y salidas laborales.',
    landmarks: ['Naco', 'Piantini', 'Winston Churchill', 'Máximo Gómez'],
    tip: 'Si puedes, evita 7:30–9:00 y 17:30–19:30 en días laborables.',
  },
  {
    id: 'kennedy',
    name: 'Av. John F. Kennedy',
    city: 'santo-domingo',
    cityLabel: 'Santo Domingo',
    from: [18.488, -69.975],
    to: [18.482, -69.918],
    fromLabel: 'Kennedy · cerca Abraham Lincoln',
    toLabel: 'Kennedy · cerca Núñez de Cáceres',
    chronic: 20,
    note: 'Congestión recurrente en horas pico',
    summary:
      'Corredor paralelo a 27 de Febrero, muy usado para cruzar la ciudad. Semáforos y giros generan colas frecuentes.',
    landmarks: ['Lincoln', 'Núñez de Cáceres', 'Plaza de la Salud'],
    tip: 'Útil como alternativa, pero en pico también se pone lenta: compara con Luperón según tu destino.',
  },
  {
    id: 'duarte-sd',
    name: 'Autopista Duarte (entrada SD)',
    city: 'santo-domingo',
    cityLabel: 'Santo Domingo',
    from: [18.52, -70.05],
    to: [18.5, -69.98],
    fromLabel: 'Duarte · acceso oeste',
    toLabel: 'Duarte · entrada metropolitana',
    chronic: 18,
    note: 'Entrada/salida metropolitana',
    summary:
      'Puerta de entrada desde el Cibao y municipios del noroeste. Los embotellamientos se concentran en la bajada hacia la capital.',
    landmarks: ['Los Alcarrizos', 'Herrera', 'entrada a SD'],
    tip: 'Sal más temprano si vienes del interior; la lluvia aquí alarga mucho el trayecto.',
  },
  {
    id: 'luperon',
    name: 'Av. Máximo Gómez / Luperón',
    city: 'santo-domingo',
    cityLabel: 'Santo Domingo',
    from: [18.505, -69.94],
    to: [18.46, -69.935],
    fromLabel: 'Luperón / Máximo Gómez norte',
    toLabel: 'Máximo Gómez · zona centro-sur',
    chronic: 16,
    note: 'Norte–sur hacia el centro',
    summary:
      'Eje norte–sur clave para llegar al centro y conectar con el Malecón / Zona Universitaria.',
    landmarks: ['Tienda Linda', 'CENIS', 'UASD', 'centro'],
    tip: 'Buen enlace norte–sur; vigila tramos cerca de semáforos densos al mediodía.',
  },
  {
    id: 'sadhala',
    name: 'Av. Estrella Sadhalá',
    city: 'santiago',
    cityLabel: 'Santiago',
    from: [19.458, -70.705],
    to: [19.448, -70.675],
    fromLabel: 'Sadhalá · tramo oeste',
    toLabel: 'Sadhalá · tramo este',
    chronic: 14,
    note: 'Corredor urbano de Santiago',
    summary:
      'Avenida principal del área metropolitana de Santiago. Concentra comercio, colegios y flujo laboral local.',
    landmarks: ['comercio local', 'zonas escolares', 'flujo este–oeste'],
    tip: 'En Santiago el pico escolar/laboral también pesa: madruga un poco si puedes.',
  },
  {
    id: 'circunvalacion-stg',
    name: 'Circunvalación de Santiago',
    city: 'santiago',
    cityLabel: 'Santiago',
    from: [19.47, -70.72],
    to: [19.44, -70.66],
    fromLabel: 'Circunvalación · acceso oeste',
    toLabel: 'Circunvalación · acceso este',
    chronic: 12,
    note: 'Flujo perimetral metropolitano',
    summary:
      'Vía perimetral para evitar el centro de Santiago. Suele fluir mejor que las avenidas internas, salvo incidentes.',
    landmarks: ['anillo metropolitano', 'accesos a avenidas'],
    tip: 'Buena opción para rodear el centro cuando Sadhalá o el casco están saturados.',
  },
]
