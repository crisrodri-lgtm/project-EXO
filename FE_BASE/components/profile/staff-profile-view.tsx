import Link from 'next/link'
import {
  ArrowUpRight,
  ClipboardCheck,
  Clock3,
  FileWarning,
  ShieldCheck,
  UserRoundCheck,
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
import type { PendingAuditTask, StaffProfileData } from './profile-data'

export function StaffProfileView({
  staff,
  pendingTasks,
}: {
  staff: StaffProfileData
  pendingTasks: PendingAuditTask[]
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)]">
        <Card className="h-full">
          <CardHeader className="border-b pb-4">
            <CardDescription className="font-semibold uppercase tracking-[0.14em]">Ficha del funcionario</CardDescription>
            <CardTitle className="text-lg">Información de cuenta</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 pt-1">
            <div className="flex items-center gap-4">
              <span className="inline-flex size-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-lg font-bold text-[#1E3A8A]" aria-hidden="true">
                {staff.initials}
              </span>
              <div className="min-w-0">
                <h2 className="text-xl font-bold leading-tight">{staff.fullName}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{staff.email}</p>
              </div>
            </div>
            <dl className="grid gap-3 rounded-xl bg-muted/50 p-4 sm:grid-cols-2 xl:grid-cols-1">
              <div>
                <dt className="text-xs text-muted-foreground">Código de empleado</dt>
                <dd className="mt-1 font-mono text-base font-bold tracking-wide">{staff.employeeId}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Permisos habilitados</dt>
                <dd className="mt-1 text-sm font-medium">{staff.permissions}</dd>
              </div>
            </dl>
            <Badge variant="outline" className="h-auto w-fit max-w-full whitespace-normal border-blue-200 bg-blue-50 px-3 py-1.5 font-bold text-[#1E3A8A]">
              <ShieldCheck data-icon="inline-start" />
              {staff.roleLabel}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardDescription className="font-semibold uppercase tracking-[0.14em]">Trabajo de hoy</CardDescription>
                <CardTitle className="mt-1 text-lg">Auditorías y pendientes</CardTitle>
              </div>
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700" aria-hidden="true">
                <FileWarning className="size-5" />
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Casos de material dañado que aún requieren dictamen en Pantalla 3.</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-1">
            {pendingTasks.map((task) => (
              <article key={task.id} className="rounded-xl border border-border p-3.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold">{task.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{task.detail}</p>
                  </div>
                  <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">Pendiente</Badge>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock3 aria-hidden="true" className="size-3.5" />
                    {task.source} · {task.reportedAt}
                  </span>
                  <Link
                    href={`/admin/auditoria/incidencias?caso=${encodeURIComponent(task.id)}`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-8')}
                  >
                    Revisar caso <ArrowUpRight data-icon="inline-end" />
                  </Link>
                </div>
              </article>
            ))}
            {pendingTasks.length === 0 && (
              <p className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">No hay casos pendientes de dictamen.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="staff-quick-access-title" className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Atajos del funcionario</p>
          <h2 id="staff-quick-access-title" className="mt-1 text-lg font-semibold">Accesos rápidos</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="flex flex-col justify-between">
            <CardHeader>
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-blue-50 text-[#1E3A8A]" aria-hidden="true">
                <ClipboardCheck className="size-5" />
              </span>
              <CardTitle className="mt-2">Auditoría e incidencias</CardTitle>
              <CardDescription>Dictamina daños, revisa auto-reportes y cierra casos pendientes en Pantalla 3.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/auditoria/incidencias" className={cn(buttonVariants({ variant: 'default', size: 'lg' }), 'w-full justify-between')}>
                Abrir auditoría <ArrowUpRight data-icon="inline-end" />
              </Link>
            </CardContent>
          </Card>
          <Card className="flex flex-col justify-between">
            <CardHeader>
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800" aria-hidden="true">
                <UserRoundCheck className="size-5" />
              </span>
              <CardTitle className="mt-2">Aprobación de usuarios</CardTitle>
              <CardDescription>Gestiona solicitudes de registro y cuentas pendientes de aprobación en Pantalla 12.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/usuarios?tab=aprobaciones" className={cn(buttonVariants({ variant: 'default', size: 'lg' }), 'w-full justify-between')}>
                Revisar solicitudes <ArrowUpRight data-icon="inline-end" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
