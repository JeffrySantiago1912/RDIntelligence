import { ExternalLink } from 'lucide-react'

type Props = {
  title: string
  description: string
  sources?: { name: string; href?: string }[]
}

export function SectionHeader({ title, description, sources = [] }: Props) {
  return (
    <header className="mb-6 space-y-3">
      <div>
        <p className="font-brand text-xs font-semibold uppercase tracking-[0.2em] text-rd-ocean">
          RDIntelligence
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold leading-snug tracking-normal text-rd-ink md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-base text-rd-slate md:text-lg">{description}</p>
      </div>
      {sources.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {sources.map((s) =>
            s.href ? (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-rd-deep/10 bg-white/80 px-3 py-1 text-xs font-medium text-rd-deep transition hover:border-rd-teal hover:text-rd-ocean"
              >
                {s.name}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span
                key={s.name}
                className="rounded-full border border-rd-deep/10 bg-white/80 px-3 py-1 text-xs font-medium text-rd-deep"
              >
                {s.name}
              </span>
            ),
          )}
        </div>
      ) : null}
    </header>
  )
}
