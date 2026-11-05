'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  BookMarked,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  LibraryBig,
  PackageCheck,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  DEMO_STUDENT_PROFILE_ID,
  getOutstandingAmount,
  useDemoLibraryState,
} from '@/components/circulacion/demo-library-state'
import { LoanCountdown } from './loan-countdown'

type DashboardLoan = {
  id: string
  title: string
  author: string
  cover: string
  dueAt: string
  copyCode: string
}

const ACTIVE_LOANS: DashboardLoan[] = [
  {
    id: 'loan-1',
    title: 'Álgebra lineal y sus aplicaciones',
    author: 'Gilbert Strang',
    cover: '/covers/algebra-lineal.png',
    dueAt: '2026-11-13T23:59:59-04:00',
    copyCode: 'EJ-MAT-204',
  },
  {
    id: 'loan-2',
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    cover: '/covers/cien-anos.png',
    dueAt: '2026-11-15T23:59:59-04:00',
    copyCode: 'EJ-LIT-118',
  },
]

const READING_METRICS = [
  {
    label: 'Libros leídos este año',
    value: '18',
    supporting: 'Buen ritmo de lectura',
    icon: <BookOpenCheck aria-hidden="true" />,
    tone: 'blue',
  },
  {
    label: 'Categoría favorita',
    value: 'Matemáticas',
    supporting: '60% de tus préstamos',
    icon: <LibraryBig aria-hidden="true" />,
    tone: 'violet',
  },
  {
    label: 'Libro más solicitado',
    value: 'Álgebra lineal',
    supporting: '4 veces este año',
    icon: <BookMarked aria-hidden="true" />,
    tone: 'amber',
  },
  {
    label: 'Frecuencia promedio',
    value: '1 libro',
    supporting: 'Cada 14 días',
    icon: <TrendingUp aria-hidden="true" />,
    tone: 'emerald',
  },
] as const

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-DO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Santo_Domingo',
  }).format(new Date(value))
}

