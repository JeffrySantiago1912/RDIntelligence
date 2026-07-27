import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  CloudRain,
  Droplets,
  MapPin,
  Thermometer,
  Umbrella,
  Wind,
} from 'lucide-react'
import { PROVINCES } from '@/data/locations'
import { useAsyncData } from '@/shared/hooks/useAsyncData'
import {
  currentHourIndex,
  fetchForecast,
  fetchRainOutlook,
  maxNextHours,
  sumNextHours,
} from '@/shared/api/openMeteo'
import { SectionHeader } from '@/shared/components/SectionHeader'
import { LoadingState, ErrorState } from '@/shared/components/States'
import { WeatherIcon, weatherVisual } from '@/shared/components/WeatherIcon'
import { cn, formatNumber } from '@/shared/lib/utils'

function rainBarColor(kind: string) {
  if (kind === 'pasado') return '#94a3b8'
  if (kind === 'hoy') return '#0b3d4a'
  return '#2ec4b6'
}

function weekdayLabel(isoDate: string, kind?: string) {
  if (kind === 'hoy') return 'Hoy'
  const d = new Date(`${isoDate}T12:00:00`)
  const name = new Intl.DateTimeFormat('es-DO', { weekday: 'short' }).format(d)
  return name.replace('.', '')
}

function shortDate(isoDate: string) {
  const [, m, day] = isoDate.split('-')
  return `${day}/${m}`
}

function citizenTips(opts: {
  temp: number
  humidity: number
  wind: number
  rainNow: number
  rainNext5: number
  rainMax: number
  code: number
}) {
  const tips: { icon: 'umbrella' | 'thermo' | 'wind' | 'drop'; text: string }[] = []
  const label = weatherVisual(opts.code).label

  if (opts.rainNow >= 0.5 || opts.rainNext5 >= 3 || opts.rainMax >= 2) {
    tips.push({ icon: 'umbrella', text: 'Lleva paraguas o impermeable: hay lluvia ahora o en las próximas horas.' })
  } else if (opts.rainNext5 < 1) {
    tips.push({ icon: 'umbrella', text: 'Poca lluvia esperada en las próximas horas.' })
  }

  if (opts.temp >= 32) {
    tips.push({ icon: 'thermo', text: 'Hace calor: hidrátate y busca sombra al mediodía.' })
  } else if (opts.temp <= 22) {
    tips.push({ icon: 'thermo', text: 'Temperatura fresca para RD: una chaqueta ligera puede ayudar.' })
  } else {
    tips.push({ icon: 'thermo', text: `Temperatura agradable · ${label.toLowerCase()}.` })
  }

  if (opts.humidity >= 80) {
    tips.push({ icon: 'drop', text: 'Humedad alta: el calor se siente más sofocante.' })
  }
  if (opts.wind >= 35) {
    tips.push({ icon: 'wind', text: 'Viento fuerte: cuidado con objetos sueltos y conducción.' })
  }

  return tips.slice(0, 3)
}

function tipIcon(kind: 'umbrella' | 'thermo' | 'wind' | 'drop') {
  if (kind === 'umbrella') return Umbrella
  if (kind === 'thermo') return Thermometer
  if (kind === 'wind') return Wind
  return Droplets
}

