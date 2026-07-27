import { useMemo, useState } from 'react'
import {
  Clock,
  ExternalLink,
  Globe,
  MapPinned,
  MapPin,
  Navigation,
  Phone,
  Ticket,
  Trees,
} from 'lucide-react'
import {
  PARKS,
  PARK_FILTERS,
  municipalitiesFromParks,
  provincesFromParks,
  type Park,
  type ParkAccess,
  type ParkCategory,
} from '@/data/parks'
import { useAsyncData } from '@/shared/hooks/useAsyncData'
import { fetchForecast } from '@/shared/api/openMeteo'
import { SectionHeader } from '@/shared/components/SectionHeader'
import { MetricCard } from '@/shared/components/MetricCard'
import { LoadingState, ErrorState, Disclaimer } from '@/shared/components/States'
import { MapView } from '@/shared/components/MapView'
import { formatNumber } from '@/shared/lib/utils'
import { formatUpdatedAt, parkOpenStatus } from '@/shared/lib/parkHours'
import {
  appleMapsDirectionsUrl,
  googleMapsDirectionsFromOriginUrl,
  googleMapsDirectionsUrl,
  googleMapsPlaceUrl,
  wazeNavigateUrl,
} from '@/shared/lib/navigationLinks'
import { WeatherIcon } from '@/shared/components/WeatherIcon'

type ChipFilter = ParkCategory | ParkAccess

function matchesFilters(park: Park, active: ChipFilter[]) {
  if (active.length === 0) return true
  return active.every((f) => {
    if (f === 'gratis' || f === 'con-entrada') return park.access === f
    return park.categories.includes(f)
  })
}

function markerColor(park: Park) {
  const { open } = parkOpenStatus(park)
  if (park.access === 'gratis') return open ? '#3d8b6e' : '#94a3b8'
  if (park.categories.includes('nacional')) return open ? '#137a8a' : '#94a3b8'
  if (park.categories.includes('tematico')) return open ? '#e9a825' : '#94a3b8'
  return open ? '#2ec4b6' : '#94a3b8'
}

