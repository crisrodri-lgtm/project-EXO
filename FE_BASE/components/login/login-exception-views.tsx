'use client'

import Link from 'next/link'
import { useState, type FormEvent, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  MailQuestion,
  Plus,
  UserRoundPlus,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUserManagementDemo } from '@/components/users/user-management-demo'
import {
  ageOnDominicanDate,
  DEMO_OTP_CODE,
  profileRouteForRole,
  roleForAccessEmail,
  todayInDominicanRepublic,
} from './login-access-utils'

export type AccessExceptionView = 'lost-email' | 'otp-reset' | 'registration'

export function AccessHelpMenu({
  onSelect,
  onBack,
}: {
  onSelect: (view: AccessExceptionView) => void
  onBack: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">¿Qué problema tienes?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Elige una opción para recuperar tu acceso o solicitar una cuenta.</p>
      </div>
      <div className="grid gap-3">
        <HelpOption
          icon={<MailQuestion aria-hidden="true" />}
          title="Perdí mi correo"
          description="Solicita ayuda para localizar tu cuenta institucional."
          onClick={() => onSelect('lost-email')}
        />
        <HelpOption
          icon={<KeyRound aria-hidden="true" />}
          title="Olvidé mi contraseña"
          description="Solicita un código temporal y verifica tu identidad."
          onClick={() => onSelect('otp-reset')}
        />
        <HelpOption
          icon={<UserRoundPlus aria-hidden="true" />}
          title="No tengo cuenta"
          description="Envía un pre-registro para aprobación manual."
          onClick={() => onSelect('registration')}
        />
      </div>
      <Button type="button" variant="ghost" onClick={onBack} className="self-start px-0 text-muted-foreground">
        <ArrowLeft data-icon="inline-start" /> Volver al inicio de sesión
      </Button>
    </div>
  )
}

function HelpOption({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-20 items-center gap-4 rounded-xl border border-border bg-background p-4 text-left transition-colors hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
    >
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A]">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-slate-900">{title}</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{description}</span>
      </span>
      <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  )
}

