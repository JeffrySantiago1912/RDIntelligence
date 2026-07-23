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
import { dengueRisk, riskLabel } from '@/shared/lib/utils'

async function loadDengue() {
  const rows = await Promise.all(
    PROVINCES.map(async (p) => {
      const f = await fetchForecast(p.lat, p.lon)
      const idx = currentHourIndex(f.hourly.time)
      const temp = f.current?.temperature_2m ?? f.hourly.temperature_2m[idx]
      const hum = f.current?.relative_humidity_2m ?? f.hourly.relative_humidity_2m[idx]
      const rain = sumNextHours(f.hourly.precipitation, 72, idx)
      const risk = dengueRisk(temp, hum, rain / 3)
      return { ...p, risk, temp, hum, rain }
    }),
  )
  return rows.sort((a, b) => b.risk - a.risk)
}

export function DenguePage() {
  const { data, error, loading, reload } = useAsyncData(loadDengue, [])

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Riesgo de dengue"
        description="Condiciones climáticas favorables al mosquito Aedes (temperatura, humedad y lluvia)."
        sources={[
          { name: 'Open-Meteo', href: 'https://open-meteo.com/' },
          { name: 'Modelo heurístico (no oficial MSP)' },
        ]}
      />
      <Disclaimer>
        No sustituye boletines de Salud Pública. Es un índice ambiental para anticipar vigilancia.
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
              color: p.risk >= 60 ? '#c026d3' : '#f07167',
            }))}
          />
          <ul className="panel divide-y divide-rd-deep/5">
            {data.map((p) => (
              <li key={p.id} className="flex justify-between px-4 py-3">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-rd-slate">
                    {p.temp.toFixed(0)}°C · {p.hum.toFixed(0)}% · lluvia 72h {p.rain.toFixed(1)} mm
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
