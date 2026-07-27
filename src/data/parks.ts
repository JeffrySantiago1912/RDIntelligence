/** Datos de referencia de parques más visitados en RD.
 * Catálogo orientativo: no es inventario oficial ni feed en tiempo real.
 * El usuario debe validar horario, tarifas y operación en la fuente oficial.
 */

export type ParkCategory = 'urbano' | 'nacional' | 'tematico'
export type ParkAccess = 'gratis' | 'con-entrada'

export type ParkSchedule = {
  /** Días abiertos: 0=dom … 6=sáb (JS getDay). Vacío = todos los días. */
  openDays: number[]
  openHour: number
  openMinute: number
  closeHour: number
  closeMinute: number
  label: string
  note?: string
}

export type ParkFees = {
  free: boolean
  adultLocal: string
  childLocal: string
  foreignerAdult: string
  foreignerChild: string
  note?: string
}

export type Park = {
  id: string
  name: string
  province: string
  municipality: string
  lat: number
  lon: number
  categories: ParkCategory[]
  access: ParkAccess
  schedule: ParkSchedule
  fees: ParkFees
  howToGet: string
  phone?: string
  website?: string
  officialSource: { name: string; url: string }
  updatedAt: string
  summary: string
  highlights: string[]
}

const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6]
const TUE_SUN = [0, 2, 3, 4, 5, 6]

export const PARK_FILTERS = [
  { id: 'urbano' as const, label: 'Urbano' },
  { id: 'nacional' as const, label: 'Nacional' },
  { id: 'tematico' as const, label: 'Temático' },
  { id: 'gratis' as const, label: 'Gratis' },
  { id: 'con-entrada' as const, label: 'Con entrada' },
]