export function ClimatePage() {
  const [provinceId, setProvinceId] = useState(PROVINCES[0].id)
  const [selectedDay, setSelectedDay] = useState(0)
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

  const hourStrip = useMemo(() => {
    if (!data) return []
    return data.hourly.time.slice(idx, idx + 24).map((t, i) => {
      const iAbs = idx + i
      return {
        key: t,
        hora: t.slice(11, 16),
        temp: data.hourly.temperature_2m[iAbs],
        lluvia: data.hourly.precipitation[iAbs],
        code: data.hourly.weather_code[iAbs] ?? 0,
        prob: data.hourly.precipitation_probability?.[iAbs] ?? null,
      }
    })
  }, [data, idx])

  const weekDays = useMemo(() => {
    if (!data?.daily) return []
    return data.daily.time.map((day, i) => ({
      date: day,
      max: data.daily!.temperature_2m_max[i],
      min: data.daily!.temperature_2m_min[i],
      rain: data.daily!.precipitation_sum[i],
      prob: data.daily!.precipitation_probability_max?.[i] ?? null,
      code: data.daily!.weather_code?.[i] ?? 0,
      uv: data.daily!.uv_index_max?.[i] ?? null,
      wind: data.daily!.wind_speed_10m_max[i],
    }))
  }, [data])

  const loading = forecast.loading || rain.loading
  const error = forecast.error || rain.error
  const reload = () => {
    forecast.reload()
    rain.reload()
  }

  const temp = data?.current?.temperature_2m ?? 0
  const humidity = data?.current?.relative_humidity_2m ?? 0
  const wind = data?.current?.wind_speed_10m ?? 0
  const rainNow = data?.current?.precipitation ?? 0
  const code = data?.current?.weather_code ?? 0
  const rainNext5 = data ? sumNextHours(data.hourly.precipitation, 5, idx) : 0
  const rainMax = data ? maxNextHours(data.hourly.precipitation, 5, idx) : 0
  const tips = data
    ? citizenTips({ temp, humidity, wind, rainNow, rainNext5, rainMax, code })
    : []
  const visual = weatherVisual(code)
  const selected = weekDays[selectedDay] ?? weekDays[0]
  const todayRain = rain.data?.days.find((d) => d.kind === 'hoy')

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Clima y lluvia"
        description="Lo esencial para tu día: cómo está ahora, si debes llevar paraguas y el resumen de la semana — en lenguaje claro."
        sources={[{ name: 'Open-Meteo', href: 'https://open-meteo.com/en/docs' }]}
      />

      <label className="flex flex-wrap items-center gap-2 text-sm">
        <MapPin className="h-4 w-4 text-rd-ocean" />
        <span className="font-medium text-rd-slate">Tu provincia</span>
        <select
          value={provinceId}
          onChange={(e) => {
            setProvinceId(e.target.value)
            setSelectedDay(0)
          }}
          className="rounded-xl border border-rd-deep/15 bg-white px-3 py-2 text-sm font-medium text-rd-ink"
        >
          {PROVINCES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      {loading ? <LoadingState label="Actualizando el clima…" /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {data ? (
        <>
          {/* Hero ahora */}
          <section className="relative overflow-hidden rounded-[1.75rem] border border-rd-deep/10 bg-[linear-gradient(135deg,#0b3d4a_0%,#137a8a_55%,#1aa6a0_100%)] px-5 py-6 text-white shadow-[0_20px_50px_rgb(11_61_74_/_0.22)] sm:px-8 sm:py-8">
            <div className="pointer-events-none absolute -right-8 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-rd-coral/20 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 sm:gap-5">
                <WeatherIcon code={code} size="lg" className="[&>span]:bg-white/15 [&>span]:text-white [&>span]:ring-white/30" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                    Ahora en {province.name}
                  </p>
                  <p className="mt-1 font-display text-5xl font-bold leading-none tracking-tight sm:text-6xl">
                    {formatNumber(temp, 0)}°
                  </p>
                  <p className="mt-2 text-lg font-medium text-white/90">{visual.label}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:min-w-[280px]">
                <div className="rounded-2xl bg-white/10 px-3 py-3 text-center backdrop-blur-sm">
                  <Droplets className="mx-auto h-4 w-4 text-white/80" />
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-white/65">Humedad</p>
                  <p className="font-display text-lg font-bold">{formatNumber(humidity, 0)}%</p>
                </div>
                <div className="rounded-2xl bg-white/10 px-3 py-3 text-center backdrop-blur-sm">
                  <Wind className="mx-auto h-4 w-4 text-white/80" />
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-white/65">Viento</p>
                  <p className="font-display text-lg font-bold">{formatNumber(wind, 0)}</p>
                  <p className="text-[10px] text-white/60">km/h</p>
                </div>
                <div className="rounded-2xl bg-white/10 px-3 py-3 text-center backdrop-blur-sm">
                  <CloudRain className="mx-auto h-4 w-4 text-white/80" />
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-white/65">Lluvia</p>
                  <p className="font-display text-lg font-bold">{formatNumber(rainNow, 1)}</p>
                  <p className="text-[10px] text-white/60">mm</p>
                </div>
              </div>
            </div>

            <div className="relative mt-6 grid gap-2 sm:grid-cols-3">
              {tips.map((t) => {
                const Icon = tipIcon(t.icon)
                return (
                  <div
                    key={t.text}
                    className="flex items-start gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white/95 backdrop-blur-sm"
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-rd-teal" />
                    <span>{t.text}</span>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Próximas horas - scroll horizontal ciudadano */}
          <section className="panel p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="font-display text-xl font-bold text-rd-ink">Próximas horas</h2>
                <p className="text-sm text-rd-slate">Desliza para ver temperatura y lluvia hora por hora.</p>
              </div>
              <p className="text-xs font-medium text-rd-ocean">
                Próx. 5 h: {formatNumber(rainNext5)} mm lluvia
              </p>
            </div>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
              {hourStrip.filter((_, i) => i % 2 === 0).map((h, i) => {
                const rainy = h.lluvia >= 0.4
                return (
                  <div
                    key={h.key}
                    className={cn(
                      'w-[76px] shrink-0 rounded-2xl border px-2 py-3 text-center',
                      i === 0
                        ? 'border-rd-ocean/30 bg-rd-mist'
                        : rainy
                          ? 'border-sky-200 bg-sky-50/80'
                          : 'border-rd-deep/10 bg-white/80',
                    )}
                  >
                    <p className="text-[11px] font-semibold text-rd-slate">
                      {i === 0 ? 'Ahora' : h.hora}
                    </p>
                    <div className="mt-2 flex justify-center">
                      <WeatherIcon code={h.code} mm={h.lluvia} size="sm" />
                    </div>
                    <p className="mt-2 font-display text-lg font-bold leading-none text-rd-ink">
                      {formatNumber(h.temp, 0)}°
                    </p>
                    <p className={cn('mt-1 text-[11px]', rainy ? 'font-semibold text-sky-700' : 'text-rd-slate')}>
                      {rainy ? `${formatNumber(h.lluvia)} mm` : 'seco'}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Semana */}
          <section className="space-y-3">
            <div>
              <h2 className="font-display text-xl font-bold text-rd-ink">Esta semana</h2>
              <p className="text-sm text-rd-slate">Toca un día para ver el detalle. Máx / mín y lluvia del día.</p>
            </div>
            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
              {weekDays.map((d, i) => {
                const active = selectedDay === i
                const rainy = d.rain >= 1
                return (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => setSelectedDay(i)}
                    className={cn(
                      'w-[108px] shrink-0 rounded-2xl border px-3 py-3 text-left transition',
                      active
                        ? 'border-rd-ocean bg-rd-ocean text-white shadow-md'
                        : 'border-rd-deep/10 bg-white/80 hover:border-rd-teal',
                    )}
                  >
                    <p className={cn('text-xs font-semibold uppercase', active ? 'text-white/75' : 'text-rd-slate')}>
                      {weekdayLabel(d.date, i === 0 ? 'hoy' : undefined)}
                    </p>
                    <p className={cn('text-[11px]', active ? 'text-white/60' : 'text-rd-slate')}>
                      {shortDate(d.date)}
                    </p>
                    <div className="mt-2 flex justify-center">
                      <WeatherIcon
                        code={d.code}
                        mm={d.rain}
                        size="sm"
                        className={active ? '[&>span]:bg-white/15 [&>span]:text-white [&>span]:ring-white/25' : undefined}
                      />
                    </div>
                    <p className="mt-2 text-center font-display text-base font-bold leading-snug">
                      {formatNumber(d.max, 0)}°{' '}
                      <span className={active ? 'text-white/70' : 'text-rd-slate'}>
                        / {formatNumber(d.min, 0)}°
                      </span>
                    </p>
                    <p className={cn('mt-1 text-center text-[11px]', active ? 'text-white/80' : rainy ? 'text-sky-700' : 'text-rd-slate')}>
                      {rainy ? `${formatNumber(d.rain, 1)} mm` : 'Sin lluvia'}
                    </p>
                  </button>
                )
              })}
            </div>

            {selected ? (
              <div className="panel grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-rd-slate">Día seleccionado</p>
                  <p className="mt-1 font-display text-xl font-bold text-rd-ink">
                    {weekdayLabel(selected.date, selectedDay === 0 ? 'hoy' : undefined)} ·{' '}
                    {shortDate(selected.date)}
                  </p>
                  <p className="mt-1 text-sm text-rd-slate">{weatherVisual(selected.code).label}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-rd-slate">Temperatura</p>
                  <p className="font-display text-2xl font-bold text-rd-ink">
                    {formatNumber(selected.max, 0)}° / {formatNumber(selected.min, 0)}°
                  </p>
                  <p className="text-xs text-rd-slate">máx / mín</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-rd-slate">Lluvia del día</p>
                  <p className="font-display text-2xl font-bold text-rd-ink">
                    {formatNumber(selected.rain, 1)} mm
                  </p>
                  <p className="text-xs text-rd-slate">
                    {selected.prob != null ? `Prob. hasta ${selected.prob}%` : 'Según pronóstico'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-rd-slate">Viento máx.</p>
                  <p className="font-display text-2xl font-bold text-rd-ink">
                    {formatNumber(selected.wind, 0)} km/h
                  </p>
                  <p className="text-xs text-rd-slate">
                    {selected.uv != null ? `UV máx. ${formatNumber(selected.uv, 0)}` : '—'}
                  </p>
                </div>
              </div>
            ) : null}
          </section>

          {/* Lluvia simple */}
          {rain.data ? (
            <section className="space-y-4">
              <div>
                <h2 className="font-display text-xl font-bold text-rd-ink">Lluvia: reciente y próxima</h2>
                <p className="text-sm text-rd-slate">
                  Resumen fácil: cuánto cayó y cuánto se espera. Hoy:{' '}
                  {todayRain ? `${formatNumber(todayRain.mm)} mm` : '—'}.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-rd-deep/10 bg-white/80 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-rd-slate">
                    Últimos 7 días
                  </p>
                  <p className="mt-2 font-display text-4xl font-bold text-rd-ink">
                    {formatNumber(rain.data.pastTotalMm, 0)}
                    <span className="ml-1 text-lg font-semibold text-rd-slate">mm</span>
                  </p>
                  <p className="mt-1 text-sm text-rd-slate">Lo que ya cayó en {province.name}</p>
                </div>
                <div className="rounded-2xl border border-rd-teal/25 bg-rd-mist/80 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-rd-ocean">
                    Próximos 7 días
                  </p>
                  <p className="mt-2 font-display text-4xl font-bold text-rd-ocean">
                    {formatNumber(rain.data.nextTotalMm, 0)}
                    <span className="ml-1 text-lg font-semibold text-rd-ocean/70">mm</span>
                  </p>
                  <p className="mt-1 text-sm text-rd-slate">Incluye hoy + pronóstico</p>
                </div>
              </div>

              <div className="panel p-4 sm:p-5">
                <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-rd-slate">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-slate-400" /> Pasado
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-rd-deep" /> Hoy
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-rd-teal" /> Pronóstico
                  </span>
                </div>
                <div className="h-56 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rain.data.days}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d5e3e0" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} unit=" mm" width={44} />
                      <Tooltip
                        formatter={(value) => [`${formatNumber(Number(value))} mm`, 'Lluvia']}
                        labelFormatter={(_, payload) => {
                          const row = payload?.[0]?.payload as
                            | { date?: string; kind?: string; probability?: number | null }
                            | undefined
                          if (!row?.date) return ''
                          const kind =
                            row.kind === 'pasado' ? 'Pasado' : row.kind === 'hoy' ? 'Hoy' : 'Pronóstico'
                          const prob = row.probability != null ? ` · Prob. ${row.probability}%` : ''
                          return `${shortDate(row.date)} · ${kind}${prob}`
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
        </>
      ) : null}
    </div>
  )
}
