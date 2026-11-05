export type CategoriaIncidencia =
  | 'MANCHA'
  | 'HOJA_SUELTA'
  | 'LOMO_ROTO'
  | 'PERDIDA_TOTAL'
  | 'OTRO'

export type EstadoIncidencia =
  | 'PENDIENTE_REVISION'
  | 'RESOLVIDO_ACEPTADO'
  | 'DESESTIMADO'

export interface Ejemplar {
  codigo: string
  titulo: string
  autor: string
}

export interface Prestamo {
  codigo: string
  ejemplar: Ejemplar
  fechaPrestamo: string
  fechaDevolucion: string
  activo: boolean
}

export interface Incidencia {
  codigo: string
  prestamoCodigo: string
  ejemplarCodigo: string
  fecha: string
  categoria: CategoriaIncidencia
  descripcion: string
  estado: EstadoIncidencia
  fotoUrl?: string
}

export const MOCK_PRESTAMOS: Prestamo[] = [
  {
    codigo: 'PR-882',
    ejemplar: { codigo: 'EJ-MAT-04', titulo: 'Álgebra Lineal', autor: 'Stanley I. Grossman' },
    fechaPrestamo: '2026-10-12',
    fechaDevolucion: '2026-11-02',
    activo: true,
  },
  {
    codigo: 'PR-901',
    ejemplar: { codigo: 'EJ-LIT-18', titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez' },
    fechaPrestamo: '2026-10-20',
    fechaDevolucion: '2026-11-10',
    activo: true,
  },
]

export const MOCK_REPORTES: Incidencia[] = [
  {
    codigo: 'REP-2026-087',
    prestamoCodigo: 'PR-801',
    ejemplarCodigo: 'EJ-HIS-12',
    fecha: '2026-10-22',
    categoria: 'HOJA_SUELTA',
    descripcion: 'Noté varias hojas sueltas en el capítulo tres al abrir el libro.',
    estado: 'PENDIENTE_REVISION',
    fotoUrl: '/evidencia/rep-2026-087.png',
  },
  {
    codigo: 'REP-2026-061',
    prestamoCodigo: 'PR-734',
    ejemplarCodigo: 'EJ-MAT-09',
    fecha: '2026-10-04',
    categoria: 'MANCHA',
    descripcion: 'Mancha de tinta en la portada interior; el texto se lee completo.',
    estado: 'RESOLVIDO_ACEPTADO',
    fotoUrl: '/evidencia/rep-2026-089.png',
  },
  {
    codigo: 'REP-2026-038',
    prestamoCodigo: 'PR-692',
    ejemplarCodigo: 'EJ-LIT-02',
    fecha: '2026-09-19',
    categoria: 'OTRO',
    descripcion: 'La cubierta tiene una marca leve de uso, sin afectar el contenido.',
    estado: 'DESESTIMADO',
  },
]

export const MOCK_HISTORIAL_ANONIMO: Incidencia[] = [
  {
    codigo: 'ANT-2026-044',
    prestamoCodigo: 'PR-760',
    ejemplarCodigo: 'EJ-MAT-04',
    fecha: '2026-09-28',
    categoria: 'LOMO_ROTO',
    descripcion: 'Desgaste en el borde inferior del lomo. El libro continúa siendo legible.',
    estado: 'RESOLVIDO_ACEPTADO',
    fotoUrl: '/evidencia/rep-2026-087.png',
  },
  {
    codigo: 'ANT-2026-019',
    prestamoCodigo: 'PR-631',
    ejemplarCodigo: 'EJ-MAT-04',
    fecha: '2026-08-14',
    categoria: 'MANCHA',
    descripcion: 'Pequeña mancha en la página 42, sin cubrir ejercicios ni fórmulas.',
    estado: 'RESOLVIDO_ACEPTADO',
    fotoUrl: '/evidencia/rep-2026-089.png',
  },
  {
    codigo: 'ANT-2026-012',
    prestamoCodigo: 'PR-608',
    ejemplarCodigo: 'EJ-MAT-09',
    fecha: '2026-07-30',
    categoria: 'HOJA_SUELTA',
    descripcion: 'Una hoja de ejercicios se encuentra suelta cerca de la sección de matrices.',
    estado: 'PENDIENTE_REVISION',
    fotoUrl: '/evidencia/rep-2026-087.png',
  },
]

export const CATEGORIAS: CategoriaIncidencia[] = [
  'MANCHA',
  'HOJA_SUELTA',
  'LOMO_ROTO',
  'PERDIDA_TOTAL',
  'OTRO',
]
