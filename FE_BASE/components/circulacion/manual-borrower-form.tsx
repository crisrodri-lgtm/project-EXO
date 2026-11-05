'use client'

import { useState, type FormEvent } from 'react'
import { ContactRound, UserPlus } from 'lucide-react'
import { inputClass } from '@/components/circulacion/section-card'
import {
  getOutstandingAmount,
  normalizeDemoSearch,
  useDemoLibraryState,
  type DemoProfile,
} from '@/components/circulacion/demo-library-state'

type ManualBorrowerFormProps = {
  onProfileCreated: (profile: DemoProfile) => void
}

export function ManualBorrowerForm({ onProfileCreated }: ManualBorrowerFormProps) {
  const { state, update } = useDemoLibraryState()
  const [identifier, setIdentifier] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')

    const cleanIdentifier = identifier.trim()
    const cleanName = name.trim()
    const cleanEmail = email.trim().toLocaleLowerCase('es')
    const cleanPhone = phone.trim()
    if (!cleanIdentifier || !cleanName || !cleanEmail || !cleanPhone) {
      setError('Completa todos los campos obligatorios antes de registrar la identidad.')
      return
    }

    const normalizedIdentifier = normalizeDemoSearch(cleanIdentifier)
    const existing = state.profiles.find((profile) =>
      [profile.cedula, profile.matricula].some((value) => normalizeDemoSearch(value) === normalizedIdentifier),
    )
    if (existing?.channel === 'PWA') {
      setError('Esta identidad ya está vinculada a una cuenta PWA. Utiliza la pestaña de préstamo digital.')
      return
    }

    const isCedula = cleanIdentifier.replace(/\D/g, '').length === 11
    const profileId = existing?.id ?? `MAN-${normalizedIdentifier.replace(/[^a-z0-9]+/g, '-')}`
    const identity = {
      id: profileId,
      cedula: isCedula ? cleanIdentifier : '',
      matricula: isCedula ? '' : cleanIdentifier,
    }
    const profile: DemoProfile = {
      ...identity,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      channel: 'MANUAL',
      career: 'Registro presencial · sin cuenta PWA',
      activeLoans: existing?.activeLoans ?? 0,
      loanLimit: existing?.loanLimit ?? 3,
      status: 'ACTIVO',
    }
    profile.status = getOutstandingAmount(profile, state.fines) > 0 ? 'BLOQUEADO' : 'ACTIVO'

    update((current) => ({
      ...current,
      profiles: existing
        ? current.profiles.map((item) => item.id === existing.id ? profile : item)
        : [...current.profiles, profile],
    }))
    onProfileCreated(profile)
    setMessage(`Identidad vinculada a ${isCedula ? 'la cédula' : 'la matrícula'} para trazabilidad de notificaciones.`)
  }

  return (
    <section aria-labelledby="manual-identity-title" className="rounded-md border border-gray-300 bg-white">
      <header className="border-b border-gray-300 px-4 py-3 md:px-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[#1E3A8A]">
            <ContactRound aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 id="manual-identity-title" className="text-sm font-bold tracking-wide text-gray-900 md:text-base">IDENTIDAD PRESENCIAL</h2>
            <p className="mt-0.5 text-sm text-gray-600">Solo para estudiantes sin cuenta PWA. Los datos de contacto quedan vinculados a su identificación en esta demo.</p>
          </div>
        </div>
      </header>
      <div className="p-4 md:p-6">
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <label htmlFor="manual-identifier" className="flex flex-col gap-1.5 text-sm font-semibold text-gray-800">
            Cédula / Matrícula física <span className="text-xs font-normal text-gray-600">Obligatorio</span>
            <input id="manual-identifier" value={identifier} onChange={(event) => setIdentifier(event.target.value)} required autoComplete="off" placeholder="Ej. 001-1287743-2" className={inputClass} />
          </label>
          <label htmlFor="manual-name" className="flex flex-col gap-1.5 text-sm font-semibold text-gray-800">
            Nombre completo <span className="text-xs font-normal text-gray-600">Obligatorio</span>
            <input id="manual-name" value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" placeholder="Nombre y apellidos" className={inputClass} />
          </label>
          <label htmlFor="manual-email" className="flex flex-col gap-1.5 text-sm font-semibold text-gray-800">
            Correo <span className="text-xs font-normal text-gray-600">Para notificaciones de mora</span>
            <input id="manual-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="estudiante@correo.edu.do" className={inputClass} />
          </label>
          <label htmlFor="manual-phone" className="flex flex-col gap-1.5 text-sm font-semibold text-gray-800">
            Teléfono <span className="text-xs font-normal text-gray-600">Para notificaciones de mora</span>
            <input id="manual-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required autoComplete="tel" placeholder="809-555-0000" className={inputClass} />
          </label>
          <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-gray-600">El registro es temporal: al recargar la aplicación se restauran los datos de demostración.</p>
            <button type="submit" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-[#1E3A8A] px-4 text-sm font-bold text-white hover:bg-[#172E6E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]">
              <UserPlus aria-hidden="true" className="size-4" /> Registrar identidad
            </button>
          </div>
        </form>
        {error && <p role="alert" className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800">{error}</p>}
        {message && <p role="status" className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">{message}</p>}
      </div>
    </section>
  )
}
