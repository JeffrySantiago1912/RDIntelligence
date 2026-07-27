import { BEACHES } from '@/data/locations'
import { useAsyncData } from '@/shared/hooks/useAsyncData'
import { currentHourIndex, fetchForecast } from '@/shared/api/openMeteo'
import { SectionHeader } from '@/shared/components/SectionHeader'
import { MapView } from '@/shared/components/MapView'
import { LoadingState, ErrorState, Disclaimer } from '@/shared/components/States'
import { riskLabel, sargassumIndex } from '@/shared/lib/utils'

async function loadSargassum() {
  const results = await Promise.all(
    BEACHES.map(async (b) => {
      const f = await fetchForecast(b.lat, b.lon)
      const idx = currentHourIndex(f.hourly.time)
      const wind = f.current?.wind_speed_10m ?? f.hourly.wind_speed_10m[idx]
      const windDir = f.current?.wind_direction_10m ?? f.hourly.wind_direction_10m[idx]
      const score = sargassumIndex(new Date().getMonth() + 1, windDir, wind)
      return { ...b, score, wind, windDir }
    }),
  )
  return results.sort((a, b) => b.score - a.score)
}

export function SargassumPage() {
  const { data, error, loading, reload } = useAsyncData(loadSargassum, [])

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Monitoreo de sargazo"
        description="Índice relativo por playa usando temporada caribeña y viento onshore estimado."
        sources={[
          { name: 'Open-Meteo viento', href: 'https://open-meteo.com/' },
          { name: 'Heurística estacional RDIntelligence' },
        ]}
      />
      <Disclaimer>
        No existe (aún integrada) una API gratuita pública oficial de cobertura de sargazo para RD.
        Este módulo estima presión estacional solo en playas costeras (no aplica a provincias
        interiores como Santiago). Fuentes futuras: Copernicus / NOAA / satélite.
      </Disclaimer>

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <MapView
            className="h-[420px]"
            markers={data.map((b) => ({
              id: b.id,
              position: [b.lat, b.lon],
              label: b.name,
              detail: `${Math.round(b.score)} · ${riskLabel(b.score)}`,
              color: b.score >= 60 ? '#c4a35a' : '#3d8b6e',
              radius: 8 + b.score / 15,
            }))}
          />
          <ul className="panel divide-y divide-rd-deep/5 overflow-hidden">
            {data.map((b) => (
              <li key={b.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium">{b.name}</p>
                  <p className="text-xs text-rd-slate">
                    Viento {Math.round(b.wind)} km/h · dir {Math.round(b.windDir)}°
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-bold">{Math.round(b.score)}</p>
                  <p className="text-xs text-rd-slate">{riskLabel(b.score)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
