'use client'

import Link from 'next/link'
import { AlertTriangle, ArrowRight, CheckCircle2, LockKeyhole, ShieldCheck } from 'lucide-react'
import { DEMO_STUDENT_PROFILE_ID, formatDemoCurrency, getOutstandingAmount, useDemoLibraryState } from '@/components/circulacion/demo-library-state'

export function LoanAccessStatus() {
  const { state } = useDemoLibraryState()
  const profile = state.profiles.find((item) => item.id === DEMO_STUDENT_PROFILE_ID)
  if (!profile) return null

  const debt = getOutstandingAmount(profile, state.fines)
  const blocked = debt > 0

  return (
    <section aria-labelledby="loan-access-title" className={`mb-6 flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${blocked ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'}`}>
      <div className="flex items-start gap-3">
        <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-white ${blocked ? 'text-rose-700' : 'text-emerald-700'}`}>{blocked ? <LockKeyhole aria-hidden="true" className="size-5" /> : <ShieldCheck aria-hidden="true" className="size-5" />}</span>
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${blocked ? 'text-rose-700' : 'text-emerald-700'}`}>Acceso a nuevos préstamos</p>
          <h2 id="loan-access-title" className={`mt-1 flex items-center gap-2 text-sm font-bold ${blocked ? 'text-rose-950' : 'text-emerald-950'}`}>
            {blocked ? <><AlertTriangle aria-hidden="true" className="size-4" /> Perfil bloqueado por deuda</> : <><CheckCircle2 aria-hidden="true" className="size-4" /> Perfil al día</>}
          </h2>
          <p className={`mt-1 text-xs leading-5 ${blocked ? 'text-rose-800' : 'text-emerald-800'}`}>
            {blocked ? `Saldo pendiente ${formatDemoCurrency(debt)}. Liquida las sanciones en caja para habilitar solicitudes PWA.` : 'Puedes solicitar préstamos desde el catálogo o retirarlos en mostrador.'}
          </p>
        </div>
      </div>
      <Link href="/opac" aria-disabled={blocked} tabIndex={blocked ? -1 : 0} onClick={(event) => { if (blocked) event.preventDefault() }} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${blocked ? 'cursor-not-allowed bg-slate-200 text-slate-500 focus-visible:outline-slate-400' : 'bg-[#1E3A8A] text-white hover:bg-[#1E3A8A]/90 focus-visible:outline-[#1E3A8A]'}`}>
        {blocked ? 'Solicitud deshabilitada' : 'Solicitar préstamo'}<ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </section>
  )
}
