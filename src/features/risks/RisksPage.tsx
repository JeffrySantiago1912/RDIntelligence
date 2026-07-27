import { useMemo, useState } from 'react'
import { PROVINCES } from '@/data/locations'
import { useAsyncData } from '@/shared/hooks/useAsyncData'
import {
  currentHourIndex,
  fetchAirQuality,
  fetchForecast,
  maxNextHours,
  sumNextHours,
} from '@/shared/api/openMeteo'
import { SectionHeader } from '@/shared/components/SectionHeader'
import { MetricCard } from '@/shared/components/MetricCard'
import { RiskGauge } from '@/shared/components/RiskGauge'
import { LoadingState, ErrorState } from '@/shared/components/States'
import { MapView } from '@/shared/components/MapView'
import {
  clamp,
  cn,
  dengueRisk,
  fireRisk,
  floodRiskFromPrecip,
  riskLabel,
  riskTone,
  sargassumIndex,
} from '@/shared/lib/utils'
import { TIPS } from '@/data/tips'

type RiskBundle = {
  inundacion: number
  sargazo: number | null
  incendio: number
  uv: number
  lluvia: number
  dengue: number
  respiratorio: number
}

async function loadRisks(lat: number, lon: number, coastal: boolean): Promise<RiskBundle> {
  const [forecast, air] = await Promise.all([fetchForecast(lat, lon), fetchAirQuality(lat, lon)])
  const idx = currentHourIndex(forecast.hourly.time)
  const rain5 = sumNextHours(forecast.hourly.precipitation, 5, idx)
  const rainMax = maxNextHours(forecast.hourly.precipitation, 5, idx)
  const uv = forecast.hourly.uv_index?.[idx] ?? forecast.daily?.uv_index_max?.[0] ?? 0
  const temp = forecast.current?.temperature_2m ?? forecast.hourly.temperature_2m[idx]
  const hum = forecast.current?.relative_humidity_2m ?? forecast.hourly.relative_humidity_2m[idx]
  const wind = forecast.current?.wind_speed_10m ?? forecast.hourly.wind_speed_10m[idx]
  const windDir = forecast.current?.wind_direction_10m ?? forecast.hourly.wind_direction_10m[idx]
  const dust = air.current?.dust ?? air.hourly.dust[idx] ?? 0
  const pm = air.current?.pm10 ?? air.hourly.pm10[idx] ?? 0

  return {
    inundacion: floodRiskFromPrecip(rain5, rainMax),
    sargazo: coastal ? sargassumIndex(new Date().getMonth() + 1, windDir, wind) : null,
    incendio: fireRisk(temp, hum, wind, rain5),
    uv: clamp(uv * 9),
    lluvia: clamp((rain5 / 80) * 100),
    dengue: dengueRisk(temp, hum, rain5),
    respiratorio: clamp(dust * 2 + pm * 0.8),
  }
}

function adviceFor(key: string, score: number) {
  const level = riskLabel(score)
  const map: Record<string, Record<string, string>> = {
    inundacion: {
      Bajo: 'No se esperan anegamientos relevantes por lluvia inmediata.',
      Moderado: 'Vigilá calles bajas si aumenta la lluvia.',
      Alto: 'Evita zonas que suelen inundarse; prioriza rutas altas.',
      Crítico: 'Precaución máxima en sectores propensos a inundación.',
    },
    sargazo: {
      Bajo: 'Poca presión estimada de sargazo en costa cercana.',
      Moderado: 'Puede haber algo de alga en playas del este.',
      Alto: 'Alta probabilidad de sargazo visible en costa.',
      Crítico: 'Condiciones muy favorables a acumulación de sargazo.',
    },
    incendio: {
      Bajo: 'Clima poco favorable a incendios forestales.',
      Moderado: 'Evita fogatas o quemas sin control.',
      Alto: 'Alto peligro de fuego; extrema precaución en campo.',
      Crítico: 'Condiciones críticas: no uses fuego al aire libre.',
    },
    dengue: {
      Bajo: 'Clima poco favorable al mosquito por ahora.',
      Moderado: 'Elimina agua estancada en casa y patio.',
      Alto: 'Usa repelente y revisa criaderos de mosquito.',
      Crítico: 'Refuerza prevención: criaderos, mosquiteros y repelente.',
    },
    uv: {
      Bajo: 'Sol suave; aún así conviene protección básica.',
      Moderado: 'Usa protector solar si estarás afuera un rato.',
      Alto: 'Busca sombra al mediodía y usa protector.',
      Crítico: 'UV extremo: limita exposición y cúbrete bien.',
    },
    lluvia: {
      Bajo: 'Poca lluvia esperada en las próximas horas.',
      Moderado: 'Puede lloviznar; lleva paraguas por si acaso.',
      Alto: 'Lluvia importante posible; cuida desplazamientos.',
      Crítico: 'Lluvia intensa probable; evita zonas inundables.',
    },
    respiratorio: {
      Bajo: 'Aire en rango aceptable para la mayoría.',
      Moderado: 'Personas sensibles: reduzcan ejercicio intenso afuera.',
      Alto: 'Cuidado con polvo/partículas; limita actividades al aire libre.',
      Crítico: 'Aire muy cargado: prioriza interiores y mascarilla si molesta.',
    },
  }
  return map[key]?.[level] ?? `Nivel ${level.toLowerCase()}.`
}

