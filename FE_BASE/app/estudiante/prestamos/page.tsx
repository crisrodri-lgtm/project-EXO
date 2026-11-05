import type { Metadata } from 'next'
import { PrestamosPortal } from '@/components/estudiante/prestamos-portal'

export const metadata: Metadata = {
  title: 'Mis préstamos y reservas',
  description: 'Consulta préstamos activos, fechas de devolución y reservas en cola FIFO.',
}

export default function StudentLoansPage() {
  return <PrestamosPortal />
}
