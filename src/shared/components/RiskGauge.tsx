import { cn, riskLabel, riskTone } from '@/shared/lib/utils'
import { InfoTip } from '@/shared/components/InfoTip'

type Props = {
  score: number
  label?: string
  tip?: string
  className?: string
}

export function RiskGauge({ score, label = 'Riesgo', tip, className }: Props) {
  const clamped = Math.round(Math.min(100, Math.max(0, score)))
  return (
    <div className={cn('panel p-4', className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-rd-slate">{label}</p>
          {tip ? <InfoTip text={tip} /> : null}
        </div>
        <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-semibold', riskTone(clamped))}>
          {riskLabel(clamped)}
        </span>
      </div>
      <p className="mt-2 font-display text-4xl font-bold leading-snug text-rd-ink">{clamped}</p>
      <p className="mt-0.5 text-xs text-rd-slate">Escala 0–100 · {riskLabel(clamped).toLowerCase()}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-rd-mist">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rd-teal via-rd-amber to-rd-coral transition-all duration-700"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
