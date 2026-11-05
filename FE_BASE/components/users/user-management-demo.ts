'use client'

import { useCallback } from 'react'
import useSWR from 'swr'

export type ManagedUserRole = 'ESTUDIANTE' | 'AUXILIAR' | 'ADMINISTRADOR'
export type ManagedUserStatus = 'ACTIVO' | 'BLOQUEADO' | 'INACTIVO'
export type RequestStatus = 'PENDIENTE' | 'PENDIENTE_APROBACION' | 'APROBADA' | 'RECHAZADA'
export type CancellationStatus = 'PENDIENTE' | 'FIRMADA' | 'DENEGADA'

export type ManagedUser = {
  id: string
  fullName: string
  identifier: string
  email: string
  role: ManagedUserRole
  status: ManagedUserStatus
  activeLoans: number
  pendingFine: number
  photoUrl?: string
}

export type RegistrationRequest = {
  id: string
  fullName: string
  identifier: string
  email: string
  program: string
  requestedAt: string
  status: RequestStatus
  phonePrimary?: string
  phoneSecondary?: string
  emails?: string[]
  birthDate?: string
  cedula?: string
  matricula?: string
  isStudent?: boolean
}

export type AccountRecoveryRequest = {
  id: string
  fullName: string
  phone: string
  alternateEmail?: string
  birthDate: string
  cedula?: string
  requestedAt: string
  status: 'PENDIENTE' | 'REVISADA'
}

export type CancellationRequest = {
  id: string
  userId: string
  fullName: string
  identifier: string
  email: string
  role: ManagedUserRole
  requestedAt: string
  activeLoans: number
  pendingFine: number
  status: CancellationStatus
}

export type UserManagementDemoState = {
  users: ManagedUser[]
  registrationRequests: RegistrationRequest[]
  accountRecoveryRequests: AccountRecoveryRequest[]
  cancellationRequests: CancellationRequest[]
}

const DEMO_CACHE_KEY = 'biblonexo:demo:user-management'

const INITIAL_STATE: UserManagementDemoState = {
  users: [
    {
      id: 'STU-2048',
      fullName: 'Andrea Martínez López',
      identifier: 'STU-2048',
      email: 'andrea.martinez@biblonexo.edu',
      role: 'ESTUDIANTE',
      status: 'ACTIVO',
      activeLoans: 0,
      pendingFine: 0,
      photoUrl: '/brand/student-profile.png',
    },
    {
      id: 'STU-3018',
      fullName: 'Sofía Cruz Medina',
      identifier: 'STU-3018',
      email: 'sofia.cruz@biblonexo.edu',
      role: 'ESTUDIANTE',
      status: 'ACTIVO',
      activeLoans: 0,
      pendingFine: 0,
    },
    {
      id: 'STU-1842',
      fullName: 'María Fernanda Gutiérrez',
      identifier: 'V-27.845.391',
      email: 'maria.gutierrez@biblonexo.edu',
      role: 'ESTUDIANTE',
      status: 'BLOQUEADO',
      activeLoans: 1,
      pendingFine: 240,
    },
    {
      id: 'STU-1049',
      fullName: 'Pablo Torres Ramírez',
      identifier: 'STU-1049',
      email: 'pablo.torres@biblonexo.edu',
      role: 'ESTUDIANTE',
      status: 'INACTIVO',
      activeLoans: 0,
      pendingFine: 0,
    },
    {
      id: 'AUX-014',
      fullName: 'Luis García Herrera',
      identifier: 'AUX-014',
      email: 'luis.garcia@biblonexo.edu',
      role: 'AUXILIAR',
      status: 'ACTIVO',
      activeLoans: 0,
      pendingFine: 0,
    },
    {
      id: 'ADM-001',
      fullName: 'Mariana Andrade Pérez',
      identifier: 'ADM-001',
      email: 'mariana.andrade@biblonexo.edu',
      role: 'ADMINISTRADOR',
      status: 'ACTIVO',
      activeLoans: 0,
      pendingFine: 0,
    },
  ],
  accountRecoveryRequests: [],
  registrationRequests: [
    {
      id: 'REG-2026-014',
      fullName: 'Fernando Soto Paredes',
      identifier: 'STU-4010',
      email: 'fernando.soto@correo.edu',
      program: 'Ingeniería de Sistemas',
      requestedAt: '2026-11-02T09:35:00',
      status: 'PENDIENTE',
    },
    {
      id: 'REG-2026-015',
      fullName: 'Camila Rivera Núñez',
      identifier: 'V-31.552.817',
      email: 'camila.rivera@correo.edu',
      program: 'Psicología',
      requestedAt: '2026-11-01T16:20:00',
      status: 'PENDIENTE',
    },
  ],
  cancellationRequests: [
    {
      id: 'BAJA-2026-001',
      userId: 'STU-3018',
      fullName: 'Sofía Cruz Medina',
      identifier: 'STU-3018',
      email: 'sofia.cruz@biblonexo.edu',
      role: 'ESTUDIANTE',
      requestedAt: '2026-11-02T08:50:00',
      activeLoans: 0,
      pendingFine: 0,
      status: 'PENDIENTE',
    },
  ],
}

export function useUserManagementDemo() {
  const { data, mutate } = useSWR<UserManagementDemoState>(DEMO_CACHE_KEY, null, {
    fallbackData: INITIAL_STATE,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  })

  const update = useCallback(
    (updater: (current: UserManagementDemoState) => UserManagementDemoState) => {
      void mutate((current) => updater(current ?? INITIAL_STATE), { revalidate: false })
    },
    [mutate],
  )

  return { state: data ?? INITIAL_STATE, update }
}
