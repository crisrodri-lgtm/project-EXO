'use client'

import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { AlertTriangle, BookOpenCheck, CalendarClock, ShieldCheck, Smartphone } from 'lucide-react'
import { BorrowerSection } from '@/components/circulacion/borrower-section'
import { MaterialSection } from '@/components/circulacion/material-section'
import { LoanSummary } from '@/components/circulacion/loan-summary'
import { SuccessToast } from '@/components/circulacion/success-toast'
import { ReturnEvidenceCapture } from '@/components/circulacion/return-evidence-capture'
import { ManualBorrowerForm } from '@/components/circulacion/manual-borrower-form'
import {
  CATALOG_SAMPLE,
  INITIAL_ITEMS,
  borrowerFromProfile,
  type Borrower,
  type LoanItem,
} from '@/components/circulacion/loan-data'
import {
  findDemoProfile,
  formatDemoCurrency,
  getOutstandingAmount,
  isProfileBlocked,
  useDemoLibraryState,
  type DemoProfile,
  type DemoPwaRequest,
} from '@/components/circulacion/demo-library-state'

type LoanMode = 'digital' | 'manual'
type Notice = { receipt: string; message: string }

const ALL_CATALOG_ITEMS = [...INITIAL_ITEMS, ...CATALOG_SAMPLE]
const ITEM_BY_CODE = new Map(ALL_CATALOG_ITEMS.map((item) => [item.code, item]))

function itemsForRequest(request: DemoPwaRequest | undefined) {
  if (!request) return []
  return request.itemCodes.flatMap((code) => {
    const item = ITEM_BY_CODE.get(code)
    return item ? [item] : []
  })
}

function formatRequestDate(value: string) {
  return new Intl.DateTimeFormat('es-DO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Santo_Domingo' }).format(new Date(value))
}

function RequestSelector({
  requests,
  profiles,
  selectedRequestId,
  onRequestChange,
}: {
  requests: DemoPwaRequest[]
  profiles: DemoProfile[]
  selectedRequestId: string | null
  onRequestChange: (id: string) => void
}) {
  const selected = requests.find((request) => request.id === selectedRequestId)
  const selectedProfile = profiles.find((profile) => profile.id === selected?.profileId)

  return (
    <section aria-labelledby="recent-requests-title" className="rounded-md border border-gray-300 bg-white">
      <header className="border-b border-gray-300 px-4 py-3 md:px-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-[#1E3A8A]"><Smartphone aria-hidden="true" className="size-4" /></span>
          <div>
            <h2 id="recent-requests-title" className="text-sm font-bold tracking-wide text-gray-900 md:text-base">SOLICITUDES RECIENTES DE LA PWA</h2>
            <p className="mt-0.5 text-sm text-gray-600">Selecciona una petición para precargar identidad y libros solicitados.</p>
          </div>
        </div>
      </header>
      <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.72fr)] md:items-end md:p-5">
        <label htmlFor="recent-pwa-request" className="flex flex-col gap-1.5 text-sm font-semibold text-gray-800">
          Peticiones recibidas · cronológicas
          <select id="recent-pwa-request" value={selected ? selected.id : ''} onChange={(event) => onRequestChange(event.target.value)} className="h-11 w-full rounded-md border border-gray-400 bg-white px-3 text-sm text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]">
            <option value="">Selecciona una solicitud reciente</option>
            {requests.map((request) => {
              const profile = profiles.find((item) => item.id === request.profileId)
              return <option key={request.id} value={request.id}>{formatRequestDate(request.submittedAt)} · {profile?.name ?? request.profileId} · {request.itemCodes.length} {request.itemCodes.length === 1 ? 'ítem' : 'ítems'}</option>
            })}
          </select>
        </label>
        <p aria-live="polite" className="min-h-11 rounded-md bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
          {selected && selectedProfile ? <><span className="font-semibold text-slate-800">{selected.id}</span> · {selectedProfile.name} · recibida {formatRequestDate(selected.submittedAt)}</> : requests.length > 0 ? 'Las solicitudes confirmadas salen de esta cola temporal.' : 'No hay solicitudes PWA pendientes en esta demo.'}
        </p>
      </div>
    </section>
  )
}

