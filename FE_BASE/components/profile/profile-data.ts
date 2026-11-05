export type StaffRole = 'ADMINISTRADOR' | 'AUXILIAR'
export type DemoAccountScenario = 'actual' | 'prestamo' | 'multa' | 'limpio'

export type StudentProfileData = {
  userId: string
  fullName: string
  enrollmentId: string
  program: string
  semester: string
  campus: string
  email: string
  photo: string
  qrValue: string
  activeLoans: number
  pendingFine: number
}

export type ReadingHistoryEntry = {
  id: string
  title: string
  author: string
  borrowedAt: string
  returnedAt: string
  status: 'Devuelto' | 'Renovado'
}

export type StaffProfileData = {
  fullName: string
  employeeId: string
  email: string
  roleLabel: string
  permissions: string
  initials: string
}

export type PendingAuditTask = {
  id: string
  title: string
  detail: string
  source: 'Mostrador' | 'Auto-reporte PWA'
  reportedAt: string
}

export function getStudentProfile(scenario: DemoAccountScenario): StudentProfileData {
  const activeLoans = scenario === 'prestamo' ? 1 : scenario === 'limpio' || scenario === 'multa' ? 0 : 2
  const pendingFine = scenario === 'multa' ? 250 : scenario === 'limpio' || scenario === 'prestamo' ? 0 : 750

  return {
    userId: 'V-27.845.391',
    fullName: 'María Fernanda Gutiérrez López',
    enrollmentId: '2019-0832',
    program: 'Licenciatura en Educación',
    semester: '5.º semestre',
    campus: 'Campus Central',
    email: 'maria.gutierrez@demo.test',
    photo: '/brand/student-profile.png',
    qrValue: 'BIBLONEXO:2019-0832',
    activeLoans,
    pendingFine,
  }
}

export const READING_HISTORY: ReadingHistoryEntry[] = [
  {
    id: 'P-2026-0321',
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    borrowedAt: '2026-10-03',
    returnedAt: '2026-10-17',
    status: 'Devuelto',
  },
  {
    id: 'P-2026-0289',
    title: 'Pedagogía del oprimido',
    author: 'Paulo Freire',
    borrowedAt: '2026-09-10',
    returnedAt: '2026-09-24',
    status: 'Devuelto',
  },
  {
    id: 'P-2026-0254',
    title: 'El principito',
    author: 'Antoine de Saint-Exupéry',
    borrowedAt: '2026-08-18',
    returnedAt: '2026-09-01',
    status: 'Devuelto',
  },
]

export function getStaffProfile(role: StaffRole): StaffProfileData {
  if (role === 'AUXILIAR') {
    return {
      fullName: 'Luis García Herrera',
      employeeId: 'AUX-014',
      email: 'luis.garcia@biblonexo.edu',
      roleLabel: 'AUXILIAR DE BIBLIOTECA',
      permissions: 'Circulación, devoluciones y registro de incidencias',
      initials: 'LG',
    }
  }

  return {
    fullName: 'Mariana Andrade Pérez',
    employeeId: 'ADM-001',
    email: 'mariana.andrade@biblonexo.edu',
    roleLabel: 'ADMINISTRADOR DEL SISTEMA',
    permissions: 'Administración general y gestión de permisos',
    initials: 'MA',
  }
}

export const PENDING_AUDIT_TASKS: PendingAuditTask[] = [
  {
    id: 'INC-0139',
    title: 'Cien años de soledad',
    detail: 'Cubierta con daño reportado al devolver el ejemplar.',
    source: 'Mostrador',
    reportedAt: 'Hoy · 09:42',
  },
  {
    id: 'INC-0142',
    title: 'Álgebra lineal',
    detail: 'Auto-reporte PWA: páginas desprendidas y lomo debilitado.',
    source: 'Auto-reporte PWA',
    reportedAt: 'Hoy · 08:18',
  },
  {
    id: 'INC-0145',
    title: 'Introducción a la psicología',
    detail: 'Inspección pendiente tras devolución en ventanilla.',
    source: 'Mostrador',
    reportedAt: 'Ayer · 16:27',
  },
]
