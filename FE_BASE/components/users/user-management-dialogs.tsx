'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ManagedUser, ManagedUserRole } from './user-management-demo'

export type UserConfirmAction =
  | { type: 'block-user' | 'activate-user'; targetId: string; userName: string }
  | { type: 'registration-approve' | 'registration-reject'; targetId: string; userName: string }
  | { type: 'cancellation-sign' | 'cancellation-deny'; targetId: string; userName: string }

export type UserDialogState =
  | { kind: 'edit'; user: ManagedUser }
  | { kind: 'new-staff'; suggestedCode: string }
  | { kind: 'reset-credentials'; user: ManagedUser }
  | { kind: 'confirm'; action: UserConfirmAction }

export function UserManagementDialogs({
  dialog,
  onClose,
  onSaveUser,
  onCreateStaff,
  onConfirmAction,
  onResetCredentials,
}: {
  dialog: UserDialogState | null
  onClose: () => void
  onSaveUser: (user: ManagedUser) => void
  onCreateStaff: (user: ManagedUser) => boolean
  onConfirmAction: (action: UserConfirmAction) => void
  onResetCredentials: (user: ManagedUser, method: 'email' | 'temporary') => void
}) {
  const title = dialog?.kind === 'edit'
    ? 'Editar perfil'
    : dialog?.kind === 'new-staff'
      ? 'Alta de personal'
      : dialog?.kind === 'reset-credentials'
        ? 'Restablecer credenciales'
        : dialog?.kind === 'confirm'
          ? getConfirmTitle(dialog.action)
          : ''
  const description = dialog?.kind === 'edit'
    ? 'Actualiza los datos básicos y el rol del usuario.'
    : dialog?.kind === 'new-staff'
      ? 'Crea una cuenta de funcionario con código de empleado.'
      : dialog?.kind === 'reset-credentials'
        ? `Selecciona una acción de prueba para ${dialog.user.fullName}. No se enviará correo real.`
        : dialog?.kind === 'confirm'
          ? getConfirmDescription(dialog.action)
          : ''

  return (
    <Dialog.Root open={dialog !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      {dialog && (
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-950/45 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 flex max-h-[min(90dvh,50rem)] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl">
            <div className="border-b px-5 py-4 sm:px-6">
              <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">{description}</Dialog.Description>
            </div>
            <div className="overflow-y-auto p-5 sm:p-6">
              {dialog.kind === 'edit' && (
                <EditUserForm key={dialog.user.id} user={dialog.user} onSave={onSaveUser} onClose={onClose} />
              )}
              {dialog.kind === 'new-staff' && (
                <NewStaffForm key={dialog.suggestedCode} suggestedCode={dialog.suggestedCode} onCreate={onCreateStaff} onClose={onClose} />
              )}
              {dialog.kind === 'reset-credentials' && (
                <CredentialResetForm user={dialog.user} onConfirm={onResetCredentials} onClose={onClose} />
              )}
              {dialog.kind === 'confirm' && (
                <ConfirmActionForm action={dialog.action} onConfirm={onConfirmAction} onClose={onClose} />
              )}
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      )}
    </Dialog.Root>
  )
}

function EditUserForm({
  user,
  onSave,
  onClose,
}: {
  user: ManagedUser
  onSave: (user: ManagedUser) => void
  onClose: () => void
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    onSave({
      ...user,
      fullName: String(values.get('fullName') ?? '').trim(),
      identifier: String(values.get('identifier') ?? '').trim(),
      email: String(values.get('email') ?? '').trim(),
      role: String(values.get('role') ?? user.role) as ManagedUserRole,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField id="edit-fullName" label="Nombre completo">
        <Input id="edit-fullName" name="fullName" defaultValue={user.fullName} required />
      </FormField>
      <FormField id="edit-identifier" label="Matrícula / cédula / código">
        <Input id="edit-identifier" name="identifier" defaultValue={user.identifier} required />
      </FormField>
      <FormField id="edit-email" label="Correo electrónico">
        <Input id="edit-email" name="email" type="email" defaultValue={user.email} required />
      </FormField>
      <FormField id="edit-role" label="Rol del sistema">
        <select id="edit-role" name="role" defaultValue={user.role} className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <option value="ESTUDIANTE">ESTUDIANTE</option>
          <option value="AUXILIAR">AUXILIAR</option>
          <option value="ADMINISTRADOR">ADMINISTRADOR</option>
        </select>
      </FormField>
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit">Guardar cambios</Button>
      </div>
    </form>
  )
}

function NewStaffForm({
  suggestedCode,
  onCreate,
  onClose,
}: {
  suggestedCode: string
  onCreate: (user: ManagedUser) => boolean
  onClose: () => void
}) {
  const [role, setRole] = useState<Extract<ManagedUserRole, 'ADMINISTRADOR' | 'AUXILIAR'>>('ADMINISTRADOR')
  const [code, setCode] = useState(suggestedCode)
  const [error, setError] = useState<string | null>(null)

  function handleRoleChange(nextRole: Extract<ManagedUserRole, 'ADMINISTRADOR' | 'AUXILIAR'>) {
    setRole(nextRole)
    const suffix = suggestedCode.split('-').at(-1) ?? '01'
    setCode(`${nextRole === 'ADMINISTRADOR' ? 'ADMIN' : 'AUX'}-${suffix}`)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const fullName = String(values.get('fullName') ?? '').trim()
    const email = String(values.get('email') ?? '').trim()
    const employeeCode = String(values.get('employeeCode') ?? '').trim()
    const created = onCreate({
      id: employeeCode,
      fullName,
      identifier: employeeCode,
      email,
      role,
      status: 'ACTIVO',
      activeLoans: 0,
      pendingFine: 0,
    })
    if (created) onClose()
    else setError('Ya existe una cuenta con ese código o correo. Ajusta los datos e inténtalo de nuevo.')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField id="staff-name" label="Nombre completo">
        <Input id="staff-name" name="fullName" autoComplete="name" required />
      </FormField>
      <FormField id="staff-email" label="Correo institucional">
        <Input id="staff-email" name="email" type="email" autoComplete="email" required />
      </FormField>
      <FormField id="staff-role" label="Rol">
        <select
          id="staff-role"
          value={role}
          onChange={(event) => handleRoleChange(event.target.value as 'ADMINISTRADOR' | 'AUXILIAR')}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="ADMINISTRADOR">ADMINISTRADOR</option>
          <option value="AUXILIAR">AUXILIAR</option>
        </select>
      </FormField>
      <FormField id="staff-code" label="Código identificativo de empleado">
        <Input id="staff-code" name="employeeCode" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} required />
      </FormField>
      {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
      <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
        La cuenta y sus credenciales definitivas se simulan en esta vista; no se envía invitación real.
      </p>
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit">Crear cuenta</Button>
      </div>
    </form>
  )
}

function CredentialResetForm({
  user,
  onConfirm,
  onClose,
}: {
  user: ManagedUser
  onConfirm: (user: ManagedUser, method: 'email' | 'temporary') => void
  onClose: () => void
}) {
  const [method, setMethod] = useState<'email' | 'temporary'>('email')

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg bg-muted/60 p-3 text-sm">
        <p className="font-semibold">{user.fullName}</p>
        <p className="text-muted-foreground">{user.email}</p>
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Método de restablecimiento</legend>
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
          <input type="radio" name="reset-method" checked={method === 'email'} onChange={() => setMethod('email')} className="mt-1 accent-[#1E3A8A]" />
          <span><span className="block text-sm font-semibold">Simular envío de enlace</span><span className="block text-xs text-muted-foreground">Se mostraría el envío de recuperación al correo registrado.</span></span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
          <input type="radio" name="reset-method" checked={method === 'temporary'} onChange={() => setMethod('temporary')} className="mt-1 accent-[#1E3A8A]" />
          <span><span className="block text-sm font-semibold">Simular contraseña temporal</span><span className="block text-xs text-muted-foreground">Marca las credenciales para cambio en el siguiente acceso.</span></span>
        </label>
      </fieldset>
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="button" onClick={() => onConfirm(user, method)}>
          {method === 'email' ? 'Enviar enlace de prueba' : 'Generar credencial temporal'}
        </Button>
      </div>
    </div>
  )
}

function ConfirmActionForm({
  action,
  onConfirm,
  onClose,
}: {
  action: UserConfirmAction
  onConfirm: (action: UserConfirmAction) => void
  onClose: () => void
}) {
  const destructive = ['block-user', 'registration-reject', 'cancellation-sign', 'cancellation-deny'].includes(action.type)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Volver</Button>
        <Button type="button" variant={destructive ? 'destructive' : 'default'} onClick={() => onConfirm(action)}>
          {getConfirmButton(action)}
        </Button>
      </div>
    </div>
  )
}

function FormField({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      {children}
    </div>
  )
}

function getConfirmTitle(action: UserConfirmAction) {
  if (action.type === 'block-user') return 'Bloquear usuario'
  if (action.type === 'activate-user') return 'Reactivar usuario'
  if (action.type === 'registration-approve') return 'Aprobar y activar cuenta'
  if (action.type === 'registration-reject') return 'Rechazar solicitud de registro'
  if (action.type === 'cancellation-sign') return 'Firmar baja y eliminar cuenta'
  return 'Denegar solicitud de baja'
}

function getConfirmDescription(action: UserConfirmAction) {
  if (action.type === 'block-user') return `Se suspenderá el acceso de ${action.userName}. La cuenta permanecerá en el directorio.`
  if (action.type === 'activate-user') return `Se habilitará nuevamente el acceso de ${action.userName}.`
  if (action.type === 'registration-approve') return `Se activará la cuenta de ${action.userName} y se simulará la generación de sus credenciales definitivas.`
  if (action.type === 'registration-reject') return `Se marcará como rechazada la solicitud de ${action.userName}.`
  if (action.type === 'cancellation-sign') return `Se firmará la baja de ${action.userName} y se retirará la cuenta del directorio de demostración.`
  return `La solicitud de baja de ${action.userName} quedará denegada; su cuenta se conservará.`
}

function getConfirmButton(action: UserConfirmAction) {
  if (action.type === 'block-user') return 'Confirmar bloqueo'
  if (action.type === 'activate-user') return 'Reactivar cuenta'
  if (action.type === 'registration-approve') return 'Aprobar y activar'
  if (action.type === 'registration-reject') return 'Rechazar solicitud'
  if (action.type === 'cancellation-sign') return 'Firmar baja'
  return 'Denegar solicitud'
}
