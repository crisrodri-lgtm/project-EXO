import type { Metadata } from 'next'
import { StudentDashboard } from '@/components/estudiante/student-dashboard'

export const metadata: Metadata = {
  title: 'Inicio estudiantil',
  description: 'Consulta tus alertas, préstamos activos y estadísticas de lectura en Biblonexo.',
}

export default function StudentDashboardPage() {
  return <StudentDashboard />
}
