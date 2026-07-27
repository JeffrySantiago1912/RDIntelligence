import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeftRight,
  CloudRain,
  Clock3,
  ExternalLink,
  Lightbulb,
  MapPin,
  MapPinned,
  Navigation,
  Route,
} from 'lucide-react'
import { TRAFFIC_CORRIDORS } from '@/data/trafficCorridors'
import { useAsyncData } from '@/shared/hooks/useAsyncData'
import { currentHourIndex, fetchForecast } from '@/shared/api/openMeteo'
import { fetchDrivingRoute } from '@/shared/api/osrm'
import { SectionHeader } from '@/shared/components/SectionHeader'
import { MetricCard } from '@/shared/components/MetricCard'
import { LoadingState, ErrorState, Disclaimer } from '@/shared/components/States'
import { MapView } from '@/shared/components/MapView'
import { getRdNowParts } from '@/shared/lib/parkHours'
import { formatNumber } from '@/shared/lib/utils'
import {
  advanceRdClock,
  congestionColor,
  congestionLevel,
  congestionScore,
  formatMinutes,
  travelAdvice,
  travelMultiplier,
} from '@/shared/lib/trafficModel'
import {
  appleMapsCorridorUrl,
  appleMapsDirectionsUrl,
  googleMapsCorridorUrl,
  googleMapsDirectionsFromOriginUrl,
  googleMapsDirectionsUrl,
  googleMapsPlaceUrl,
  wazeNavigateUrl,
} from '@/shared/lib/navigationLinks'
import { TIPS } from '@/data/tips'

type CorridorLive = {
  id: string
  name: string
  cityLabel: string
  note: string
  summary: string
  landmarks: string[]
  tip: string
  from: [number, number]
  to: [number, number]
  fromLabel: string
  toLabel: string
  lat: number
  lon: number
  scoreNow: number
  score45: number
  levelNow: ReturnType<typeof congestionLevel>
  level45: ReturnType<typeof congestionLevel>
  travelNowLabel: string
  travel45Label: string
  freeFlowLabel: string
  distanceKm: number
  routeSource: 'osrm' | 'haversine'
  precipMm: number
  windKmh: number
  advice: string
}

function dist2(a: [number, number], b: [number, number]) {
  const dLat = a[0] - b[0]
  const dLon = a[1] - b[1]
  return dLat * dLat + dLon * dLon
}

async function loadTraffic(): Promise<{
  corridors: CorridorLive[]
  clock: { hour: number; minute: number; day: number }
  avgNow: number
  raining: boolean
  osrmOk: number
}> {
  const clock = getRdNowParts()
  const in45 = advanceRdClock(clock.hour, clock.minute, 45)

  const [wxSd, wxStg, routes] = await Promise.all([
    fetchForecast(18.48, -69.94),
    fetchForecast(19.45, -70.69),
    Promise.all(TRAFFIC_CORRIDORS.map((c) => fetchDrivingRoute(c.from, c.to))),
  ])

  const readWx = (city: 'santo-domingo' | 'santiago') => {
    const f = city === 'santiago' ? wxStg : wxSd
    const idx = currentHourIndex(f.hourly.time)
    return {
      precip: f.current?.precipitation ?? f.hourly.precipitation[idx] ?? 0,
      wind: f.current?.wind_speed_10m ?? f.hourly.wind_speed_10m[idx] ?? 0,
    }
  }

  const corridors: CorridorLive[] = TRAFFIC_CORRIDORS.map((c, i) => {
    const wx = readWx(c.city)
    const route = routes[i]
    const scoreNow = congestionScore({
      hour: clock.hour,
      minute: clock.minute,
      day: clock.day,
      chronic: c.chronic,
      precipMm: wx.precip,
      windKmh: wx.wind,
    })
    const score45 = congestionScore({
      hour: in45.hour,
      minute: in45.minute,
      day: clock.day,
      chronic: c.chronic,
      precipMm: wx.precip,
      windKmh: wx.wind,
    })
    const travelNow = route.durationSec * travelMultiplier(scoreNow)
    const travel45 = route.durationSec * travelMultiplier(score45)
    const midLat = (c.from[0] + c.to[0]) / 2
    const midLon = (c.from[1] + c.to[1]) / 2
    const raining = wx.precip >= 0.4

    return {
      id: c.id,
      name: c.name,
      cityLabel: c.cityLabel,
      note: c.note,
      summary: c.summary,
      landmarks: c.landmarks,
      tip: c.tip,
      from: c.from,
      to: c.to,
      fromLabel: c.fromLabel,
      toLabel: c.toLabel,
      lat: midLat,
      lon: midLon,
      scoreNow: Math.round(scoreNow),
      score45: Math.round(score45),
      levelNow: congestionLevel(scoreNow),
      level45: congestionLevel(score45),
      travelNowLabel: formatMinutes(travelNow),
      travel45Label: formatMinutes(travel45),
      freeFlowLabel: formatMinutes(route.durationSec),
      distanceKm: route.distanceM / 1000,
      routeSource: route.source,
      precipMm: wx.precip,
      windKmh: wx.wind,
      advice: travelAdvice(scoreNow, score45, raining),
    }
  }).sort((a, b) => b.scoreNow - a.scoreNow)

  const avgNow = corridors.reduce((s, c) => s + c.scoreNow, 0) / corridors.length
  const raining = corridors.some((c) => c.precipMm >= 0.4)
  const osrmOk = corridors.filter((c) => c.routeSource === 'osrm').length

  return { corridors, clock, avgNow, raining, osrmOk }
}

