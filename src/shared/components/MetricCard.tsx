import { cn } from '@/shared/lib/utils'
import { InfoTip } from '@/shared/components/InfoTip'

type Props = {
  label: string
  value: string | number
  hint?: string
  /** Explicación sencilla para personas no técnicas */
  tip?: string
  className?: string
  accent?: string
}

export function MetricCard({ label, value, hint, tip, className, accent }: Props) {
  return (
    <div className={cn('panel p-4', className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-rd-slate">{label}</p>
        {tip ? <InfoTip text={tip} align="right" /> : null}
      </div>
      <p className={cn('mt-2 font-display text-3xl font-bold leading-snug tracking-normal text-rd-ink', accent)}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-sm text-rd-slate">{hint}</p> : null}
    </div>
  )
}
