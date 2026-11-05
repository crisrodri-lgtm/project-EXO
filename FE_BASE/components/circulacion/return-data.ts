export type BorrowerIdentity = {
  id: string
  name: string
  matricula: string
  cedula: string
  channel: 'PWA' | 'MANUAL'
  program: string
}

export type CustodyRecord = {
  borrower: BorrowerIdentity
  channel: 'PWA' | 'MANUAL'
  receivedAt: string
}

export type Reservation = {
  id: string
  name: string
  identity: string
  position: number
  requestedAt: string
}

export type ReturnLoan = {
  id: string
  copyCode: string
  title: string
  author: string
  checkedOutAt: string
  dueAt: string
  currentHolder: BorrowerIdentity
  priorCustodians: CustodyRecord[]
  selfReport?: { reportedAt: string; description: string }
  reservationQueue: Reservation[]
  state: 'ACTIVE' | 'RETURNED'
  itemState: 'EN PRÉSTAMO' | 'DISPONIBLE' | 'RESERVADO' | 'EN AUDITORÍA'
  assignedTo?: string
}

const firstReservation: Reservation = {
  id: 'fifo-001',
  name: 'Carlos Sánchez',
  identity: 'Matrícula 2023-0417',
  position: 1,
  requestedAt: '2026-10-25',
}

export const INITIAL_RETURN_LOANS: ReturnLoan[] = [
  {
    id: 'return-001',
    copyCode: 'EJ-LIT-18',
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    checkedOutAt: '2026-10-14',
    dueAt: '2026-10-28',
    currentHolder: {
      id: 'borrower-marta-2022-0841',
      name: 'Marta López',
      matricula: '2022-0841',
      cedula: '001-2104567-8',
      channel: 'PWA',
      program: 'Literatura · 6.º semestre',
    },
    priorCustodians: [
      {
        borrower: {
          id: 'borrower-luis-manual-001',
          name: 'Luis Rojas',
          matricula: '2020-1182',
          cedula: '001-1840021-6',
          channel: 'MANUAL',
          program: 'Registro histórico de mostrador',
        },
        channel: 'MANUAL',
        receivedAt: '2026-09-30',
      },
      {
        borrower: {
          id: 'borrower-ana-pwa-2021-0933',
          name: 'Ana Pérez',
          matricula: '2021-0933',
          cedula: '001-1722080-3',
          channel: 'PWA',
          program: 'Educación · 5.º semestre',
        },
        channel: 'PWA',
        receivedAt: '2026-08-18',
      },
    ],
    selfReport: {
      reportedAt: '2026-10-15',
      description: 'Mancha en el margen de la página 42, registrada al recibir el ejemplar.',
    },
    reservationQueue: [firstReservation],
    state: 'ACTIVE',
    itemState: 'EN PRÉSTAMO',
  },
  {
    id: 'return-002',
    copyCode: 'EJ-MAT-04',
    title: 'Álgebra lineal y sus aplicaciones',
    author: 'Gilbert Strang',
    checkedOutAt: '2026-10-17',
    dueAt: '2026-10-29',
    currentHolder: {
      id: 'borrower-carlos-manual-2023-0417',
      name: 'Carlos Sánchez',
      matricula: '2023-0417',
      cedula: '001-1287743-2',
      channel: 'MANUAL',
      program: 'Ingeniería · registro presencial',
    },
    priorCustodians: [
      {
        borrower: {
          id: 'borrower-ana-manual-2019-0832',
          name: 'María Fernanda Gutiérrez',
          matricula: '2019-0832',
          cedula: '001-1729901-4',
          channel: 'MANUAL',
          program: 'Préstamo presencial legado',
        },
        channel: 'MANUAL',
        receivedAt: '2026-09-21',
      },
    ],
    reservationQueue: [],
    state: 'ACTIVE',
    itemState: 'EN PRÉSTAMO',
  },
  {
    id: 'return-003',
    copyCode: 'EJ-COM-11',
    title: 'Sistemas operativos modernos',
    author: 'Andrew S. Tanenbaum',
    checkedOutAt: '2026-10-20',
    dueAt: '2026-10-30',
    currentHolder: {
      id: 'borrower-ana-manual-2024-0150',
      name: 'Ana Sofía Pérez',
      matricula: '2024-0150',
      cedula: '001-2013568-9',
      channel: 'MANUAL',
      program: 'Cédula capturada en mostrador · sin cuenta PWA',
    },
    priorCustodians: [
      {
        borrower: {
          id: 'borrower-diego-pwa-2022-0521',
          name: 'Diego Ramírez',
          matricula: '2022-0521',
          cedula: '001-1846613-0',
          channel: 'PWA',
          program: 'Informática · 4.º semestre',
        },
        channel: 'PWA',
        receivedAt: '2026-10-03',
      },
    ],
    reservationQueue: [firstReservation],
    state: 'ACTIVE',
    itemState: 'EN PRÉSTAMO',
  },
  {
    id: 'return-004',
    copyCode: 'EJ-DER-06',
    title: 'Teoría general del proceso',
    author: 'Eduardo J. Couture',
    checkedOutAt: '2026-10-21',
    dueAt: '2026-10-31',
    currentHolder: {
      id: 'borrower-andrea-pwa-2024-0227',
      name: 'Andrea Martínez',
      matricula: '2024-0227',
      cedula: '001-2145801-2',
      channel: 'PWA',
      program: 'Derecho · 3.º semestre',
    },
    priorCustodians: [],
    reservationQueue: [],
    state: 'ACTIVE',
    itemState: 'EN PRÉSTAMO',
  },
  {
    id: 'return-005',
    copyCode: 'EJ-BIO-02',
    title: 'Biología: la vida en la Tierra',
    author: 'Teresa Audesirk',
    checkedOutAt: '2026-10-24',
    dueAt: '2026-11-03',
    currentHolder: {
      id: 'borrower-daniel-pwa-2023-0660',
      name: 'Daniel Ruiz',
      matricula: '2023-0660',
      cedula: '001-2158274-7',
      channel: 'PWA',
      program: 'Ciencias Naturales · 2.º semestre',
    },
    priorCustodians: [],
    reservationQueue: [],
    state: 'ACTIVE',
    itemState: 'EN PRÉSTAMO',
  },
]

export function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .trim()
}

export function getTodayISO() {
  const today = new Date()
  return new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())).toISOString().slice(0, 10)
}

export function dateDifferenceInDays(from: string, to: string) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000)
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('es-DO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T12:00:00Z`))
}
