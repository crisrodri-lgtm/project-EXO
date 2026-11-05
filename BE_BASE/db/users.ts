export type UserRole = 'ADMINISTRADOR' | 'AUXILIAR' | 'ESTUDIANTE'
export type UserStatus = 'ACTIVO' | 'BLOQUEADO' | 'INACTIVO'

export type MockUser = {
  id: string
  fullName: string
  identifier: string
  email: string
  password: string
  role: UserRole
  status: UserStatus
  activeLoans: number
  pendingFine: number
  photoUrl?: string
  phone?: string
  career?: string
  matricula?: string
}

export const USERS: MockUser[] = [
  {
    id: 'ADM-001',
    fullName: 'Mariana Andrade Pérez',
    identifier: 'ADM-001',
    email: 'admin@progresodigital.edu.do',
    password: 'ExoAdmin#2026',
    role: 'ADMINISTRADOR',
    status: 'ACTIVO',
    activeLoans: 0,
    pendingFine: 0,
    phone: '809-555-0100',
  },
  {
    id: 'AUX-014',
    fullName: 'Luis García Herrera',
    identifier: 'AUX-014',
    email: 'auxiliar1@progresodigital.edu.do',
    password: 'ExoAux01#2026',
    role: 'AUXILIAR',
    status: 'ACTIVO',
    activeLoans: 0,
    pendingFine: 0,
    phone: '809-555-0101',
  },
  {
    id: 'AUX-015',
    fullName: ' Carmen Rosa Delgado',
    identifier: 'AUX-015',
    email: 'auxiliar2@progresodigital.edu.do',
    password: 'ExoAux02#2026',
    role: 'AUXILIAR',
    status: 'ACTIVO',
    activeLoans: 0,
    pendingFine: 0,
    phone: '809-555-0102',
  },
  {
    id: 'STU-2048',
    fullName: 'Andrea Martínez López',
    identifier: 'STU-2048',
    email: 'andrea.martinez@progresodigital.edu.do',
    password: 'ExoEst01#2026',
    role: 'ESTUDIANTE',
    status: 'ACTIVO',
    activeLoans: 0,
    pendingFine: 0,
    photoUrl: '/brand/student-profile.png',
    career: 'Ingeniería de Sistemas',
    matricula: '2024-2048',
  },
  {
    id: 'STU-3018',
    fullName: 'Sofía Cruz Medina',
    identifier: 'STU-3018',
    email: 'sofia.cruz@progresodigital.edu.do',
    password: 'ExoEst02#2026',
    role: 'ESTUDIANTE',
    status: 'ACTIVO',
    activeLoans: 0,
    pendingFine: 0,
    career: 'Psicología',
    matricula: '2023-3018',
  },
  {
    id: 'STU-1842',
    fullName: 'María Fernanda Gutiérrez',
    identifier: 'STU-1842',
    email: 'maria.gutierrez@progresodigital.edu.do',
    password: 'ExoEst03#2026',
    role: 'ESTUDIANTE',
    status: 'BLOQUEADO',
    activeLoans: 1,
    pendingFine: 240,
    career: 'Ingeniería Civil',
    matricula: '2022-1842',
  },
  {
    id: 'STU-1049',
    fullName: 'Pablo Torres Ramírez',
    identifier: 'STU-1049',
    email: 'pablo.torres@progresodigital.edu.do',
    password: 'ExoEst04#2026',
    role: 'ESTUDIANTE',
    status: 'INACTIVO',
    activeLoans: 0,
    pendingFine: 0,
    career: 'Tecnología',
    matricula: '2025-1049',
  },
  {
    id: 'STU-4010',
    fullName: 'Fernando Soto Paredes',
    identifier: 'STU-4010',
    email: 'fernando.soto@progresodigital.edu.do',
    password: 'ExoEst05#2026',
    role: 'ESTUDIANTE',
    status: 'ACTIVO',
    activeLoans: 0,
    pendingFine: 0,
    career: 'Matemáticas',
    matricula: '2024-4010',
  },
]

export function authenticate(email: string, password: string): MockUser | null {
  const normalizedEmail = email.trim().toLocaleLowerCase('es')
  const user = USERS.find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === password,
  )
  return user ?? null
}

export function routeForRole(role: UserRole): string {
  if (role === 'ESTUDIANTE') return '/estudiante/dashboard'
  return '/admin/dashboard'
}

export function canManageUser(actorRole: UserRole, targetRole: UserRole): boolean {
  if (actorRole === 'ADMINISTRADOR') return true
  if (actorRole === 'AUXILIAR') {
    return targetRole === 'ESTUDIANTE'
  }
  return false
}