export function TrafficPage() {
  const { data, error, loading, reload } = useAsyncData(loadTraffic, [])
  const [selectedId, setSelectedId] = useState('')
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [geoMessage, setGeoMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!data?.corridors.length) return
    if (!selectedId || !data.corridors.some((c) => c.id === selectedId)) {
      setSelectedId(data.corridors[0].id)
    }
  }, [data, selectedId])

  const clockLabel = useMemo(() => {
    if (!data) return '—'
    const { hour, minute } = data.clock
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  }, [data])

  const selected = data?.corridors.find((c) => c.id === selectedId) ?? data?.corridors[0] ?? null
  const heaviest = data?.corridors[0]

  function selectCorridor(id: string) {
    setSelectedId(id)
    setGeoStatus('idle')
    setGeoMessage(null)
  }

  function openFromMyLocation(corridor: CorridorLive) {
    if (!navigator.geolocation) {
      setGeoStatus('error')
      setGeoMessage('Tu navegador no permite geolocalización. Abre Google Maps o Waze.')
      window.open(
        googleMapsDirectionsUrl(corridor.lat, corridor.lon, corridor.name),
        '_blank',
        'noopener,noreferrer',
      )
      return
    }

    setGeoStatus('loading')
    setGeoMessage(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoStatus('idle')
        const here: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        const useFrom = dist2(here, corridor.from) <= dist2(here, corridor.to)
        const dest = useFrom ? corridor.from : corridor.to
        const label = useFrom ? corridor.fromLabel : corridor.toLabel
        const url = googleMapsDirectionsFromOriginUrl(here[0], here[1], dest[0], dest[1])
        setGeoMessage(`Entrada sugerida: ${label}`)
        window.open(url, '_blank', 'noopener,noreferrer')
      },
      () => {
        setGeoStatus('error')
        setGeoMessage('No pudimos obtener tu ubicación. Abre Google Maps o Waze y permite el GPS allí.')
        window.open(
          googleMapsDirectionsUrl(corridor.lat, corridor.lon, corridor.name),
          '_blank',
          'noopener,noreferrer',
        )
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60_000 },
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Tráfico inteligente RD"
        description="Índice de congestión y tiempo estimado en corredores clave de Santo Domingo y Santiago. Toca un corredor para ver detalle, consejo y cómo llegar."
        sources={[
          { name: 'Open-Meteo', href: 'https://open-meteo.com/' },
          { name: 'OSRM (OpenStreetMap)', href: 'https://project-osrm.org/' },
          { name: 'Modelo horario RDIntelligence' },
        ]}
      />

      <Disclaimer>
        No usamos GPS de Waze/Google en tiempo real (esas APIs no son gratuitas sin restricciones).
        Aquí verás una estimación con clima vivo y patrones de hora pico dominicanos. Los botones de
        navegación abren apps externas para la ruta real.
      </Disclaimer>

      {loading ? <LoadingState label="Calculando corredores y clima…" /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Hora local RD"
              value={clockLabel}
              hint="America/Santo_Domingo"
              tip="Hora actual en República Dominicana. El índice cambia con la hora pico matutina y vespertina."
            />
            <MetricCard
              label="Congestión media"
              value={Math.round(data.avgNow)}
              hint={congestionLevel(data.avgNow)}
              accent="text-rd-coral"
              tip={TIPS.trafficNow}
            />
            <MetricCard
              label="Corredor más cargado"
              value={heaviest ? heaviest.scoreNow : '—'}
              hint={heaviest?.name ?? '—'}
              tip="El tramo con mayor índice estimado en este momento entre los corredores monitoreados."
            />
            <MetricCard
              label="Clima en vías"
              value={data.raining ? 'Lluvia' : 'Seco'}
              hint={data.raining ? 'La lluvia eleva la congestión estimada' : 'Sin lluvia relevante ahora'}
              tip="Open-Meteo alimenta el ajuste por precipitación y viento en cada ciudad."
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <MapView
                className="h-[420px]"
                markers={data.corridors.map((c) => ({
                  id: c.id,
                  position: [c.lat, c.lon],
                  label: c.name,
                  detail: `${c.levelNow} · ${c.scoreNow}/100 · ${c.travelNowLabel}`,
                  color: congestionColor(c.scoreNow),
                  radius: selected?.id === c.id ? 14 : 8 + c.scoreNow / 12,
                }))}
                selectedId={selected?.id}
                onMarkerClick={selectCorridor}
              />
              <p className="text-xs text-rd-slate">
                Haz clic en un marcador o en la lista para abrir la ficha del corredor.
              </p>
            </div>

            <ul className="panel max-h-[460px] divide-y divide-rd-deep/5 overflow-y-auto">
              {data.corridors.map((c) => {
                const active = selected?.id === c.id
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => selectCorridor(c.id)}
                      className={`w-full px-4 py-3.5 text-left transition hover:bg-rd-mist/60 ${
                        active ? 'bg-rd-mist/80' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-display text-base font-bold leading-snug text-rd-ink">
                            {c.name}
                          </p>
                          <p className="mt-0.5 text-xs text-rd-slate">
                            {c.cityLabel} · {c.note}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-rd-slate">
                            <span className="inline-flex items-center gap-1">
                              <Route className="h-3 w-3" />
                              {formatNumber(c.distanceKm, 1)} km
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock3 className="h-3 w-3" />
                              {c.travelNowLabel}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p
                            className="font-display text-2xl font-bold leading-none"
                            style={{ color: congestionColor(c.scoreNow) }}
                          >
                            {c.scoreNow}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-rd-ink">{c.levelNow}</p>
                        </div>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {selected ? (
            <article className="panel-strong overflow-hidden">
              <div className="gradient-brand px-5 py-5 text-white sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                      Ficha del corredor
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-bold leading-snug sm:text-3xl">
                      {selected.name}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-white/85">{selected.summary}</p>
                  </div>
                  <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-sm font-semibold">
                    {selected.levelNow} · {selected.scoreNow}/100
                  </span>
                </div>
                <p className="mt-3 text-xs text-white/70">
                  {selected.cityLabel} · tramo ~{formatNumber(selected.distanceKm, 1)} km · tiempo libre
                  estimado {selected.freeFlowLabel}
                </p>
              </div>

              <div className="grid gap-0 lg:grid-cols-2">
                <div className="space-y-5 border-b border-rd-deep/10 p-5 sm:p-6 lg:border-b-0 lg:border-r">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-rd-mist/70 px-3 py-3">
                      <p className="text-xs uppercase tracking-wider text-rd-slate">Ahora</p>
                      <p
                        className="font-display text-2xl font-bold"
                        style={{ color: congestionColor(selected.scoreNow) }}
                      >
                        {selected.travelNowLabel}
                      </p>
                      <p className="text-xs text-rd-slate">{selected.levelNow}</p>
                    </div>
                    <div className="rounded-xl bg-rd-mist/70 px-3 py-3">
                      <p className="text-xs uppercase tracking-wider text-rd-slate">En ~45 min</p>
                      <p
                        className="font-display text-2xl font-bold"
                        style={{ color: congestionColor(selected.score45) }}
                      >
                        {selected.travel45Label}
                      </p>
                      <p className="text-xs text-rd-slate">
                        {selected.level45} · {selected.score45}/100
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-rd-teal/25 bg-rd-teal/10 px-4 py-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-rd-ocean">
                      <Lightbulb className="h-4 w-4" />
                      Consejo ahora
                    </p>
                    <p className="mt-1 text-sm text-rd-ink">{selected.advice}</p>
                    <p className="mt-2 text-xs text-rd-slate">{selected.tip}</p>
                  </div>

                  <div>
                    <h3 className="font-display text-lg font-bold text-rd-ink">Referencias del tramo</h3>
                    <p className="mt-1 text-sm text-rd-slate">
                      De <span className="font-medium text-rd-ink">{selected.fromLabel}</span> a{' '}
                      <span className="font-medium text-rd-ink">{selected.toLabel}</span>
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {selected.landmarks.map((l) => (
                        <li
                          key={l}
                          className="rounded-full border border-rd-deep/10 bg-white px-3 py-1 text-xs font-medium text-rd-deep"
                        >
                          {l}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-rd-slate">
                    <span className="inline-flex items-center gap-1">
                      <CloudRain className="h-3.5 w-3.5" />
                      Lluvia {formatNumber(selected.precipMm)} mm · viento{' '}
                      {formatNumber(selected.windKmh)} km/h
                    </span>
                    <span>
                      Ruta base: {selected.routeSource === 'osrm' ? 'OSRM/OSM' : 'distancia estimada'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 p-5 sm:p-6">
                  <h3 className="flex items-center gap-2 font-display text-lg font-bold text-rd-ink">
                    <Navigation className="h-4 w-4 text-rd-ocean" />
                    Cómo llegar / navegar
                  </h3>
                  <p className="text-sm text-rd-slate">
                    Abre la navegación externa hacia este corredor o recorre el tramo en el mapa.
                  </p>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => openFromMyLocation(selected)}
                      disabled={geoStatus === 'loading'}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-rd-deep px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-rd-ocean disabled:opacity-60 sm:col-span-2"
                    >
                      <Navigation className="h-4 w-4" />
                      {geoStatus === 'loading'
                        ? 'Obteniendo tu ubicación…'
                        : 'Desde mi ubicación al corredor'}
                    </button>

                    <a
                      href={googleMapsCorridorUrl(
                        selected.from,
                        selected.to,
                        selected.fromLabel,
                        selected.toLabel,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-rd-deep/15 bg-white px-3 py-2.5 text-sm font-semibold text-rd-deep transition hover:border-rd-teal hover:text-rd-ocean"
                    >
                      <MapPinned className="h-4 w-4" />
                      Recorrer tramo (Maps)
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <a
                      href={googleMapsCorridorUrl(
                        selected.to,
                        selected.from,
                        selected.toLabel,
                        selected.fromLabel,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-rd-deep/15 bg-white px-3 py-2.5 text-sm font-semibold text-rd-deep transition hover:border-rd-teal hover:text-rd-ocean"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                      Sentido inverso
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <a
                      href={wazeNavigateUrl(selected.lat, selected.lon)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-rd-deep/15 bg-white px-3 py-2.5 text-sm font-semibold text-rd-deep transition hover:border-rd-teal hover:text-rd-ocean"
                    >
                      Waze al punto medio
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <a
                      href={appleMapsCorridorUrl(selected.from, selected.to)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-rd-deep/15 bg-white px-3 py-2.5 text-sm font-semibold text-rd-deep transition hover:border-rd-teal hover:text-rd-ocean"
                    >
                      Apple Maps (tramo)
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <a
                      href={appleMapsDirectionsUrl(selected.lat, selected.lon, selected.name)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-rd-deep/15 bg-white px-3 py-2.5 text-sm font-semibold text-rd-deep transition hover:border-rd-teal hover:text-rd-ocean"
                    >
                      Apple Maps (punto)
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <a
                      href={googleMapsPlaceUrl(selected.lat, selected.lon, selected.name)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-rd-deep/20 bg-rd-mist/50 px-3 py-2.5 text-sm font-medium text-rd-deep transition hover:border-rd-teal sm:col-span-2"
                    >
                      <MapPin className="h-4 w-4" />
                      Solo ver el corredor en el mapa
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {geoMessage ? (
                    <p className="text-xs text-amber-800">{geoMessage}</p>
                  ) : (
                    <p className="text-xs text-rd-slate">
                      “Desde mi ubicación” elige el extremo del tramo más cercano a ti y abre Google
                      Maps. Waze suele abrir la app en el celular.
                    </p>
                  )}
                </div>
              </div>
            </article>
          ) : null}

          <div className="panel p-4 text-xs leading-relaxed text-rd-slate sm:p-5">
            <p>
              <span className="font-semibold text-rd-ink">Cómo se calcula: </span>
              tiempo base del tramo con OSRM/OSM ({data.osrmOk}/{data.corridors.length} rutas
              obtenidas del servidor público)
              {data.osrmOk < data.corridors.length
                ? '; el resto usa distancia estimada si OSRM no responde'
                : ''}
              , más curva de hora pico RD y ajuste por lluvia/viento de Open-Meteo. Índice 0–100:
              Fluido &lt; 42 · Lento · Congestionado · Crítico ≥ 80.
            </p>
          </div>
        </>
      ) : null}
    </div>
  )
}
