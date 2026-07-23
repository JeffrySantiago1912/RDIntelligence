import { useMemo } from 'react'
import { FLOOD_SECTORS } from '@/data/locations'
import { useAsyncData } from '@/shared/hooks/useAsyncData'
import {
  currentHourIndex,
  fetchForecast,
  maxNextHours,
  sumNextHours,
} from '@/shared/api/openMeteo'
import { SectionHeader } from '@/shared/components/SectionHeader'
import { MetricCard } from '@/shared/components/MetricCard'
import { MapView, type MapMarker } from '@/shared/components/MapView'
import { LoadingState, ErrorState, Disclaimer } from '@/shared/components/States'
import { clamp, floodRiskFromPrecip, formatNumber, riskLabel } from '@/shared/lib/utils'
import { TIPS } from '@/data/tips'

export function FloodsPage() {
  const { data, error, loading, reload } = useAsyncData(
    () => fetchForecast(18.4861, -69.9312),
    [],
  )

  const idx = data ? currentHourIndex(data.hourly.time) : 0
  const rain5 = data ? sumNextHours(data.hourly.precipitation, 5, idx) : 0
  const rainMax = data ? maxNextHours(data.hourly.precipitation, 5, idx) : 0
  const base = floodRiskFromPrecip(rain5, rainMax)

  const sectors = useMemo(
    () =>
      FLOOD_SECTORS.map((s) => ({
        ...s,
        risk: clamp(base * (0.7 + s.floodBias)),
      })).sort((a, b) => b.risk - a.risk),
    [base],
  )

  const markers: MapMarker[] = sectors.map((s) => ({
    id: s.id,
    position: [s.lat, s.lon],
    label: s.name,
    detail: `Riesgo ${Math.round(s.risk)} · ${riskLabel(s.risk)}`,
    color: s.risk >= 60 ? '#f07167' : s.risk >= 35 ? '#e9a825' : '#2ec4b6',
    radius: 8 + s.risk / 12,
  }))

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Predicción de inundaciones urbanas"
        description="Si llueve fuerte en las próximas 5 horas, ¿qué sectores concentran más riesgo? Modelo heurístico + precipitación Open-Meteo."
        sources={[
          { name: 'Open-Meteo', href: 'https://open-meteo.com/' },
          { name: 'OpenStreetMap', href: 'https://www.openstreetmap.org/' },
        ]}
      />

      <Disclaimer>
        No es un modelo hidrológico oficial (ONAMET/INDRHI/COE). Combina precipitación prevista con
        sesgo urbano por sector para demostración de producto. Ideal base para entrenar ML luego.
      </Disclaimer>

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              label="Lluvia próximas 5h (SD)"
              value={`${formatNumber(rain5)} mm`}
              tip={TIPS.rain5h}
            />
            <MetricCard
              label="Intensidad pico"
              value={`${formatNumber(rainMax)} mm/h`}
              tip="Milímetros de lluvia por hora en el momento más intenso. Si es alto, el agua puede acumularse más rápido de lo que drena la calle."
            />
            <MetricCard
              label="Escenario"
              value={riskLabel(base)}
              hint={`Base ${Math.round(base)}/100`}
              tip={TIPS.floodRisk}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <MapView center={[18.49, -69.94]} zoom={11} markers={markers} className="h-[420px]" />
            <div className="panel overflow-hidden">
              <div className="border-b border-rd-deep/10 px-4 py-3 font-display font-bold leading-snug">
                Calles / sectores probables
              </div>
              <ul className="divide-y divide-rd-deep/5">
                {sectors.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div>
                      <p className="font-medium text-rd-ink">{s.name}</p>
                      <p className="text-xs text-rd-slate">{s.city}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg font-bold">{Math.round(s.risk)}</p>
                      <p className="text-xs text-rd-slate">{riskLabel(s.risk)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
