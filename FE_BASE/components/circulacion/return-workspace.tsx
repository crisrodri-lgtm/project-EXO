'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  ContactRound,
  History,
  ListOrdered,
  LockKeyhole,
  Search,
  ScanBarcode,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SuccessToast } from '@/components/circulacion/success-toast'
import { ReturnEvidenceCapture } from '@/components/circulacion/return-evidence-capture'
import { demoIdentityKey, useDemoLibraryState } from '@/components/circulacion/demo-library-state'
import {
  dateDifferenceInDays,
  formatShortDate,
  getTodayISO,
  INITIAL_RETURN_LOANS,
  normalizeSearch,
  type BorrowerIdentity,
  type ReturnLoan,
} from '@/components/circulacion/return-data'

type MainTab = 'receive' | 'pending'
type LoanFilter = 'UPCOMING' | 'OVERDUE' | 'ALL'
type ReturnCondition = 'CLEAN' | 'DAMAGE'
type SuccessNotice = { receipt: string; message: string }
type SanctionRecord = { name: string; amount: number; detail: string }

function currencyLabel(amount: number) {
  return `RD$ ${amount.toLocaleString('es-DO')}`
}

function dueLabel(dueAt: string) {
  const days = dateDifferenceInDays(getTodayISO(), dueAt)
  if (days < 0) return `Vencido hace ${Math.abs(days)} ${Math.abs(days) === 1 ? 'día' : 'días'}`
  if (days === 0) return 'Vence hoy'
  return `Vence en ${days} ${days === 1 ? 'día' : 'días'}`
}

function isOverdue(dueAt: string) {
  return dueAt < getTodayISO()
}

function matchesSearch(loan: ReturnLoan, query: string) {
  const searchable = normalizeSearch([
    loan.copyCode,
    loan.title,
    loan.author,
    loan.currentHolder.name,
    loan.currentHolder.matricula,
    loan.currentHolder.cedula,
    loan.currentHolder.id,
  ].join(' '))
  return normalizeSearch(query).split(/\s+/).filter(Boolean).every((term) => searchable.includes(term))
}

function identityKey(holder: BorrowerIdentity) {
  const identity = holder.cedula || holder.matricula
  const type = holder.cedula ? 'cedula' : 'matricula'
  return `${type}:${normalizeSearch(identity)}`
}

function isHolderBlocked(holder: BorrowerIdentity, sanctions: Record<string, SanctionRecord>) {
  return Boolean(sanctions[identityKey(holder)])
}

function ChannelBadge({ channel }: { channel: BorrowerIdentity['channel'] }) {
  return channel === 'MANUAL' ? (
    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-900">Registro manual</Badge>
  ) : (
    <Badge variant="secondary" className="bg-blue-50 text-[#1E3A8A]">Cuenta PWA</Badge>
  )
}

