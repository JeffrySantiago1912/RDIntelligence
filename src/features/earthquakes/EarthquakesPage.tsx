import { useAsyncData } from '@/shared/hooks/useAsyncData'
import { fetchRdQuakes } from '@/shared/api/usgs'
import { SectionHeader } from '@/shared/components/SectionHeader'
import { MetricCard } from '@/shared/components/MetricCard'
import { MapView } from '@/shared/components/MapView'
import { LoadingState, ErrorState } from '@/shared/components/States'
import { TIPS } from '@/data/tips'

export function EarthquakesPage() {
  const { data, error, loading, reload } = useAsyncData(() => fetchRdQuakes(30, 2.0), [])
  const features = data?.features ?? []
  const maxMag = features.reduce((m, f) => Math.max(m, f.properties.mag ?? 0), 0)

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Sismos en RD y cercanías"
        description="Últimos 30 días de temblores en República Dominicana, La Española y el Canal de la Mona (no todo el Caribe)."
        sources={[
          { name: 'USGS', href: 'https://earthquake.usgs.gov/fdsnws/event/1/' },
        ]}
      />

      {loading ? <LoadingState label="Buscando sismos cerca de RD…" /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              label="Eventos cerca de RD"
              value={features.length}
              tip="Sismos de magnitud 2.0 o más en los últimos 30 días dentro de la zona de RD y alrededores inmediatos."
            />
            <MetricCard
              label="Magnitud máxima"
              value={features.length ? maxMag.toFixed(1) : '—'}
              tip={TIPS.earthquakeMag}
            />
            <MetricCard
              label="Fuente"
              value="USGS"
              hint="Red sísmica abierta"
              tip="Servicio Geológico de Estados Unidos: publica sismos casi en tiempo real."
            />
          </div>

          {features.length === 0 ? (
            <div className="panel p-8 text-center text-rd-slate">
              No hay sismos registrados cerca de RD en este periodo con los filtros actuales. Eso
              suele ser una buena señal; vuelve a consultar más adelante.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <MapView
                className="h-[380px] sm:h-[420px]"
                center={[18.7, -70.2]}
                zoom={8}
                markers={features.slice(0, 50).map((f) => ({
                  id: f.id,
                  position: [f.geometry.coordinates[1], f.geometry.coordinates[0]],
                  label: `M${f.properties.mag ?? '?'}`,
                  detail: f.properties.place ?? '',
                  color: (f.properties.mag ?? 0) >= 4.5 ? '#f07167' : '#e9a825',
                  radius: 6 + (f.properties.mag ?? 1) * 2,
                }))}
              />
              <ul className="panel max-h-[420px] divide-y divide-rd-deep/5 overflow-auto">
                {features.slice(0, 30).map((f) => (
                  <li key={f.id} className="px-4 py-3">
                    <a
                      href={f.properties.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-rd-ocean hover:underline"
                    >
                      M{f.properties.mag} — {f.properties.place}
                    </a>
                    <p className="text-xs text-rd-slate">
                      {new Date(f.properties.time).toLocaleString('es-DO')}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
