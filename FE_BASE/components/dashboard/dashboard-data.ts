export type DateRange = '30d' | 'mes' | 'anio'

export const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '30d', label: 'Últimos 30 días' },
  { value: 'mes', label: 'Este mes' },
  { value: 'anio', label: 'Año en curso' },
]

export type KpiId = 'prestamos' | 'devolucion' | 'incidencias' | 'opac'

export type Kpi = {
  id: KpiId
  label: string
  value: string
  unit?: string
  change: number
  /** true when a positive change is a good outcome */
  higherIsBetter: boolean
  comparison: string
}

const KPIS_BY_RANGE: Record<DateRange, Kpi[]> = {
  '30d': [
    { id: 'prestamos', label: 'Total de préstamos activos', value: '1,248', change: 12, higherIsBetter: true, comparison: 'vs. periodo anterior' },
    { id: 'devolucion', label: 'Tasa de devolución a tiempo', value: '94.2', unit: '%', change: 2.1, higherIsBetter: true, comparison: 'vs. periodo anterior' },
    { id: 'incidencias', label: 'Incidencias / daños registrados', value: '18', unit: 'pendientes', change: -5, higherIsBetter: false, comparison: 'vs. periodo anterior' },
    { id: 'opac', label: 'Usuarios activos / consultas OPAC', value: '3,850', unit: 'consultas', change: 8.4, higherIsBetter: true, comparison: 'vs. periodo anterior' },
  ],
  mes: [
    { id: 'prestamos', label: 'Total de préstamos activos', value: '1,102', change: 9.6, higherIsBetter: true, comparison: 'vs. mes anterior' },
    { id: 'devolucion', label: 'Tasa de devolución a tiempo', value: '93.7', unit: '%', change: 1.4, higherIsBetter: true, comparison: 'vs. mes anterior' },
    { id: 'incidencias', label: 'Incidencias / daños registrados', value: '15', unit: 'pendientes', change: -7.2, higherIsBetter: false, comparison: 'vs. mes anterior' },
    { id: 'opac', label: 'Usuarios activos / consultas OPAC', value: '3,410', unit: 'consultas', change: 6.1, higherIsBetter: true, comparison: 'vs. mes anterior' },
  ],
  anio: [
    { id: 'prestamos', label: 'Total de préstamos acumulados', value: '11,936', change: 18.3, higherIsBetter: true, comparison: 'vs. año anterior' },
    { id: 'devolucion', label: 'Tasa de devolución a tiempo', value: '92.8', unit: '%', change: 3.5, higherIsBetter: true, comparison: 'vs. año anterior' },
    { id: 'incidencias', label: 'Incidencias / daños registrados', value: '164', unit: 'en el año', change: 4.2, higherIsBetter: false, comparison: 'vs. año anterior' },
    { id: 'opac', label: 'Usuarios activos / consultas OPAC', value: '36,720', unit: 'consultas', change: 22.7, higherIsBetter: true, comparison: 'vs. año anterior' },
  ],
}

export function getKpis(range: DateRange) {
  return KPIS_BY_RANGE[range]
}

export type TrendPoint = {
  periodo: string
  sistemas: number
  ingenieria: number
  literatura: number
  ciencias: number
}

const TREND_BY_RANGE: Record<DateRange, TrendPoint[]> = {
  '30d': [
    { periodo: '30 sep – 6 oct', sistemas: 96, ingenieria: 74, literatura: 52, ciencias: 41 },
    { periodo: '7 – 13 oct', sistemas: 112, ingenieria: 81, literatura: 49, ciencias: 46 },
    { periodo: '14 – 20 oct', sistemas: 128, ingenieria: 92, literatura: 58, ciencias: 50 },
    { periodo: '21 – 29 oct', sistemas: 141, ingenieria: 97, literatura: 61, ciencias: 55 },
  ],
  mes: [
    { periodo: '1 – 7 oct', sistemas: 88, ingenieria: 70, literatura: 47, ciencias: 38 },
    { periodo: '8 – 14 oct', sistemas: 104, ingenieria: 79, literatura: 51, ciencias: 44 },
    { periodo: '15 – 21 oct', sistemas: 121, ingenieria: 88, literatura: 55, ciencias: 49 },
    { periodo: '22 – 29 oct', sistemas: 133, ingenieria: 94, literatura: 59, ciencias: 53 },
  ],
  anio: [
    { periodo: 'Ene', sistemas: 310, ingenieria: 240, literatura: 180, ciencias: 150 },
    { periodo: 'Feb', sistemas: 280, ingenieria: 225, literatura: 170, ciencias: 140 },
    { periodo: 'Mar', sistemas: 420, ingenieria: 330, literatura: 210, ciencias: 190 },
    { periodo: 'Abr', sistemas: 465, ingenieria: 350, literatura: 220, ciencias: 205 },
    { periodo: 'May', sistemas: 490, ingenieria: 372, literatura: 230, ciencias: 210 },
    { periodo: 'Jun', sistemas: 455, ingenieria: 340, literatura: 240, ciencias: 198 },
    { periodo: 'Jul', sistemas: 300, ingenieria: 230, literatura: 260, ciencias: 150 },
    { periodo: 'Ago', sistemas: 380, ingenieria: 290, literatura: 215, ciencias: 172 },
    { periodo: 'Sep', sistemas: 470, ingenieria: 355, literatura: 225, ciencias: 201 },
    { periodo: 'Oct', sistemas: 504, ingenieria: 361, literatura: 233, ciencias: 214 },
  ],
}