export const PARKS: Park[] = [
  {
    id: 'jardin-botanico',
    name: 'Jardín Botánico Nacional Dr. Rafael M. Moscoso',
    province: 'Distrito Nacional',
    municipality: 'Santo Domingo',
    lat: 18.4945,
    lon: -69.9535,
    categories: ['urbano', 'nacional'],
    access: 'con-entrada',
    schedule: {
      openDays: EVERY_DAY,
      openHour: 9,
      openMinute: 0,
      closeHour: 17,
      closeMinute: 0,
      label: 'Lun–Dom · 9:00 a.m. – 5:00 p.m.',
    },
    fees: {
      free: false,
      adultLocal: 'RD$100',
      childLocal: 'RD$50',
      foreignerAdult: 'US$5',
      foreignerChild: 'US$3',
      note: 'Grupos escolares suelen tener tarifa reducida. Verificar en taquilla.',
    },
    howToGet:
      'Av. República de Colombia esq. Av. Los Próceres, Arroyo Hondo. Acceso en carro, taxi o Uber; rutas de transporte público por Los Próceres.',
    phone: '809-385-2611',
    website: 'https://jbn.gob.do/',
    officialSource: { name: 'Jardín Botánico Nacional', url: 'https://jbn.gob.do/' },
    updatedAt: '2026-06-15',
    summary:
      'Oasis urbano con jardín japonés, orquídeas y senderos. Uno de los espacios verdes más visitados de la capital.',
    highlights: ['Jardín japonés', 'Herbario', 'Tren interno', 'Ideal para fotos y caminatas'],
  },
  {
    id: 'zoodom',
    name: 'Parque Zoológico Nacional (Zoodom)',
    province: 'Distrito Nacional',
    municipality: 'Santo Domingo',
    lat: 18.5082,
    lon: -69.9688,
    categories: ['urbano', 'tematico'],
    access: 'con-entrada',
    schedule: {
      openDays: TUE_SUN,
      openHour: 9,
      openMinute: 0,
      closeHour: 17,
      closeMinute: 0,
      label: 'Mar–Dom · boletería 9:00 a.m. – 3:30 p.m. · cierra 5:00 p.m.',
      note: 'Cerrado los lunes. La boletería cierra antes que el parque.',
    },
    fees: {
      free: false,
      adultLocal: 'RD$200',
      childLocal: 'RD$150',
      foreignerAdult: 'RD$200',
      foreignerChild: 'RD$150',
      note: 'Niños menores de 2 años suelen entrar gratis. Área infantil con cargo extra.',
    },
    howToGet:
      'Av. La Vega Real, Arroyo Hondo. En carro o taxi; metro más cercano estación Máximo Gómez + traslado corto.',
    phone: '809-378-2149',
    website: 'https://www.zoodom.gob.do/',
    officialSource: { name: 'Zoodom', url: 'https://www.zoodom.gob.do/' },
    updatedAt: '2026-06-15',
    summary: 'Zoológico nacional con fauna local y exótica, área educativa y zonas recreativas para familias.',
    highlights: ['Fauna caribeña', 'Área infantil', 'Educación ambiental'],
  },
  {
    id: 'acuario-nacional',
    name: 'Acuario Nacional',
    province: 'Santo Domingo Este',
    municipality: 'Santo Domingo Este',
    lat: 18.4568,
    lon: -69.8455,
    categories: ['urbano', 'tematico'],
    access: 'con-entrada',
    schedule: {
      openDays: TUE_SUN,
      openHour: 9,
      openMinute: 30,
      closeHour: 17,
      closeMinute: 30,
      label: 'Mar–Dom · 9:30 a.m. – 5:30 p.m.',
      note: 'Cerrado los lunes. Confirmar shows de mamíferos marinos en web oficial.',
    },
    fees: {
      free: false,
      adultLocal: 'RD$100',
      childLocal: 'RD$50',
      foreignerAdult: 'RD$100',
      foreignerChild: 'RD$50',
      note: 'Tarifas referenciales; verificar en taquilla o mitur.gob.do.',
    },
    howToGet:
      'Av. España, Malecón de Santo Domingo Este (cerca de Sans Souci). Acceso en carro, taxi o rutas por Av. España.',
    phone: '809-766-1709',
    website: 'https://www.mitur.gob.do/',
    officialSource: {
      name: 'MITUR · Acuario Nacional',
      url: 'https://www.mitur.gob.do/',
    },
    updatedAt: '2026-05-20',
    summary: 'Acuario frente al Caribe con tanques, tortugas y exhibiciones educativas sobre la vida marina.',
    highlights: ['Malecón Este', 'Exhibiciones marinas', 'Ideal para niños'],
  },
  {
    id: 'tres-ojos',
    name: 'Los Tres Ojos',
    province: 'Santo Domingo Este',
    municipality: 'Santo Domingo Este',
    lat: 18.4806,
    lon: -69.8433,
    categories: ['urbano', 'tematico'],
    access: 'con-entrada',
    schedule: {
      openDays: EVERY_DAY,
      openHour: 9,
      openMinute: 0,
      closeHour: 17,
      closeMinute: 0,
      label: 'Lun–Dom · 9:00 a.m. – 5:00 p.m.',
    },
    fees: {
      free: false,
      adultLocal: 'RD$100',
      childLocal: 'RD$50',
      foreignerAdult: 'US$5 aprox.',
      foreignerChild: 'US$3 aprox.',
      note: 'Cuevas kársticas con lagos; hay escaleras. Verificar tarifa del día en taquilla.',
    },
    howToGet:
      'Av. Las Américas, Parque Mirador Este. Acceso fácil en carro o taxi desde el aeropuerto SDQ (~15 min).',
    phone: '809-472-4204',
    website: 'https://www.mitur.gob.do/',
    officialSource: { name: 'MITUR', url: 'https://www.mitur.gob.do/' },
    updatedAt: '2026-05-20',
    summary: 'Sistema de cuevas abiertas con tres lagos subterráneos. Clásico stop cerca del aeropuerto.',
    highlights: ['Cuevas', 'Lagos subterráneos', 'Cerca del aeropuerto'],
  },
  {
    id: 'mirador-sur',
    name: 'Parque Mirador Sur',
    province: 'Distrito Nacional',
    municipality: 'Santo Domingo',
    lat: 18.4448,
    lon: -69.9555,
    categories: ['urbano'],
    access: 'gratis',
    schedule: {
      openDays: EVERY_DAY,
      openHour: 5,
      openMinute: 0,
      closeHour: 22,
      closeMinute: 0,
      label: 'Lun–Dom · aproximadamente 5:00 a.m. – 10:00 p.m.',
      note: 'Horario de uso público; zonas iluminadas varían. Ideal de mañana y atardecer.',
    },
    fees: {
      free: true,
      adultLocal: 'Gratis',
      childLocal: 'Gratis',
      foreignerAdult: 'Gratis',
      foreignerChild: 'Gratis',
    },
    howToGet:
      'Av. Mirador Sur (corredor oeste–este de la capital). Entradas múltiples; estacionamiento limitado en avenida.',
    website: 'https://adn.gob.do/',
    officialSource: { name: 'ADN · Distrito Nacional', url: 'https://adn.gob.do/' },
    updatedAt: '2026-04-10',
    summary: 'El pulmón verde más popular de la capital: trote, ciclismo, picnic y vistas al sur.',
    highlights: ['Correr / ciclismo', 'Gratis', 'Atardeceres'],
  },
  {
    id: 'mirador-norte',
    name: 'Parque Mirador Norte',
    province: 'Distrito Nacional',
    municipality: 'Santo Domingo',
    lat: 18.5155,
    lon: -69.9278,
    categories: ['urbano'],
    access: 'gratis',
    schedule: {
      openDays: EVERY_DAY,
      openHour: 6,
      openMinute: 0,
      closeHour: 20,
      closeMinute: 0,
      label: 'Lun–Dom · aproximadamente 6:00 a.m. – 8:00 p.m.',
    },
    fees: {
      free: true,
      adultLocal: 'Gratis',
      childLocal: 'Gratis',
      foreignerAdult: 'Gratis',
      foreignerChild: 'Gratis',
    },
    howToGet:
      'Av. Máximo Gómez / zona norte del DN. Acceso en carro o transporte público por Máximo Gómez.',
    website: 'https://adn.gob.do/',
    officialSource: { name: 'ADN · Distrito Nacional', url: 'https://adn.gob.do/' },
    updatedAt: '2026-04-10',
    summary: 'Parque urbano amplio con lagunas, áreas deportivas y espacios para familias.',
    highlights: ['Lagunas', 'Deportes', 'Gratis'],
  },
  {
    id: 'parque-colon',
    name: 'Parque Colón',
    province: 'Distrito Nacional',
    municipality: 'Zona Colonial',
    lat: 18.4734,
    lon: -69.8845,
    categories: ['urbano'],
    access: 'gratis',
    schedule: {
      openDays: EVERY_DAY,
      openHour: 0,
      openMinute: 0,
      closeHour: 23,
      closeMinute: 59,
      label: 'Espacio público abierto · 24 h (actividad principal de día)',
      note: 'Plaza abierta; comercios y Catedral tienen sus propios horarios.',
    },
    fees: {
      free: true,
      adultLocal: 'Gratis',
      childLocal: 'Gratis',
      foreignerAdult: 'Gratis',
      foreignerChild: 'Gratis',
    },
    howToGet:
      'Calle El Conde esq. Arzobispo Meriño, Ciudad Colonial. Metro estación Casandra Damirón / caminando por El Conde.',
    website: 'https://www.mitur.gob.do/',
    officialSource: { name: 'MITUR · Ciudad Colonial', url: 'https://www.mitur.gob.do/' },
    updatedAt: '2026-04-01',
    summary: 'Plaza histórica frente a la Catedral Primada. Punto de encuentro del casco colonial.',
    highlights: ['Ciudad Colonial', 'Catedral', 'Gratis'],
  },
  {
    id: 'los-haitises',
    name: 'Parque Nacional Los Haitises',
    province: 'Samaná / Hato Mayor',
    municipality: 'Sabana de la Mar / Samaná',
    lat: 19.05,
    lon: -69.6,
    categories: ['nacional'],
    access: 'con-entrada',
    schedule: {
      openDays: EVERY_DAY,
      openHour: 8,
      openMinute: 0,
      closeHour: 16,
      closeMinute: 0,
      label: 'Acceso diurno vía operadores · típico 8:00 a.m. – 4:00 p.m.',
      note: 'Se visita casi siempre con tour en lancha desde Samaná, Sánchez o Sabana de la Mar.',
    },
    fees: {
      free: false,
      adultLocal: 'Permiso + tour',
      childLocal: 'Según operador',
      foreignerAdult: 'US$65–190 (tour típico)',
      foreignerChild: 'Según operador',
      note: 'No hay una sola taquilla fija: el precio combina permiso ambiental y operador turístico.',
    },
    howToGet:
      'Embarque principal desde Samaná, Cayo Levantado / Sánchez o Sabana de la Mar. Reservar con operador autorizado.',
    website: 'https://ambiente.gob.do/',
    officialSource: {
      name: 'Ministerio de Medio Ambiente',
      url: 'https://ambiente.gob.do/',
    },
    updatedAt: '2026-06-01',
    summary:
      'Mogotes, manglares, cuevas con petroglifos y aves. Uno de los parques nacionales más visitados del país.',
    highlights: ['Kayak / lancha', 'Cuevas', 'Manglares', 'Ecoturismo'],
  },
  {
    id: 'cotubanama',
    name: 'Parque Nacional Cotubanamá (del Este)',
    province: 'La Altagracia',
    municipality: 'Bayahíbe / Higüey',
    lat: 18.35,
    lon: -68.82,
    categories: ['nacional'],
    access: 'con-entrada',
    schedule: {
      openDays: EVERY_DAY,
      openHour: 8,
      openMinute: 0,
      closeHour: 16,
      closeMinute: 0,
      label: 'Acceso diurno · típico 8:00 a.m. – 4:00 p.m.',
      note: 'Incluye Isla Saona vía operadores desde Bayahíbe.',
    },
    fees: {
      free: false,
      adultLocal: 'Permiso + tour',
      childLocal: 'Según operador',
      foreignerAdult: 'Incluido en excursión Saona',
      foreignerChild: 'Según operador',
      note: 'Excursiones a Saona suelen incluir tasas del parque. Confirmar con el tour.',
    },
    howToGet: 'Salidas en catamarán/speedboat desde Bayahíbe. También senderos y cuevas en tierra firme.',
    website: 'https://ambiente.gob.do/',
    officialSource: {
      name: 'Ministerio de Medio Ambiente',
      url: 'https://ambiente.gob.do/',
    },
    updatedAt: '2026-06-01',
    summary: 'Parque costero–marino famoso por Saona, arrecifes, playas vírgenes y sitios arqueológicos taínos.',
    highlights: ['Isla Saona', 'Playas', 'Arqueología'],
  },
  {
    id: 'valle-nuevo',
    name: 'Parque Nacional Valle Nuevo',
    province: 'La Vega / Monseñor Nouel',
    municipality: 'Constanza / Bonao',
    lat: 18.78,
    lon: -70.62,
    categories: ['nacional'],
    access: 'con-entrada',
    schedule: {
      openDays: EVERY_DAY,
      openHour: 8,
      openMinute: 0,
      closeHour: 16,
      closeMinute: 0,
      label: 'Diurno · típico 8:00 a.m. – 4:00 p.m.',
      note: 'Clima frío de montaña. Llevar abrigo; caminos 4x4 en temporada de lluvia.',
    },
    fees: {
      free: false,
      adultLocal: 'Permiso ambiental',
      childLocal: 'Permiso ambiental',
      foreignerAdult: 'Permiso ambiental',
      foreignerChild: 'Permiso ambiental',
      note: 'Coordinar ingreso y guía con Medio Ambiente o eco-lodges de Constanza.',
    },
    howToGet:
      'Acceso típico desde Constanza (Camino de la Pirámide / Valle Nuevo). Vehículo alto recomendado.',
    website: 'https://ambiente.gob.do/',
    officialSource: {
      name: 'Ministerio de Medio Ambiente',
      url: 'https://ambiente.gob.do/',
    },
    updatedAt: '2026-05-15',
    summary: 'Altiplano dominicano con páramo, pinos y temperaturas bajas. “Los Alpes del Caribe”.',
    highlights: ['Montaña', 'Clima frío', 'Senderismo', 'Astronomía'],
  },
  {
    id: 'jaragua',
    name: 'Parque Nacional Jaragua',
    province: 'Pedernales',
    municipality: 'Pedernales / Oviedo',
    lat: 17.8,
    lon: -71.45,
    categories: ['nacional'],
    access: 'con-entrada',
    schedule: {
      openDays: EVERY_DAY,
      openHour: 8,
      openMinute: 0,
      closeHour: 16,
      closeMinute: 0,
      label: 'Diurno · acceso según sector (Bahía de las Águilas, Laguna Oviedo)',
      note: 'Bahía de las Águilas se visita con lancha desde Pedernales o Cabo Rojo.',
    },
    fees: {
      free: false,
      adultLocal: 'Permiso / lancha',
      childLocal: 'Según operador',
      foreignerAdult: 'Permiso / lancha',
      foreignerChild: 'Según operador',
      note: 'Combinar con operadores locales de Pedernales. Llevar agua y protección solar.',
    },
    howToGet:
      'Desde Pedernales hacia Cabo Rojo / embarcadero a Bahía de las Águilas. Laguna de Oviedo con guía local.',
    website: 'https://ambiente.gob.do/',
    officialSource: {
      name: 'Ministerio de Medio Ambiente',
      url: 'https://ambiente.gob.do/',
    },
    updatedAt: '2026-05-15',
    summary:
      'El parque nacional más grande del país: Bahía de las Águilas, lagunas y biodiversidad del suroeste.',
    highlights: ['Bahía de las Águilas', 'Laguna Oviedo', 'Biodiversidad'],
  },
  {
    id: 'armando-bermudez',
    name: 'Parque Nacional Armando Bermúdez',
    province: 'Santiago / La Vega',
    municipality: 'Jarabacoa / San José de las Matas',
    lat: 19.1,
    lon: -70.95,
    categories: ['nacional'],
    access: 'con-entrada',
    schedule: {
      openDays: EVERY_DAY,
      openHour: 7,
      openMinute: 0,
      closeHour: 16,
      closeMinute: 0,
      label: 'Diurno · rutas de montaña (Pico Duarte con permisos)',
      note: 'Ascenso a Pico Duarte requiere permisos, guías y varios días.',
    },
    fees: {
      free: false,
      adultLocal: 'Permiso + guía',
      childLocal: 'No recomendado para menores en rutas altas',
      foreignerAdult: 'Permiso + guía',
      foreignerChild: 'Consultar operador',
      note: 'Trámites vía Medio Ambiente / parques. No improvisar el Pico Duarte.',
    },
    howToGet:
      'Entradas frecuentes: La Ciénaga (Jarabacoa) o Mata Grande. Coordinar con guías certificados.',
    website: 'https://ambiente.gob.do/',
    officialSource: {
      name: 'Ministerio de Medio Ambiente',
      url: 'https://ambiente.gob.do/',
    },
    updatedAt: '2026-05-15',
    summary: 'Bosque de montaña y acceso clásico al Pico Duarte, la cima de las Antillas.',
    highlights: ['Pico Duarte', 'Senderismo', 'Bosque nublado'],
  },
  {
    id: 'isla-cabritos',
    name: 'Parque Nacional Isla Cabritos',
    province: 'Independencia',
    municipality: 'Duvergé / La Descubierta',
    lat: 18.48,
    lon: -71.7,
    categories: ['nacional'],
    access: 'con-entrada',
    schedule: {
      openDays: EVERY_DAY,
      openHour: 8,
      openMinute: 0,
      closeHour: 15,
      closeMinute: 0,
      label: 'Diurno · lancha desde La Descubierta / Duvergé',
      note: 'Calor extremo; llevar agua. Cocodrilos y flamingos en Lago Enriquillo.',
    },
    fees: {
      free: false,
      adultLocal: 'Permiso + lancha',
      childLocal: 'Según operador',
      foreignerAdult: 'Permiso + lancha',
      foreignerChild: 'Según operador',
    },
    howToGet:
      'Desde La Descubierta o Duvergé (Lago Enriquillo). Embarque matutino recomendado por el calor.',
    website: 'https://ambiente.gob.do/',
    officialSource: {
      name: 'Ministerio de Medio Ambiente',
      url: 'https://ambiente.gob.do/',
    },
    updatedAt: '2026-04-20',
    summary: 'Isla en el Lago Enriquillo (punto más bajo del Caribe) con cocodrilos americanos e iguanas.',
    highlights: ['Lago Enriquillo', 'Cocodrilos', 'Iguanas'],
  },
  {
    id: 'faro-colon',
    name: 'Faro a Colón',
    province: 'Santo Domingo Este',
    municipality: 'Santo Domingo Este',
    lat: 18.4758,
    lon: -69.8478,
    categories: ['urbano', 'tematico'],
    access: 'con-entrada',
    schedule: {
      openDays: TUE_SUN,
      openHour: 9,
      openMinute: 0,
      closeHour: 17,
      closeMinute: 0,
      label: 'Mar–Dom · 9:00 a.m. – 5:00 p.m. (aprox.)',
      note: 'Verificar si el museo/interior está abierto el día de la visita.',
    },
    fees: {
      free: false,
      adultLocal: 'RD$100 aprox.',
      childLocal: 'RD$50 aprox.',
      foreignerAdult: 'RD$100–US$ equivalente',
      foreignerChild: 'Tarifa reducida',
      note: 'Parque exterior a veces accesible; museo con boleto. Confirmar en MITUR.',
    },
    howToGet: 'Av. Mirador del Este, Santo Domingo Este. Cerca de Los Tres Ojos y el Acuario.',
    website: 'https://www.mitur.gob.do/',
    officialSource: { name: 'MITUR', url: 'https://www.mitur.gob.do/' },
    updatedAt: '2026-04-20',
    summary: 'Monumento-museo con forma de cruz y parque circundante en el este capitalino.',
    highlights: ['Museo', 'Mirador Este', 'Historia'],
  },
  {
    id: 'la-isabela',
    name: 'Parque Nacional Histórico La Isabela',
    province: 'Puerto Plata',
    municipality: 'Luperón',
    lat: 19.887,
    lon: -71.079,
    categories: ['nacional', 'tematico'],
    access: 'con-entrada',
    schedule: {
      openDays: EVERY_DAY,
      openHour: 9,
      openMinute: 0,
      closeHour: 17,
      closeMinute: 0,
      label: 'Lun–Dom · 9:00 a.m. – 5:00 p.m. (aprox.)',
    },
    fees: {
      free: false,
      adultLocal: 'Entrada local',
      childLocal: 'Tarifa reducida',
      foreignerAdult: 'Entrada turística',
      foreignerChild: 'Tarifa reducida',
      note: 'Primer asentamiento europeo en América. Verificar tarifas en sitio.',
    },
    howToGet: 'Desde Puerto Plata hacia Luperón / El Castillo. Carretera costera; carro o tour local.',
    website: 'https://ambiente.gob.do/',
    officialSource: {
      name: 'Ministerio de Medio Ambiente / MITUR',
      url: 'https://www.mitur.gob.do/',
    },
    updatedAt: '2026-03-28',
    summary: 'Sitio histórico de 1493–1494: ruinas, museo y costa norte cerca de Luperón.',
    highlights: ['Historia colonial', 'Museo', 'Costa norte'],
  },
]

export function provincesFromParks(parks: Park[] = PARKS) {
  return [...new Set(parks.map((p) => p.province))].sort((a, b) => a.localeCompare(b, 'es'))
}

export function municipalitiesFromParks(parks: Park[], province?: string) {
  const filtered = province ? parks.filter((p) => p.province === province) : parks
  return [...new Set(filtered.map((p) => p.municipality))].sort((a, b) => a.localeCompare(b, 'es'))
}
