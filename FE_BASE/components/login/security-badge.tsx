'use client'

import { useState } from 'react'
import { ShieldCheck, Lock, Eye, EyeOff, Server } from 'lucide-react'
import { cn } from '@/lib/utils'

// Bloque de badge de seguridad

type SecurityFeature = {
  icon: typeof ShieldCheck
  label: string
  detail: string
}

const SECURITY_FEATURES: SecurityFeature[] = [
  { icon: Lock, label: 'Cifrado TLS 1.3', detail: 'Conexión cifrada de extremo a extremo en cada petición.' },
  { icon: ShieldCheck, label: 'Bloqueo anti-fuerza bruta', detail: 'El acceso se bloquea tras 3 intentos fallidos consecutivos.' },
  { icon: Server, label: 'Sesión protegida', detail: 'La credencial de sesión se almacena de forma efímera en esta terminal.' },
]

export function SecurityBadge() {
  const [expanded, setExpanded] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all',
          'border-emerald-600 bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600',
        )}
        aria-expanded={expanded}
        aria-controls="security-details"
      >
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
        </span>
        Conexión Segura
        <ShieldCheck className="size-3.5" aria-hidden="true" />
      </button>

      {expanded && (
        <div
          id="security-details"
          className="w-full max-w-md rounded-xl border border-emerald-200 bg-white p-4 shadow-md"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Medidas de seguridad activas</h3>
            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
            >
              {showDetails ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              {showDetails ? 'Ocultar' : 'Ver'} detalle
            </button>
          </div>
          <ul className="flex flex-col gap-2.5">
            {SECURITY_FEATURES.map(({ icon: Icon, label, detail }) => (
              <li key={label} className="flex items-start gap-2.5">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800">{label}</p>
                  {showDetails && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{detail}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
