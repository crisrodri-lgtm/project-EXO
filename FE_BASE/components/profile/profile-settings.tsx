'use client'

import Link from 'next/link'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Bell, BellRing, Check, KeyRound, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useUserManagementDemo, type ManagedUserRole } from '@/components/users/user-management-demo'

export function ProfileSettings({
  activeLoans,
  pendingFine,
  requester,
}: {
  activeLoans: number
  pendingFine: number
  requester: { userId: string; fullName: string; identifier: string; email: string; role: ManagedUserRole }
}) {
  const { update } = useUserManagementDemo()
  const [pushEnabled, setPushEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [cancellationState, setCancellationState] = useState<'idle' | 'confirm' | 'sent'>('idle')
  const [cancellationMessage, setCancellationMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const newPassword = String(formData.get('newPassword') ?? '')
    const confirmation = String(formData.get('confirmPassword') ?? '')

    if (newPassword !== confirmation) {
      setPasswordMessage({ type: 'error', text: 'Las contraseñas nuevas no coinciden.' })
      return
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres.' })
      return
    }

    setPasswordMessage({
      type: 'success',
      text: 'Validación correcta. Esta demostración no modifica credenciales reales ni llama a Supabase Auth.',
    })
    event.currentTarget.reset()
  }

  function beginCancellationRequest() {
    const blockers: string[] = []
    if (activeLoans > 0) blockers.push(`${activeLoans} préstamo${activeLoans === 1 ? '' : 's'} activo${activeLoans === 1 ? '' : 's'}`)
    if (pendingFine > 0) blockers.push(`multas pendientes por $${pendingFine.toFixed(2)}`)

    if (blockers.length > 0) {
      setCancellationState('idle')
      setCancellationMessage({
        type: 'error',
        text: `No se puede solicitar la baja: primero debes resolver ${blockers.join(' y ')}.`,
      })
      return
    }

    setCancellationMessage(null)
    setCancellationState('confirm')
  }

  function confirmCancellationRequest() {
    const request = {
      id: `BAJA-${Date.now()}`,
      userId: requester.userId,
      fullName: requester.fullName,
      identifier: requester.identifier,
      email: requester.email,
      role: requester.role,
      requestedAt: new Date().toISOString(),
      activeLoans,
      pendingFine,
      status: 'PENDIENTE' as const,
    }

    update((current) => {
      const alreadyPending = current.cancellationRequests.some(
        (item) => item.userId === requester.userId && item.status === 'PENDIENTE',
      )
      return alreadyPending
        ? current
        : { ...current, cancellationRequests: [request, ...current.cancellationRequests] }
    })
    setCancellationState('sent')
    setCancellationMessage({
      type: 'success',
      text: 'Solicitud simulada enviada a la bandeja de Pantalla 12 para firma del administrador.',
    })
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card>
        <CardHeader className="border-b pb-4">
          <CardDescription className="font-semibold uppercase tracking-[0.14em]">Preferencias del sistema</CardDescription>
          <CardTitle className="text-lg">Notificaciones PWA</CardTitle>
          <p className="text-sm text-muted-foreground">Elige qué avisos de la biblioteca quieres recibir en este dispositivo.</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 pt-1">
          <NotificationSwitch
            checked={pushEnabled}
            onCheckedChange={setPushEnabled}
            title="Notificaciones push"
            description="Avisos de vencimiento y cambios en tus solicitudes."
            icon={<BellRing aria-hidden="true" className="size-4" />}
          />
          <NotificationSwitch
            checked={emailEnabled}
            onCheckedChange={setEmailEnabled}
            title="Notificaciones por correo"
            description="Resumen de movimientos en tu correo institucional."
            icon={<Bell aria-hidden="true" className="size-4" />}
          />
          <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            Preferencias locales de demostración: no se sincronizan con una cuenta real.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardDescription className="font-semibold uppercase tracking-[0.14em]">Seguridad</CardDescription>
              <CardTitle className="mt-1 text-lg">Cambiar contraseña</CardTitle>
            </div>
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">Simulación</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Formulario de cambio preparado para integrarse con Supabase Auth.</p>
        </CardHeader>
        <CardContent className="pt-1">
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="currentPassword" className="text-sm font-medium">Contraseña actual</label>
              <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="newPassword" className="text-sm font-medium">Nueva contraseña</label>
              <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={8} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar nueva contraseña</label>
              <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required />
            </div>
            <Button type="submit" className="mt-1 w-full sm:w-fit">
              <KeyRound data-icon="inline-start" /> Validar cambio
            </Button>
            {passwordMessage && (
              <p role={passwordMessage.type === 'error' ? 'alert' : 'status'} className={passwordMessage.type === 'error' ? 'text-sm font-medium text-destructive' : 'text-sm font-medium text-emerald-800'}>
                {passwordMessage.text}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card className="border-rose-200 xl:col-span-2">
        <CardHeader className="border-b border-rose-100 pb-4">
          <CardDescription className="font-semibold uppercase tracking-[0.14em] text-rose-700">Acción crítica</CardDescription>
          <CardTitle className="text-lg">Solicitar baja o cancelación de cuenta</CardTitle>
          <p className="text-sm text-muted-foreground">Antes de continuar se verifica que no existan préstamos activos ni multas pendientes.</p>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4 pt-1">
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline" className={activeLoans > 0 ? 'border-amber-200 bg-amber-50 text-amber-800' : ''}>
              {activeLoans} préstamos activos
            </Badge>
            <Badge variant="outline" className={pendingFine > 0 ? 'border-rose-200 bg-rose-50 text-rose-800' : ''}>
              Multas: ${pendingFine.toFixed(2)}
            </Badge>
          </div>
          {cancellationState === 'confirm' ? (
            <div className="flex w-full flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-amber-950">La cuenta está al día. ¿Confirmas enviar la solicitud para revisión administrativa?</p>
              <div className="flex shrink-0 gap-2">
                <Button type="button" variant="outline" onClick={() => setCancellationState('idle')}>Cancelar</Button>
                <Button type="button" onClick={confirmCancellationRequest}><Check data-icon="inline-start" /> Confirmar solicitud</Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="destructive"
              disabled={cancellationState === 'sent'}
              onClick={beginCancellationRequest}
            >
              <ShieldAlert data-icon="inline-start" />
              {cancellationState === 'sent' ? 'Solicitud simulada enviada' : 'Solicitar Baja / Cancelación de Cuenta'}
            </Button>
          )}
          {cancellationMessage && (
            <div
              role={cancellationMessage.type === 'error' ? 'alert' : 'status'}
              className={cn(
                'w-full rounded-lg border px-3 py-3 text-sm',
                cancellationMessage.type === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-900'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-900',
              )}
            >
              <p>{cancellationMessage.text}</p>
              {cancellationMessage.type === 'success' && (
                <Link href="/admin/usuarios?tab=aprobaciones&solicitud=bajas" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-3 border-emerald-300 bg-white text-emerald-900')}>
                  Ver bandeja de aprobación
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function NotificationSwitch({
  checked,
  onCheckedChange,
  title,
  description,
  icon,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  title: string
  description: string
  icon: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg px-2 py-3">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground" aria-hidden="true">{icon}</span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold">{title}</span>
          <span className="block text-xs leading-relaxed text-muted-foreground">{description}</span>
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]',
          checked ? 'border-[#1E3A8A] bg-[#1E3A8A]' : 'border-slate-300 bg-slate-200',
        )}
      >
        <span className={cn('size-4 rounded-full bg-white shadow-sm transition-transform', checked ? 'translate-x-5' : 'translate-x-1')} />
      </button>
    </div>
  )
}
