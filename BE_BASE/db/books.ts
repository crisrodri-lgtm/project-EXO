export type BookStatus = 'DISPONIBLE' | 'EN PRÉSTAMO'

export type BookReport = {
  code: string
  incidentType: string
  date: string
  status: 'Pendiente' | 'En revisión' | 'Atendido'
  image: string
  reportedBy: string
  summary: string
}

export type Book = {
  id: string
  title: string
  author: string
  category: string
  location: string
  year: number
  status: BookStatus
  coverUrl?: string
  availableInSeconds?: number
  waitlistCount?: number
  reports?: BookReport[]
}

const DAY = 86_400

export const BOOKS: Book[] = [
  {
    id: 'BK-1001',
    title: 'Sistemas Operativos Modernos',
    author: 'Andrew S. Tanenbaum',
    category: 'Tecnología',
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
    category: 'Tecnología',
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
    coverUrl: '/covers/cien-anos.png',
    availableInSeconds: 3 * DAY + 2 * 3600 + 15 * 60,
    waitlistCount: 5,
    reports: [
      {
        code: '#REP-2026-085',
        incidentType: 'Subrayado excesivo',
        date: '2026-10-22',
        status: 'Atendido',
        image: '/evidencia/inc-0142-t1.png',
        reportedBy: 'M. Quispe — Sala de circulación',
        summary: 'Subrayado con resaltador en capítulos 3 y 4. Se aplicó sanción según reglamento y el ejemplar sigue en circulación.',
      },
    ],
  },
  {
    id: 'BK-1005',
    title: 'Cálculo de una Variable',
    author: 'James Stewart',
    category: 'Matemáticas',
    location: 'Estante M-01',
    year: 2012,
    status: 'DISPONIBLE',
    reports: [
      {
        code: '#REP-2026-088',
        incidentType: 'Humedad en tapa',
        date: '2026-10-27',
        status: 'En revisión',
        image: '/evidencia/inc-0142-t0.png',
        reportedBy: 'L. Huamán — Devoluciones',
        summary: 'Manchas de humedad en tapa posterior detectadas en la devolución. Pendiente evaluación del área de conservación.',
      },
    ],
  },
  {
    id: 'BK-1006',
    title: 'Fundamentos de Bases de Datos',
    author: 'Abraham Silberschatz',
    category: 'Tecnología',
    location: 'Estante B-05',
    year: 2014,
    status: 'EN PRÉSTAMO',
    availableInSeconds: 6 * 3600 + 45 * 60,
    waitlistCount: 0,
  },
  {
    id: 'BK-1007',
    title: 'Álgebra Lineal y sus Aplicaciones',
    author: 'Gilbert Strang',
    category: 'Matemáticas',
    location: 'Estante M-03',
    year: 2016,
    status: 'EN PRÉSTAMO',
    coverUrl: '/covers/algebra-lineal.png',
    availableInSeconds: 2 * DAY + 14 * 3600,
    waitlistCount: 1,
  },
  {
    id: 'BK-1008',
    title: 'Estructuras de Datos en Java',
    author: 'Robert Lafore',
    category: 'Tecnología',
    location: 'Estante B-09',
    year: 2017,
    status: 'DISPONIBLE',
    reports: [
      {
        code: '#REP-2026-089',
        incidentType: 'Lomo dañado',
        date: '2026-10-28',
        status: 'Pendiente',
        image: '/evidencia/rep-2026-089.png',
        reportedBy: 'M. Quispe — Sala de circulación',
        summary: 'Lomo agrietado con hilos de encuadernación sueltos. Se recomienda reencuadernación antes de reingresar a circulación.',
      },
    ],
  },
  {
    id: 'BK-1009',
    title: 'Ingeniería de Software',
    author: 'Ian Sommerville',
    category: 'Tecnología',
    location: 'Estante B-11',
    year: 2015,
    status: 'DISPONIBLE',
    reports: [
      {
        code: '#REP-2026-087',
        incidentType: 'Página faltante',
        date: '2026-10-25',
        status: 'Pendiente',
        image: '/evidencia/rep-2026-087.png',
        reportedBy: 'R. Mamani — Auditoría',
        summary: 'Faltan las páginas 213–214 (arrancadas desde el lomo). Se notificó al usuario y se gestiona reposición.',
      },
    ],
  },
  {
    id: 'BK-1010',
    title: 'Física Universitaria Vol. 1',
    author: 'Hugh D. Young',
    category: 'Ciencias Naturales',
    location: 'Estante F-01',
    year: 2012,
    status: 'DISPONIBLE',
    reports: [
      {
        code: '#REP-2026-082',
        incidentType: 'Tapa desprendida',
        date: '2026-10-18',
        status: 'Atendido',
        image: '/evidencia/inc-0139-t0.png',
        reportedBy: 'L. Huamán — Devoluciones',
        summary: 'Tapa frontal desprendida. Reparada por conservación y reincorporada al estante el 21/10/2026.',
      },
    ],
  },
  {
    id: 'BK-1011',
    title: 'El Principito',
    author: 'Antoine de Saint-Exupéry',
    category: 'Literatura',
    location: 'Estante L-05',
    year: 1943,
    status: 'DISPONIBLE',
  },
  {
    id: 'BK-1012',
    title: 'Introducción a los Algoritmos',
    author: 'Thomas H. Cormen',
    category: 'Tecnología',
    location: 'Estante B-02',
    year: 2009,
    status: 'EN PRÉSTAMO',
    availableInSeconds: 5 * DAY + 3 * 3600,
    waitlistCount: 3,
  },
  {
    id: 'BK-1013',
    title: 'Don Quijote de la Mancha',
    author: 'Miguel de Cervantes',
    category: 'Literatura',
    location: 'Estante L-01',
    year: 1605,
    status: 'DISPONIBLE',
  },
  {
    id: 'BK-1014',
    title: 'Química General',
    author: 'Raymond Chang',
    category: 'Ciencias Naturales',
    location: 'Estante Q-03',
    year: 2019,
    status: 'DISPONIBLE',
  },
  {
    id: 'BK-1015',
    title: 'Principios de Economía',
    author: 'N. Gregory Mankiw',
    category: 'Ciencias Sociales',
    location: 'Estante E-08',
    year: 2018,
    status: 'DISPONIBLE',
  },
  {
    id: 'BK-1016',
    title: 'Redes de Computadoras',
    author: 'Andrew S. Tanenbaum',
    category: 'Tecnología',
    location: 'Estante B-06',
    year: 2010,
    status: 'EN PRÉSTAMO',
    availableInSeconds: 4 * DAY + 12 * 3600,
    waitlistCount: 4,
  },
  {
    id: 'BK-1017',
    title: 'La República',
    author: 'Platón',
    category: 'Filosofía',
    location: 'Estante P-02',
    year: -380,
    status: 'DISPONIBLE',
  },
  {
    id: 'BK-1018',
    title: 'Mecánica de Materiales',
    author: 'Ferdinand P. Beer',
    category: 'Ingeniería Civil',
    location: 'Estante D-15',
    year: 2014,
    status: 'DISPONIBLE',
  },
  {
    id: 'BK-1019',
    title: 'Estadística Aplicada',
    author: 'Douglas C. Montgomery',
    category: 'Matemáticas',
    location: 'Estante M-07',
    year: 2013,
    status: 'EN PRÉSTAMO',
    availableInSeconds: DAY + 2 * 3600,
    waitlistCount: 1,
  },
  {
    id: 'BK-1020',
    title: 'Psicología General',
    author: 'David G. Myers',
    category: 'Ciencias Sociales',
    location: 'Estante E-12',
    year: 2016,
    status: 'DISPONIBLE',
  },
  {
    id: 'BK-1021',
    title: 'Crónica de una Muerte Anunciada',
    author: 'Gabriel García Márquez',
    category: 'Literatura',
    location: 'Estante L-04',
    year: 1981,
    status: 'DISPONIBLE',
  },
  {
    id: 'BK-1022',
    title: 'Inteligencia Artificial: Un Enfoque Moderno',
    author: 'Stuart Russell',
    category: 'Tecnología',
    location: 'Estante B-14',
    year: 2020,
    status: 'EN PRÉSTAMO',
    availableInSeconds: 7 * DAY,
    waitlistCount: 6,
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
