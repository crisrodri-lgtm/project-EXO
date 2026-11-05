'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BookMarked,
  CalendarDays,
  Clock3,
  Hash,
  ListOrdered,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoanAccessStatus } from '@/components/estudiante/loan-access-status'
import { LoanCountdown } from '@/components/estudiante/loan-countdown'

type ActiveLoan = {
  id: string
  title: string
  author: string
  copyCode: string
  checkedOutAt: string
  dueAt: string
  cover: string
}

type Reservation = {
  id: string
  title: string
  author: string
  queuePosition: number
  placedAt: string
}

const ACTIVE_LOANS: ActiveLoan[] = [
  {
    id: 'loan-1',
    title: 'Álgebra lineal y sus aplicaciones',
    author: 'Gilbert Strang',
    copyCode: 'EJ-MAT-204',
    checkedOutAt: '2026-10-21',
    dueAt: '2026-11-13',
    cover: '/covers/algebra-lineal.png',
  },
  {
    id: 'loan-2',
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    copyCode: 'EJ-LIT-118',
    checkedOutAt: '2026-10-24',
    dueAt: '2026-11-15',
    cover: '/covers/cien-anos.png',
  },
]

const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'reservation-1',
    title: 'Fundamentos de bases de datos',
    author: 'Abraham Silberschatz',
    queuePosition: 2,
    placedAt: '2026-10-26',
  },
  {
    id: 'reservation-2',
    title: 'Sistemas operativos modernos',
    author: 'Andrew S. Tanenbaum',
    queuePosition: 4,
    placedAt: '2026-10-28',
  },
]

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T12:00:00Z`))
}

function LoanCard({ loan }: { loan: ActiveLoan }) {
  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white py-0 shadow-sm ring-0">
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
        <CardTitle className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Préstamo activo</CardTitle>
        <Badge variant="secondary" className="rounded-full bg-emerald-50 px-2.5 text-emerald-800">En curso</Badge>
      </CardHeader>
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="relative mx-auto aspect-[2/3] w-32 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm sm:mx-0 sm:w-36">
            <Image src={loan.cover} alt={`Portada de ${loan.title}`} fill priority={loan.id === 'loan-1'} sizes="144px" className="object-cover" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold leading-snug text-slate-900 sm:text-xl">{loan.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{loan.author}</p>
            </div>
            <dl className="grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2 sm:p-4">
              <div className="flex items-start gap-2.5">
                <Hash aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-500" />
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Código de ejemplar</dt>
                  <dd className="mt-0.5 font-mono text-sm font-semibold text-slate-800">{loan.copyCode}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-500" />
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Fecha de retiro</dt>
                  <dd className="mt-0.5 text-sm font-medium text-slate-800">{formatDate(loan.checkedOutAt)}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5 sm:col-span-2">
                <CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-500" />
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Fecha límite de devolución</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-slate-900">{formatDate(loan.dueAt)}</dd>
                </div>
              </div>
            </dl>
            <LoanCountdown dueAt={`${loan.dueAt}T23:59:59-04:00`} />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-2 text-xs leading-5 text-slate-500">
                <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#1E3A8A]" />
                Reporta cualquier detalle del ejemplar antes de devolverlo.
              </p>
              <Link
                href="/estudiante/incidencias"
                className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#1E3A8A] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1E3A8A]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
              >
                <AlertTriangle aria-hidden="true" className="size-4" />
                Reportar Imperfecto / Daño
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ReservationCard({ reservation, onCancel }: { reservation: Reservation; onCancel: (id: string) => void }) {
  return (
    <Card className="gap-0 rounded-xl border border-slate-200 bg-white py-0 shadow-none ring-0">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1E3A8A]">
            <BookMarked aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-slate-900">{reservation.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{reservation.author}</p>
            <p className="mt-2 text-xs text-slate-500">Solicitud del {formatDate(reservation.placedAt)}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <Badge variant="outline" className="h-auto gap-1.5 rounded-full border-blue-200 bg-blue-50 px-3 py-1.5 font-semibold text-[#1E3A8A]">
            <ListOrdered aria-hidden="true" className="size-4" />
            Posición en Cola FIFO: #{reservation.queuePosition}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => onCancel(reservation.id)} className="min-h-9 border-slate-300 text-slate-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700">
            <RotateCcw data-icon="inline-start" />
            Cancelar Reserva
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function PrestamosPortal() {
  const [reservations, setReservations] = useState(INITIAL_RESERVATIONS)
  const [confirmation, setConfirmation] = useState('')

  function cancelReservation(id: string) {
    const reservation = reservations.find((item) => item.id === id)
    if (!reservation) return
    setReservations((current) => current.filter((item) => item.id !== id))
    setConfirmation(`Se canceló la reserva de “${reservation.title}”.`)
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-9 lg:py-9">
      <nav aria-label="Ruta de navegación" className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
        <span>Portal</span><span aria-hidden="true">/</span><span>Estudiante</span><span aria-hidden="true">/</span>
        <span aria-current="page" className="font-semibold text-slate-800">Mis préstamos</span>
      </nav>

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="outline" className="mb-3 rounded-full border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1E3A8A]">
            <BookMarked data-icon="inline-start" /> Portal estudiantil
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Mis préstamos y reservas</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Consulta tus ejemplares activos, controla las fechas de devolución y gestiona tu lugar en la cola de reservas.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm">
          <ShieldCheck aria-hidden="true" className="size-4 text-[#1E3A8A]" /> Cuenta protegida
        </div>
      </header>

      <LoanAccessStatus />

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <Card className="rounded-xl border border-slate-200 bg-white shadow-sm ring-0">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="inline-flex size-10 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A]"><BookMarked aria-hidden="true" className="size-5" /></span>
            <div><p className="text-xl font-bold text-slate-900">{ACTIVE_LOANS.length}</p><p className="text-xs text-slate-500">Préstamos activos</p></div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-slate-200 bg-white shadow-sm ring-0">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="inline-flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700"><Clock3 aria-hidden="true" className="size-5" /></span>
            <div><p className="text-xl font-bold text-slate-900">{reservations.length}</p><p className="text-xs text-slate-500">Reservas en cola FIFO</p></div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-slate-200 bg-white shadow-sm ring-0">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="inline-flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><CalendarDays aria-hidden="true" className="size-5" /></span>
            <div><p className="text-sm font-bold text-slate-900">{formatDate(ACTIVE_LOANS[0].dueAt)}</p><p className="text-xs text-slate-500">Próxima devolución</p></div>
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="active-loans-title" className="mb-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="active-loans-title" className="text-xl font-bold text-slate-900">Préstamos activos</h2>
            <p className="mt-1 text-sm text-slate-600">No olvides devolver cada ejemplar antes de su fecha límite.</p>
          </div>
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">{ACTIVE_LOANS.length} ejemplares</Badge>
        </div>
        <div className="flex flex-col gap-4">
          {ACTIVE_LOANS.map((loan) => <LoanCard key={loan.id} loan={loan} />)}
        </div>
      </section>

      <section aria-labelledby="reservations-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="reservations-title" className="text-xl font-bold text-slate-900">Reservas activas</h2>
            <p className="mt-1 text-sm text-slate-600">Tu turno se actualiza respetando el orden de llegada FIFO.</p>
          </div>
          <Badge variant="outline" className="rounded-full border-slate-300 px-3 py-1 text-xs">{reservations.length} en espera</Badge>
        </div>
        {confirmation && <p role="status" className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{confirmation}</p>}
        {reservations.length > 0 ? (
          <div className="flex flex-col gap-3">
            {reservations.map((reservation) => <ReservationCard key={reservation.id} reservation={reservation} onCancel={cancelReservation} />)}
          </div>
        ) : (
          <Card className="rounded-xl border border-dashed border-slate-300 bg-white shadow-none ring-0">
            <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
              <ListOrdered aria-hidden="true" className="size-7 text-slate-400" />
              <p className="font-semibold text-slate-800">No tienes reservas activas</p>
              <p className="text-sm text-slate-500">Puedes buscar otro título en el catálogo OPAC.</p>
              <Link href="/opac" className="mt-2 inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#1E3A8A] hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-[#1E3A8A]">
                Ir al catálogo <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
