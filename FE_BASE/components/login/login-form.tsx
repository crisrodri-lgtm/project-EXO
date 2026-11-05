'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  AccessHelpMenu,
  LostEmailForm,
  OtpResetForm,
  RegistrationForm,
  type AccessExceptionView,
} from './login-exception-views'
import { routeForRole, verifyDemoCredentials } from './login-access-utils'

const MAX_ATTEMPTS = 3
const LOCK_SECONDS = 30

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'locked'; until: number }

type LoginView = 'login' | 'help' | AccessExceptionView

const VIEW_TITLES: Record<LoginView, { title: string; description: string }> = {
  login: {
    title: 'ACCESO UNIFICADO AL SISTEMA',
    description: 'Ingresa con tu correo institucional y contraseña.',
  },
  help: {
    title: 'Ayuda con el acceso',
    description: 'Selecciona el caso que mejor describe lo que necesitas.',
  },
  'lost-email': {
    title: 'Recuperación de cuenta',
    description: 'Solicita asistencia para localizar tu correo registrado.',
  },
  'otp-reset': {
    title: 'Restablecer contraseña',
    description: 'Verifica tu identidad con un código temporal de un solo uso.',
  },
  registration: {
    title: 'Pre-registro PWA',
    description: 'Solicita una cuenta y espera la aprobación manual de biblioteca.',
  },
}

export function LoginForm() {
  const router = useRouter()
  const [view, setView] = useState<LoginView>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [now, setNow] = useState(() => Date.now())

  const isLocked = status.kind === 'locked' && status.until > now
  const secondsLeft = status.kind === 'locked' ? Math.max(0, Math.ceil((status.until - now) / 1000)) : 0
  const disabled = isLocked || status.kind === 'loading'

  function startLockCountdown(until: number) {
    const intervalId = window.setInterval(() => {
      const currentTime = Date.now()
      setNow(currentTime)
      if (currentTime >= until) {
        window.clearInterval(intervalId)
        setAttempts(0)
        setStatus({ kind: 'idle' })
      }
    }, 1_000)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (disabled) return

    setStatus({ kind: 'loading' })
    const role = await verifyDemoCredentials(email, password)

    if (role) {
      setAttempts(0)
      setStatus({ kind: 'idle' })
      router.replace(routeForRole(role))
      return
    }

    const nextAttempt = attempts + 1
    setAttempts(nextAttempt)
    if (nextAttempt >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCK_SECONDS * 1_000
      setNow(Date.now())
      setStatus({ kind: 'locked', until })
      startLockCountdown(until)
      return
    }

    setStatus({ kind: 'error', message: `Credenciales incorrectas. Intento ${nextAttempt} de ${MAX_ATTEMPTS}.` })
  }

  function handleCancel() {
    setEmail('')
    setPassword('')
    setRemember(false)
    router.replace('/opac')
  }

  function openHelp() {
    setStatus({ kind: 'idle' })
    setView('help')
  }

  const currentView = VIEW_TITLES[view]

  return (
    <Card className="w-full max-w-lg border-slate-200 bg-white shadow-xl">
      <CardHeader className="items-center gap-3 pb-4 text-center">
        <div className="flex w-full justify-center">
          <BrandLogo variant="icon" className="[&_img]:h-14" />
        </div>
        <div>
          <CardTitle className="text-base font-bold tracking-wide text-slate-950 md:text-lg">{currentView.title}</CardTitle>
          <CardDescription className="mx-auto mt-1 max-w-sm text-sm">{currentView.description}</CardDescription>
        </div>
        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-[#1E3A8A]">
          <ShieldCheck data-icon="inline-start" /> Acceso seguro · modo demo
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {status.kind === 'error' && (
          <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
            <p className="font-semibold">No se pudo iniciar sesión</p>
            <p>{status.message}</p>
          </div>
        )}
        {isLocked && (
          <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
            <p className="font-semibold">Acceso bloqueado temporalmente</p>
            <p>Se superaron {MAX_ATTEMPTS} intentos. Inténtalo de nuevo en <span className="font-mono font-bold">{secondsLeft}s</span>.</p>
          </div>
        )}

        {view === 'login' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField id="login-email" label="Correo institucional">
              <Input
                id="login-email"
                name="email"
                type="email"
                autoComplete="username"
                required
                disabled={disabled}
                value={email}
                onChange={(event) => { setEmail(event.target.value); if (status.kind === 'error') setStatus({ kind: 'idle' }) }}
                placeholder="usuario@progresodigital.edu.do"
                className="h-11"
              />
            </FormField>
            <FormField id="login-password" label="Contraseña">
              <Input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={disabled}
                value={password}
                onChange={(event) => { setPassword(event.target.value); if (status.kind === 'error') setStatus({ kind: 'idle' }) }}
                className="h-11"
              />
            </FormField>
            <label className="flex items-start gap-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={remember}
                disabled={disabled}
                onChange={(event) => setRemember(event.target.checked)}
                className="mt-0.5 size-4 accent-[#1E3A8A]"
              />
              Recordar sesión en esta terminal (60 min)
            </label>
            <div className="flex flex-col gap-2 pt-1 sm:flex-row-reverse">
              <Button type="submit" disabled={disabled} className="min-h-11 flex-1 bg-[#1E3A8A] font-bold tracking-wide hover:bg-[#172E6E]">
                {status.kind === 'loading' ? <><LockKeyhole data-icon="inline-start" /> Verificando…</> : isLocked ? '[ ACCESO BLOQUEADO ]' : '[ INICIAR SESIÓN ]'}
              </Button>
              <Button type="button" variant="secondary" onClick={handleCancel} className="min-h-11 flex-1 font-bold tracking-wide">
                [ CANCELAR ]
              </Button>
            </div>
            <Button id="ayuda" type="button" variant="link" onClick={openHelp} className="min-h-10 whitespace-normal text-center text-sm font-semibold text-[#1E3A8A]">
              ¿Olvidó su contraseña o tiene problemas de acceso?
            </Button>
          </form>
        )}

        {view === 'help' && (
          <AccessHelpMenu onSelect={setView} onBack={() => setView('login')} />
        )}
        {view === 'lost-email' && <LostEmailForm onBack={() => setView('help')} />}
        {view === 'otp-reset' && <OtpResetForm onBack={() => setView('help')} />}
        {view === 'registration' && <RegistrationForm onBack={() => setView('help')} />}

        {view === 'login' && (
          <p className="rounded-lg bg-muted/60 px-3 py-2 text-center text-xs text-muted-foreground">
            Autenticación simulada para validar los flujos de acceso; no se crea una sesión JWT real.
          </p>
        )}
        {view !== 'login' && (
          <Button type="button" variant="ghost" onClick={() => setView('login')} className="self-center text-xs text-muted-foreground">
            Volver al formulario de acceso
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function FormField({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label htmlFor={id} className="text-sm font-semibold text-slate-800">{label}</label>
      {children}
    </div>
  )
}