export function ParksPage() {
  const [filters, setFilters] = useState<ChipFilter[]>([])
  const [province, setProvince] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [selectedId, setSelectedId] = useState(PARKS[0]?.id ?? '')
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [geoMessage, setGeoMessage] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return PARKS.filter((p) => {
      if (!matchesFilters(p, filters)) return false
      if (province && p.province !== province) return false
      if (municipality && p.municipality !== municipality) return false
      return true
    })
  }, [filters, province, municipality])

  const selected = filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? null

  const provinces = useMemo(() => provincesFromParks(PARKS), [])
  const municipalities = useMemo(
    () => municipalitiesFromParks(PARKS, province || undefined),
    [province],
  )

  const openCount = PARKS.filter((p) => parkOpenStatus(p).open).length
  const freeCount = PARKS.filter((p) => p.access === 'gratis').length
  const nationalCount = PARKS.filter((p) => p.categories.includes('nacional')).length

  const { data: weather, error, loading, reload } = useAsyncData(async () => {
    if (!selected) return null
    return fetchForecast(selected.lat, selected.lon)
  }, [selected?.lat, selected?.lon, selected?.id])

  function toggleFilter(id: ChipFilter) {
    setFilters((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function selectPark(id: string) {
    setSelectedId(id)
    setGeoStatus('idle')
    setGeoMessage(null)
  }

  function openRouteFromMyLocation(park: Park) {
    if (!navigator.geolocation) {
      setGeoStatus('error')
      setGeoMessage('Tu navegador no permite geolocalización. Usa Google Maps o Waze.')
      window.open(googleMapsDirectionsUrl(park.lat, park.lon, park.name), '_blank', 'noopener,noreferrer')
      return
    }

    setGeoStatus('loading')
    setGeoMessage(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoStatus('idle')
        const url = googleMapsDirectionsFromOriginUrl(
          pos.coords.latitude,
          pos.coords.longitude,
          park.lat,
          park.lon,
        )
        window.open(url, '_blank', 'noopener,noreferrer')
      },
      () => {
        setGeoStatus('error')
        setGeoMessage(
          'No pudimos obtener tu ubicación. Abre Google Maps o Waze y permite el acceso a la ubicación allí.',
        )
        window.open(googleMapsDirectionsUrl(park.lat, park.lon, park.name), '_blank', 'noopener,noreferrer')
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60_000 },
    )
  }

  const status = selected ? parkOpenStatus(selected) : null

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Parques de República Dominicana"
        description="Guía orientativa de algunos de los parques más visitados, con mapa y datos de referencia (horario, tarifas y contacto). RDIntelligence no administra estos espacios ni garantiza que la información esté al día: confirma siempre en la fuente oficial antes de ir."
        sources={[
          { name: 'MITUR', href: 'https://www.mitur.gob.do/' },
          { name: 'Medio Ambiente', href: 'https://ambiente.gob.do/' },
          { name: 'Open-Meteo (clima en ficha)', href: 'https://open-meteo.com/' },
          { name: 'OpenStreetMap', href: 'https://www.openstreetmap.org/' },
        ]}
      />

      <Disclaimer>
        Antes de visitar un parque, valida horario, tarifas, cierres y requisitos en el sitio o
        teléfono oficial (MITUR, Medio Ambiente u operador del lugar). Esta sección es solo
        informativa y de referencia; puede haber cambios sin aviso. El clima de la ficha sí se
        consulta en vivo, pero no indica si el parque está operativo ese día.
      </Disclaimer>

      <section>
        <div className="mb-3">
          <h2 className="font-display text-xl font-bold leading-snug text-rd-ink sm:text-2xl">
            Información general
          </h2>
          <p className="mt-1 text-sm text-rd-slate">
            Resumen de referencia del catálogo mostrado aquí (no es un listado oficial completo).
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Fichas de referencia"
            value={PARKS.length}
            hint="Más visitados · no todos los de RD"
          />
          <MetricCard
            label="¿Abiertos ahora?"
            value={openCount}
            hint={`Según horario publicado · zona RD`}
            accent="text-rd-leaf"
          />
          <MetricCard label="Gratis" value={freeCount} hint="Acceso sin boleto" />
          <MetricCard
            label="Parques nacionales"
            value={nationalCount}
            hint="Áreas protegidas destacadas"
            accent="text-rd-ocean"
          />
        </div>
      </section>

      <div className="panel space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Trees className="h-4 w-4 text-rd-ocean" />
          <p className="text-sm font-semibold text-rd-ink">Filtros</p>
          <span className="text-xs text-rd-slate">urbano · nacional · temático · gratis · con entrada</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PARK_FILTERS.map((f) => {
            const on = filters.includes(f.id)
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => toggleFilter(f.id)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  on
                    ? 'border-rd-ocean bg-rd-ocean text-white'
                    : 'border-rd-deep/15 bg-white text-rd-deep hover:border-rd-teal'
                }`}
              >
                {f.label}
              </button>
            )
          })}
          {filters.length > 0 ? (
            <button
              type="button"
              onClick={() => setFilters([])}
              className="rounded-full px-3 py-1.5 text-sm text-rd-slate underline-offset-2 hover:underline"
            >
              Limpiar
            </button>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-rd-slate">
              Provincia / región
            </span>
            <select
              value={province}
              onChange={(e) => {
                setProvince(e.target.value)
                setMunicipality('')
              }}
              className="w-full rounded-xl border border-rd-deep/15 bg-white px-3 py-2"
            >
              <option value="">Todas</option>
              {provinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-rd-slate">
              Municipio / zona
            </span>
            <select
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              className="w-full rounded-xl border border-rd-deep/15 bg-white px-3 py-2"
            >
              <option value="">Todos</option>
              {municipalities.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-3">
          <MapView
            className="h-[380px] sm:h-[460px]"
            markers={filtered.map((p) => {
              const st = parkOpenStatus(p)
              return {
                id: p.id,
                position: [p.lat, p.lon] as [number, number],
                label: p.name,
                detail: `${p.municipality} · ${st.label}`,
                color: markerColor(p),
                radius: selected?.id === p.id ? 12 : 9,
              }
            })}
            selectedId={selected?.id}
            onMarkerClick={selectPark}
          />
          <div className="flex flex-wrap gap-3 text-xs text-rd-slate">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rd-leaf" /> Gratis / abierto
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rd-ocean" /> Nacional
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rd-amber" /> Temático
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> Cerrado ahora
            </span>
          </div>
        </div>

        <div className="panel max-h-[520px] overflow-y-auto divide-y divide-rd-deep/5">
          {filtered.length === 0 ? (
            <p className="p-5 text-sm text-rd-slate">Ningún parque coincide con los filtros.</p>
          ) : (
            filtered.map((p) => {
              const st = parkOpenStatus(p)
              const active = selected?.id === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectPark(p.id)}
                  className={`w-full px-4 py-3 text-left transition hover:bg-rd-mist/60 ${
                    active ? 'bg-rd-mist/80' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display text-base font-bold leading-snug text-rd-ink">
                        {p.name}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-rd-slate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {p.municipality} · {p.province}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${st.tone}`}
                    >
                      {st.open ? 'Abierto' : 'Cerrado'}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.categories.map((c) => (
                      <span
                        key={c}
                        className="rounded bg-rd-deep/5 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-rd-slate"
                      >
                        {c}
                      </span>
                    ))}
                    <span className="rounded bg-rd-deep/5 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-rd-slate">
                      {p.access === 'gratis' ? 'gratis' : 'con entrada'}
                    </span>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {selected ? (
        <article className="panel-strong overflow-hidden">
          <div className="gradient-brand px-5 py-5 text-white sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  Ficha de referencia
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold leading-snug sm:text-3xl">
                  {selected.name}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-white/85">{selected.summary}</p>
              </div>
              {status ? (
                <span
                  className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                    status.open
                      ? 'border-emerald-300/40 bg-emerald-400/20 text-white'
                      : 'border-white/25 bg-white/10 text-white'
                  }`}
                >
                  ¿Abierto ahora? · {status.label}
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-xs text-white/70">
              Referencia al {formatUpdatedAt(selected.updatedAt)} · Consultar:{' '}
              <a
                href={selected.officialSource.url}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-white"
              >
                {selected.officialSource.name}
              </a>
            </p>
          </div>

          <div className="grid gap-0 lg:grid-cols-2">
            <div className="space-y-5 border-b border-rd-deep/10 p-5 sm:p-6 lg:border-b-0 lg:border-r">
              <div>
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-rd-ink">
                  <Clock className="h-4 w-4 text-rd-ocean" />
                  Horario
                </h3>
                <p className="mt-2 text-sm text-rd-ink">{selected.schedule.label}</p>
                {selected.schedule.note ? (
                  <p className="mt-1 text-xs text-rd-slate">{selected.schedule.note}</p>
                ) : null}
              </div>

              <div>
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-rd-ink">
                  <Ticket className="h-4 w-4 text-rd-ocean" />
                  Tarifas
                </h3>
                {selected.fees.free ? (
                  <p className="mt-2 text-sm font-semibold text-rd-leaf">Entrada gratuita</p>
                ) : (
                  <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-xl bg-rd-mist/70 px-3 py-2">
                      <dt className="text-xs text-rd-slate">Adulto (local)</dt>
                      <dd className="font-semibold">{selected.fees.adultLocal}</dd>
                    </div>
                    <div className="rounded-xl bg-rd-mist/70 px-3 py-2">
                      <dt className="text-xs text-rd-slate">Niño (local)</dt>
                      <dd className="font-semibold">{selected.fees.childLocal}</dd>
                    </div>
                    <div className="rounded-xl bg-rd-mist/70 px-3 py-2">
                      <dt className="text-xs text-rd-slate">Extranjero adulto</dt>
                      <dd className="font-semibold">{selected.fees.foreignerAdult}</dd>
                    </div>
                    <div className="rounded-xl bg-rd-mist/70 px-3 py-2">
                      <dt className="text-xs text-rd-slate">Extranjero niño</dt>
                      <dd className="font-semibold">{selected.fees.foreignerChild}</dd>
                    </div>
                  </dl>
                )}
                {selected.fees.note ? (
                  <p className="mt-2 text-xs text-rd-slate">{selected.fees.note}</p>
                ) : null}
              </div>

              <div>
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-rd-ink">
                  <Navigation className="h-4 w-4 text-rd-ocean" />
                  Cómo llegar
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-rd-slate">{selected.howToGet}</p>
                <p className="mt-2 text-xs text-rd-slate">
                  Coordenadas: {selected.lat.toFixed(4)}, {selected.lon.toFixed(4)}
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => openRouteFromMyLocation(selected)}
                    disabled={geoStatus === 'loading'}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-rd-deep px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-rd-ocean disabled:opacity-60"
                  >
                    <Navigation className="h-4 w-4" />
                    {geoStatus === 'loading' ? 'Obteniendo tu ubicación…' : 'Ruta desde mi ubicación'}
                  </button>
                  <a
                    href={googleMapsDirectionsUrl(selected.lat, selected.lon, selected.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-rd-deep/15 bg-white px-3 py-2.5 text-sm font-semibold text-rd-deep transition hover:border-rd-teal hover:text-rd-ocean"
                  >
                    <MapPinned className="h-4 w-4" />
                    Google Maps
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href={wazeNavigateUrl(selected.lat, selected.lon)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-rd-deep/15 bg-white px-3 py-2.5 text-sm font-semibold text-rd-deep transition hover:border-rd-teal hover:text-rd-ocean"
                  >
                    Waze
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href={appleMapsDirectionsUrl(selected.lat, selected.lon, selected.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-rd-deep/15 bg-white px-3 py-2.5 text-sm font-semibold text-rd-deep transition hover:border-rd-teal hover:text-rd-ocean"
                  >
                    Apple Maps
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href={googleMapsPlaceUrl(selected.lat, selected.lon, selected.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-rd-deep/20 bg-rd-mist/50 px-3 py-2.5 text-sm font-medium text-rd-deep transition hover:border-rd-teal sm:col-span-2"
                  >
                    <MapPin className="h-4 w-4" />
                    Solo ver ubicación en el mapa
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                {geoMessage ? (
                  <p className="mt-2 text-xs text-amber-800">{geoMessage}</p>
                ) : (
                  <p className="mt-2 text-xs text-rd-slate">
                    “Ruta desde mi ubicación” pide permiso del GPS y abre Google Maps con el trayecto.
                    En el celular, Waze suele abrir la app directamente.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {selected.phone ? (
                  <a
                    href={`tel:${selected.phone.replace(/\s/g, '')}`}
                    className="inline-flex items-center gap-2 rounded-full border border-rd-deep/15 bg-white px-3 py-1.5 text-sm font-medium text-rd-deep hover:border-rd-teal"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {selected.phone}
                  </a>
                ) : null}
                {selected.website ? (
                  <a
                    href={selected.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-rd-deep/15 bg-white px-3 py-1.5 text-sm font-medium text-rd-deep hover:border-rd-teal"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Web
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
                <a
                  href={selected.officialSource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-rd-deep px-3 py-1.5 text-sm font-medium text-white hover:bg-rd-ocean"
                >
                  Fuente oficial
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <ul className="flex flex-wrap gap-2">
                {selected.highlights.map((h) => (
                  <li
                    key={h}
                    className="rounded-full border border-rd-teal/30 bg-rd-teal/10 px-3 py-1 text-xs font-medium text-rd-ocean"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              <h3 className="font-display text-lg font-bold text-rd-ink">Clima en el parque (vivo)</h3>
              <p className="text-xs text-rd-slate">
                Condiciones actuales vía Open-Meteo en las coordenadas de la ficha — útil para planear
                la visita, no sustituye el estado operativo del parque.
              </p>

              {loading ? <LoadingState label="Consultando clima del parque…" /> : null}
              {error ? <ErrorState message={error} onRetry={reload} /> : null}

              {weather && !loading ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-2xl bg-rd-mist/80 p-4">
                    <WeatherIcon code={weather.current?.weather_code ?? 0} size="md" />
                    <div>
                      <p className="font-display text-3xl font-bold text-rd-ink">
                        {formatNumber(weather.current?.temperature_2m ?? 0)}°C
                      </p>
                      <p className="text-sm text-rd-slate">
                        Humedad {formatNumber(weather.current?.relative_humidity_2m ?? 0, 0)}% ·
                        Viento {formatNumber(weather.current?.wind_speed_10m ?? 0)} km/h
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-rd-deep/10 px-3 py-3">
                      <p className="text-xs uppercase tracking-wider text-rd-slate">Lluvia ahora</p>
                      <p className="font-display text-xl font-bold">
                        {formatNumber(weather.current?.precipitation ?? 0)} mm
                      </p>
                    </div>
                    <div className="rounded-xl border border-rd-deep/10 px-3 py-3">
                      <p className="text-xs uppercase tracking-wider text-rd-slate">Máx. hoy</p>
                      <p className="font-display text-xl font-bold">
                        {formatNumber(weather.daily?.temperature_2m_max?.[0] ?? 0)}°C
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs leading-relaxed text-amber-950">
                Esta ficha es orientativa. Antes de salir, confirma en la fuente oficial si el parque
                opera hoy, si hay cierres por clima o mantenimiento, y la tarifa vigente en taquilla.
                RDIntelligence no sustituye la información del administrador del parque.
              </div>
            </div>
          </div>
        </article>
      ) : null}
    </div>
  )
}
