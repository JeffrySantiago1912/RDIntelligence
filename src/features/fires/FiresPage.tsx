import { PROVINCES } from '@/data/locations'
import { useAsyncData } from '@/shared/hooks/useAsyncData'
import {
  currentHourIndex,
  fetchForecast,
  sumNextHours,
} from '@/shared/api/openMeteo'
import { SectionHeader } from '@/shared/components/SectionHeader'
import { MapView } from '@/shared/components/MapView'
import { LoadingState, ErrorState, Disclaimer } from '@/shared/components/States'
import { fireRisk, riskLabel } from '@/shared/lib/utils'

async function loadFires() {
  const rows = await Promise.all(
    PROVINCES.map(async (p) => {
      const f = await fetchForecast(p.lat, p.lon)
      const idx = currentHourIndex(f.hourly.time)
      const temp = f.current?.temperature_2m ?? f.hourly.temperature_2m[idx]
      const hum = f.current?.relative_humidity_2m ?? f.hourly.relative_humidity_2m[idx]
      const wind = f.current?.wind_speed_10m ?? f.hourly.wind_speed_10m[idx]
      const rain = sumNextHours(f.hourly.precipitation, 24, idx)
      const risk = fireRisk(temp, hum, wind, rain)
      return { ...p, risk, temp, hum, wind }
    }),
  )
  return rows.sort((a, b) => b.risk - a.risk)
}

export function FiresPage() {
  const { data, error, loading, reload } = useAsyncData(loadFires, [])

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Riesgo de incendios forestales"
        description="Índice por provincia con temperatura, humedad, viento y lluvia esperada."
        sources={[
          { name: 'Open-Meteo', href: 'https://open-meteo.com/' },
          { name: 'NASA FIRMS (opcional)', href: 'https://firms.modaps.eosdis.nasa.gov/api/' },
        ]}
      />
      <Disclaimer>
        NASA FIRMS requiere MAP_KEY gratuita. En esta versión el riesgo se estima con meteorología.
        Puedes añadir tu key después para hotspots satelitales reales.
      </Disclaimer>

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <MapView
            className="h-[420px]"
            markers={data.map((p) => ({
              id: p.id,
              position: [p.lat, p.lon],
              label: p.name,
              detail: `${Math.round(p.risk)} · ${riskLabel(p.risk)}`,
              color: p.risk >= 60 ? '#f07167' : '#e9a825',
            }))}
          />
          <ul className="panel divide-y divide-rd-deep/5">
            {data.map((p) => (
              <li key={p.id} className="flex justify-between px-4 py-3">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-rd-slate">
                    {p.temp.toFixed(0)}°C · humedad {p.hum.toFixed(0)}% · viento{' '}
                    {p.wind.toFixed(0)} km/h
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-bold">{Math.round(p.risk)}</p>
                  <p className="text-xs text-rd-slate">{riskLabel(p.risk)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
