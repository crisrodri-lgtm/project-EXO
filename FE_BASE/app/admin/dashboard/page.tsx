import type { Metadata } from 'next'
import { AdminShell } from '@/components/admin/admin-shell'
import { MisDashboard } from '@/components/dashboard/mis-dashboard'

export const metadata: Metadata = {
  title: 'Tablero Gerencial MIS | Biblionexo',
  description: 'Resumen ejecutivo de operaciones, estadísticas de uso y alertas del sistema bibliotecario.',
}

export default function DashboardPage() {
  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-8">
        <nav aria-label="Ruta de navegación" className="mb-2 text-xs font-medium tracking-wide text-gray-700 print:hidden">
          <ol className="flex flex-wrap gap-1.5">
            <li>ADMINISTRACIÓN</li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-bold text-gray-900">
              TABLERO GERENCIAL
            </li>
          </ol>
        </nav>
        <MisDashboard />
      </div>
    </AdminShell>
  )
}