export function LostEmailForm({ onBack }: { onBack: () => void }) {
  const { update } = useUserManagementDemo()
  const [birthDate, setBirthDate] = useState('')
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const age = birthDate ? ageOnDominicanDate(birthDate) : null
  const requiresCedula = age !== null && age >= 16

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const fullName = String(formData.get('fullName') ?? '').trim()
    const phone = String(formData.get('phone') ?? '').trim()
    const alternateEmail = String(formData.get('alternateEmail') ?? '').trim()
    const cedula = String(formData.get('cedula') ?? '').trim()

    if (age === null) {
      setError('Ingresa una fecha de nacimiento válida para continuar.')
      return
    }
    if (requiresCedula && !cedula) {
      setError('La cédula es obligatoria a partir de los 16 años.')
      return
    }

    const id = `REC-${Date.now()}`
    update((current) => ({
      ...current,
      accountRecoveryRequests: [
        {
          id,
          fullName,
          phone,
          alternateEmail: alternateEmail || undefined,
          birthDate,
          cedula: cedula || undefined,
          requestedAt: new Date().toISOString(),
          status: 'PENDIENTE',
        },
        ...current.accountRecoveryRequests,
      ],
    }))
    setError('')
    setSubmittedRequestId(id)
  }

  if (submittedRequestId) {
    return (
      <SubmissionResult
        title="Solicitud enviada para verificación"
        description={`La solicitud ${submittedRequestId} quedó en la bandeja de recuperación de Pantalla 12. Un administrador revisará tus datos.`}
        inboxHref="/admin/usuarios?tab=aprobaciones&solicitud=recuperacion"
        onBack={onBack}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <FormHeading title="Recuperar correo institucional" description="Un administrador verificará tu identidad antes de localizar tu cuenta." />
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <FormField id="recovery-full-name" label="Nombre completo">
          <Input id="recovery-full-name" name="fullName" autoComplete="name" required className="h-10" />
        </FormField>
        <FormField id="recovery-phone" label="Teléfono de contacto · obligatorio">
          <Input id="recovery-phone" name="phone" type="tel" autoComplete="tel" required className="h-10" placeholder="809-555-0100" />
        </FormField>
        <FormField id="recovery-alt-email" label="Correo alternativo · opcional">
          <Input id="recovery-alt-email" name="alternateEmail" type="email" autoComplete="email" className="h-10" placeholder="nombre@correo.com" />
        </FormField>
        <FormField id="recovery-birth-date" label="Fecha de nacimiento">
          <Input
            id="recovery-birth-date"
            name="birthDate"
            type="date"
            value={birthDate}
            max={todayInDominicanRepublic()}
            onChange={(event) => { setBirthDate(event.target.value); setError('') }}
            required
            className="h-10"
          />
        </FormField>
        <div aria-live="polite" className="-mt-1 text-xs text-muted-foreground">
          {age === null ? 'Indica tu fecha de nacimiento para validar los requisitos de identidad.' : age >= 16 ? `Edad calculada con fecha de República Dominicana: ${age} años. Se requiere cédula.` : `Edad calculada con fecha de República Dominicana: ${age} años. Cédula opcional.`}
        </div>
        <FormField id="recovery-cedula" label={requiresCedula ? 'Cédula · obligatoria desde los 16 años' : 'Cédula · opcional'}>
          <Input id="recovery-cedula" name="cedula" required={requiresCedula} aria-required={requiresCedula} className="h-10" placeholder="000-0000000-0" />
        </FormField>
        {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
        <div className="flex flex-col gap-2 pt-1 sm:flex-row-reverse">
          <Button type="submit" className="min-h-10 flex-1">Enviar solicitud</Button>
          <Button type="button" variant="outline" onClick={onBack} className="min-h-10 flex-1">Volver</Button>
        </div>
      </form>
      <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">Modo demo: la solicitud se conserva en memoria y no consulta un directorio real.</p>
    </div>
  )
}

export function OtpResetForm({ onBack }: { onBack: () => void }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'error' | 'success'; text: string } | null>(null)

  function requestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setOtpSent(true)
    setFeedback({ kind: 'success', text: `Si la cuenta está registrada, se enviará el OTP. En este modo demo el código es ${DEMO_OTP_CODE}.` })
  }

  function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (code !== DEMO_OTP_CODE) {
      setFeedback({ kind: 'error', text: 'El código temporal no es válido. Verifica los seis dígitos e inténtalo nuevamente.' })
      return
    }

    const role = roleForAccessEmail(email)
    if (!role) {
      setFeedback({ kind: 'error', text: 'No fue posible verificar esta cuenta en la demostración. Contacta al personal de biblioteca.' })
      return
    }

    router.replace(profileRouteForRole(role))
  }

  return (
    <div className="flex flex-col gap-4">
      <FormHeading title="Restablecer contraseña" description="Solicita una clave temporal de un solo uso para verificar tu acceso." />
      {!otpSent ? (
        <form onSubmit={requestOtp} className="flex flex-col gap-3.5">
          <FormField id="otp-email" label="Correo registrado">
            <Input id="otp-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-10" placeholder="usuario@progresodigital.edu.do" />
          </FormField>
          <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">En producción, el código se enviaría con Supabase Auth OTP. Esta acción es simulada.</p>
          <div className="flex flex-col gap-2 pt-1 sm:flex-row-reverse">
            <Button type="submit" className="min-h-10 flex-1">Enviar clave temporal</Button>
            <Button type="button" variant="outline" onClick={onBack} className="min-h-10 flex-1">Volver</Button>
          </div>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="flex flex-col gap-3.5">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            Código solicitado para <span className="font-semibold">{email}</span>.
          </div>
          <FormField id="otp-code" label="Clave temporal OTP · 6 dígitos">
            <Input
              id="otp-code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => { setCode(event.target.value.replace(/\D/g, '').slice(0, 6)); setFeedback(null) }}
              required
              className="h-12 text-center font-mono text-xl tracking-[0.4em]"
              placeholder="000000"
            />
          </FormField>
          {feedback && <p role={feedback.kind === 'error' ? 'alert' : 'status'} className={feedback.kind === 'error' ? 'text-sm font-medium text-destructive' : 'text-sm font-medium text-emerald-800'}>{feedback.text}</p>}
          <div className="flex flex-col gap-2 pt-1 sm:flex-row-reverse">
            <Button type="submit" className="min-h-10 flex-1">Verificar y continuar</Button>
            <Button type="button" variant="outline" onClick={() => { setOtpSent(false); setCode(''); setFeedback(null) }} className="min-h-10 flex-1">Cambiar correo</Button>
          </div>
          <Button type="button" variant="ghost" onClick={() => setFeedback({ kind: 'success', text: `OTP reenviado en modo demo. Código: ${DEMO_OTP_CODE}.` })} className="self-start px-0 text-xs text-muted-foreground">Reenviar código</Button>
        </form>
      )}
      {feedback && !otpSent && <p role="status" className="text-sm text-emerald-800">{feedback.text}</p>}
    </div>
  )
}

