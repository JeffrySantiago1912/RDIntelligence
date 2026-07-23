import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PROVINCES } from '@/data/locations'
import { useAsyncData } from '@/shared/hooks/useAsyncData'
import { currentHourIndex, fetchAirQuality } from '@/shared/api/openMeteo'
import { SectionHeader } from '@/shared/components/SectionHeader'
import { MetricCard } from '@/shared/components/MetricCard'
import { RiskGauge } from '@/shared/components/RiskGauge'
import { LoadingState, ErrorState } from '@/shared/components/States'
import { clamp, formatNumber } from '@/shared/lib/utils'
import { TIPS } from '@/data/tips'

export function RespiratoryPage() {
  const [provinceId, setProvinceId] = useState(PROVINCES[0].id)
  const province = PROVINCES.find((p) => p.id === provinceId) ?? PROVINCES[0]
  const { data, error, loading, reload } = useAsyncData(
    () => fetchAirQuality(province.lat, province.lon),
    [province.lat, province.lon],
  )

  const idx = data ? currentHourIndex(data.hourly.time) : 0
  const dust = data?.current?.dust ?? data?.hourly.dust[idx] ?? 0
  const pm10 = data?.current?.pm10 ?? data?.hourly.pm10[idx] ?? 0
  const pm25 = data?.current?.pm2_5 ?? data?.hourly.pm2_5[idx] ?? 0
  const aqi = data?.current?.european_aqi ?? data?.hourly.european_aqi?.[idx] ?? 0
  const alert = clamp(dust * 2.2 + pm10 * 0.7 + pm25)

  const chart =
    data?.hourly.time.slice(idx, idx + 24).map((t, i) => ({
      hora: t.slice(11, 16),
      polvo: data.hourly.dust[idx + i],
      pm10: data.hourly.pm10[idx + i],
    })) ?? []

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Alertas respiratorias"
        description="Polvo (posible Sahara), PM10 y PM2.5 para anticipar molestias respiratorias."
        sources={[
          {
            name: 'Open-Meteo Air Quality',
            href: 'https://open-meteo.com/en/docs/air-quality-api',
          },
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
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Polvo" value={formatNumber(dust)} hint="µg/m³" tip={TIPS.dust} />
            <MetricCard label="PM10" value={formatNumber(pm10)} hint="µg/m³" tip={TIPS.pm10} />
            <MetricCard label="PM2.5" value={formatNumber(pm25)} hint="µg/m³" tip={TIPS.pm25} />
            <MetricCard label="AQI europeo" value={formatNumber(aqi, 0)} tip={TIPS.aqi} />
            <RiskGauge
              score={alert}
              label="Nivel de alerta respiratoria"
              tip={TIPS.respiratoryAlert}
              className="sm:col-span-2"
            />
          </div>
          <div className="panel p-4">
            <h2 className="mb-3 font-display text-lg font-bold">Próximas 24 h</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d5e3e0" />
                  <XAxis dataKey="hora" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="polvo" name="Polvo" stroke="#a16207" fill="#a1620733" />
                  <Area type="monotone" dataKey="pm10" name="PM10" stroke="#0b3d4a" fill="#2ec4b633" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
