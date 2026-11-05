'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

function formatRemaining(total: number) {
  const days = Math.floor(total / 86_400)
  const hours = Math.floor((total % 86_400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const hms = [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':')
  if (days === 0) return hms
  return `${days} ${days === 1 ? 'día' : 'días'}, ${hms}`
}

export function FifoCountdown({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining((value) => (value > 0 ? value - 1 : 0))
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <p className="flex items-center gap-1.5 text-sm text-amber-800">
      <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>
        Disponible en:{' '}
        <span className="font-mono font-semibold tabular-nums" aria-live="off">
          {formatRemaining(remaining)}
        </span>
      </span>
    </p>
  )
}
