import type { DemoProfile } from '@/components/circulacion/demo-library-state'

export type Borrower = {
  id: string
  profileId: string
  name: string
  type: 'ESTUDIANTE' | 'DOCENTE' | 'PERSONAL'
  career: string
  activeLoans: number
  loanLimit: number
  status: 'HABILITADO' | 'SUSPENDIDO'
  cedula?: string
  matricula?: string
  email?: string
  phone?: string
  debtAmount?: number
}

export type LoanItem = {
  code: string
  title: string
  author: string
  type: 'LIBRO' | 'TESIS' | 'REVISTA'
  dueDate: string
}

export type PwaRequest = {
  id: string
  profileId: string
  submittedAt: string
  itemCodes: string[]
}

export const MOCK_BORROWER: Borrower = {
  id: 'V-27.845.391',
  profileId: 'V-27.845.391',
  name: 'María Fernanda Gutiérrez López',
  type: 'ESTUDIANTE',
  career: 'Licenciatura en Educación · 5.º semestre',
  activeLoans: 0,
  loanLimit: 3,
  status: 'SUSPENDIDO',
  cedula: '001-1729901-4',
  matricula: '2019-0832',
  email: 'maria.gutierrez@demo.test',
  phone: '809-555-0184',
  debtAmount: 750,
}

export const INITIAL_ITEMS: LoanItem[] = [
  {
    code: 'BN-004512',
    title: 'Pedagogía del oprimido',
    author: 'Paulo Freire',
    type: 'LIBRO',
    dueDate: '13/11/2026',
  },
  {
    code: 'BN-007830',
    title: 'Metodología de la investigación',
    author: 'R. Hernández Sampieri',
    type: 'LIBRO',
    dueDate: '13/11/2026',
  },
]

export const CATALOG_SAMPLE: LoanItem[] = [
  {
    code: 'BN-010277',
    title: 'Didáctica general',
    author: 'Imídeo G. Nérici',
    type: 'LIBRO',
    dueDate: '13/11/2026',
  },
  {
    code: 'TS-000194',
    title: 'Estrategias lectoras en educación primaria',
    author: 'Trabajo de grado, 2024',
    type: 'TESIS',
    dueDate: '06/11/2026',
  },
  {
    code: 'EJ-MAT-04',
    title: 'Álgebra lineal y sus aplicaciones',
    author: 'Gilbert Strang',
    type: 'LIBRO',
    dueDate: '13/11/2026',
  },
]

export function borrowerFromProfile(profile: DemoProfile, debtAmount: number): Borrower {
  return {
    id: profile.id,
    profileId: profile.id,
    name: profile.name,
    type: 'ESTUDIANTE',
    career: profile.career,
    activeLoans: profile.activeLoans,
    loanLimit: profile.loanLimit,
    status: debtAmount > 0 ? 'SUSPENDIDO' : 'HABILITADO',
    cedula: profile.cedula,
    matricula: profile.matricula,
    email: profile.email,
    phone: profile.phone,
    debtAmount,
  }
}
