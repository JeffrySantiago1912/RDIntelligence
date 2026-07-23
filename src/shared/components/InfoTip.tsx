import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CircleHelp } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

type Props = {
  text: string
  className?: string
  /** Preferencia inicial; se ajusta sola si no cabe en pantalla */
  align?: 'left' | 'right'
}

type Coord = {
  top: number
  left: number
  placement: 'top' | 'bottom'
  arrowLeft: number
}

const PAD = 12
const GAP = 10

/**
 * Tooltip accesible con portal (no se corta por overflow de cards).
 * El botón se ve claramente clicable; en móvil abre/cierra con tap.
 */
export function InfoTip({ text, className, align = 'left' }: Props) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<Coord | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback(() => {
    const btn = btnRef.current
    const tip = tipRef.current
    if (!btn || !tip) return

    const br = btn.getBoundingClientRect()
    const tr = tip.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    const spaceBelow = vh - br.bottom - PAD
    const spaceAbove = br.top - PAD
    const placement: 'top' | 'bottom' =
      spaceBelow < tr.height + GAP && spaceAbove > spaceBelow ? 'top' : 'bottom'

    let left =
      align === 'right' ? br.right - tr.width : br.left + br.width / 2 - tr.width / 2
    left = Math.min(Math.max(PAD, left), vw - tr.width - PAD)

    const top =
      placement === 'bottom' ? br.bottom + GAP : br.top - tr.height - GAP

    const arrowLeft = Math.min(
      Math.max(16, br.left + br.width / 2 - left),
      tr.width - 16,
    )

    setCoords({ top, left, placement, arrowLeft })
  }, [align])

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null)
      return
    }
    updatePosition()
  }, [open, text, updatePosition])

  useEffect(() => {
    if (!open) return

    const onDoc = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node
      if (btnRef.current?.contains(t) || tipRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onReposition = () => updatePosition()

    document.addEventListener('mousedown', onDoc)
    document.addEventListener('touchstart', onDoc, { passive: true })
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)

    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('touchstart', onDoc)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [open, updatePosition])

  return (
    <span className={cn('inline-flex shrink-0 align-middle', className)}>
      <button
        ref={btnRef}
        type="button"
        aria-label="Ver explicación"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        title="Toca para ver qué significa"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className={cn(
          'inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full',
          'border border-rd-ocean/35 bg-rd-teal/15 text-rd-ocean shadow-sm',
          'transition hover:border-rd-ocean hover:bg-rd-teal/25 hover:shadow',
          'active:scale-95',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rd-teal',
          open && 'border-rd-ocean bg-rd-ocean text-white hover:bg-rd-deep hover:text-white',
        )}
      >
        <CircleHelp className="h-4 w-4" strokeWidth={2.4} />
      </button>

      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={tipRef}
              id={id}
              role="tooltip"
              style={{
                position: 'fixed',
                top: coords?.top ?? -9999,
                left: coords?.left ?? -9999,
                visibility: coords ? 'visible' : 'hidden',
              }}
              className={cn(
                'z-[9999] max-w-[min(18rem,calc(100vw-1.5rem))] rounded-xl px-3.5 py-2.5',
                'border border-white/10 bg-rd-ink text-left text-xs font-normal normal-case',
                'leading-relaxed tracking-normal text-white shadow-2xl',
              )}
            >
              {text}
              {coords ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute h-2.5 w-2.5 rotate-45 bg-rd-ink"
                  style={{
                    left: coords.arrowLeft - 5,
                    ...(coords.placement === 'bottom'
                      ? { top: -5 }
                      : { bottom: -5 }),
                  }}
                />
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </span>
  )
}
