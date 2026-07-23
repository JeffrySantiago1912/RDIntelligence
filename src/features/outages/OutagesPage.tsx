import { OUTAGE_SECTORS } from '@/data/locations'
import { useAsyncData } from '@/shared/hooks/useAsyncData'
import {
  currentHourIndex,
  fetchForecast,
  maxNextHours,
  sumNextHours,
} from '@/shared/api/openMeteo'
import { SectionHeader } from '@/shared/components/SectionHeader'
import { MapView } from '@/shared/components/MapView'
import { LoadingState, ErrorState, Disclaimer } from '@/shared/components/States'
import { outageRisk, riskLabel } from '@/shared/lib/utils'

async function loadOutages() {
  return Promise.all(
    OUTAGE_SECTORS.map(async (s) => {
      const f = await fetchForecast(s.lat, s.lon)
      const idx = currentHourIndex(f.hourly.time)
      const precip = sumNextHours(f.hourly.precipitation, 6, idx)
      const wind = maxNextHours(f.hourly.wind_speed_10m, 6, idx)
      const codes = f.hourly.weather_code.slice(idx, idx + 6)
      const thunder = codes.filter((c) => c >= 95).length * 20
      const risk = outageRisk(precip, wind, thunder)
      return { ...s, risk, precip, wind }
    }),
  ).then((rows) => rows.sort((a, b) => b.risk - a.risk))
}

export function OutagesPage() {
  const { data, error, loading, reload } = useAsyncData(loadOutages, [])

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Riesgo de apagones"
        description="Probabilidad relativa por sector ante lluvia, viento y tormentas previstas."
        sources={[{ name: 'Open-Meteo', href: 'https://open-meteo.com/' }]}
      />
      <Disclaimer>
        EDESur / EDEEste / EDENorte no publican una API abierta de interrupciones. Este módulo es una
        heurística climática para portafolio — no reporta apagones reales.
      </Disclaimer>

      {loading ? <LoadingState label="Calculando riesgo por sector…" /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <MapView
            className="h-[420px]"
            markers={data.map((s) => ({
              id: s.id,
              position: [s.lat, s.lon],
              label: s.name,
              detail: `${Math.round(s.risk)} · ${riskLabel(s.risk)}`,
              color: s.risk >= 60 ? '#f07167' : '#e9a825',
            }))}
          />
          <ul className="panel divide-y divide-rd-deep/5">
            {data.map((s) => (
              <li key={s.id} className="flex justify-between px-4 py-3">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-rd-slate">
                    Lluvia 6h {s.precip.toFixed(1)} mm · viento máx {s.wind.toFixed(0)} km/h
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-bold">{Math.round(s.risk)}</p>
                  <p className="text-xs text-rd-slate">{riskLabel(s.risk)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
