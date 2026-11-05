export type BookStatus = 'DISPONIBLE' | 'EN PRÉSTAMO'

export type Book = {
  id: string
  title: string
  author: string
  category: string
  location: string
  year: number
  status: BookStatus
  coverUrl?: string
  /** Segundos restantes hasta la próxima devolución (cola FIFO). Solo para EN PRÉSTAMO. */
  availableInSeconds?: number
  /** Personas ya en lista de espera. */
  waitlistCount?: number
}

const DAY = 86_400

export const BOOKS: Book[] = [
  {
    id: 'BK-1001',
    title: 'Sistemas Operativos Modernos',
    author: 'Andrew S. Tanenbaum',
    category: 'Informática',
    location: 'Estante B-04',
    year: 2009,
    status: 'DISPONIBLE',
  },
  {
    id: 'BK-1002',
    title: 'Análisis Estructural',
    author: 'Carlos Sistemas',
    category: 'Ingeniería Civil',
    location: 'Estante D-12',
    year: 2015,
    status: 'EN PRÉSTAMO',
    availableInSeconds: DAY + 8 * 3600 + 30 * 60,
    waitlistCount: 2,
  },
  {
    id: 'BK-1003',
    title: 'Teoría General de la Información',
    author: 'Claude E. Shannon',
    category: 'Sistemas y Computación',
    location: 'Estante B-07',
    year: 1998,
    status: 'DISPONIBLE',
  },
  {
    id: 'BK-1004',
    title: 'Cien Años de Soledad',
    author: 'Gabriel García Márquez',
    category: 'Literatura',
    location: 'Estante L-02',
    year: 1967,
    status: 'EN PRÉSTAMO',
    availableInSeconds: 3 * DAY + 2 * 3600 + 15 * 60,
    waitlistCount: 5,
  },
  {
    id: 'BK-1005',
    title: 'Cálculo de una Variable',
    author: 'James Stewart',
    category: 'Matemáticas',
    location: 'Estante M-01',
    year: 2012,
    status: 'DISPONIBLE',
  },
  {
    id: 'BK-1006',
    title: 'Fundamentos de Bases de Datos',
    author: 'Abraham Silberschatz',
    category: 'Informática',
    location: 'Estante B-05',
    year: 2014,
    status: 'EN PRÉSTAMO',
    availableInSeconds: 6 * 3600 + 45 * 60,
    waitlistCount: 0,
  },
]

export const CATEGORIES = Array.from(new Set(BOOKS.map((b) => b.category))).sort((a, b) =>
  a.localeCompare(b, 'es'),
)

export function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}