export function RegistrationForm({ onBack }: { onBack: () => void }) {
  const { update } = useUserManagementDemo()
  const [birthDate, setBirthDate] = useState('')
  const [isStudent, setIsStudent] = useState(false)
  const [emails, setEmails] = useState([''])
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const age = birthDate ? ageOnDominicanDate(birthDate) : null
  const requiresCedula = age !== null && age >= 16

  function updateEmail(index: number, value: string) {
    setEmails((current) => current.map((email, emailIndex) => emailIndex === index ? value : email))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const firstName = String(formData.get('firstName') ?? '').trim()
    const lastName = String(formData.get('lastName') ?? '').trim()
    const phonePrimary = String(formData.get('phonePrimary') ?? '').trim()
    const phoneSecondary = String(formData.get('phoneSecondary') ?? '').trim()
    const cedula = String(formData.get('cedula') ?? '').trim()
    const matricula = String(formData.get('matricula') ?? '').trim()
    const validEmails = emails.map((email) => email.trim()).filter(Boolean)

    if (age === null) {
      setError('Ingresa una fecha de nacimiento válida en la zona horaria de República Dominicana.')
      return
    }
    if (validEmails.length === 0) {
      setError('Agrega al menos un correo electrónico de contacto.')
      return
    }
    if (requiresCedula && !cedula) {
      setError('La cédula es obligatoria a partir de los 16 años.')
      return
    }
    if (isStudent && !matricula) {
      setError('La matrícula es obligatoria para estudiantes de la institución.')
      return
    }

    const id = `REG-${Date.now()}`
    const fullName = `${firstName} ${lastName}`.trim()
    const identifier = isStudent ? matricula : requiresCedula ? cedula : `MENOR-16-${id.slice(-6)}`
    const request = {
      id,
      fullName,
      identifier,
      email: validEmails[0],
      emails: validEmails,
      phonePrimary,
      phoneSecondary: phoneSecondary || undefined,
      birthDate,
      cedula: cedula || undefined,
      matricula: isStudent ? matricula : undefined,
      isStudent,
      program: isStudent ? 'Estudiante de la institución' : 'Pre-registro PWA',
      requestedAt: new Date().toISOString(),
      status: 'PENDIENTE_APROBACION' as const,
    }
    update((current) => ({ ...current, registrationRequests: [request, ...current.registrationRequests] }))
    setError('')
    setSubmittedRequestId(id)
  }

  if (submittedRequestId) {
    return (
      <SubmissionResult
        title="Pre-registro recibido"
        description={`La solicitud ${submittedRequestId} quedó en estado PENDIENTE_APROBACION y se envió a la bandeja de altas de Pantalla 12.`}
        inboxHref="/admin/usuarios?tab=aprobaciones&solicitud=registros"
        onBack={onBack}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <FormHeading title="Solicitar inscripción" description="Completa el pre-registro. El personal de biblioteca validará tu información antes de activar la cuenta." />
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField id="registration-first-name" label="Nombres">
            <Input id="registration-first-name" name="firstName" autoComplete="given-name" required className="h-10" />
          </FormField>
          <FormField id="registration-last-name" label="Apellidos">
            <Input id="registration-last-name" name="lastName" autoComplete="family-name" required className="h-10" />
          </FormField>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField id="registration-phone-primary" label="Teléfono principal">
            <Input id="registration-phone-primary" name="phonePrimary" type="tel" autoComplete="tel" required className="h-10" placeholder="809-555-0100" />
          </FormField>
          <FormField id="registration-phone-secondary" label="Teléfono secundario · opcional">
            <Input id="registration-phone-secondary" name="phoneSecondary" type="tel" className="h-10" placeholder="809-555-0101" />
          </FormField>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-800">Correos de contacto</p>
            <Button type="button" variant="outline" size="sm" onClick={() => setEmails((current) => [...current, ''])}>
              <Plus data-icon="inline-start" /> Agregar correo
            </Button>
          </div>
          {emails.map((email, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                id={`registration-email-${index}`}
                name="email"
                type="email"
                autoComplete={index === 0 ? 'email' : 'off'}
                value={email}
                onChange={(event) => updateEmail(index, event.target.value)}
                required={index === 0}
                aria-label={`Correo de contacto ${index + 1}`}
                placeholder={index === 0 ? 'Correo principal' : 'Correo adicional'}
                className="h-10"
              />
              {emails.length > 1 && (
                <Button type="button" variant="ghost" size="icon" aria-label={`Quitar correo ${index + 1}`} onClick={() => setEmails((current) => current.filter((_, emailIndex) => emailIndex !== index))}>
                  <span aria-hidden="true">×</span>
                </Button>
              )}
            </div>
          ))}
        </div>
        <FormField id="registration-birth-date" label="Fecha de nacimiento">
          <Input
            id="registration-birth-date"
            name="birthDate"
            type="date"
            value={birthDate}
            max={todayInDominicanRepublic()}
            onChange={(event) => { setBirthDate(event.target.value); setError('') }}
            required
            className="h-10"
          />
        </FormField>
        <p aria-live="polite" className="-mt-2 text-xs text-muted-foreground">
          {age === null ? 'La edad se calcula usando la fecha actual de República Dominicana.' : age >= 16 ? `Edad: ${age} años · cédula obligatoria.` : `Edad: ${age} años · cédula opcional por ser menor de 16.`}
        </p>
        <FormField id="registration-cedula" label={requiresCedula ? 'Cédula · obligatoria' : 'Cédula · opcional'}>
          <Input id="registration-cedula" name="cedula" required={requiresCedula} aria-required={requiresCedula} className="h-10" placeholder="000-0000000-0" />
        </FormField>
        <label className="flex items-start gap-3 rounded-lg border border-border p-3 text-sm">
          <input type="checkbox" checked={isStudent} onChange={(event) => { setIsStudent(event.target.checked); setError('') }} className="mt-0.5 size-4 accent-[#1E3A8A]" />
          <span><span className="font-semibold text-slate-800">¿Eres estudiante de la institución?</span><span className="mt-0.5 block text-xs text-muted-foreground">Si marcas la opción, se solicitará matrícula obligatoria.</span></span>
        </label>
        {isStudent && (
          <FormField id="registration-matricula" label="Matrícula institucional">
            <Input id="registration-matricula" name="matricula" required className="h-10" placeholder="Ej. 2026-0142" />
          </FormField>
        )}
        {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
        <div className="flex flex-col gap-2 pt-1 sm:flex-row-reverse">
          <Button type="submit" className="min-h-10 flex-1">Enviar pre-registro</Button>
          <Button type="button" variant="outline" onClick={onBack} className="min-h-10 flex-1">Volver</Button>
        </div>
      </form>
      <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">Modo demo: la solicitud queda en memoria hasta que se cierre o recargue la sesión.</p>
    </div>
  )
}

function FormHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}

function FormField({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-800">{label}</label>
      {children}
    </div>
  )
}

function SubmissionResult({
  title,
  description,
  inboxHref,
  onBack,
}: {
  title: string
  description: string
  inboxHref: string
  onBack: () => void
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
      <div className="flex items-start gap-3">
        <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-emerald-700" />
        <div>
          <h2 className="font-semibold text-emerald-950">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-emerald-900">{description}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href={inboxHref} className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-emerald-900 ring-1 ring-emerald-300 hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
          Ir a bandeja de Pantalla 12
        </Link>
        <Button type="button" variant="outline" onClick={onBack} className="min-h-10 flex-1">Volver al acceso</Button>
      </div>
    </div>
  )
}