export function getTrend(range: DateRange) {
  return TREND_BY_RANGE[range]
}

export const AREA_LABELS = {
  sistemas: 'Sistemas',
  ingenieria: 'Ingeniería',
  literatura: 'Literatura',
  ciencias: 'Ciencias básicas',
} as const

export type InventorySegment = {
  key: 'sala' | 'prestados' | 'reparacion' | 'baja'
  label: string
  value: number
  color: string
}

export const INVENTORY: InventorySegment[] = [
  { key: 'sala', label: 'En sala', value: 6420, color: '#1E3A8A' },
  { key: 'prestados', label: 'Prestados', value: 1248, color: '#3B82F6' },
  { key: 'reparacion', label: 'En reparación', value: 86, color: '#D97706' },
  { key: 'baja', label: 'Dados de baja', value: 142, color: '#6B7280' },
]

export type ReportStatus = 'Atendido' | 'Pendiente' | 'En revisión'

export type AuditReport = {
  code: string
  bookTitle: string
  inventoryCode: string
  incidentType: string
  date: string
  status: ReportStatus
  image: string
  reportedBy: string
  summary: string
}

export const RECENT_REPORTS: AuditReport[] = [
  {
    code: '#REP-2026-089',
    bookTitle: 'Estructuras de datos en Java',
    inventoryCode: 'INV-004512',
    incidentType: 'Lomo dañado',
    date: '2026-10-28',
    status: 'Pendiente',
    image: '/evidencia/rep-2026-089.png',
    reportedBy: 'M. Quispe — Sala de circulación',
    summary: 'Lomo agrietado con hilos de encuadernación sueltos. Se recomienda reencuadernación antes de reingresar a circulación.',
  },
  {
    code: '#REP-2026-088',
    bookTitle: 'Cálculo de una variable',
    inventoryCode: 'INV-002287',
    incidentType: 'Humedad en tapa',
    date: '2026-10-27',
    status: 'En revisión',
    image: '/evidencia/inc-0142-t0.png',
    reportedBy: 'L. Huamán — Devoluciones',
    summary: 'Manchas de humedad en tapa posterior detectadas en la devolución. Pendiente evaluación del área de conservación.',
  },
  {
    code: '#REP-2026-087',
    bookTitle: 'Ingeniería de software',
    inventoryCode: 'INV-003961',
    incidentType: 'Página faltante',
    date: '2026-10-25',
    status: 'Pendiente',
    image: '/evidencia/rep-2026-087.png',
    reportedBy: 'R. Mamani — Auditoría',
    summary: 'Faltan las páginas 213–214 (arrancadas desde el lomo). Se notificó al usuario y se gestiona reposición.',
  },
  {
    code: '#REP-2026-085',
    bookTitle: 'Cien años de soledad',
    inventoryCode: 'INV-007104',
    incidentType: 'Subrayado excesivo',
    date: '2026-10-22',
    status: 'Atendido',
    image: '/evidencia/inc-0142-t1.png',
    reportedBy: 'M. Quispe — Sala de circulación',
    summary: 'Subrayado con resaltador en capítulos 3 y 4. Se aplicó sanción según reglamento y el ejemplar sigue en circulación.',
  },
  {
    code: '#REP-2026-082',
    bookTitle: 'Física universitaria Vol. 1',
    inventoryCode: 'INV-001830',
    incidentType: 'Tapa desprendida',
    date: '2026-10-18',
    status: 'Atendido',
    image: '/evidencia/inc-0139-t0.png',
    reportedBy: 'L. Huamán — Devoluciones',
    summary: 'Tapa frontal desprendida. Reparada por conservación y reincorporada al estante el 21/10/2026.',
  },
]

export function formatDate(iso: string) {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}
