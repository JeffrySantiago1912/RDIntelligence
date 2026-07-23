import { useState } from 'react'
import { BEACHES } from '@/data/locations'
import { useAsyncData } from '@/shared/hooks/useAsyncData'
import { currentHourIndex, fetchForecast, fetchMarine } from '@/shared/api/openMeteo'
import { SectionHeader } from '@/shared/components/SectionHeader'
import { MetricCard } from '@/shared/components/MetricCard'
import { LoadingState, ErrorState } from '@/shared/components/States'
import { clamp, formatNumber } from '@/shared/lib/utils'
import { TIPS } from '@/data/tips'

async function loadFishing(lat: number, lon: number) {
  const [f, m] = await Promise.all([fetchForecast(lat, lon), fetchMarine(lat, lon)])
  const idx = currentHourIndex(f.hourly.time)
  const mIdx = currentHourIndex(m.hourly.time)
  const wave = m.hourly.wave_height[mIdx] ?? 0
  const wind = f.current?.wind_speed_10m ?? f.hourly.wind_speed_10m[idx]
  const period = m.hourly.wave_period?.[mIdx] ?? 0
  const safety = clamp(100 - wave * 28 - Math.max(0, wind - 20) * 1.5)
  const fishingScore = clamp(55 + (period > 6 ? 15 : 0) - wave * 20 - Math.max(0, wind - 18))
  const window =
    safety >= 70 ? 'Buenas condiciones · ventana abierta' : safety >= 45 ? 'Precaución · costeable' : 'No recomendado'
  return { wave, wind, period, safety, fishingScore, window }
}

export function FishingPage() {
  const [beachId, setBeachId] = useState('las-terrenas')
  const beach = BEACHES.find((b) => b.id === beachId) ?? BEACHES[0]
  const { data, error, loading, reload } = useAsyncData(
    () => loadFishing(beach.lat, beach.lon),
    [beach.lat, beach.lon],
  )

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Sistema para pescadores"
        description="Oleaje, viento y score operativo para salir a faenar con mayor seguridad."
        sources={[
          { name: 'Open-Meteo Marine', href: 'https://open-meteo.com/en/docs/marine-weather-api' },
        ]}
      />

      <select
        value={beachId}
        onChange={(e) => setBeachId(e.target.value)}
        className="rounded-xl border border-rd-deep/15 bg-white px-3 py-2 text-sm"
      >
        {BEACHES.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Oleaje" value={`${formatNumber(data.wave)} m`} tip={TIPS.wave} />
          <MetricCard label="Viento" value={`${formatNumber(data.wind)} km/h`} tip={TIPS.wind} />
          <MetricCard
            label="Periodo"
            value={`${formatNumber(data.period, 0)} s`}
            tip="Segundos entre una ola y la siguiente. Periodos más largos suelen indicar oleaje de fondo (swell)."
          />
          <MetricCard
            label="Seguridad"
            value={Math.round(data.safety)}
            hint="/100"
            tip={TIPS.fishingSafety}
          />
          <MetricCard
            label="Score pesca"
            value={Math.round(data.fishingScore)}
            hint="Heurística"
            tip={TIPS.fishingScore}
          />
          <MetricCard
            label="Recomendación"
            value={data.window}
            tip="Consejo práctico según seguridad y condiciones del mar para salir o no a faenar."
          />
        </div>
      ) : null}
    </div>
  )
}
