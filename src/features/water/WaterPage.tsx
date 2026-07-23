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
import { LoadingState, ErrorState, Disclaimer } from '@/shared/components/States'
import { clamp, formatNumber } from '@/shared/lib/utils'
import { TIPS } from '@/data/tips'

export function WaterPage() {
  const [provinceId, setProvinceId] = useState(PROVINCES[0].id)
  const province = PROVINCES.find((p) => p.id === provinceId) ?? PROVINCES[0]
  const { data, error, loading, reload } = useAsyncData(
    () => fetchForecast(province.lat, province.lon),
    [province.lat, province.lon],
  )
  const idx = data ? currentHourIndex(data.hourly.time) : 0
  const rain7 = data ? sumNextHours(data.hourly.precipitation, 24 * 7, idx) : 0
  const soil = data?.hourly.soil_moisture_0_to_7cm?.[idx] ?? 0
  const drought = clamp(100 - rain7 * 1.2 - soil * 200)
  const supplyStress = clamp(drought * 0.7 + (100 - (data?.current?.relative_humidity_2m ?? 60)) * 0.3)

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Agua potable y sequía"
        description="Balance hídrico estimado por provincia. Base para mapear interrupciones cuando exista feed INAPA/CAASD."
        sources={[
          { name: 'Open-Meteo', href: 'https://open-meteo.com/' },
          { name: 'INDRHI / INAPA (roadmap)' },
        ]}
      />
      <Disclaimer>
        No hay API abierta nacional de cortes de agua o presión por sector. Se muestra estrés hídrico
        meteorológico como proxy.
      </Disclaimer>

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
          <MetricCard label="Lluvia 7 días" value={`${formatNumber(rain7)} mm`} tip={TIPS.rain7d} />
          <MetricCard
            label="Humedad suelo"
            value={formatNumber(soil, 3)}
            tip={TIPS.soilMoisture}
          />
          <RiskGauge score={drought} label="Estrés de sequía" tip={TIPS.drought} />
          <RiskGauge
            score={supplyStress}
            label="Estrés de suministro (proxy)"
            tip={TIPS.waterStress}
          />
        </div>
      ) : null}
    </div>
  )
}