function StatCard({ label, value, detail, icon: Icon, tone }: {
  label: string
  value: number
  detail: string
  icon: typeof BookOpen
  tone: 'blue' | 'amber' | 'rose' | 'slate'
}) {
  const iconTone = {
    blue: 'bg-blue-50 text-[#1E3A8A]',
    amber: 'bg-amber-50 text-amber-800',
    rose: 'bg-rose-50 text-rose-700',
    slate: 'bg-slate-100 text-slate-600',
  }[tone]
  return (
    <Card className="gap-0 border-slate-200 py-0 shadow-sm ring-0">
      <CardContent className="flex items-center gap-3 p-4">
        <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl ${iconTone}`}><Icon aria-hidden="true" className="size-5" /></span>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-none tabular-nums text-slate-900">{value}</p>
          <p className="mt-1 text-xs font-semibold text-slate-700">{label}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">{detail}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function LoanCandidate({ loan, blocked, onSelect }: { loan: ReturnLoan; blocked: boolean; onSelect: () => void }) {
  const overdue = isOverdue(loan.dueAt)
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className="group flex min-h-[76px] w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-blue-300 hover:bg-blue-50/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
      >
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-white"><BookOpen aria-hidden="true" className="size-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-bold text-slate-900">{loan.title}</span>
            <span className="font-mono text-[11px] text-slate-500">{loan.copyCode}</span>
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
            <span>{loan.currentHolder.name}</span><span aria-hidden="true">·</span><span>{loan.currentHolder.matricula}</span>
            <ChannelBadge channel={loan.currentHolder.channel} />
            {blocked && <Badge variant="destructive">Bloqueado</Badge>}
          </span>
        </span>
        <span className={`hidden shrink-0 text-right text-xs font-semibold sm:block ${overdue ? 'text-rose-700' : 'text-slate-600'}`}>
          <span className="block">{formatShortDate(loan.dueAt)}</span>
          <span className="mt-1 block font-normal">{dueLabel(loan.dueAt)}</span>
        </span>
        <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-slate-400 group-hover:text-[#1E3A8A]" />
      </button>
    </li>
  )
}

function SearchAndCandidates({ loans, sanctions, onSelect }: {
  loans: ReturnLoan[]
  sanctions: Record<string, SanctionRecord>
  onSelect: (loan: ReturnLoan) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [manualIdentifier, setManualIdentifier] = useState('')
  const [manualCopyCode, setManualCopyCode] = useState('')
  const [scanHint, setScanHint] = useState(false)
  const [feedback, setFeedback] = useState('')
  const activeLoans = loans.filter((loan) => loan.state === 'ACTIVE')
  const results = useMemo(() => {
    const matching = activeLoans.filter((loan) => matchesSearch(loan, query))
    return (query.trim() ? matching : [...matching].sort((a, b) => a.dueAt.localeCompare(b.dueAt))).slice(0, 5)
  }, [activeLoans, query])

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback('')
    if (!query.trim()) {
      setFeedback('Escribe un código, título, nombre, matrícula o cédula para buscar.')
      return
    }
    const normalizedQuery = normalizeSearch(query)
    const exactCode = activeLoans.find((loan) => normalizeSearch(loan.copyCode) === normalizedQuery)
    if (exactCode) {
      onSelect(exactCode)
      return
    }
    if (results.length === 1) onSelect(results[0])
    else if (results.length === 0) setFeedback('No encontramos un préstamo activo con esos datos. Verifica la matrícula/cédula o el código del ejemplar.')
    else setFeedback(`Encontramos ${results.length} coincidencias. Selecciona el ejemplar correcto.`)
  }

  function handleManualSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedIdentity = normalizeSearch(manualIdentifier)
    const normalizedCode = normalizeSearch(manualCopyCode)
    if (!normalizedIdentity) {
      setFeedback('Ingresa la matrícula o cédula del registro presencial.')
      return
    }
    const match = activeLoans.find((loan) => {
      const holder = loan.currentHolder
      const identityMatch = [holder.id, holder.matricula, holder.cedula, holder.name].some((value) => normalizeSearch(value) === normalizedIdentity)
      const codeMatch = !normalizedCode || normalizeSearch(loan.copyCode) === normalizedCode
      return holder.channel === 'MANUAL' && identityMatch && codeMatch
    })
    if (match) {
      setFeedback('Registro presencial localizado. Confirma el ejemplar y su estado físico antes de cerrar el préstamo.')
      onSelect(match)
    } else {
      setFeedback('No se localizó un préstamo manual activo con esa identidad y ejemplar. No se cerró ningún registro.')
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)]">
      <Card className="gap-0 border-slate-200 py-0 shadow-sm ring-0">
        <CardHeader className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <h2 className="text-base font-bold text-slate-900">Buscar préstamo para recibir</h2>
          <p className="text-xs leading-5 text-slate-500">Código de ejemplar, título, nombre, matrícula o cédula física.</p>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          <form onSubmit={handleSearchSubmit} role="search" aria-label="Buscar devolución" className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setFeedback('') }} placeholder="Ej. EJ-MAT-04 o 001-1287743-2" autoComplete="off" className="h-11 border-slate-300 bg-white pl-9" aria-label="Código, título, nombre, matrícula o cédula" />
            </div>
            <Button type="submit" className="min-h-11 bg-[#1E3A8A] px-4 text-white hover:bg-[#183174]">
              <Search data-icon="inline-start" /> Buscar
            </Button>
            <Button type="button" variant="outline" onClick={() => { setScanHint(true); inputRef.current?.focus() }} className="min-h-11 border-slate-300 bg-white px-3 text-slate-700">
              <ScanBarcode data-icon="inline-start" /> Escanear código
            </Button>
          </form>
          {scanHint && <p role="status" className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-900">El campo está listo para un lector USB/teclado. La integración con escáner físico se conectará en una siguiente fase.</p>}
          {feedback && <p role="status" className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-700">{feedback}</p>}

          <div className="mt-5 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">{query.trim() ? 'Coincidencias activas' : 'Próximas recepciones'}</h3>
              <p className="mt-1 text-[11px] text-slate-500">Selecciona un préstamo para verificarlo en mostrador.</p>
            </div>
            <Badge variant="outline" className="rounded-full border-slate-300">{results.length} {results.length === 1 ? 'registro' : 'registros'}</Badge>
          </div>
          {results.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-2" aria-label="Préstamos candidatos para devolución">
              {results.map((loan) => <LoanCandidate key={loan.id} loan={loan} blocked={isHolderBlocked(loan.currentHolder, sanctions)} onSelect={() => onSelect(loan)} />)}
            </ul>
          ) : (
            <p className="mt-3 rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">No hay préstamos activos que coincidan con la búsqueda.</p>
          )}
        </CardContent>
      </Card>

      <Card className="gap-0 border-slate-200 bg-slate-50 py-0 shadow-sm ring-0">
        <CardHeader className="border-b border-slate-200 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-white text-[#1E3A8A] shadow-sm"><ContactRound aria-hidden="true" className="size-5" /></span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Devolución sin cuenta PWA</h2>
              <p className="text-xs text-slate-500">Busca por el identificador capturado en mostrador.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          <form onSubmit={handleManualSearch} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
              Matrícula o cédula
              <Input value={manualIdentifier} onChange={(event) => setManualIdentifier(event.target.value)} placeholder="Ej. 001-1287743-2" autoComplete="off" className="h-10 border-slate-300 bg-white" />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
              Código de ejemplar <span className="font-normal text-slate-500">(opcional)</span>
              <Input value={manualCopyCode} onChange={(event) => setManualCopyCode(event.target.value)} placeholder="Ej. EJ-MAT-04" autoComplete="off" className="h-10 border-slate-300 bg-white font-mono" />
            </label>
            <Button type="submit" variant="outline" className="min-h-10 border-slate-300 bg-white text-slate-800">
              <Search data-icon="inline-start" /> Buscar registro manual
            </Button>
          </form>
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs leading-5 text-blue-900">
            <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            Si hay una sanción, la identidad física queda marcada como bloqueada en esta demo hasta liquidar la deuda.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CustodyAndLoanDetails({ loan, sanctions }: { loan: ReturnLoan; sanctions: Record<string, SanctionRecord> }) {
  const reservation = loan.reservationQueue[0]
  const currentBlocked = isHolderBlocked(loan.currentHolder, sanctions)
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)]">
      <Card className="gap-0 border-slate-200 py-0 shadow-sm ring-0">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Préstamo actual · último tenedor</p>
            <h2 className="mt-1 text-lg font-bold leading-snug text-slate-900">{loan.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{loan.author}</p>
          </div>
          <Badge variant="outline" className="font-mono text-xs">{loan.copyCode}</Badge>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-start gap-2.5">
                <UserRound aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-500" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Persona responsable</p>
                  <p className="mt-1 break-words text-sm font-bold text-slate-900">{loan.currentHolder.name}</p>
                  <p className="mt-0.5 text-xs text-slate-600">{loan.currentHolder.program}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5"><ChannelBadge channel={loan.currentHolder.channel} />{currentBlocked && <Badge variant="destructive">Bloqueo activo</Badge>}</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-start gap-2.5">
                <ContactRound aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-500" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Identidad vinculada</p>
                  <p className="mt-1 text-xs text-slate-700">Matrícula <span className="font-mono font-bold">{loan.currentHolder.matricula}</span></p>
                  <p className="mt-1 text-xs text-slate-700">Cédula <span className="font-mono font-bold">{loan.currentHolder.cedula}</span></p>
                </div>
              </div>
            </div>
          </div>
          <dl className="mt-3 grid gap-3 rounded-xl border border-slate-200 p-3 text-xs sm:grid-cols-3">
            <div><dt className="text-slate-500">Préstamo desde</dt><dd className="mt-1 font-semibold text-slate-800">{formatShortDate(loan.checkedOutAt)}</dd></div>
            <div><dt className="text-slate-500">Fecha límite</dt><dd className={`mt-1 font-semibold ${isOverdue(loan.dueAt) ? 'text-rose-700' : 'text-slate-800'}`}>{formatShortDate(loan.dueAt)} · {dueLabel(loan.dueAt)}</dd></div>
            <div><dt className="text-slate-500">Estado del ejemplar</dt><dd className="mt-1 font-semibold text-slate-800">{loan.itemState}</dd></div>
          </dl>
          {reservation && (
            <div role="status" className="mt-4 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-amber-950">
              <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-700" />
              <div>
                <p className="text-sm font-extrabold">⚠️ EJEMPLAR CON RESERVAS EN COLA FIFO</p>
                <p className="mt-1 text-xs leading-5">#{reservation.position} en espera: <span className="font-bold">{reservation.name}</span> · {reservation.identity}. Si la recepción queda limpia, el ejemplar se asigna automáticamente.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="gap-0 border-slate-200 py-0 shadow-sm ring-0">
        <CardHeader className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex items-start gap-2.5">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A]"><History aria-hidden="true" className="size-5" /></span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Trazabilidad de cadena de custodia</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">Historial de tenedores, incluidos préstamos manuales anteriores.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          {loan.selfReport && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-700" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">Auto-reporte preventivo del tenedor actual</p>
                  <p className="mt-1 text-xs leading-5 text-emerald-900">{loan.selfReport.description}</p>
                  <p className="mt-1 text-[11px] text-emerald-800">Registrado el {formatShortDate(loan.selfReport.reportedAt)} · condición previa a esta recepción</p>
                </div>
              </div>
            </div>
          )}
          <ol className="relative flex flex-col gap-0" aria-label="Historial de custodia">
            {loan.priorCustodians.map((record, index) => (
              <li key={record.borrower.id} className="relative flex gap-3 pb-4 last:pb-0">
                <span className="relative flex w-4 shrink-0 justify-center"><span className="mt-1.5 size-2.5 rounded-full border-2 border-slate-300 bg-white" />{index < loan.priorCustodians.length - 1 && <span aria-hidden="true" className="absolute bottom-0 top-4 w-px bg-slate-200" />}</span>
                <div className="min-w-0 flex-1 rounded-lg border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-800">Tenedor anterior · {record.borrower.name}</p>
                    <ChannelBadge channel={record.channel} />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600">Matrícula {record.borrower.matricula} · Cédula {record.borrower.cedula}</p>
                  <p className="mt-1 text-[11px] text-slate-500">Recibió el {formatShortDate(record.receivedAt)} · {record.channel === 'MANUAL' ? 'préstamo presencial histórico' : 'préstamo PWA'}</p>
                </div>
              </li>
            ))}
            <li className="relative flex gap-3">
              <span className="relative flex w-4 shrink-0 justify-center"><span className="mt-1.5 size-2.5 rounded-full border-2 border-[#1E3A8A] bg-blue-100" /></span>
              <div className="min-w-0 flex-1 rounded-lg border border-blue-200 bg-blue-50/60 p-3">
                <p className="text-xs font-bold text-[#1E3A8A]">Tenedor actual · {loan.currentHolder.name}</p>
                <p className="mt-1 text-[11px] text-slate-700">Matrícula {loan.currentHolder.matricula} · Cédula {loan.currentHolder.cedula}</p>
                <p className="mt-1 text-[11px] text-slate-600">Préstamo del {formatShortDate(loan.checkedOutAt)} · {loan.currentHolder.channel === 'MANUAL' ? 'registro manual' : 'cuenta PWA'}</p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}

function ResponsibilityOption({ id, holder, checked, disabled, label, note, onChange }: {
  id: string
  holder: BorrowerIdentity
  checked: boolean
  disabled?: boolean
  label: string
  note: string
  onChange: () => void
}) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${checked ? 'border-[#1E3A8A] bg-blue-50 ring-1 ring-blue-100' : 'border-slate-200 bg-white hover:border-slate-300'} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}>
      <input type="radio" name="responsible" value={holder.id} checked={checked} disabled={disabled} onChange={onChange} className="mt-1 size-4 accent-[#1E3A8A]" />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-900">{label} · {holder.name}<ChannelBadge channel={holder.channel} /></span>
        <span className="mt-1 block text-[11px] leading-5 text-slate-600">{note}</span>
        <span className="mt-1 block font-mono text-[10px] text-slate-500">Matrícula {holder.matricula} · Cédula {holder.cedula}</span>
      </span>
    </label>
  )
}

function ReturnAssessment({ loan, condition, onConditionChange, responsibleId, onResponsibleChange, damageDescription, onDamageDescriptionChange, amount, onAmountChange, hasEvidence, onEvidenceChange, onSubmit, processing, sanctions }: {
  loan: ReturnLoan
  condition: ReturnCondition
  onConditionChange: (condition: ReturnCondition) => void
  responsibleId: string
  onResponsibleChange: (id: string) => void
  damageDescription: string
  onDamageDescriptionChange: (description: string) => void
  amount: number
  onAmountChange: (amount: number) => void
  hasEvidence: boolean
  onEvidenceChange: (hasEvidence: boolean) => void
  onSubmit: () => void
  processing: boolean
  sanctions: Record<string, SanctionRecord>
}) {
  const selfReported = Boolean(loan.selfReport)
  const eligibleCustodians = [loan.currentHolder, ...loan.priorCustodians.map((record) => record.borrower)]
  const responsible = eligibleCustodians.find((holder) => holder.id === responsibleId)
  const canSubmit = condition === 'CLEAN' || (
    damageDescription.trim().length >= 8 &&
    amount > 0 &&
    Boolean(responsible) &&
    (!selfReported || responsible?.id !== loan.currentHolder.id)
  )

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <Card className="gap-0 border-slate-200 py-0 shadow-sm ring-0">
        <CardHeader className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <h2 className="text-base font-bold text-slate-900">Evaluador de estado físico</h2>
          <p className="text-xs leading-5 text-slate-500">La entrega solo se confirma después de la validación presencial.</p>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          <fieldset>
            <legend className="text-xs font-bold text-slate-700">Estado al recibir el ejemplar</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <label className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-3 ${condition === 'CLEAN' ? 'border-emerald-300 bg-emerald-50 ring-1 ring-emerald-100' : 'border-slate-200 bg-white'}`}>
                <input type="radio" name="return-condition" value="CLEAN" checked={condition === 'CLEAN'} onChange={() => onConditionChange('CLEAN')} className="size-4 accent-emerald-700" />
                <span><span className="block text-xs font-bold text-slate-900">Devolución limpia</span><span className="block text-[11px] text-slate-600">Sin novedades físicas</span></span>
              </label>
              <label className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-3 ${condition === 'DAMAGE' ? 'border-rose-300 bg-rose-50 ring-1 ring-rose-100' : 'border-slate-200 bg-white'}`}>
                <input type="radio" name="return-condition" value="DAMAGE" checked={condition === 'DAMAGE'} onChange={() => onConditionChange('DAMAGE')} className="size-4 accent-rose-700" />
                <span><span className="block text-xs font-bold text-slate-900">Presenta daño nuevo</span><span className="block text-[11px] text-slate-600">Requiere detalle y evaluación</span></span>
              </label>
            </div>
          </fieldset>

          {condition === 'DAMAGE' && (
            <div className="mt-5 flex flex-col gap-5 border-t border-slate-200 pt-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Imputación y trazabilidad</h3>
                {selfReported ? (
                  <div role="status" className="mt-2 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-900">
                    <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                    {loan.priorCustodians.length > 0
                      ? 'El tenedor actual queda exonerado: el historial muestra un auto-reporte preventivo anterior a esta recepción. La sanción se dirigirá a un tenedor anterior.'
                      : 'El tenedor actual queda exonerado por su auto-reporte. No hay un tenedor anterior trazable; deriva el caso a auditoría sin bloquear al tenedor actual.'}
                  </div>
                ) : (
                  <p className="mt-1 text-xs leading-5 text-slate-600">No hay auto-reporte preventivo para este préstamo. Se sugiere imputar el daño al tenedor actual.</p>
                )}
              </div>
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-xs font-bold text-slate-700">Responsable de la incidencia</legend>
                <ResponsibilityOption
                  id="current-holder"
                  holder={loan.currentHolder}
                  checked={responsibleId === loan.currentHolder.id}
                  disabled={selfReported}
                  label="Tenedor actual"
                  note={selfReported ? 'Exonerado por auto-reporte previo.' : 'Responsable sugerido; la matrícula/cédula quedará bloqueada hasta saldar la sanción.'}
                  onChange={() => onResponsibleChange(loan.currentHolder.id)}
                />
                {loan.priorCustodians.map((record, index) => (
                  <ResponsibilityOption
                    key={record.borrower.id}
                    id={`prior-holder-${record.borrower.id}`}
                    holder={record.borrower}
                    checked={responsibleId === record.borrower.id}
                    label={index === 0 ? 'Tenedor anterior' : `Tenedor previo ${index + 1}`}
                    note={`${record.channel === 'MANUAL' ? 'Registro presencial histórico' : 'Préstamo PWA'} · recibido ${formatShortDate(record.receivedAt)}. Se puede sancionar aunque no tenga cuenta activa.`}
                    onChange={() => onResponsibleChange(record.borrower.id)}
                  />
                ))}
              </fieldset>

              <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
                Detalle del daño nuevo
                <textarea value={damageDescription} onChange={(event) => onDamageDescriptionChange(event.target.value)} minLength={8} maxLength={500} rows={3} placeholder="Ej. Hoja quemada en la página 42; no figura en el auto-reporte." className="min-h-24 resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal leading-5 text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100" aria-describedby="damage-description-help" />
                <span id="damage-description-help" className="text-[11px] font-normal text-slate-500">Mínimo 8 caracteres · máximo 500.</span>
              </label>

              <label className="flex max-w-xs flex-col gap-1.5 text-xs font-semibold text-slate-700">
                Monto sugerido de sanción (RD$)
                <div className="relative">
                  <CircleDollarSign aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input type="number" min={1} step={50} value={amount} onChange={(event) => onAmountChange(Number(event.target.value))} className="h-10 border-slate-300 bg-white pl-9 font-mono" aria-label="Monto de sanción en pesos dominicanos" />
                </div>
                <span className="text-[11px] font-normal text-slate-500">Sugerencia demo para daño físico moderado: RD$ 450. Ajustable por el encargado.</span>
              </label>

              <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs leading-5 text-rose-900">
                <LockKeyhole aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <span><strong>Bloqueo inmediato:</strong> {responsible ? `la matrícula/cédula de ${responsible.name} queda bloqueada para nuevos préstamos hasta saldar la deuda.` : 'no se imputará al tenedor actual sin una persona responsable trazable.'}</span>
              </div>

              <ReturnEvidenceCapture onEvidenceChange={onEvidenceChange} />
            </div>
          )}

          <div className="mt-5 border-t border-slate-200 pt-4">
            <Button type="button" onClick={onSubmit} disabled={!canSubmit || processing} className={`min-h-11 w-full whitespace-normal px-3 py-2 text-center text-xs font-bold leading-5 text-white sm:text-sm ${condition === 'CLEAN' ? 'bg-[#1E3A8A] hover:bg-[#183174]' : 'bg-rose-700 hover:bg-rose-800'}`}>
              {condition === 'CLEAN' ? (
                <><CheckCircle2 data-icon="inline-start" />{loan.reservationQueue.length ? 'Registrar devolución limpia y liberar en FIFO' : 'Registrar devolución limpia'}</>
              ) : (
                <><AlertTriangle data-icon="inline-start" />Registrar devolución con daño y aplicar sanción</>
              )}
            </Button>
            {!canSubmit && condition === 'DAMAGE' && <p className="mt-2 text-center text-[11px] text-rose-700">Completa el detalle del daño y un monto mayor que cero para continuar.</p>}
            <p className="mt-2 text-center text-[11px] leading-5 text-slate-500">Acción de demostración en memoria; el préstamo no cambia a DEVUELTO en un sistema persistente.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 border-slate-200 bg-slate-50 py-0 shadow-sm ring-0">
        <CardHeader className="border-b border-slate-200 px-4 py-4 sm:px-5">
          <div className="flex items-start gap-2.5">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#1E3A8A] shadow-sm"><CalendarClock aria-hidden="true" className="size-5" /></span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Resumen de recepción</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">Verifica identidad, condición y destino antes de confirmar.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          <dl className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3"><dt className="text-xs text-slate-500">Ejemplar</dt><dd className="max-w-[65%] text-right text-xs font-bold text-slate-800">{loan.copyCode} · {loan.title}</dd></div>
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3"><dt className="text-xs text-slate-500">Entrega de</dt><dd className="text-right text-xs font-bold text-slate-800">{loan.currentHolder.name}</dd></div>
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3"><dt className="text-xs text-slate-500">Identidad física</dt><dd className="text-right font-mono text-[11px] font-semibold text-slate-700">{loan.currentHolder.matricula} · {loan.currentHolder.cedula}</dd></div>
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3"><dt className="text-xs text-slate-500">Evaluación</dt><dd className={`text-right text-xs font-bold ${condition === 'CLEAN' ? 'text-emerald-700' : 'text-rose-700'}`}>{condition === 'CLEAN' ? 'Limpia · sin novedades' : 'Daño nuevo · requiere sanción'}</dd></div>
            {condition === 'DAMAGE' && <>
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3"><dt className="text-xs text-slate-500">Responsable</dt><dd className="text-right text-xs font-bold text-slate-800">{responsible?.name ?? 'Sin responsable trazable'}</dd></div>
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3"><dt className="text-xs text-slate-500">Sanción demo</dt><dd className="text-right text-xs font-bold text-rose-700">{currencyLabel(amount || 0)}</dd></div>
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3"><dt className="text-xs text-slate-500">Evidencia</dt><dd className="text-right text-xs font-semibold text-slate-700">{hasEvidence ? 'Foto optimizada localmente' : 'Sin fotografía'}</dd></div>
            </>}
            <div className="flex items-start justify-between gap-4"><dt className="text-xs text-slate-500">Destino</dt><dd className="text-right text-xs font-bold text-slate-800">{condition === 'DAMAGE' ? 'Retenido · Auditoría' : loan.reservationQueue[0] ? `Reserva FIFO · ${loan.reservationQueue[0].name}` : 'Disponible para circulación'}</dd></div>
          </dl>
          {condition === 'CLEAN' && loan.reservationQueue[0] && (
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs leading-5 text-blue-950">
              <p className="font-bold">Reasignación FIFO automática</p>
              <p className="mt-1">Turno #1 · {loan.reservationQueue[0].name} ({loan.reservationQueue[0].identity}).</p>
            </div>
          )}
          {condition === 'DAMAGE' && responsible && sanctions[identityKey(responsible)] && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-900"><strong>Deuda demo existente:</strong> {currencyLabel(sanctions[identityKey(responsible)].amount)} · su identidad está bloqueada.</div>
          )}
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 text-[11px] leading-5 text-slate-600">
            <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#1E3A8A]" />
            El cambio de estado ocurre solo después de confirmar la recepción física en este flujo.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PendingLoansPanel({ loans, sanctions, onReceive }: { loans: ReturnLoan[]; sanctions: Record<string, SanctionRecord>; onReceive: (loan: ReturnLoan) => void }) {
  const [filter, setFilter] = useState<LoanFilter>('ALL')
  const [query, setQuery] = useState('')
  const today = getTodayISO()
  const horizon = new Date(`${today}T00:00:00Z`)
  horizon.setUTCDate(horizon.getUTCDate() + 3)
  const horizonISO = horizon.toISOString().slice(0, 10)
  const activeLoans = useMemo(() => loans
    .filter((loan) => loan.state === 'ACTIVE')
    .filter((loan) => matchesSearch(loan, query))
    .filter((loan) => {
      if (filter === 'OVERDUE') return loan.dueAt < today
      if (filter === 'UPCOMING') return loan.dueAt >= today && loan.dueAt <= horizonISO
      return true
    })
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt)), [loans, query, filter, today, horizonISO])

  const filters: Array<{ value: LoanFilter; label: string }> = [
    { value: 'UPCOMING', label: 'Próximos a vencer' },
    { value: 'OVERDUE', label: 'Vencidos / en mora' },
    { value: 'ALL', label: 'Todos los préstamos activos' },
  ]

  return (
    <Card className="gap-0 border-slate-200 py-0 shadow-sm ring-0">
      <CardHeader className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Devoluciones pendientes y cronograma de entregas</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">Préstamos activos ordenados por vencimiento, primero los más antiguos y vencidos.</p>
          </div>
          <div className="relative w-full xl:max-w-sm">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nombre, matrícula, cédula o título" className="h-10 border-slate-300 bg-white pl-9" aria-label="Filtrar préstamos activos" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar cronograma de préstamos">
          {filters.map((item) => (
            <Button key={item.value} type="button" variant={filter === item.value ? 'default' : 'outline'} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)} className={`min-h-9 ${filter === item.value ? 'bg-[#1E3A8A] text-white hover:bg-[#183174]' : 'border-slate-300 bg-white text-slate-700'}`}>
              {item.label}
            </Button>
          ))}
          <Badge variant="secondary" className="ml-auto self-center rounded-full px-3 py-1">{activeLoans.length} activos</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {activeLoans.length > 0 ? (
          <Table>
            <TableCaption className="sr-only">Préstamos activos ordenados cronológicamente por fecha de vencimiento.</TableCaption>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="pl-4 text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:pl-5">Vencimiento</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Ejemplar</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Tenedor / identidad</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Estado</TableHead>
                <TableHead className="pr-4 text-right text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:pr-5">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeLoans.map((loan) => {
                const overdue = loan.dueAt < today
                const isBlocked = isHolderBlocked(loan.currentHolder, sanctions)
                return (
                  <TableRow key={loan.id} className="bg-white">
                    <TableCell className="pl-4 sm:pl-5">
                      <span className={`block text-xs font-bold ${overdue ? 'text-rose-700' : 'text-slate-800'}`}>{formatShortDate(loan.dueAt)}</span>
                      <span className={`mt-1 block text-[10px] ${overdue ? 'font-semibold text-rose-700' : 'text-slate-500'}`}>{dueLabel(loan.dueAt)}</span>
                    </TableCell>
                    <TableCell className="max-w-64">
                      <span className="block truncate text-xs font-semibold text-slate-900">{loan.title}</span>
                      <span className="mt-1 block font-mono text-[10px] text-slate-500">{loan.copyCode}</span>
                      {loan.reservationQueue.length > 0 && <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-blue-800"><ListOrdered aria-hidden="true" className="size-3" />FIFO #{loan.reservationQueue[0].position}</span>}
                    </TableCell>
                    <TableCell className="min-w-52">
                      <span className="block text-xs font-semibold text-slate-800">{loan.currentHolder.name}</span>
                      <span className="mt-1 block font-mono text-[10px] text-slate-500">Mat. {loan.currentHolder.matricula} · C.I. {loan.currentHolder.cedula}</span>
                      <span className="mt-1 flex flex-wrap gap-1.5"><ChannelBadge channel={loan.currentHolder.channel} />{isBlocked && <Badge variant="destructive">Bloqueado</Badge>}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={overdue ? 'destructive' : 'secondary'}>{overdue ? 'En mora' : loan.dueAt === today ? 'Vence hoy' : 'Activo'}</Badge>
                    </TableCell>
                    <TableCell className="pr-4 text-right sm:pr-5">
                      <Button type="button" variant="outline" onClick={() => onReceive(loan)} className="min-h-10 border-slate-300 bg-white text-xs font-semibold text-slate-800">
                        <CheckCircle2 data-icon="inline-start" /> Registrar devolución
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <CalendarClock aria-hidden="true" className="size-8 text-slate-400" />
            <p className="text-sm font-semibold text-slate-800">No hay préstamos para este filtro</p>
            <p className="max-w-md text-xs leading-5 text-slate-500">Prueba otro estado o ajusta el término de búsqueda.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ReturnWorkspace() {
  const { state: demoState, update: updateDemoState } = useDemoLibraryState()
  const [loans, setLoans] = useState<ReturnLoan[]>(INITIAL_RETURN_LOANS)
  const [activeTab, setActiveTab] = useState<MainTab>('receive')
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null)
  const [condition, setCondition] = useState<ReturnCondition>('CLEAN')
  const [responsibleId, setResponsibleId] = useState('')
  const [damageDescription, setDamageDescription] = useState('')
  const [amount, setAmount] = useState(450)
  const [hasEvidence, setHasEvidence] = useState(false)
  const sanctions = useMemo(() => demoState.fines.reduce<Record<string, SanctionRecord>>((records, fine) => {
    if (fine.paid) return records
    const key = demoIdentityKey(fine)
    const current = records[key]
    records[key] = {
      name: fine.borrowerName,
      amount: (current?.amount ?? 0) + fine.amount,
      detail: fine.reason,
    }
    return records
  }, {}), [demoState.fines])
  const [notice, setNotice] = useState<SuccessNotice | null>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const selectedLoan = loans.find((loan) => loan.id === selectedLoanId && loan.state === 'ACTIVE') ?? null
  const activeLoans = loans.filter((loan) => loan.state === 'ACTIVE')
  const overdueCount = activeLoans.filter((loan) => isOverdue(loan.dueAt)).length
  const upcomingCount = activeLoans.filter((loan) => {
    const days = dateDifferenceInDays(getTodayISO(), loan.dueAt)
    return days >= 0 && days <= 3
  }).length
  const manualCount = activeLoans.filter((loan) => loan.currentHolder.channel === 'MANUAL').length
  useEffect(() => {
    if (!selectedLoan) {
      setResponsibleId('')
      return
    }
    setCondition('CLEAN')
    setDamageDescription('')
    setAmount(450)
    setHasEvidence(false)
    setResponsibleId(selectedLoan.selfReport
      ? selectedLoan.priorCustodians[0]?.borrower.id ?? ''
      : selectedLoan.currentHolder.id)
  }, [selectedLoan])

  function selectLoan(loan: ReturnLoan) {
    setSelectedLoanId(loan.id)
    setActiveTab('receive')
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    const nextIndex = event.key === 'ArrowRight' ? (currentIndex + 1) % 2 : event.key === 'ArrowLeft' ? (currentIndex + 1) % 2 : null
    if (nextIndex === null) return
    event.preventDefault()
    const nextTab = nextIndex === 0 ? 'receive' : 'pending'
    setActiveTab(nextTab)
    tabRefs.current[nextIndex]?.focus()
  }

  function recordReturn() {
    if (!selectedLoan) return
    if (condition === 'DAMAGE' && (!damageDescription.trim() || damageDescription.trim().length < 8 || amount <= 0)) return

    if (condition === 'CLEAN') {
      const firstReservation = selectedLoan.reservationQueue[0]
      setLoans((current) => current.map((loan) => loan.id === selectedLoan.id ? {
        ...loan,
        state: 'RETURNED',
        itemState: firstReservation ? 'RESERVADO' : 'DISPONIBLE',
        assignedTo: firstReservation?.name,
        reservationQueue: firstReservation ? loan.reservationQueue.slice(1) : loan.reservationQueue,
      } : loan))
      setNotice({
        receipt: `DEV-${String(Date.now()).slice(-7)}`,
        message: firstReservation
          ? `Devolución registrada. El ejemplar ha sido reservado y asignado a ${firstReservation.name} (Turno #${firstReservation.position} FIFO).`
          : 'Devolución registrada. El ejemplar quedó disponible para nuevos préstamos.',
      })
    } else {
      const responsible = [selectedLoan.currentHolder, ...selectedLoan.priorCustodians.map((record) => record.borrower)].find((holder) => holder.id === responsibleId)
      if (!responsible) return
      const profileKey = demoIdentityKey(responsible)
      updateDemoState((current) => {
        const existingProfile = current.profiles.find((profile) => demoIdentityKey(profile) === profileKey)
        const profileId = existingProfile?.id ?? responsible.id
        const profile = existingProfile ?? {
          id: profileId,
          name: responsible.name,
          cedula: responsible.cedula,
          matricula: responsible.matricula,
          email: '',
          phone: '',
          channel: responsible.channel,
          career: responsible.program,
          activeLoans: 0,
          loanLimit: 3,
          status: 'BLOQUEADO' as const,
        }
        return {
          ...current,
          profiles: existingProfile
            ? current.profiles.map((item) => demoIdentityKey(item) === profileKey ? { ...item, status: 'BLOQUEADO' as const } : item)
            : [...current.profiles, profile],
          fines: [...current.fines, {
            id: `INC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
            profileId,
            borrowerName: responsible.name,
            cedula: responsible.cedula,
            matricula: responsible.matricula,
            issuedAt: getTodayISO(),
            reason: `Daño en devolución · ${damageDescription.trim()}`,
            amount,
            paid: false,
          }],
        }
      })
      setLoans((current) => current.map((loan) => loan.id === selectedLoan.id ? { ...loan, state: 'RETURNED', itemState: 'EN AUDITORÍA' } : loan))
      setNotice({
        receipt: `INC-${String(Date.now()).slice(-7)}`,
        message: `Devolución con daño registrada. Se aplicó ${currencyLabel(amount)} a ${responsible.name} y su matrícula/cédula quedó bloqueada para nuevos préstamos en esta demo.`,
      })
    }

    setSelectedLoanId(null)
    setActiveTab('pending')
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 xl:px-9">
      <nav aria-label="Ruta de navegación" className="mb-4 flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-slate-500 sm:text-xs">
        <span>ADMINISTRACIÓN</span><span aria-hidden="true">/</span><span>CIRCULACIÓN</span><span aria-hidden="true">/</span><span aria-current="page" className="text-slate-800">DEVOLUCIONES</span>
      </nav>
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="outline" className="mb-3 rounded-full border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1E3A8A]">Pantalla 9 · Circulación en mostrador</Badge>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Recepción de devoluciones</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Verifica al último tenedor, registra el estado físico y respeta la trazabilidad y el orden FIFO antes de cerrar cada préstamo.</p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 shadow-sm lg:self-auto">
          <Clock3 aria-hidden="true" className="size-4 text-[#1E3A8A]" /> Actualizado al {formatShortDate(getTodayISO())}
        </div>
      </header>

      <div role="note" className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-950">
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-700" />
        <p><strong>Modo de demostración:</strong> las sanciones y bloqueos se comparten en memoria con préstamo, caja y PWA mientras esta sesión permanezca abierta. No hay escritura a Supabase; los cambios se reinician al recargar.</p>
      </div>

      <section aria-label="Resumen de circulación" className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Préstamos activos" value={activeLoans.length} detail="Pendientes de recepción física" icon={BookOpen} tone="blue" />
        <StatCard label="En mora" value={overdueCount} detail="Requieren atención prioritaria" icon={AlertTriangle} tone="rose" />
        <StatCard label="Próximos a vencer" value={upcomingCount} detail="Dentro de los próximos 3 días" icon={CalendarClock} tone="amber" />
        <StatCard label="Registros manuales" value={manualCount} detail="Identificados por cédula/matrícula" icon={ContactRound} tone="slate" />
      </section>

      <div className="mb-5 flex flex-wrap gap-2 border-b border-slate-200" role="tablist" aria-label="Secciones de devoluciones">
        <button ref={(element) => { tabRefs.current[0] = element }} id="tab-receive" type="button" role="tab" aria-selected={activeTab === 'receive'} aria-controls="panel-receive" tabIndex={activeTab === 'receive' ? 0 : -1} onClick={() => setActiveTab('receive')} onKeyDown={(event) => handleTabKeyDown(event, 0)} className={`-mb-px inline-flex min-h-11 items-center gap-2 border-b-2 px-3 text-sm font-semibold transition ${activeTab === 'receive' ? 'border-[#1E3A8A] text-[#1E3A8A]' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>
          <CheckCircle2 aria-hidden="true" className="size-4" /> Recepción en mostrador
        </button>
        <button ref={(element) => { tabRefs.current[1] = element }} id="tab-pending" type="button" role="tab" aria-selected={activeTab === 'pending'} aria-controls="panel-pending" tabIndex={activeTab === 'pending' ? 0 : -1} onClick={() => setActiveTab('pending')} onKeyDown={(event) => handleTabKeyDown(event, 1)} className={`-mb-px inline-flex min-h-11 items-center gap-2 border-b-2 px-3 text-sm font-semibold transition ${activeTab === 'pending' ? 'border-[#1E3A8A] text-[#1E3A8A]' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>
          <ListOrdered aria-hidden="true" className="size-4" /> Devoluciones pendientes <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] tabular-nums text-slate-700">{activeLoans.length}</span>
        </button>
      </div>

      <section id="panel-receive" role="tabpanel" aria-labelledby="tab-receive" hidden={activeTab !== 'receive'} className="flex flex-col gap-4">
        <SearchAndCandidates loans={loans} sanctions={sanctions} onSelect={selectLoan} />
        {selectedLoan ? (
          <>
            <CustodyAndLoanDetails loan={selectedLoan} sanctions={sanctions} />
            <ReturnAssessment
              key={selectedLoan.id}
              loan={selectedLoan}
              condition={condition}
              onConditionChange={setCondition}
              responsibleId={responsibleId}
              onResponsibleChange={setResponsibleId}
              damageDescription={damageDescription}
              onDamageDescriptionChange={setDamageDescription}
              amount={amount}
              onAmountChange={setAmount}
              hasEvidence={hasEvidence}
              onEvidenceChange={setHasEvidence}
              onSubmit={recordReturn}
              processing={false}
              sanctions={sanctions}
            />
          </>
        ) : (
          <Card className="border-dashed border-slate-300 bg-slate-50 shadow-none ring-0">
            <CardContent className="flex flex-col items-center gap-2 p-8 text-center sm:p-10">
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white text-[#1E3A8A] shadow-sm"><ScanBarcode aria-hidden="true" className="size-6" /></span>
              <h2 className="mt-1 text-sm font-bold text-slate-900">Selecciona un préstamo para iniciar la verificación</h2>
              <p className="max-w-xl text-xs leading-5 text-slate-500">La búsqueda incluye préstamos PWA y registros manuales. El estado solo se confirma después de validar la entrega física.</p>
            </CardContent>
          </Card>
        )}
      </section>

      <section id="panel-pending" role="tabpanel" aria-labelledby="tab-pending" hidden={activeTab !== 'pending'}>
        <PendingLoansPanel loans={loans} sanctions={sanctions} onReceive={selectLoan} />
      </section>

      {notice && <SuccessToast receipt={notice.receipt} message={notice.message} receiptLabel="Registro:" onDismiss={() => setNotice(null)} />}
    </div>
  )
}