export function RisksPage() {
  const [provinceId, setProvinceId] = useState(PROVINCES[0].id)
  const province = PROVINCES.find((p) => p.id === provinceId) ?? PROVINCES[0]

  const { data, error, loading, reload } = useAsyncData(
    () => loadRisks(province.lat, province.lon, province.coastal),
    [province.lat, province.lon, province.coastal],
  )

  const summary = useMemo(() => {
    if (!data) return []
    const rows: { key: string; label: string; score: number }[] = [
      { key: 'inundacion', label: 'Inundación', score: data.inundacion },
      { key: 'incendio', label: 'Incendio', score: data.incendio },
      { key: 'dengue', label: 'Dengue', score: data.dengue },
      { key: 'uv', label: 'Rayos UV', score: data.uv },
      { key: 'lluvia', label: 'Lluvia', score: data.lluvia },
      { key: 'respiratorio', label: 'Aire / respiratorio', score: data.respiratorio },
    ]
    if (data.sargazo != null) {
      rows.push({ key: 'sargazo', label: 'Sargazo', score: data.sargazo })
    }
    return rows.map((r) => ({ ...r, score: Math.round(r.score) })).sort((a, b) => b.score - a.score)
  }, [data])

  const top = summary[0]

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Riesgos en tu provincia"
        description="Resumen fácil de entender: inundación, incendio, dengue, sol, lluvia y calidad del aire. El sargazo solo aplica en provincias con costa. Cada número va de 0 a 100 (bajo es mejor)."
        sources={[
          { name: 'Open-Meteo', href: 'https://open-meteo.com/' },
          { name: 'Estimaciones RDIntelligence' },
        ]}
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-rd-slate" htmlFor="provincia">
          ¿Dónde estás?
        </label>
        <select
          id="provincia"
          value={provinceId}
          onChange={(e) => setProvinceId(e.target.value)}
          className="rounded-xl border border-rd-deep/15 bg-white px-3 py-2 text-sm"
        >
          {PROVINCES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {!p.coastal ? ' (sin costa)' : ''}
            </option>
          ))}
        </select>
      </div>

      {loading ? <LoadingState label="Consultando condiciones…" /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {data && top ? (
        <>
          {!province.coastal ? (
            <div className="rounded-xl border border-sky-200 bg-sky-50/80 px-4 py-3 text-sm text-sky-950">
              {province.name} no tiene costa: no aplican playas ni sargazo aquí. Esos indicadores solo
              se muestran en provincias costeras.
            </div>
          ) : null}

          <div className="panel-strong flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-rd-slate">
                Atención principal en {province.name}
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-rd-ink">
                {top.label}: {riskLabel(top.score)}
              </p>
              <p className="mt-1 text-sm text-rd-slate">{adviceFor(top.key, top.score)}</p>
            </div>
            <span
              className={cn(
                'inline-flex w-fit rounded-full border px-3 py-1 text-sm font-semibold',
                riskTone(top.score),
              )}
            >
              {top.score}/100
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <RiskGauge score={data.inundacion} label="Inundación" tip={TIPS.floodRisk} />
            {data.sargazo != null ? (
              <RiskGauge score={data.sargazo} label="Sargazo" tip={TIPS.sargassum} />
            ) : (
              <div className="panel flex flex-col justify-center p-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-rd-slate">
                  Sargazo
                </p>
                <p className="mt-2 font-display text-2xl font-bold text-rd-ink">No aplica</p>
                <p className="mt-1 text-sm text-rd-slate">Provincia sin costa</p>
              </div>
            )}
            <RiskGauge score={data.incendio} label="Incendio" tip={TIPS.fireRisk} />
            <RiskGauge score={data.dengue} label="Dengue" tip={TIPS.dengueRisk} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard label="Rayos UV" value={Math.round(data.uv)} tip={TIPS.uv100} />
            <MetricCard
              label="Lluvia"
              value={Math.round(data.lluvia)}
              tip="Qué tanta lluvia hay o se espera, en escala 0–100. Más alto = más precipitación."
            />
            <MetricCard
              label="Aire / respiratorio"
              value={Math.round(data.respiratorio)}
              tip={TIPS.respiratoryAlert}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <MapView
              className="h-[380px] sm:h-[420px]"
              center={[province.lat, province.lon]}
              zoom={9}
              markers={[
                {
                  id: province.id,
                  position: [province.lat, province.lon],
                  label: province.name,
                  detail: `${top.label}: ${riskLabel(top.score)}`,
                  color: top.score > 60 ? '#f07167' : '#2ec4b6',
                },
              ]}
            />

            <div className="panel overflow-hidden">
              <div className="border-b border-rd-deep/10 px-4 py-3">
                <h2 className="font-display text-lg font-bold leading-snug">Qué debes saber hoy</h2>
              </div>
              <ul className="divide-y divide-rd-deep/5">
                {summary.map((item) => (
                  <li key={item.key} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-rd-ink">{item.label}</p>
                        <p className="mt-0.5 text-sm text-rd-slate">
                          {adviceFor(item.key, item.score)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-display text-xl font-bold leading-snug">{item.score}</p>
                        <span
                          className={cn(
                            'mt-0.5 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                            riskTone(item.score),
                          )}
                        >
                          {riskLabel(item.score)}
                        </span>
                      </div>
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
