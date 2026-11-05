'use client'

import { useEffect, useState } from 'react'
import { Clock3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const SECOND = 1_000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export function LoanCountdown({ dueAt }: { dueAt: string }) {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const interval = window.setInterval(() => setNow(Date.now()), SECOND)
    return () => window.clearInterval(interval)
  }, [])

  const remaining = now === null ? null : new Date(dueAt).getTime() - now
  const overdue = remaining !== null && remaining <= 0
  let countdownLabel = 'Calculando tiempo restante…'

  if (remaining !== null && overdue) {
    const elapsed = Math.abs(remaining)
    const hours = Math.floor(elapsed / HOUR)
    const days = Math.floor(elapsed / DAY)
    countdownLabel = days > 0
      ? `Vencido hace ${days} ${days === 1 ? 'día' : 'días'}`
      : `Vencido hace ${Math.max(hours, 1)} ${hours === 1 ? 'hora' : 'horas'}`
  } else if (remaining !== null) {
    const totalSeconds = Math.floor(remaining / SECOND)
    const days = Math.floor(totalSeconds / (DAY / SECOND))
    const hours = Math.floor((totalSeconds % (DAY / SECOND)) / (HOUR / SECOND))
    const minutes = Math.floor((totalSeconds % (HOUR / SECOND)) / (MINUTE / SECOND))
    const seconds = totalSeconds % (MINUTE / SECOND)
    countdownLabel = days > 0
      ? `Quedan ${days} ${days === 1 ? 'día' : 'días'}, ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `Quedan ${hours} h ${String(minutes).padStart(2, '0')} min ${String(seconds).padStart(2, '0')} s`
  }

  return (
    <div className={cn(
      'flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold sm:text-sm',
      overdue ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-amber-200 bg-amber-50 text-amber-950',
    )}>
      <Clock3 aria-hidden="true" className="size-4 shrink-0" />
      <span aria-label={`Cuenta regresiva para la devolución: ${countdownLabel}`}>{countdownLabel}</span>
    </div>
  )
}