function formatRD(amount: number) {
  return `RD$ ${amount.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function StudentDashboard() {
  const { state } = useDemoLibraryState()
  const student = state.profiles.find((profile) => profile.id === DEMO_STUDENT_PROFILE_ID)

  if (!student) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Card><CardContent className="p-6 text-sm text-muted-foreground">No se encontró el perfil estudiantil de esta sesión.</CardContent></Card>
      </div>
    )
  }

  const pendingFine = getOutstandingAmount(student, state.fines)
  const accountBlocked = pendingFine > 0

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-4 py-5 sm:px-6 md:py-8">
      <nav aria-label="Ruta de navegación" className="text-xs font-medium tracking-wide text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li>PORTAL ESTUDIANTIL</li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-bold text-foreground">INICIO</li>
        </ol>
      </nav>

      <section aria-labelledby="student-welcome-title">
        <Card className="overflow-hidden border-0 bg-[#1E3A8A] text-white shadow-lg">
          <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <Image
                src="/brand/student-profile.png"
                alt={`Fotografía de ${student.name}`}
                width={80}
                height={80}
                priority
                className="size-16 shrink-0 rounded-2xl border-2 border-white/70 object-cover sm:size-20"
              />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100">Tu espacio en Biblonexo</p>
                <h1 id="student-welcome-title" className="mt-1 text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
                  Bienvenido, {student.name}{' '}<span className="whitespace-nowrap">({student.matricula})</span>
                </h1>
                <p className="mt-1 text-sm text-blue-100">{student.career}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-white/30 bg-white/10 text-white">
                    <BookMarked data-icon="inline-start" /> {ACTIVE_LOANS.length} préstamos activos
                  </Badge>
                  <Link href="/estudiante/prestamos" className="inline-flex min-h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white">
                    Ver préstamos <ArrowRight aria-hidden="true" className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 border-t border-white/20 pt-4 sm:items-end sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-100">Estado de cuenta</p>
              <Badge
                variant="outline"
                className={cn(
                  'h-auto max-w-full whitespace-normal border px-3 py-2 text-sm font-bold',
                  accountBlocked
                    ? 'border-rose-200 bg-rose-50 text-rose-900'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-900',
                )}
              >
                {accountBlocked
                  ? <CircleAlert data-icon="inline-start" />
                  : <CheckCircle2 data-icon="inline-start" />}
                {accountBlocked ? `MULTA PENDIENTE: ${formatRD(pendingFine)}` : 'AL DÍA · SIN DEUDAS'}
              </Badge>
              {accountBlocked && <p className="text-xs text-blue-100">Regulariza el saldo para habilitar nuevas solicitudes.</p>}
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="notifications-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Centro de alertas</p>
            <h2 id="notifications-title" className="mt-1 text-xl font-bold text-slate-950">Notificaciones prioritarias</h2>
          </div>
          <Badge variant="secondary" className="rounded-full">3 avisos</Badge>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          <NotificationCard
            label="Vencimiento próximo"
            title="Cien años de soledad vence pronto"
            description="Devuelve el ejemplar antes del 15 de noviembre para evitar una multa por mora."
            icon={<Clock3 aria-hidden="true" />}
            tone="amber"
            href="/estudiante/prestamos"
            action="Revisar préstamo"
          />
          <NotificationCard
            label="Disponibilidad FIFO"
            title="Tu reserva está lista"
            description="Fundamentos de bases de datos ya está disponible para retiro en el mostrador."
            icon={<PackageCheck aria-hidden="true" />}
            tone="blue"
            href="/estudiante/prestamos"
            action="Ver reserva"
          />
          <NotificationCard
            label="Auditoría resuelta"
            title="Incidencia revisada por biblioteca"
            description="La revisión del reporte de “Álgebra lineal” quedó cerrada por administración."
            icon={<ClipboardCheck aria-hidden="true" />}
            tone="emerald"
            href="/estudiante/incidencias?tab=history"
            action="Ver historial"
          />
        </div>
      </section>

      <section aria-labelledby="active-loans-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Seguimiento rápido</p>
            <h2 id="active-loans-heading" className="mt-1 text-xl font-bold text-slate-950">Préstamos activos</h2>
          </div>
          <Link href="/estudiante/prestamos" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2')}>
            Ver Todos <ArrowRight data-icon="inline-end" />
          </Link>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {ACTIVE_LOANS.map((loan) => <ActiveLoanCard key={loan.id} loan={loan} />)}
        </div>
      </section>

      <section aria-labelledby="reading-stats-heading">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Tus hábitos</p>
          <h2 id="reading-stats-heading" className="mt-1 text-xl font-bold text-slate-950">Estadísticas de lectura</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {READING_METRICS.map((metric) => <ReadingMetricCard key={metric.label} {...metric} />)}
        </div>
      </section>

      <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-900">
        Resumen de ejemplo para esta vista de demostración. Las fechas, notificaciones y métricas se sincronizarán con los datos de tu cuenta.
      </p>
    </div>
  )
}

function NotificationCard({
  label,
  title,
  description,
  icon,
  tone,
  href,
  action,
}: {
  label: string
  title: string
  description: string
  icon: ReactNode
  tone: 'amber' | 'blue' | 'emerald'
  href: string
  action: string
}) {
  const toneClasses = {
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  }[tone]

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <span className={cn('inline-flex size-10 shrink-0 items-center justify-center rounded-xl border', toneClasses)} aria-hidden="true">{icon}</span>
          <Badge variant="outline" className={cn('h-auto whitespace-normal px-2 py-1 text-[10px] font-bold uppercase tracking-wide', toneClasses)}>{label}</Badge>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <Link href={href} className="inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-[#1E3A8A] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]">
          {action} <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </CardContent>
    </Card>
  )
}

function ActiveLoanCard({ loan }: { loan: DashboardLoan }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex gap-4 p-4 sm:gap-5 sm:p-5">
        <Image
          src={loan.cover}
          alt={`Portada de ${loan.title}`}
          width={76}
          height={112}
          className="h-28 w-[4.75rem] shrink-0 rounded-lg border border-border object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold leading-snug text-slate-950">{loan.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{loan.author}</p>
            </div>
            <Badge variant="secondary" className="shrink-0">{loan.copyCode}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <CalendarClock aria-hidden="true" className="size-4" />
            <span>Devolución: <time dateTime={loan.dueAt}>{formatDate(loan.dueAt)}</time></span>
          </div>
          <LoanCountdown dueAt={loan.dueAt} />
        </div>
      </CardContent>
    </Card>
  )
}

function ReadingMetricCard({
  label,
  value,
  supporting,
  icon,
  tone,
}: {
  label: string
  value: string
  supporting: string
  icon: ReactNode
  tone: 'blue' | 'violet' | 'amber' | 'emerald'
}) {
  const toneClasses = {
    blue: 'bg-blue-50 text-[#1E3A8A]',
    violet: 'bg-violet-50 text-violet-800',
    amber: 'bg-amber-50 text-amber-800',
    emerald: 'bg-emerald-50 text-emerald-800',
  }[tone]

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <CardDescription className="max-w-[12rem] leading-5">{label}</CardDescription>
        <span className={cn('inline-flex size-9 shrink-0 items-center justify-center rounded-lg', toneClasses)} aria-hidden="true">{icon}</span>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-bold leading-tight text-slate-950">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{supporting}</p>
      </CardContent>
    </Card>
  )
}
