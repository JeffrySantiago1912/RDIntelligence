import { BEACHES } from '@/data/locations'
import { useAsyncData } from '@/shared/hooks/useAsyncData'
import { currentHourIndex, fetchForecast, fetchMarine } from '@/shared/api/openMeteo'
import { SectionHeader } from '@/shared/components/SectionHeader'
import { LoadingState, ErrorState } from '@/shared/components/States'
import { MapView } from '@/shared/components/MapView'
import { sargassumIndex, tourismScore } from '@/shared/lib/utils'

async function loadTourism() {
  const destinations = BEACHES.filter((b) =>
    ['punta-cana', 'bavaro', 'sosua', 'las-terrenas', 'bayahibe', 'cabarete'].includes(b.id),
  )
  return Promise.all(
    destinations.map(async (b) => {
      const [f, m] = await Promise.all([fetchForecast(b.lat, b.lon), fetchMarine(b.lat, b.lon)])
      const idx = currentHourIndex(f.hourly.time)
      const mIdx = currentHourIndex(m.hourly.time)
      const temp = f.current?.temperature_2m ?? f.hourly.temperature_2m[idx]
      const precip = f.hourly.precipitation[idx] ?? 0
      const uv = f.hourly.uv_index?.[idx] ?? 0
      const wind = f.current?.wind_speed_10m ?? f.hourly.wind_speed_10m[idx]
      const windDir = f.current?.wind_direction_10m ?? f.hourly.wind_direction_10m[idx]
      const wave = m.hourly.wave_height[mIdx] ?? 0
      const sargazo = sargassumIndex(new Date().getMonth() + 1, windDir, wind)
      const score = tourismScore({ tempC: temp, precipMm: precip, uv, sargazo, waveM: wave })
      const label =
        score >= 80 ? 'Excelente para visitar' : score >= 65 ? 'Bueno' : score >= 50 ? 'Aceptable' : 'Desfavorable'
      return { ...b, score, label, temp, sargazo }
    }),
  ).then((rows) => rows.sort((a, b) => b.score - a.score))
}

export function TourismPage() {
  const { data, error, loading, reload } = useAsyncData(loadTourism, [])

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Índice de turismo RD"
        description="Score 0–100 por destino combinando clima, UV, oleaje y presión de sargazo."
        sources={[{ name: 'Open-Meteo' }, { name: 'Heurística RDIntelligence' }]}
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <MapView
            className="h-[420px]"
            markers={data.map((d) => ({
              id: d.id,
              position: [d.lat, d.lon],
              label: `${d.name} ${Math.round(d.score)}/100`,
              detail: d.label,
              color: '#e9a825',
            }))}
          />
          <ul className="panel divide-y divide-rd-deep/5">
            {data.map((d) => (
              <li key={d.id} className="flex items-center justify-between px-4 py-4">
                <div>
                  <p className="font-display text-lg font-bold">{d.name}</p>
                  <p className="text-sm text-rd-slate">{d.label}</p>
                </div>
                <p className="font-display text-3xl font-bold text-rd-ocean">{Math.round(d.score)}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
