import Link from 'next/link'
import { ArrowLeft, Settings2, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ProfileSettings } from './profile-settings'
import { FirstOtpPasswordGate } from './first-otp-password-gate'
import { StaffProfileView } from './staff-profile-view'
import { StudentProfileView } from './student-profile-view'
import {
  getStaffProfile,
  getStudentProfile,
  PENDING_AUDIT_TASKS,
  READING_HISTORY,
  type DemoAccountScenario,
  type StaffRole,
} from './profile-data'

type ProfileTab = 'informacion' | 'configuracion'
type ProfileKind = 'ESTUDIANTE' | 'FUNCIONARIO'

export function ProfileDashboard({
  kind,
  initialTab,
  staffRole = 'ADMINISTRADOR',
  demoScenario = 'actual',
  requirePasswordUpdate = false,
}: {
  kind: ProfileKind
  initialTab: ProfileTab
  staffRole?: StaffRole
  demoScenario?: DemoAccountScenario
  requirePasswordUpdate?: boolean
}) {
  const isStudent = kind === 'ESTUDIANTE'
  const profilePath = isStudent ? '/estudiante/perfil' : '/admin/perfil'
  const queryParams = new URLSearchParams()
  if (!isStudent && staffRole === 'AUXILIAR') queryParams.set('demoRole', 'auxiliar')
  if (isStudent && demoScenario !== 'actual') queryParams.set('demo', demoScenario)
  const profileQuery = queryParams.toString()
  const informationHref = profileQuery ? `${profilePath}?${profileQuery}` : profilePath
  const settingsParams = new URLSearchParams(queryParams)
  settingsParams.set('tab', 'configuracion')
  const settingsHref = `${profilePath}?${settingsParams.toString()}`
  const otpReturnHref = isStudent
    ? '/estudiante/perfil'
    : `/admin/perfil${staffRole === 'AUXILIAR' ? '?demoRole=auxiliar' : ''}`
  const student = isStudent ? getStudentProfile(demoScenario) : null
  const staff = isStudent ? null : getStaffProfile(staffRole)
  const account = student ?? { activeLoans: 0, pendingFine: 0 }
  const requester = student
    ? { userId: student.userId, fullName: student.fullName, identifier: student.enrollmentId, email: student.email, role: 'ESTUDIANTE' as const }
    : { userId: staff?.employeeId ?? '', fullName: staff?.fullName ?? '', identifier: staff?.employeeId ?? '', email: staff?.email ?? '', role: staffRole }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 md:py-8">
      <FirstOtpPasswordGate open={requirePasswordUpdate} returnHref={otpReturnHref} />
      <nav aria-label="Ruta de navegación" className="text-xs font-medium tracking-wide text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href={isStudent ? '/estudiante/dashboard' : '/admin/dashboard'} className="hover:text-foreground">{isStudent ? 'PORTAL ESTUDIANTIL' : 'ADMINISTRACIÓN'}</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-bold text-foreground">MI PERFIL</li>
        </ol>
      </nav>

      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1E3A8A]">Cuenta personal · Pantalla 11</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Mi perfil</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {isStudent
              ? 'Tu carnet digital, estado de cuenta e historial de lectura en un solo lugar.'
              : 'Tu ficha de funcionario, pendientes de auditoría y accesos de trabajo.'}
          </p>
        </div>
        <Badge variant="outline" className="h-auto w-fit gap-1.5 px-3 py-1.5 text-xs font-semibold">
          {isStudent ? <UserRound data-icon="inline-start" /> : <Settings2 data-icon="inline-start" />}
          {isStudent ? 'ESTUDIANTE' : staff?.roleLabel}
        </Badge>
      </header>

      <nav aria-label="Secciones del perfil" className="flex w-full max-w-md gap-1 rounded-xl border border-border bg-white p-1">
        <Link
          href={informationHref}
          aria-current={initialTab === 'informacion' ? 'page' : undefined}
          className={cn(
            'inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]',
            initialTab === 'informacion' ? 'bg-[#1E3A8A] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          )}
        >
          <UserRound aria-hidden="true" className="size-4" /> Mi Información
        </Link>
        <Link
          href={settingsHref}
          aria-current={initialTab === 'configuracion' ? 'page' : undefined}
          className={cn(
            'inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]',
            initialTab === 'configuracion' ? 'bg-[#1E3A8A] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          )}
        >
          <Settings2 aria-hidden="true" className="size-4" /> Configuración
        </Link>
      </nav>

      <section aria-label={initialTab === 'configuracion' ? 'Configuración y seguridad' : 'Información del perfil'}>
        {initialTab === 'configuracion' ? (
          <div className="flex flex-col gap-5">
            <Link href={informationHref} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit px-0 text-muted-foreground')}>
              <ArrowLeft data-icon="inline-start" /> Volver a Mi Información
            </Link>
            <ProfileSettings activeLoans={account.activeLoans} pendingFine={account.pendingFine} requester={requester} />
          </div>
        ) : isStudent ? (
          <StudentProfileView student={student!} history={READING_HISTORY} />
        ) : staff ? (
          <StaffProfileView staff={staff} pendingTasks={PENDING_AUDIT_TASKS} />
        ) : null}
      </section>
    </div>
  )
}
