import { useMemo, useState } from 'react'
import { Polyline } from 'react-leaflet'
import { useAsyncData } from '@/shared/hooks/useAsyncData'
import {
  distanceToSantoDomingoKm,
  fetchActiveStorms,
  stormClassLabel,
} from '@/shared/api/nhc'
import { SectionHeader } from '@/shared/components/SectionHeader'
import { MetricCard } from '@/shared/components/MetricCard'
import { MapView } from '@/shared/components/MapView'
import { LoadingState, ErrorState, Disclaimer } from '@/shared/components/States'
import { TIPS } from '@/data/tips'

type BasinFilter = 'all' | 'Atlántico' | 'Pacífico'

export function HurricanesPage() {
  const { data, error, loading, reload } = useAsyncData(fetchActiveStorms, [])
  const [basin, setBasin] = useState<BasinFilter>('all')

  const storms = useMemo(() => {
    const list = data?.activeStorms ?? []
    if (basin === 'all') return list
    return list.filter((s) => s.basin === basin)
  }, [data, basin])

  const nearest = useMemo(() => {
    if (!storms.length) return null
    return [...storms]
      .map((s) => ({
        ...s,
        distanceKm: distanceToSantoDomingoKm(s.latitudeNumeric, s.longitudeNumeric),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)[0]
  }, [storms])

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Huracanes y ciclones"
        description="Tormentas activas globales vía NASA EONET (incluye fuentes NOAA NHC / JTWC). Compatible con hosting estático."
        sources={[
          { name: 'NASA EONET', href: 'https://eonet.gsfc.nasa.gov/api/v3/events' },
          { name: 'NOAA NHC', href: 'https://www.nhc.noaa.gov/' },
        ]}
      />
      <Disclaimer>
        Antes usábamos el JSON directo de NHC, pero bloquea CORS y el proxy local devolvía 502. Ahora
        usamos NASA EONET (CORS abierto), que agrega las mismas tormentas y enlaza a NHC cuando
        existe.
      </Disclaimer>

      <div className="flex flex-wrap gap-2">
        {([
          ['all', 'Todas'],
          ['Atlántico', 'Atlántico / Caribe'],
          ['Pacífico', 'Pacífico'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setBasin(value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              basin === value
                ? 'bg-rd-deep text-white'
                : 'border border-rd-deep/10 bg-white text-rd-deep hover:border-rd-teal'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {!loading && !error ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Tormentas activas"
              value={storms.length}
              tip="Cantidad de ciclones o tormentas tropicales abiertas ahora mismo (según el filtro)."
            />
            <MetricCard
              label="Más intensa"
              value={
                storms.length
                  ? `${Math.max(...storms.map((s) => s.intensity || 0))} kt`
                  : '—'
              }
              tip={TIPS.stormIntensity}
            />
            <MetricCard
              label="Más cercana a SD"
              value={nearest ? nearest.name : '—'}
              hint={nearest ? `${nearest.distanceKm} km` : undefined}
              tip={TIPS.stormDistance}
            />
            <MetricCard
              label="Proveedor"
              value="NASA EONET"
              hint="Datos satélite / agencias"
              tip="Fuente abierta de la NASA con desastres naturales activos, incluidas tormentas, y enlaces a NOAA NHC."
            />
          </div>

          {storms.length === 0 ? (
            <div className="panel p-8 text-center text-rd-slate">
              No hay tormentas activas en este filtro. Prueba “Todas” o vuelve durante la temporada.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <MapView
                center={[20, -65]}
                zoom={3}
                className="h-[420px]"
                markers={storms.map((s) => ({
                  id: s.id,
                  position: [s.latitudeNumeric, s.longitudeNumeric],
                  label: s.name,
                  detail: `${stormClassLabel(s.classification)} · ${s.intensity} kt · ${s.basin}`,
                  color: s.basin === 'Atlántico' ? '#6366f1' : '#f07167',
                  radius: 12 + Math.min(10, s.intensity / 10),
                }))}
              >
                {storms.map((s) =>
                  s.track.length > 1 ? (
                    <Polyline
                      key={`${s.id}-track`}
                      positions={s.track.map((p) => [p.lat, p.lon] as [number, number])}
                      pathOptions={{
                        color: s.basin === 'Atlántico' ? '#6366f1' : '#f07167',
                        weight: 2,
                        opacity: 0.7,
                      }}
                    />
                  ) : null,
                )}
              </MapView>
              <ul className="panel divide-y divide-rd-deep/5">
                {storms.map((s) => {
                  const distanceKm = distanceToSantoDomingoKm(
                    s.latitudeNumeric,
                    s.longitudeNumeric,
                  )
                  return (
                    <li key={s.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-lg font-bold">{s.name}</p>
                          <p className="text-sm text-rd-slate">
                            {stormClassLabel(s.classification)} · {s.intensity || '—'} kt · {s.basin}
                          </p>
                          <p className="text-xs text-rd-slate">
                            Distancia a Santo Domingo: {distanceKm} km · act.{' '}
                            {new Date(s.lastUpdate).toLocaleString('es-DO')}
                          </p>
                        </div>
                        <a
                          href={s.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 rounded-full border border-rd-deep/10 px-2.5 py-1 text-xs font-medium text-rd-ocean hover:border-rd-teal"
                        >
                          {s.sourceLabel}
                        </a>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