export function LoanWorkspace() {
  const { state, update } = useDemoLibraryState()
  const [activeMode, setActiveMode] = useState<LoanMode>('digital')
  const [requestId, setRequestId] = useState<string | null>(() => state.requests[0]?.id ?? null)
  const [borrowerProfileId, setBorrowerProfileId] = useState<string | null>(() => state.requests[0]?.profileId ?? null)
  const [items, setItems] = useState<LoanItem[]>(() => itemsForRequest(state.requests[0]))
  const [feedback, setFeedback] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [formKey, setFormKey] = useState(0)
  const [damagePreexisting, setDamagePreexisting] = useState(false)
  const [hasEvidence, setHasEvidence] = useState(false)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const requests = useMemo(
    () => [...state.requests].sort((first, second) => second.submittedAt.localeCompare(first.submittedAt)),
    [state.requests],
  )
  const profile = state.profiles.find((item) => item.id === borrowerProfileId) ?? null
  const debtAmount = profile ? getOutstandingAmount(profile, state.fines) : 0
  const borrower: Borrower | null = profile ? borrowerFromProfile(profile, debtAmount) : null
  const remainingQuota = borrower ? borrower.loanLimit - borrower.activeLoans - items.length : 0

  function selectRequest(id: string) {
    const request = state.requests.find((item) => item.id === id)
    if (!request) return
    setActiveMode('digital')
    setRequestId(request.id)
    setBorrowerProfileId(request.profileId)
    setItems(itemsForRequest(request))
    setFeedback(null)
    setNotice(null)
  }

  function handleSearch(query: string) {
    const match = findDemoProfile(query, state.profiles)
    setFeedback(null)
    setNotice(null)
    if (!match) {
      setBorrowerProfileId(null)
      setRequestId(null)
      setItems([])
      setFeedback('No encontramos una identidad registrada. Verifica la cédula o matrícula antes de continuar.')
      return
    }

    const matchingRequest = state.requests.find((request) => request.profileId === match.id)
    setBorrowerProfileId(match.id)
    setRequestId(matchingRequest?.id ?? null)
    setItems(itemsForRequest(matchingRequest))
    if (matchingRequest) setFeedback(`Identidad y ${matchingRequest.itemCodes.length} ítems precargados desde ${matchingRequest.id}.`)
  }

  function handleAdd(query: string) {
    if (!borrower) {
      setFeedback('Primero identifica a la persona prestataria.')
      return
    }
    if (remainingQuota <= 0) {
      setFeedback('AVISO: El límite de préstamos quedaría excedido para esta identidad.')
      return
    }
    const normalized = query.trim().toUpperCase()
    const match = ITEM_BY_CODE.get(normalized)
    if (!match) {
      setFeedback('No encontramos ese código de ejemplar en el catálogo de demostración.')
      return
    }
    if (items.some((item) => item.code === match.code)) {
      setFeedback(`El ejemplar ${match.code} ya está en la lista.`)
      return
    }
    setItems((current) => [...current, match])
    setFeedback(`Agregado: ${match.code} · ${match.title}`)
  }

  function handleRemove(code: string) {
    setItems((current) => current.filter((item) => item.code !== code))
    setFeedback(`Retirado: ${code}`)
  }

  function handleManualProfileCreated(createdProfile: DemoProfile) {
    setBorrowerProfileId(createdProfile.id)
    setRequestId(null)
    setItems([])
    setFeedback('Identidad manual registrada y lista para asociar ejemplares.')
    setNotice(null)
  }

  function handleConfirm() {
    if (!borrower || items.length === 0 || isProfileBlocked(profile!, state.fines)) return
    const loanedCount = items.length
    const receipt = `PR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

    update((current) => ({
      ...current,
      profiles: current.profiles.map((item) => item.id === borrower.profileId
        ? { ...item, activeLoans: item.activeLoans + loanedCount }
        : item),
      requests: requestId ? current.requests.filter((request) => request.id !== requestId) : current.requests,
    }))
    setNotice({ receipt, message: `Préstamo de ${loanedCount} ${loanedCount === 1 ? 'ejemplar' : 'ejemplares'} registrado en esta sesión.` })
    setItems([])
    setBorrowerProfileId(null)
    setRequestId(null)
    setFeedback(null)
    setDamagePreexisting(false)
    setHasEvidence(false)
    setFormKey((key) => key + 1)
  }

  function handleCancel() {
    setItems([])
    setBorrowerProfileId(null)
    setRequestId(null)
    setFeedback('Operación cancelada. No se registró ningún préstamo.')
    setNotice(null)
    setDamagePreexisting(false)
    setHasEvidence(false)
    setFormKey((key) => key + 1)
  }

  function changeMode(mode: LoanMode) {
    if (mode === activeMode) return
    setActiveMode(mode)
    setBorrowerProfileId(null)
    setRequestId(null)
    setItems([])
    setFeedback(null)
    setNotice(null)
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    const nextIndex = event.key === 'ArrowRight'
      ? (currentIndex + 1) % 2
      : event.key === 'ArrowLeft'
        ? (currentIndex + 1) % 2
        : null
    if (nextIndex === null) return
    event.preventDefault()
    changeMode(nextIndex === 0 ? 'digital' : 'manual')
    tabRefs.current[nextIndex]?.focus()
  }

  const selectedRequest = requests.find((request) => request.id === requestId)

  return (
    <>
      <div role="note" className="mb-5 flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-950">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-700" />
        <p><strong>Demo interactiva:</strong> identidad, pagos y bloqueos se comparten entre pantallas solo durante esta sesión; no se guardan en Supabase y se reinician al recargar.</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2 border-b border-gray-300" role="tablist" aria-label="Tipo de préstamo">
        <button ref={(element) => { tabRefs.current[0] = element }} id="tab-direct-loan" type="button" role="tab" aria-selected={activeMode === 'digital'} aria-controls="panel-direct-loan" tabIndex={activeMode === 'digital' ? 0 : -1} onClick={() => changeMode('digital')} onKeyDown={(event) => handleTabKeyDown(event, 0)} className={`-mb-px inline-flex min-h-12 items-center gap-2 border-b-2 px-3 text-sm font-semibold transition sm:px-4 ${activeMode === 'digital' ? 'border-[#1E3A8A] text-[#1E3A8A]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
          <Smartphone aria-hidden="true" className="size-4" /> Préstamo Directo y Solicitudes PWA
        </button>
        <button ref={(element) => { tabRefs.current[1] = element }} id="tab-manual-loan" type="button" role="tab" aria-selected={activeMode === 'manual'} aria-controls="panel-manual-loan" tabIndex={activeMode === 'manual' ? 0 : -1} onClick={() => changeMode('manual')} onKeyDown={(event) => handleTabKeyDown(event, 1)} className={`-mb-px inline-flex min-h-12 items-center gap-2 border-b-2 px-3 text-sm font-semibold transition sm:px-4 ${activeMode === 'manual' ? 'border-[#1E3A8A] text-[#1E3A8A]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
          <BookOpenCheck aria-hidden="true" className="size-4" /> Préstamo Manual / Usuario Sin Cuenta
        </button>
      </div>

      <section id="panel-direct-loan" role="tabpanel" aria-labelledby="tab-direct-loan" hidden={activeMode !== 'digital'}>
        <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="flex min-w-0 flex-col gap-4 md:gap-6">
            <RequestSelector requests={requests} profiles={state.profiles} selectedRequestId={selectedRequest?.id ?? null} onRequestChange={selectRequest} />
            <BorrowerSection key={`direct-${borrower?.id ?? 'empty'}-${formKey}`} borrower={borrower} pendingItems={items.length} onSearch={handleSearch} onScan={() => handleSearch(selectedRequest?.profileId ?? 'V-27.845.391')} />
            {borrower?.status === 'SUSPENDIDO' && (
              <div role="alert" className="flex items-start gap-2.5 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <p><strong>Retiro bloqueado por deuda:</strong> saldo pendiente de {formatDemoCurrency(debtAmount)}. Registra el pago en Sanciones y cobros para habilitar el préstamo.</p>
              </div>
            )}
            <MaterialSection id="direct-material-section" items={items} canAdd={Boolean(borrower)} feedback={feedback} onAdd={handleAdd} onRemove={handleRemove} />
            <section aria-labelledby="preexisting-damage-title" className="rounded-md border border-gray-300 bg-white p-4 md:p-5">
              <label htmlFor="preexisting-damage" className="flex cursor-pointer items-start gap-3">
                <input id="preexisting-damage" type="checkbox" checked={damagePreexisting} onChange={(event) => { setDamagePreexisting(event.target.checked); if (!event.target.checked) setHasEvidence(false) }} className="mt-0.5 size-4 accent-[#1E3A8A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]" />
                <span><span id="preexisting-damage-title" className="block text-sm font-bold text-gray-900">Daño preexistente al retiro</span><span className="mt-1 block text-xs leading-5 text-gray-600">Marca la condición t0 antes de entregar el material. Al activar, puedes adjuntar una foto comprimida de menos de 300 KB.</span></span>
              </label>
              {damagePreexisting && <div className="mt-4"><ReturnEvidenceCapture onEvidenceChange={setHasEvidence} /></div>}
              {damagePreexisting && hasEvidence && <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800"><CalendarClock aria-hidden="true" className="size-4" /> Evidencia t0 adjunta en memoria de sesión.</p>}
            </section>
          </div>
          <LoanSummary id="direct-loan-summary" borrower={borrower} items={items} onConfirm={handleConfirm} onCancel={handleCancel} blockedMessage={borrower?.status === 'SUSPENDIDO' ? `Saldo pendiente ${formatDemoCurrency(debtAmount)}. Liquida las multas antes de confirmar.` : undefined} />
        </div>
      </section>

      <section id="panel-manual-loan" role="tabpanel" aria-labelledby="tab-manual-loan" hidden={activeMode !== 'manual'}>
        <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="flex min-w-0 flex-col gap-4 md:gap-6">
            <ManualBorrowerForm key={`manual-${formKey}`} onProfileCreated={handleManualProfileCreated} />
            {borrower && activeMode === 'manual' && (
              <section aria-label="Identidad seleccionada para el préstamo manual" className="flex flex-col gap-1 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
                <p className="font-bold">{borrower.name}</p>
                <p className="font-mono text-xs">{borrower.cedula || borrower.matricula || borrower.id} · {borrower.status === 'HABILITADO' ? 'Habilitado' : `Bloqueado · ${formatDemoCurrency(debtAmount)}`}</p>
              </section>
            )}
            {borrower?.status === 'SUSPENDIDO' && (
              <div role="alert" className="flex items-start gap-2.5 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <p><strong>Identidad bloqueada:</strong> saldo pendiente de {formatDemoCurrency(debtAmount)}. No se podrá confirmar el retiro mientras existan multas.</p>
              </div>
            )}
            <MaterialSection id="manual-material-section" items={items} canAdd={Boolean(borrower)} feedback={feedback} onAdd={handleAdd} onRemove={handleRemove} />
          </div>
          <LoanSummary id="manual-loan-summary" borrower={borrower} items={items} onConfirm={handleConfirm} onCancel={handleCancel} blockedMessage={borrower?.status === 'SUSPENDIDO' ? `Saldo pendiente ${formatDemoCurrency(debtAmount)}. Liquida las multas antes de confirmar.` : undefined} />
        </div>
      </section>

      {notice && <SuccessToast receipt={notice.receipt} message={notice.message} onDismiss={() => setNotice(null)} />}
    </>
  )
}
