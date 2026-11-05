import Image from 'next/image'
import { QRCodeSVG } from 'qrcode.react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BookOpenCheck, CalendarDays, CircleAlert, CircleCheck, QrCode } from 'lucide-react'
import type { ReadingHistoryEntry, StudentProfileData } from './profile-data'

function formatDate(date: string) {
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`))
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
}

export function StudentProfileView({
  student,
  history,
}: {
  student: StudentProfileData
  history: ReadingHistoryEntry[]
}) {
  const hasPendingFine = student.pendingFine > 0

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.65fr)]">
        <Card className="overflow-hidden border-0 bg-[#1E3A8A] text-white shadow-lg">
          <CardHeader className="relative z-10 border-b border-white/15 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100">Biblonexo · Carnet digital</p>
                <CardTitle className="mt-2 text-xl font-semibold text-white">Identificación de estudiante</CardTitle>
              </div>
              <span className="inline-flex size-10 items-center justify-center rounded-xl border border-white/20 bg-white/10" aria-hidden="true">
                <BookOpenCheck className="size-5" />
              </span>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 grid gap-6 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-6">
            <div className="flex min-w-0 flex-col gap-5">
              <div className="flex items-center gap-4">
                <Image
                  src={student.photo}
                  alt={`Fotografía de ${student.fullName}`}
                  width={88}
                  height={104}
                  priority
                  className="h-[6.5rem] w-[5.5rem] shrink-0 rounded-xl border-2 border-white/70 object-cover"
                />
                <div className="min-w-0">
                  <h2 className="text-xl font-bold leading-tight sm:text-2xl">{student.fullName}</h2>
                  <p className="mt-1 text-sm text-blue-100">{student.program}</p>
                  <p className="text-sm text-blue-100">{student.semester} · {student.campus}</p>
                </div>
              </div>
              <dl className="grid gap-x-6 gap-y-3 border-t border-white/15 pt-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200">Matrícula</dt>
                  <dd className="mt-1 font-mono text-base font-semibold tracking-wide">{student.enrollmentId}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200">Correo institucional</dt>
                  <dd className="mt-1 break-all font-medium">{student.email}</dd>
                </div>
              </dl>
              <div className="flex items-start gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs leading-relaxed text-blue-50">
                <QrCode aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <p>Presenta este carnet en el mostrador. El código identifica tu matrícula para lectura rápida en PC-01 y PC-02.</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-3 text-center text-slate-800 sm:self-center">
              <QRCodeSVG
                value={student.qrValue}
                size={132}
                level="M"
                title={`Código QR de matrícula ${student.enrollmentId}`}
                aria-label={`Código QR de matrícula ${student.enrollmentId}`}
              />
              <p className="font-mono text-xs font-bold tracking-widest">{student.enrollmentId}</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Escaneo rápido</p>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="border-b pb-4">
            <CardDescription className="font-semibold uppercase tracking-[0.14em]">Estado de cuenta</CardDescription>
            <CardTitle className="text-lg">Habilitación bibliotecaria</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 pt-1">
            <div className={`rounded-xl border p-4 ${hasPendingFine ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'}`}>
              <Badge
                variant="outline"
                className={`h-auto max-w-full whitespace-normal px-2.5 py-1.5 text-left font-bold leading-snug ${hasPendingFine ? 'border-rose-300 bg-white text-rose-800' : 'border-emerald-300 bg-white text-emerald-800'}`}
              >
                {hasPendingFine ? <CircleAlert data-icon="inline-start" /> : <CircleCheck data-icon="inline-start" />}
                {hasPendingFine ? 'BLOQUEADO POR MULTAS PENDIENTES' : 'AL DÍA · SIN DEUDAS'}
              </Badge>
              <p className={`mt-2 text-sm ${hasPendingFine ? 'text-rose-800' : 'text-emerald-800'}`}>
                {hasPendingFine
                  ? `Saldo pendiente: ${formatCurrency(student.pendingFine)}. Regulariza tu cuenta para volver a solicitar préstamos.`
                  : 'Tu cuenta está habilitada para solicitar y renovar materiales.'}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/60 p-3">
                <dt className="text-xs text-muted-foreground">Préstamos activos</dt>
                <dd className="mt-1 text-2xl font-bold">{student.activeLoans}</dd>
              </div>
              <div className="rounded-lg bg-muted/60 p-3">
                <dt className="text-xs text-muted-foreground">Multas pendientes</dt>
                <dd className="mt-1 text-lg font-bold">{formatCurrency(student.pendingFine)}</dd>
              </div>
            </dl>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays aria-hidden="true" className="size-4 shrink-0" />
              Última actualización de cuenta: 2 de noviembre de 2026
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b pb-4">
          <CardDescription className="font-semibold uppercase tracking-[0.14em]">Actividad personal</CardDescription>
          <CardTitle className="text-lg">Historial de lectura</CardTitle>
          <p className="text-sm text-muted-foreground">Tus préstamos y devoluciones más recientes.</p>
        </CardHeader>
        <CardContent className="pt-1">
          <Table>
            <caption className="sr-only">Historial personal de préstamos y devoluciones</caption>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Préstamo</TableHead>
                <TableHead>Devolución</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="min-w-56 whitespace-normal">
                    <span className="block font-semibold">{entry.title}</span>
                    <span className="text-xs text-muted-foreground">{entry.author} · {entry.id}</span>
                  </TableCell>
                  <TableCell>{formatDate(entry.borrowedAt)}</TableCell>
                  <TableCell>{formatDate(entry.returnedAt)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-800">{entry.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
