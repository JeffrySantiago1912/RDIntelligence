import { useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PROVINCES } from '@/data/locations'
import { useAsyncData } from '@/shared/hooks/useAsyncData'
import {
  currentHourIndex,
  fetchForecast,
  fetchRainOutlook,
  weatherCodeLabel,
} from '@/shared/api/openMeteo'
import { SectionHeader } from '@/shared/components/SectionHeader'
import { MetricCard } from '@/shared/components/MetricCard'
import { LoadingState, ErrorState } from '@/shared/components/States'
import { WeatherIcon, weatherVisual, rainAmountVisual } from '@/shared/components/WeatherIcon'
import { formatNumber } from '@/shared/lib/utils'
import { TIPS } from '@/data/tips'

function rainBarColor(kind: string) {
  if (kind === 'pasado') return '#94a3b8'
  if (kind === 'hoy') return '#0b3d4a'
  return '#2ec4b6'
}

export function ClimatePage() {
  const [provinceId, setProvinceId] = useState(PROVINCES[0].id)
  const province = PROVINCES.find((p) => p.id === provinceId) ?? PROVINCES[0]

  const forecast = useAsyncData(() => fetchForecast(province.lat, province.lon), [
    province.lat,
    province.lon,
  ])
  const rain = useAsyncData(() => fetchRainOutlook(province.lat, province.lon, 7, 7), [
    province.lat,
    province.lon,
  ])

  const data = forecast.data
  const idx = data ? currentHourIndex(data.hourly.time) : 0
  const chart =
    data?.hourly.time.slice(idx, idx + 24).map((t, i) => ({
      hora: t.slice(11, 16),
      temp: data.hourly.temperature_2m[idx + i],
      lluvia: data.hourly.precipitation[idx + i],
    })) ?? []

  const loading = forecast.loading || rain.loading
  const error = forecast.error || rain.error
  const reload = () => {
    forecast.reload()
    rain.reload()
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Clima y lluvia"
        description="Condiciones actuales, últimas 24 horas y pronóstico de lluvia: cómo estuvo y cómo se espera."
        sources={[{ name: 'Open-Meteo', href: 'https://open-meteo.com/en/docs' }]}
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
          <div className="panel flex flex-wrap items-center gap-4 p-5">
            <WeatherIcon code={data.current?.weather_code ?? 0} size="lg" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-rd-slate">
                Condición ahora
              </p>
              <p className="font-display text-2xl font-bold leading-snug text-rd-ink">
                {weatherVisual(data.current?.weather_code ?? 0).label}
              </p>
              <p className="text-sm text-rd-slate">
                {formatNumber(data.current?.temperature_2m ?? 0)}°C ·{' '}
                {weatherCodeLabel(data.current?.weather_code ?? 0)}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Temperatura"
              value={`${formatNumber(data.current?.temperature_2m ?? 0)}°C`}
              hint={weatherVisual(data.current?.weather_code ?? 0).label}
              tip={`${TIPS.tempNow} Condición mostrada abajo: ${TIPS.weatherCondition}`}
            />
            <MetricCard
              label="Humedad"
              value={`${formatNumber(data.current?.relative_humidity_2m ?? 0, 0)}%`}
              tip={TIPS.humidity}
            />
            <MetricCard
              label="Viento"
              value={`${formatNumber(data.current?.wind_speed_10m ?? 0)} km/h`}
              tip={TIPS.wind}
            />
            <MetricCard
              label="Lluvia actual"
              value={`${formatNumber(data.current?.precipitation ?? 0)} mm`}
              tip={TIPS.rainNow}
            />
          </div>

          {rain.data ? (
            <section className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard
                  label="Lluvia últimos 7 días"
                  value={`${formatNumber(rain.data.pastTotalMm)} mm`}
                  hint="Suma de los días ya pasados"
                  tip="Cuánta lluvia cayó en total en los 7 días anteriores a hoy en esta provincia."
                />
                <MetricCard
                  label="Lluvia próximos 7 días"
                  value={`${formatNumber(rain.data.nextTotalMm)} mm`}
                  hint="Hoy + pronóstico"
                  tip="Cuánta lluvia se espera en total desde hoy hasta dentro de una semana (pronóstico)."
                />
              </div>

              <div className="panel p-4">
                <h2 className="mb-1 font-display text-lg font-bold leading-snug">
                  Día a día (con icono)
                </h2>
                <p className="mb-4 text-sm text-rd-slate">
                  Soleado, nublado o lluvia según el pronóstico de cada día.
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                  {rain.data.days.map((d) => (
                    <div
                      key={d.date}
                      className="flex flex-col items-center rounded-xl border border-rd-deep/10 bg-white/80 px-2 py-3 text-center"
                    >
                      <p className="text-[11px] font-medium uppercase tracking-wide text-rd-slate">
                        {d.label}
                        {d.kind === 'hoy' ? ' · Hoy' : ''}
                      </p>
                      <WeatherIcon
                        code={d.weatherCode}
                        mm={d.mm}
                        size="sm"
                        className="mt-2"
                      />
                      <p className="mt-2 font-display text-sm font-bold leading-snug">
                        {formatNumber(d.mm)} mm
                      </p>
                      <p className="mt-0.5 text-[11px] text-rd-slate">
                        {d.weatherCode != null
                          ? weatherVisual(d.weatherCode).label
                          : rainAmountVisual(d.mm).label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel p-4">
                <h2 className="mb-1 font-display text-lg font-bold leading-snug">
                  Pronóstico de lluvia (14 días)
                </h2>
                <p className="mb-4 text-sm text-rd-slate">
                  Gris = días pasados · Azul oscuro = hoy · Verde = próximos días. Valores en mm.
                </p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rain.data.days}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d5e3e0" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} unit=" mm" width={48} />
                      <Tooltip
                        formatter={(value) => [`${formatNumber(Number(value))} mm`, 'Lluvia']}
                        labelFormatter={(_, payload) => {
                          const row = payload?.[0]?.payload as
                            | {
                                date?: string
                                kind?: string
                                probability?: number | null
                                weatherCode?: number | null
                                mm?: number
                              }
                            | undefined
                          if (!row?.date) return ''
                          const kindLabel =
                            row.kind === 'pasado'
                              ? 'Pasado'
                              : row.kind === 'hoy'
                                ? 'Hoy'
                                : 'Pronóstico'
                          const visual =
                            row.weatherCode != null
                              ? weatherVisual(row.weatherCode).label
                              : ''
                          const prob =
                            row.probability != null ? ` · Prob. ${row.probability}%` : ''
                          return `${row.date} · ${kindLabel}${visual ? ` · ${visual}` : ''}${prob}`
                        }}
                      />
                      <Bar dataKey="mm" name="Lluvia mm" radius={[6, 6, 0, 0]}>
                        {rain.data.days.map((d) => (
                          <Cell key={d.date} fill={rainBarColor(d.kind)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          ) : null}

          <div className="panel p-4">
            <h2 className="mb-3 font-display text-lg font-bold leading-snug">Próximas 24 horas</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart}>
                  <defs>
                    <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2ec4b6" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#2ec4b6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d5e3e0" />
                  <XAxis dataKey="hora" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="temp"
                    name="Temp °C"
                    stroke="#0b3d4a"
                    fill="url(#tempFill)"
                  />
                  <Area
                    type="monotone"
                    dataKey="lluvia"
                    name="Lluvia mm"
                    stroke="#f07167"
                    fill="#f0716722"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.daily?.time.slice(0, 4).map((day, i) => (
              <div key={day} className="panel p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs uppercase tracking-wider text-rd-slate">{day}</p>
                  <WeatherIcon
                    code={data.daily!.weather_code?.[i]}
                    mm={data.daily!.precipitation_sum[i]}
                    size="sm"
                  />
                </div>
                <p className="mt-2 font-display text-xl font-bold leading-snug">
                  {formatNumber(data.daily!.temperature_2m_max[i])}° /{' '}
                  {formatNumber(data.daily!.temperature_2m_min[i])}°
                </p>
                <p className="text-sm text-rd-slate">
                  {weatherVisual(data.daily!.weather_code?.[i] ?? 0).label} · Lluvia{' '}
                  {formatNumber(data.daily!.precipitation_sum[i])} mm
                </p>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
