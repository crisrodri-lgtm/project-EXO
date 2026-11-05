'use client'

import { useCallback } from 'react'
import useSWR from 'swr'

export type DemoChannel = 'PWA' | 'MANUAL'
export type DemoPaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA'

export type DemoProfile = {
  id: string
  name: string
  cedula: string
  matricula: string
  email: string
  phone: string
  channel: DemoChannel
  career: string
  activeLoans: number
  loanLimit: number
  status: 'ACTIVO' | 'BLOQUEADO'
}

export type DemoFine = {
  id: string
  profileId: string
  borrowerName: string
  cedula: string
  matricula: string
  issuedAt: string
  reason: string
  amount: number
  paid: boolean
}

export type DemoPayment = {
  id: string
  receipt: string
  profileId: string
  borrowerName: string
  createdAt: string
  method: DemoPaymentMethod
  total: number
  fineIds: string[]
}

export type DemoPwaRequest = {
  id: string
  profileId: string
  submittedAt: string
  itemCodes: string[]
}

export type DemoLibraryState = {
  profiles: DemoProfile[]
  fines: DemoFine[]
  payments: DemoPayment[]
  requests: DemoPwaRequest[]
}

export const DEMO_STUDENT_PROFILE_ID = 'V-27.845.391'

export const INITIAL_DEMO_LIBRARY_STATE: DemoLibraryState = {
  profiles: [
    {
      id: DEMO_STUDENT_PROFILE_ID,
      name: 'María Fernanda Gutiérrez López',
      cedula: '001-1729901-4',
      matricula: '2019-0832',
      email: 'maria.gutierrez@demo.test',
      phone: '809-555-0184',
      channel: 'PWA',
      career: 'Licenciatura en Educación · 5.º semestre',
      activeLoans: 2,
      loanLimit: 3,
      status: 'BLOQUEADO',
    },
    {
      id: 'borrower-marta-2022-0841',
      name: 'Marta López',
      cedula: '001-2104567-8',
      matricula: '2022-0841',
      email: 'marta.lopez@demo.test',
      phone: '809-555-0112',
      channel: 'PWA',
      career: 'Literatura · 6.º semestre',
      activeLoans: 1,
      loanLimit: 3,
      status: 'ACTIVO',
    },
    {
      id: 'borrower-daniel-pwa-2023-0660',
      name: 'Daniel Ruiz',
      cedula: '001-2158274-7',
      matricula: '2023-0660',
      email: 'daniel.ruiz@demo.test',
      phone: '809-555-0190',
      channel: 'PWA',
      career: 'Ciencias Naturales · 2.º semestre',
      activeLoans: 0,
      loanLimit: 3,
      status: 'ACTIVO',
    },
    {
      id: 'borrower-carlos-manual-2023-0417',
      name: 'Carlos Sánchez',
      cedula: '001-1287743-2',
      matricula: '2023-0417',
      email: 'carlos.sanchez@demo.test',
      phone: '809-555-0122',
      channel: 'MANUAL',
      career: 'Ingeniería · registro presencial',
      activeLoans: 1,
      loanLimit: 3,
      status: 'ACTIVO',
    },
  ],
  fines: [
    {
      id: 'SAN-2026-0148',
      profileId: DEMO_STUDENT_PROFILE_ID,
      borrowerName: 'María Fernanda Gutiérrez López',
      cedula: '001-1729901-4',
      matricula: '2019-0832',
      issuedAt: '2026-10-12',
      reason: 'Mora préstamo PR88',
      amount: 300,
      paid: false,
    },
    {
      id: 'SAN-2026-0182',
      profileId: DEMO_STUDENT_PROFILE_ID,
      borrowerName: 'María Fernanda Gutiérrez López',
      cedula: '001-1729901-4',
      matricula: '2019-0832',
      issuedAt: '2026-10-20',
      reason: 'Mancha Inc. #1042',
      amount: 450,
      paid: false,
    },
  ],
  payments: [],
  requests: [
    {
      id: 'PWA-2026-0048',
      profileId: DEMO_STUDENT_PROFILE_ID,
      submittedAt: '2026-10-30T09:25:00-04:00',
      itemCodes: ['BN-004512', 'BN-007830'],
    },
    {
      id: 'PWA-2026-0046',
      profileId: 'borrower-daniel-pwa-2023-0660',
      submittedAt: '2026-10-29T16:45:00-04:00',
      itemCodes: ['BN-010277'],
    },
    {
      id: 'PWA-2026-0043',
      profileId: 'borrower-marta-2022-0841',
      submittedAt: '2026-10-29T09:30:00-04:00',
      itemCodes: ['EJ-MAT-04'],
    },
  ],
}

const DEMO_STATE_KEY = 'biblonexo-demo-library-state'

export function normalizeDemoSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .trim()
}

export function demoIdentityKey(identity: { id?: string; cedula?: string; matricula?: string }) {
  const cedula = identity.cedula?.trim()
  const matricula = identity.matricula?.trim()
  const value = cedula || matricula || identity.id || ''
  const type = cedula ? 'cedula' : matricula ? 'matricula' : 'id'
  return `${type}:${normalizeDemoSearch(value)}`
}

export function getOutstandingAmount(profile: DemoProfile, fines: DemoFine[]) {
  const identity = demoIdentityKey(profile)
  return fines
    .filter((fine) => !fine.paid && (demoIdentityKey(fine) === identity || fine.profileId === profile.id))
    .reduce((total, fine) => total + fine.amount, 0)
}

export function isProfileBlocked(profile: DemoProfile, fines: DemoFine[]) {
  return getOutstandingAmount(profile, fines) > 0
}

export function findDemoProfile(query: string, profiles: DemoProfile[]) {
  const normalizedQuery = normalizeDemoSearch(query)
  if (!normalizedQuery) return undefined
  return profiles.find((profile) =>
    [profile.id, profile.name, profile.cedula, profile.matricula]
      .some((value) => normalizeDemoSearch(value) === normalizedQuery),
  )
}

export function formatDemoCurrency(amount: number) {
  return `RD$ ${amount.toLocaleString('es-DO', { maximumFractionDigits: 2 })}`
}

export function useDemoLibraryState() {
  const { data, mutate } = useSWR<DemoLibraryState>(DEMO_STATE_KEY, null, {
    fallbackData: INITIAL_DEMO_LIBRARY_STATE,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const update = useCallback(
    (updater: (current: DemoLibraryState) => DemoLibraryState) => {
      void mutate((current) => updater(current ?? INITIAL_DEMO_LIBRARY_STATE), { revalidate: false })
    },
    [mutate],
  )

  return { state: data ?? INITIAL_DEMO_LIBRARY_STATE, update }
}
