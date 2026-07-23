import { useState } from 'react'
import { PROVINCES } from '@/data/locations'
import { useAsyncData } from '@/shared/hooks/useAsyncData'
import {
  currentHourIndex,
  fetchForecast,
  sumNextHours,
} from '@/shared/api/openMeteo'
import { SectionHeader } from '@/shared/components/SectionHeader'
import { MetricCard } from '@/shared/components/MetricCard'
import { RiskGauge } from '@/shared/components/RiskGauge'
import { LoadingState, ErrorState } from '@/shared/components/States'
import { clamp, formatNumber } from '@/shared/lib/utils'
import { TIPS } from '@/data/tips'

export function AgriculturePage() {
  const [provinceId, setProvinceId] = useState('santiago')
  const province = PROVINCES.find((p) => p.id === provinceId) ?? PROVINCES[1]
  const { data, error, loading, reload } = useAsyncData(
    () => fetchForecast(province.lat, province.lon),
    [province.lat, province.lon],
  )

  const idx = data ? currentHourIndex(data.hourly.time) : 0
  const soil = data?.hourly.soil_moisture_0_to_7cm?.[idx] ?? 0
  const soilTemp = data?.hourly.soil_temperature_0cm?.[idx] ?? 0
  const rain48 = data ? sumNextHours(data.hourly.precipitation, 48, idx) : 0
  const temp = data?.current?.temperature_2m ?? 0
  const drought = clamp(100 - soil * 250 - rain48 * 2)

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Guía agrícola"
        description="Humedad del suelo, temperatura y lluvia esperada para apoyar decisiones en el campo."
        sources={[
          { name: 'Open-Meteo soil layers', href: 'https://open-meteo.com/en/docs' },
          { name: 'NASA / FAO (próximamente)' },
        ]}
      />

      <select
        value={provinceId}
        onChange={(e) => setProvinceId(e.target.value)}
        className="rounded-xl border border-rd-deep/15 bg-white px-3 py-2 text-sm"
      >
        {PROVINCES.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Humedad suelo 0-7cm"
            value={formatNumber(soil, 3)}
            hint="m³/m³"
            tip={`${TIPS.soilMoisture} La unidad m³/m³ es el volumen de agua por volumen de suelo.`}
          />
          <MetricCard
            label="Temp. suelo"
            value={`${formatNumber(soilTemp)}°C`}
            tip={TIPS.soilTemp}
          />
          <MetricCard
            label="Lluvia 48h"
            value={`${formatNumber(rain48)} mm`}
            tip="Lluvia acumulada esperada en las próximas 48 horas. Ayuda a planificar riego."
          />
          <MetricCard label="Temp. aire" value={`${formatNumber(temp)}°C`} tip={TIPS.tempNow} />
          <RiskGauge
            score={drought}
            label="Probabilidad de sequía (est.)"
            tip={TIPS.drought}
            className="sm:col-span-2"
          />
        </div>
      ) : null}
    </div>
  )
}
