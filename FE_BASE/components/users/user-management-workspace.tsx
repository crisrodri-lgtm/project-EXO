'use client'

import { useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { BellRing, CircleAlert, Users, UserCheck, UserRoundPlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { UserDirectory } from './user-directory'
import { UserRequestsInbox } from './user-requests-inbox'
import {
  useUserManagementDemo,
  type ManagedUser,
  type RegistrationRequest,
  type CancellationRequest,
} from './user-management-demo'
import {
  UserManagementDialogs,
  type UserConfirmAction,
  type UserDialogState,
} from './user-management-dialogs'

type MainTab = 'directorio' | 'solicitudes'
type RequestTab = 'registros' | 'bajas' | 'recuperacion'
type Notice = { type: 'success' | 'error'; text: string }

export function UserManagementWorkspace({
  initialTab,
  initialRequestTab,
}: {
  initialTab: MainTab
  initialRequestTab: RequestTab
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { state, update } = useUserManagementDemo()
  const [activeTab, setActiveTab] = useState<MainTab>(initialTab)
  const [activeRequestTab, setActiveRequestTab] = useState<RequestTab>(initialRequestTab)
  const [dialog, setDialog] = useState<UserDialogState | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)

  const activeUsers = state.users.filter((user) => user.status === 'ACTIVO').length
  const blockedUsers = state.users.filter((user) => user.status === 'BLOQUEADO').length
  const pendingRegistrations = state.registrationRequests.filter((request) => request.status === 'PENDIENTE' || request.status === 'PENDIENTE_APROBACION').length
  const pendingCancellations = state.cancellationRequests.filter((request) => request.status === 'PENDIENTE').length
  const pendingRecoveries = state.accountRecoveryRequests.filter((request) => request.status === 'PENDIENTE').length

  function changeMainTab(value: string | null) {
    if (value !== 'directorio' && value !== 'solicitudes') return
    setActiveTab(value)
    setNotice(null)
    const query = value === 'solicitudes'
      ? `?tab=aprobaciones${activeRequestTab === 'registros' ? '' : `&solicitud=${activeRequestTab}`}`
      : ''
    router.replace(`${pathname}${query}`, { scroll: false })
  }

  function changeRequestTab(value: string | null) {
    if (value !== 'registros' && value !== 'bajas' && value !== 'recuperacion') return
    setActiveRequestTab(value)
    router.replace(`${pathname}?tab=aprobaciones${value === 'registros' ? '' : `&solicitud=${value}`}`, { scroll: false })
  }

  function openStatusDialog(user: ManagedUser) {
    const type = user.status === 'ACTIVO' ? 'block-user' : 'activate-user'
    setDialog({ kind: 'confirm', action: { type, targetId: user.id, userName: user.fullName } })
  }

  function openRegistrationDialog(request: RegistrationRequest, decision: 'aprobar' | 'rechazar') {
    setDialog({
      kind: 'confirm',
      action: {
        type: decision === 'aprobar' ? 'registration-approve' : 'registration-reject',
        targetId: request.id,
        userName: request.fullName,
      },
    })
  }

  function openCancellationDialog(request: CancellationRequest, decision: 'firmar' | 'denegar') {
    setDialog({
      kind: 'confirm',
      action: {
        type: decision === 'firmar' ? 'cancellation-sign' : 'cancellation-deny',
        targetId: request.id,
        userName: request.fullName,
      },
    })
  }

  function saveUser(user: ManagedUser) {
    update((current) => ({
      ...current,
      users: current.users.map((item) => item.id === user.id ? user : item),
    }))
    setDialog(null)
    setNotice({ type: 'success', text: `El perfil de ${user.fullName} fue actualizado en esta sesión de demostración.` })
  }

  function createStaff(user: ManagedUser) {
    const duplicate = state.users.some((item) => item.id === user.id || item.email.toLowerCase() === user.email.toLowerCase())
    if (duplicate) return false
    update((current) => ({ ...current, users: [user, ...current.users] }))
    setDialog(null)
    setNotice({ type: 'success', text: `Se creó la cuenta de ${user.fullName} con el código ${user.identifier}.` })
    return true
  }

  function resetCredentials(user: ManagedUser, method: 'email' | 'temporary') {
    setDialog(null)
    setNotice({
      type: 'success',
      text: method === 'email'
        ? `Se simuló el envío de un enlace de recuperación a ${user.email}.`
        : `Se simuló la generación de una credencial temporal para ${user.fullName}.`,
    })
  }

  function markRecoveryReviewed(requestId: string) {
    update((current) => ({
      ...current,
      accountRecoveryRequests: current.accountRecoveryRequests.map((request) =>
        request.id === requestId ? { ...request, status: 'REVISADA' } : request,
      ),
    }))
    setNotice({ type: 'success', text: 'La solicitud de recuperación quedó marcada para revisión manual.' })
  }

  function applyConfirmedAction(action: UserConfirmAction) {
    if (action.type === 'block-user' || action.type === 'activate-user') {
      const nextStatus = action.type === 'block-user' ? 'BLOQUEADO' : 'ACTIVO'
      update((current) => ({
        ...current,
        users: current.users.map((user) => user.id === action.targetId ? { ...user, status: nextStatus } : user),
      }))
      setNotice({ type: 'success', text: action.type === 'block-user' ? `Se bloqueó la cuenta de ${action.userName}.` : `Se reactivó la cuenta de ${action.userName}.` })
    }

    if (action.type === 'registration-approve' || action.type === 'registration-reject') {
      const request = state.registrationRequests.find((item) => item.id === action.targetId)
      if (!request || (request.status !== 'PENDIENTE' && request.status !== 'PENDIENTE_APROBACION')) {
        setNotice({ type: 'error', text: 'La solicitud ya fue procesada.' })
        setDialog(null)
        return
      }

      update((current) => ({
        ...current,
        registrationRequests: current.registrationRequests.map((item) => item.id === action.targetId
          ? { ...item, status: action.type === 'registration-approve' ? 'APROBADA' : 'RECHAZADA' }
          : item),
        users: action.type === 'registration-approve'
          ? [
              {
                id: request.identifier,
                fullName: request.fullName,
                identifier: request.identifier,
                email: request.email,
                role: 'ESTUDIANTE',
                status: 'ACTIVO',
                activeLoans: 0,
                pendingFine: 0,
              },
              ...current.users.filter((user) => user.id !== request.identifier),
            ]
          : current.users,
      }))
      setNotice({
        type: 'success',
        text: action.type === 'registration-approve'
          ? `Se activó la cuenta de ${request.fullName}; las credenciales definitivas se simularon.`
          : `La solicitud de ${request.fullName} fue rechazada.`,
      })
    }

    if (action.type === 'cancellation-sign' || action.type === 'cancellation-deny') {
      const request = state.cancellationRequests.find((item) => item.id === action.targetId)
      if (!request || request.status !== 'PENDIENTE') {
        setNotice({ type: 'error', text: 'La solicitud de baja ya fue procesada.' })
        setDialog(null)
        return
      }
      if (action.type === 'cancellation-sign' && (request.activeLoans > 0 || request.pendingFine > 0)) {
        setNotice({ type: 'error', text: 'No se puede firmar la baja mientras existan préstamos o multas pendientes.' })
        setDialog(null)
        return
      }

      update((current) => ({
        ...current,
        cancellationRequests: current.cancellationRequests.map((item) => item.id === action.targetId
          ? { ...item, status: action.type === 'cancellation-sign' ? 'FIRMADA' : 'DENEGADA' }
          : item),
        users: action.type === 'cancellation-sign'
          ? current.users.filter((user) => user.id !== request.userId)
          : current.users,
      }))
      setNotice({
        type: 'success',
        text: action.type === 'cancellation-sign'
          ? `Se firmó la baja y se retiró la cuenta de ${request.fullName} del directorio de demostración.`
          : `La solicitud de baja de ${request.fullName} fue denegada; la cuenta se conserva.`,
      })
    }

    setDialog(null)
  }

  function getSuggestedStaffCode() {
    const role = 'ADMINISTRADOR'
    const number = state.users.filter((user) => user.role === role).length + 1
    return `ADMIN-${String(number).padStart(2, '0')}`
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 md:py-8">
      <nav aria-label="Ruta de navegación" className="text-xs font-medium tracking-wide text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li><span>ADMINISTRACIÓN</span></li>
          <li aria-hidden="true">/</li>
          <li><span>USUARIOS</span></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-bold text-foreground">PANTALLA 12</li>
        </ol>
      </nav>

      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1E3A8A]">Administración de acceso · Pantalla 12</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Gestión de usuarios</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Administra el directorio, aprueba nuevas cuentas y procesa solicitudes de baja.</p>
        </div>
        <Badge variant="outline" className="h-auto w-fit gap-1.5 px-3 py-1.5 text-xs font-semibold">
          <BellRing data-icon="inline-start" /> {pendingRegistrations + pendingCancellations + pendingRecoveries} tareas pendientes
        </Badge>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Usuarios registrados" value={state.users.length} icon={<Users aria-hidden="true" />} />
        <SummaryCard label="Cuentas activas" value={activeUsers} icon={<UserCheck aria-hidden="true" />} tone="success" />
        <SummaryCard label="Cuentas bloqueadas" value={blockedUsers} icon={<CircleAlert aria-hidden="true" />} tone="danger" />
        <SummaryCard label="Solicitudes pendientes" value={pendingRegistrations + pendingCancellations + pendingRecoveries} icon={<UserRoundPlus aria-hidden="true" />} tone="warning" />
      </div>

      {notice && (
        <div role={notice.type === 'error' ? 'alert' : 'status'} className={cn(
          'flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm',
          notice.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900',
        )}>
          <p>{notice.text}</p>
          <Button type="button" variant="ghost" size="sm" onClick={() => setNotice(null)}>Cerrar aviso</Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={changeMainTab}>
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 border border-border bg-white p-1 sm:w-fit">
          <TabsTrigger value="directorio" className="min-h-10 flex-1 px-4 sm:flex-none">Directorio General</TabsTrigger>
          <TabsTrigger value="solicitudes" className="min-h-10 flex-1 px-4 sm:flex-none">
            Bandeja de Solicitudes
            {(pendingRegistrations + pendingCancellations + pendingRecoveries) > 0 && <Badge variant="secondary" className="ml-1">{pendingRegistrations + pendingCancellations + pendingRecoveries}</Badge>}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="directorio" className="mt-5">
          <UserDirectory
            users={state.users}
            onEdit={(user) => setDialog({ kind: 'edit', user })}
            onResetCredentials={(user) => setDialog({ kind: 'reset-credentials', user })}
            onToggleStatus={openStatusDialog}
            onAddStaff={() => setDialog({ kind: 'new-staff', suggestedCode: getSuggestedStaffCode() })}
          />
        </TabsContent>
        <TabsContent value="solicitudes" className="mt-5">
          <UserRequestsInbox
            registrationRequests={state.registrationRequests}
            cancellationRequests={state.cancellationRequests}
            accountRecoveryRequests={state.accountRecoveryRequests}
            activeSubtab={activeRequestTab}
            onSubtabChange={changeRequestTab}
            onRegistrationAction={openRegistrationDialog}
            onCancellationAction={openCancellationDialog}
            onRecoveryAction={(request) => markRecoveryReviewed(request.id)}
          />
        </TabsContent>
      </Tabs>

      <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-900">
        Modo de demostración: directorio y solicitudes usan datos de ejemplo en memoria. Las modificaciones no se guardan tras recargar la página ni envían correos reales.
      </p>

      <UserManagementDialogs
        dialog={dialog}
        onClose={() => setDialog(null)}
        onSaveUser={saveUser}
        onCreateStaff={createStaff}
        onConfirmAction={applyConfirmedAction}
        onResetCredentials={resetCredentials}
      />
    </div>
  )
}

function SummaryCard({
  label,
  value,
  icon,
  tone = 'default',
}: {
  label: string
  value: number
  icon: ReactNode
  tone?: 'default' | 'success' | 'danger' | 'warning'
}) {
  const toneStyle = tone === 'success'
    ? 'bg-emerald-50 text-emerald-800'
    : tone === 'danger'
      ? 'bg-rose-50 text-rose-800'
      : tone === 'warning'
        ? 'bg-amber-50 text-amber-800'
        : 'bg-blue-50 text-[#1E3A8A]'

  return (
    <Card size="sm">
      <CardContent className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
        </div>
        <span className={cn('inline-flex size-10 items-center justify-center rounded-xl', toneStyle)}>{icon}</span>
      </CardContent>
    </Card>
  )
}
