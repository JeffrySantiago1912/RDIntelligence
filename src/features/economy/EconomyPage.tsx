import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts'
import { useAsyncData } from '@/shared/hooks/useAsyncData'
import { DOM_INDICATORS, fetchDomIndicator } from '@/shared/api/worldBank'
import { SectionHeader } from '@/shared/components/SectionHeader'
import { MetricCard } from '@/shared/components/MetricCard'
import { LoadingState, ErrorState, Disclaimer } from '@/shared/components/States'
import { formatNumber } from '@/shared/lib/utils'
import { TIPS } from '@/data/tips'

const ECONOMY_TIPS: Record<string, string> = {
  inflation: TIPS.inflation,
  gdp_growth: TIPS.gdpGrowth,
  unemployment: TIPS.unemployment,
  gdp_capita: TIPS.gdpCapita,
}

async function loadEconomy() {
  const series = await Promise.all(
    DOM_INDICATORS.map(async (ind) => {
      const points = await fetchDomIndicator(ind.code, 15)
      return { ...ind, points }
    }),
  )
  return series
}

export function EconomyPage() {
  const { data, error, loading, reload } = useAsyncData(loadEconomy, [])

  const chartData =
    data?.[0]?.points.map((p) => {
      const row: Record<string, string | number> = { year: p.date }
      for (const ind of data) {
        const match = ind.points.find((x) => x.date === p.date)
        if (match?.value != null) row[ind.id] = match.value
      }
      return row
    }) ?? []

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Dashboard económico"
        description="Indicadores macro de República Dominicana desde World Bank Open Data."
        sources={[
          { name: 'World Bank API', href: 'https://data.worldbank.org/' },
          { name: 'Banco Central RD (referencia)', href: 'https://www.bancentral.gov.do/' },
        ]}
      />
      <Disclaimer>
        El tipo de cambio intradía y series diarias del Banco Central suelen requerir scraping o API
        institucional. Aquí usamos series anuales abiertas del Banco Mundial para DOM.
      </Disclaimer>

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.map((ind) => {
              const latest = [...ind.points].reverse().find((p) => p.value != null)
              return (
                <MetricCard
                  key={ind.id}
                  label={ind.label}
                  value={latest ? formatNumber(latest.value ?? 0, 2) : '—'}
                  hint={latest ? `${latest.date} · ${ind.unit}` : ind.unit}
                  tip={ECONOMY_TIPS[ind.id]}
                />
              )
            })}
          </div>
          <div className="panel p-4">
            <h2 className="mb-3 font-display text-lg font-bold">Evolución reciente</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d5e3e0" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="inflation" name="Inflación %" stroke="#f07167" dot={false} />
                  <Line type="monotone" dataKey="gdp_growth" name="PIB %" stroke="#0b3d4a" dot={false} />
                  <Line type="monotone" dataKey="unemployment" name="Desempleo %" stroke="#2ec4b6" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
