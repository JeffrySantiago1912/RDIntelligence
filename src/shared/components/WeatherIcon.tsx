import type { LucideIcon } from 'lucide-react'
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export type WeatherVisual = {
  Icon: LucideIcon
  label: string
  tone: string
}

/** Códigos WMO de Open-Meteo → icono + etiqueta en español. */
export function weatherVisual(code: number): WeatherVisual {
  if (code === 0) {
    return { Icon: Sun, label: 'Soleado', tone: 'bg-amber-50 text-amber-600 ring-amber-200' }
  }
  if (code <= 2) {
    return { Icon: CloudSun, label: 'Parcialmente nublado', tone: 'bg-sky-50 text-sky-600 ring-sky-200' }
  }
  if (code === 3) {
    return { Icon: Cloud, label: 'Nublado', tone: 'bg-slate-100 text-slate-600 ring-slate-200' }
  }
  if (code <= 48) {
    return { Icon: CloudFog, label: 'Niebla', tone: 'bg-slate-100 text-slate-500 ring-slate-200' }
  }
  if (code <= 57) {
    return { Icon: CloudDrizzle, label: 'Llovizna', tone: 'bg-cyan-50 text-cyan-700 ring-cyan-200' }
  }
  if (code <= 67 || (code >= 80 && code <= 82)) {
    return { Icon: CloudRain, label: 'Lluvia', tone: 'bg-blue-50 text-blue-700 ring-blue-200' }
  }
  if (code <= 77) {
    return { Icon: CloudSnow, label: 'Granizo / nieve', tone: 'bg-indigo-50 text-indigo-600 ring-indigo-200' }
  }
  if (code >= 95) {
    return {
      Icon: CloudLightning,
      label: 'Tormenta',
      tone: 'bg-violet-50 text-violet-700 ring-violet-200',
    }
  }
  return { Icon: Cloud, label: 'Nublado', tone: 'bg-slate-100 text-slate-600 ring-slate-200' }
}

/** Si no hay weather_code, estima por mm de lluvia del día. */
export function rainAmountVisual(mm: number): WeatherVisual {
  if (mm <= 0.2) {
    return { Icon: Sun, label: 'Seco / soleado', tone: 'bg-amber-50 text-amber-600 ring-amber-200' }
  }
  if (mm < 2) {
    return { Icon: CloudSun, label: 'Poca lluvia', tone: 'bg-sky-50 text-sky-600 ring-sky-200' }
  }
  if (mm < 8) {
    return { Icon: CloudDrizzle, label: 'Llovizna', tone: 'bg-cyan-50 text-cyan-700 ring-cyan-200' }
  }
  if (mm < 20) {
    return { Icon: CloudRain, label: 'Lluvia', tone: 'bg-blue-50 text-blue-700 ring-blue-200' }
  }
  return {
    Icon: CloudLightning,
    label: 'Lluvia fuerte',
    tone: 'bg-violet-50 text-violet-700 ring-violet-200',
  }
}

type Props = {
  code?: number | null
  mm?: number | null
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function WeatherIcon({ code, mm, size = 'md', showLabel = false, className }: Props) {
  const visual =
    code != null && code >= 0 ? weatherVisual(code) : rainAmountVisual(mm ?? 0)
  const Icon = visual.Icon
  const box =
    size === 'lg' ? 'h-14 w-14' : size === 'sm' ? 'h-9 w-9' : 'h-11 w-11'
  const iconSize = size === 'lg' ? 'h-7 w-7' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-2xl ring-1',
          box,
          visual.tone,
        )}
        title={visual.label}
        aria-label={visual.label}
      >
        <Icon className={iconSize} strokeWidth={2.1} />
      </span>
      {showLabel ? <span className="text-sm font-medium text-rd-ink">{visual.label}</span> : null}
    </div>
  )
}
