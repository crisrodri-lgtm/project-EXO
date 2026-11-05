'use client'

import { useMemo, useState, type FormEvent } from 'react'
import {
  Banknote,
  Check,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  LockKeyhole,
  Printer,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import {
  demoIdentityKey,
  formatDemoCurrency,
  getOutstandingAmount,
  normalizeDemoSearch,
  useDemoLibraryState,
  type DemoFine,
  type DemoPaymentMethod,
  type DemoProfile,
} from '@/components/circulacion/demo-library-state'
import { inputClass } from '@/components/circulacion/section-card'

type Receipt = {
  receipt: string
  profileName: string
  total: number
  method: DemoPaymentMethod
  fineIds: string[]
  createdAt: string
  remaining: number
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-DO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value.slice(0, 10)}T12:00:00Z`))
}

function outstandingForProfile(profile: DemoProfile, fines: DemoFine[]) {
  const profileKey = demoIdentityKey(profile)
  return fines.filter((fine) => !fine.paid && demoIdentityKey(fine) === profileKey)
}

export function CashierWorkspace() {
  const { state, update } = useDemoLibraryState()
  const [query, setQuery] = useState('V-27.845.391')
  const [selectedProfileId, setSelectedProfileId] = useState('V-27.845.391')
  const [selectedFineIds, setSelectedFineIds] = useState<string[]>(() =>
    state.fines.filter((fine) => !fine.paid).map((fine) => fine.id),
  )
  const [method, setMethod] = useState<DemoPaymentMethod>('EFECTIVO')
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [feedback, setFeedback] = useState('')

  const profiles = useMemo(() => {
    const normalized = normalizeDemoSearch(query)
    if (!normalized) return state.profiles
    return state.profiles.filter((profile) =>
      normalizeDemoSearch(`${profile.name} ${profile.id} ${profile.cedula} ${profile.matricula}`).includes(normalized),
    )
  }, [query, state.profiles])

  const selectedProfile = state.profiles.find((profile) => profile.id === selectedProfileId) ?? null
  const allProfileFines = selectedProfile
    ? state.fines.filter((fine) => demoIdentityKey(fine) === demoIdentityKey(selectedProfile))
    : []
  const unpaidFines = selectedProfile ? outstandingForProfile(selectedProfile, state.fines) : []
  const outstandingTotal = selectedProfile ? getOutstandingAmount(selectedProfile, state.fines) : 0
  const selectedFines = unpaidFines.filter((fine) => selectedFineIds.includes(fine.id))
  const totalToCollect = selectedFines.reduce((total, fine) => total + fine.amount, 0)
  const isBlocked = outstandingTotal > 0

  function selectProfile(profile: DemoProfile) {
    setSelectedProfileId(profile.id)
    setQuery(profile.cedula || profile.matricula || profile.name)
    setSelectedFineIds(outstandingForProfile(profile, state.fines).map((fine) => fine.id))
    setFeedback('')
    setReceipt(null)
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback('')
    if (profiles.length === 1) {
      selectProfile(profiles[0])
    } else if (profiles.length === 0) {
      setSelectedProfileId('')
      setFeedback('No encontramos una identidad con esos datos. Verifica la cédula, matrícula o nombre.')
    } else {
      setSelectedProfileId('')
      setFeedback(`Hay ${profiles.length} coincidencias. Selecciona el perfil correcto de la lista.`)
    }
  }

  function toggleFine(id: string) {
    setSelectedFineIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id])
    setReceipt(null)
  }

  function handlePayment() {
    if (!selectedProfile || selectedFines.length === 0) return

    const selectedIds = selectedFines.map((fine) => fine.id)
    const paidTotal = totalToCollect
    const remaining = unpaidFines
      .filter((fine) => !selectedIds.includes(fine.id))
      .reduce((total, fine) => total + fine.amount, 0)
    const createdAt = new Date().toISOString()
    const receiptId = `CAJ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    const receiptData: Receipt = {
      receipt: receiptId,
      profileName: selectedProfile.name,
      total: paidTotal,
      method,
      fineIds: selectedIds,
      createdAt,
      remaining,
    }

    update((current) => ({
      ...current,
      fines: current.fines.map((fine) => selectedIds.includes(fine.id) ? { ...fine, paid: true } : fine),
      payments: [
        {
          id: receiptId,
          receipt: receiptId,
          profileId: selectedProfile.id,
          borrowerName: selectedProfile.name,
          createdAt,
          method,
          total: paidTotal,
          fineIds: selectedIds,
        },
        ...current.payments,
      ],
      profiles: current.profiles.map((profile) => demoIdentityKey(profile) === demoIdentityKey(selectedProfile)
        ? { ...profile, status: remaining > 0 ? 'BLOQUEADO' : 'ACTIVO' }
        : profile),
    }))

    setSelectedFineIds([])
    setReceipt(receiptData)
    setFeedback(remaining > 0
      ? `Pago parcial registrado. Queda un saldo de ${formatDemoCurrency(remaining)}; el perfil permanece bloqueado.`
      : 'Pago registrado. La identidad queda habilitada para préstamos en mostrador y PWA.')
  }

  const toggleAll = () => {
    const allSelected = unpaidFines.length > 0 && unpaidFines.every((fine) => selectedFineIds.includes(fine.id))
    setSelectedFineIds(allSelected ? [] : unpaidFines.map((fine) => fine.id))
    setReceipt(null)
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 xl:px-9">
      <nav aria-label="Ruta de navegación" className="mb-4 flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-slate-500 sm:text-xs">
        <span>ADMINISTRACIÓN</span><span aria-hidden="true">/</span><span>CAJA</span><span aria-hidden="true">/</span><span aria-current="page" className="text-slate-800">SANCIONES Y COBROS</span>
      </nav>

      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1E3A8A]">
            <CircleDollarSign aria-hidden="true" className="size-3.5" /> Pantalla 10 · Caja presencial
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Gestión de cobros y desbloqueo</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Consulta el expediente financiero, selecciona sanciones y registra pagos parciales o totales en RD$.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 shadow-sm"><ShieldCheck aria-hidden="true" className="size-4 text-[#1E3A8A]" /> Modo demo · memoria de sesión</span>
          <span className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 shadow-sm">Roles de caja: administrador · auxiliar</span>
        </div>
      </header>

      <div role="note" className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-950">
        <LockKeyhole aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-700" />
        <p><strong>Demostración interactiva:</strong> los pagos, comprobantes y cambios de bloqueo se comparten entre pantallas mientras esta sesión permanezca abierta; no se guardan en Supabase y se reinician al recargar.</p>
      </div>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)] xl:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          <section aria-labelledby="financial-search-title" className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-100 px-4 py-4 sm:px-5">
              <h2 id="financial-search-title" className="text-base font-bold text-slate-900">Buscar expediente financiero</h2>
              <p className="mt-1 text-xs text-slate-500">Busca por cédula, matrícula, nombre o identificador. Incluye cuentas PWA y registros manuales.</p>
            </header>
            <div className="p-4 sm:p-5">
              <form onSubmit={handleSearch} role="search" aria-label="Buscar expediente financiero" className="flex flex-col gap-2 sm:flex-row">
                <label htmlFor="financial-search" className="sr-only">Cédula, matrícula o nombre</label>
                <div className="relative min-w-0 flex-1">
                  <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input id="financial-search" value={query} onChange={(event) => { setQuery(event.target.value); setSelectedProfileId(''); setFeedback('') }} placeholder="Ej. 001-1729901-4 o María Gutiérrez" autoComplete="off" className={`${inputClass} h-11 border-slate-300 pl-9`} />
                </div>
                <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#1E3A8A] px-4 text-sm font-bold text-white hover:bg-[#183174] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]">
                  <Search aria-hidden="true" className="size-4" /> Buscar
                </button>
              </form>
              {feedback && <p role="status" className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-700">{feedback}</p>}

              {query.trim() && profiles.length > 0 && (
                <ul aria-label="Coincidencias de identidad" className="mt-3 flex flex-col gap-2">
                  {profiles.map((profile) => (
                    <li key={profile.id}>
                      <button type="button" onClick={() => selectProfile(profile)} aria-pressed={selectedProfileId === profile.id} className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] ${selectedProfileId === profile.id ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}>
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><UserRound aria-hidden="true" className="size-4" /></span>
                          <span className="min-w-0"><span className="block truncate text-sm font-bold text-slate-900">{profile.name}</span><span className="mt-0.5 block truncate font-mono text-[11px] text-slate-500">{profile.cedula || profile.matricula} · {profile.channel === 'PWA' ? 'Cuenta PWA' : 'Registro manual'}</span></span>
                        </span>
                        {selectedProfileId === profile.id && <Check aria-hidden="true" className="size-4 shrink-0 text-[#1E3A8A]" />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {selectedProfile ? (
            <section aria-labelledby="profile-file-title" className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <header className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#1E3A8A]"><UserRound aria-hidden="true" className="size-5" /></span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Expediente financiero</p>
                    <h2 id="profile-file-title" className="mt-1 text-lg font-bold leading-tight text-slate-900">{selectedProfile.name}</h2>
                    <p className="mt-1 font-mono text-xs text-slate-600">Cédula {selectedProfile.cedula || '—'} · Matrícula {selectedProfile.matricula || '—'}</p>
                  </div>
                </div>
                <span role="status" className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-extrabold tracking-wide ${isBlocked ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
                  <span aria-hidden="true" className={`size-2 rounded-full ${isBlocked ? 'bg-rose-600' : 'bg-emerald-600'}`} />
                  {isBlocked ? 'BLOQUEADO POR DEUDA DE MULTAS' : 'AL DÍA'}
                </span>
              </header>
              <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
                <div className="rounded-lg bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Canal de registro</p><p className="mt-1 text-sm font-semibold text-slate-900">{selectedProfile.channel === 'PWA' ? 'Cuenta PWA' : 'Usuario manual'}</p></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Deuda pendiente</p><p className={`mt-1 text-sm font-bold tabular-nums ${isBlocked ? 'text-rose-700' : 'text-emerald-800'}`}>{formatDemoCurrency(outstandingTotal)}</p></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Contacto para notificaciones</p><p className="mt-1 truncate text-xs font-medium text-slate-800">{selectedProfile.email || 'Sin correo'}</p><p className="mt-0.5 text-xs text-slate-600">{selectedProfile.phone || 'Sin teléfono'}</p></div>
              </div>
            </section>
          ) : (
            <section className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <UserRound aria-hidden="true" className="mx-auto size-7 text-slate-400" />
              <p className="mt-2 text-sm font-semibold text-slate-700">Selecciona una identidad para abrir su expediente</p>
              <p className="mt-1 text-xs text-slate-500">La lista incluye usuarios PWA y registros presenciales.</p>
            </section>
          )}

          <section aria-labelledby="fines-title" className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
              <div><h2 id="fines-title" className="text-base font-bold text-slate-900">Desglose de sanciones</h2><p className="mt-1 text-xs text-slate-500">Selecciona conceptos individuales para un cobro parcial o total.</p></div>
              {unpaidFines.length > 0 && <button type="button" onClick={toggleAll} className="inline-flex min-h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">{unpaidFines.every((fine) => selectedFineIds.includes(fine.id)) ? 'Quitar selección' : 'Seleccionar pendientes'}</button>}
            </header>
            {selectedProfile ? (
              allProfileFines.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                    <caption className="sr-only">Sanciones y pagos de {selectedProfile.name}</caption>
                    <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-600"><tr><th scope="col" className="px-4 py-3">Selección</th><th scope="col" className="px-4 py-3">ID / Fecha</th><th scope="col" className="px-4 py-3">Motivo</th><th scope="col" className="px-4 py-3 text-right">Monto (RD$)</th><th scope="col" className="px-4 py-3">Estado</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {allProfileFines.map((fine) => (
                        <tr key={fine.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3"><input type="checkbox" aria-label={`Seleccionar sanción ${fine.id}`} checked={!fine.paid && selectedFineIds.includes(fine.id)} disabled={fine.paid} onChange={() => toggleFine(fine.id)} className="size-4 accent-[#1E3A8A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]" /></td>
                          <td className="px-4 py-3"><span className="block font-mono text-xs font-bold text-slate-800">{fine.id}</span><span className="mt-1 block text-xs text-slate-500">{formatDate(fine.issuedAt)}</span></td>
                          <td className="max-w-[260px] px-4 py-3 font-medium text-slate-800">{fine.reason}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold tabular-nums text-slate-900">{fine.amount.toLocaleString('es-DO')}</td>
                          <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${fine.paid ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-800'}`}>{fine.paid ? 'PAGADA' : 'PENDIENTE'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 p-8 text-center"><CheckCircle2 aria-hidden="true" className="size-7 text-emerald-600" /><p className="text-sm font-semibold text-slate-800">Este expediente no tiene sanciones registradas.</p><p className="text-xs text-slate-500">Cualquier sanción generada en devoluciones aparecerá aquí durante la sesión.</p></div>
              )
            ) : (
              <p className="p-6 text-center text-sm text-slate-500">Primero selecciona una identidad.</p>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-6">
          <section aria-labelledby="settlement-title" className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-100 px-4 py-4 sm:px-5"><div className="flex items-center gap-2"><Banknote aria-hidden="true" className="size-5 text-[#1E3A8A]" /><h2 id="settlement-title" className="text-base font-bold text-slate-900">Liquidación y caja</h2></div><p className="mt-1 text-xs text-slate-500">Revisa la selección antes de registrar el pago.</p></header>
            <div className="p-4 sm:p-5">
              <dl className="flex flex-col gap-3 text-sm">
                <div className="flex items-center justify-between gap-3"><dt className="text-slate-600">Conceptos seleccionados</dt><dd className="font-semibold tabular-nums text-slate-900">{selectedFines.length}</dd></div>
                <div className="flex items-center justify-between gap-3"><dt className="text-slate-600">Deuda pendiente</dt><dd className="font-semibold tabular-nums text-slate-900">{formatDemoCurrency(outstandingTotal)}</dd></div>
              </dl>
              <div className="mt-4 rounded-xl bg-[#1E3A8A] p-4 text-white"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-100">Total a cobrar · RD$</p><p className="mt-1 text-3xl font-bold tabular-nums">{formatDemoCurrency(totalToCollect)}</p></div>

              <fieldset className="mt-5 flex flex-col gap-2">
                <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-700">Método de pago</legend>
                <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${method === 'EFECTIVO' ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                  <input type="radio" name="payment-method" value="EFECTIVO" checked={method === 'EFECTIVO'} onChange={() => setMethod('EFECTIVO')} className="size-4 accent-[#1E3A8A]" />
                  <Banknote aria-hidden="true" className="size-4 text-slate-500" /><span className="font-semibold text-slate-800">Efectivo presencial</span>
                </label>
                <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${method === 'TRANSFERENCIA' ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                  <input type="radio" name="payment-method" value="TRANSFERENCIA" checked={method === 'TRANSFERENCIA'} onChange={() => setMethod('TRANSFERENCIA')} className="size-4 accent-[#1E3A8A]" />
                  <FileText aria-hidden="true" className="size-4 text-slate-500" /><span className="font-semibold text-slate-800">Transferencia CDEB-PD</span>
                </label>
              </fieldset>

              <button type="button" onClick={handlePayment} disabled={!selectedProfile || selectedFines.length === 0} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-3 text-center text-xs font-extrabold tracking-wide text-white hover:bg-[#183174] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] disabled:cursor-not-allowed disabled:bg-slate-300">
                <CheckCircle2 aria-hidden="true" className="size-4" /> REGISTRAR PAGO Y DESBLOQUEAR PERFIL
              </button>
              <p className="mt-3 text-[11px] leading-5 text-slate-500">Un pago parcial reduce el saldo, pero el perfil permanece bloqueado mientras existan sanciones pendientes.</p>
            </div>
          </section>

          {receipt && (
            <section aria-labelledby="receipt-title" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm sm:p-5">
              <div className="flex items-start gap-3"><span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700"><CheckCircle2 aria-hidden="true" className="size-5" /></span><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800">Comprobante digital</p><h2 id="receipt-title" className="mt-1 break-all font-mono text-sm font-extrabold text-emerald-950">{receipt.receipt}</h2></div></div>
              <dl className="mt-4 flex flex-col gap-2 border-t border-emerald-200 pt-3 text-xs"><div className="flex justify-between gap-3"><dt className="text-emerald-800">Titular</dt><dd className="text-right font-semibold text-emerald-950">{receipt.profileName}</dd></div><div className="flex justify-between gap-3"><dt className="text-emerald-800">Total recibido</dt><dd className="font-mono font-bold text-emerald-950">{formatDemoCurrency(receipt.total)}</dd></div><div className="flex justify-between gap-3"><dt className="text-emerald-800">Método</dt><dd className="font-semibold text-emerald-950">{receipt.method === 'EFECTIVO' ? 'Efectivo presencial' : 'Transferencia CDEB-PD'}</dd></div><div className="flex justify-between gap-3"><dt className="text-emerald-800">Fecha</dt><dd className="text-right font-semibold text-emerald-950">{new Intl.DateTimeFormat('es-DO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(receipt.createdAt))}</dd></div></dl>
              <p role="status" className="mt-3 rounded-lg border border-emerald-200 bg-white/70 px-3 py-2 text-xs font-semibold leading-5 text-emerald-900">{receipt.remaining > 0 ? `Pago parcial aplicado. Saldo restante: ${formatDemoCurrency(receipt.remaining)}.` : 'Pago completo. Perfil habilitado en mostrador y PWA.'}</p>
              <button type="button" onClick={() => window.print()} className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-md border border-emerald-300 bg-white px-3 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 print:hidden"><Printer aria-hidden="true" className="size-4" /> Imprimir comprobante</button>
            </section>
          )}

          {selectedProfile && !isBlocked && (
            <div role="status" className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-900"><ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><p>La identidad está al día y puede solicitar préstamos en mostrador y en la PWA.</p></div>
          )}
        </aside>
      </section>
    </div>
  )
}
