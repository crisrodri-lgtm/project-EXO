'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog } from '@base-ui/react/dialog'
import { CheckCircle2, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function FirstOtpPasswordGate({
  open,
  returnHref,
}: {
  open: boolean
  returnHref: string
}) {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')

  function finish() {
    router.replace(returnHref)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (newPassword !== confirmation) {
      setError('Las contraseñas no coinciden.')
      return
    }
    finish()
  }

  return (
    <Dialog.Root open={open} onOpenChange={() => {}}>
      {open && (
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-950/50 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 flex max-h-[min(90dvh,42rem)] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-2xl sm:p-7">
            <div className="mb-5 flex items-start gap-3">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1E3A8A]" aria-hidden="true">
                <KeyRound className="size-5" />
              </span>
              <div>
                <Dialog.Title className="text-lg font-semibold">Define tu contraseña permanente</Dialog.Title>
                <Dialog.Description className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Iniciaste sesión con un código OTP temporal. Cambia la clave ahora o confirma que quieres conservar la asignada.
                </Dialog.Description>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="otp-new-password" className="text-sm font-medium">Nueva contraseña permanente</label>
                <Input
                  id="otp-new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={newPassword}
                  onChange={(event) => { setNewPassword(event.target.value); setError('') }}
                  className="h-10"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="otp-confirm-password" className="text-sm font-medium">Confirmar contraseña</label>
                <Input
                  id="otp-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={confirmation}
                  onChange={(event) => { setConfirmation(event.target.value); setError('') }}
                  className="h-10"
                />
              </div>
              {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
              <Button type="submit" className="mt-1 min-h-10 w-full">
                <CheckCircle2 data-icon="inline-start" /> Guardar contraseña permanente
              </Button>
            </form>

            <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
              o
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
            </div>
            <Button type="button" variant="outline" onClick={finish} className="min-h-10 w-full">
              Conservar la contraseña asignada
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">La actualización de contraseña se simula en esta versión de demostración.</p>
          </Dialog.Popup>
        </Dialog.Portal>
      )}
    </Dialog.Root>
  )
}
