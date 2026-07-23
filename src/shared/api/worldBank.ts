export type WorldBankPoint = {
  date: string
  value: number | null
}

export type IndicatorDef = {
  id: string
  code: string
  label: string
  unit: string
}

export const DOM_INDICATORS: IndicatorDef[] = [
  { id: 'inflation', code: 'FP.CPI.TOTL.ZG', label: 'Inflación (IPC)', unit: '%' },
  { id: 'gdp_growth', code: 'NY.GDP.MKTP.KD.ZG', label: 'Crecimiento PIB', unit: '%' },
  { id: 'unemployment', code: 'SL.UEM.TOTL.ZS', label: 'Desempleo', unit: '%' },
  { id: 'gdp_capita', code: 'NY.GDP.PCAP.CD', label: 'PIB per cápita', unit: 'USD' },
]

type WbRow = { date: string; value: number | null }

export async function fetchDomIndicator(code: string, years = 12): Promise<WorldBankPoint[]> {
  const url = `https://api.worldbank.org/v2/country/DOM/indicator/${code}?format=json&per_page=${years}&mrnev=${years}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`World Bank HTTP ${res.status}`)
  const json = (await res.json()) as [unknown, WbRow[] | undefined]
  const rows = json[1] ?? []
  return rows
    .filter((r) => r.value !== null)
    .map((r) => ({ date: r.date, value: r.value }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
