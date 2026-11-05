export type IncidentStatus = 'ABIERTO' | 'EN REVISIÓN' | 'RESUELTO'
export type IncidentType = 'Libro Dañado' | 'Extravío' | 'Error de Sistema'

export type Incident = {
  id: string
  date: string
  type: IncidentType
  involvedLabel: string
  involvedCode: string
  involvedDetail: string
  status: IncidentStatus
  description: string
  reportedBy: string
  evidences: string[]
}

export const INCIDENTS: Incident[] = [
  {
    id: 'INC-2026-0142',
    date: '2026-10-27',
    type: 'Libro Dañado',
    involvedLabel: 'Libro',
    involvedCode: 'BK-1004',
    involvedDetail: 'Cien años de soledad · devuelto por STU-1842',
    status: 'EN REVISIÓN',
    description:
      'Ejemplar devuelto con 12 páginas desprendidas y manchas de humedad en la cubierta. Se retiró de circulación para evaluación de encuadernación.',
    reportedBy: 'M. Andrade',
    evidences: ['/evidencia/inc-0142-t0.png', '/evidencia/inc-0142-t1.png'],
  },
  {
    id: 'INC-2026-0139',
    date: '2026-10-24',
    type: 'Extravío',
    involvedLabel: 'Libro',
    involvedCode: 'BK-1006',
    involvedDetail: 'Fundamentos de Bases de Datos · prestado a STU-3018',
    status: 'ABIERTO',
    description:
      'El usuario reporta la pérdida del ejemplar durante el periodo de préstamo. Pendiente de acuerdo de reposición o pago.',
    reportedBy: 'J. Salazar',
    evidences: ['/evidencia/inc-0139-t0.png'],
  },
]

export const MAX_EVIDENCES = 5
export const MAX_EVIDENCE_SIZE_MB = 5
export const ACCEPTED_EVIDENCE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const STATUS_OPTIONS: Array<IncidentStatus | 'TODOS'> = [
  'TODOS',
  'ABIERTO',
  'EN REVISIÓN',
  'RESUELTO',
]

export const INCIDENT_TYPE_OPTIONS: Array<{ value: IncidentType; label: string }> = [
  { value: 'Libro Dañado', label: 'Daño Físico' },
  { value: 'Extravío', label: 'Extravío' },
  { value: 'Error de Sistema', label: 'Inconsistencia de Sistema' },
]
