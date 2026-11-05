import type { Metadata } from 'next'
import { AdminShell } from '@/components/admin/admin-shell'
import { AuditWorkspace } from '@/components/auditoria/audit-workspace'

export const metadata: Metadata = {
  title: 'Auditoría Manual e Incidencias | Biblionexo',
  description: 'Registro y seguimiento de incidencias del material bibliográfico.',
}

export default function IncidenciasPage() {
  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-8">
        <nav aria-label="Ruta de navegación" className="mb-2 text-xs font-medium tracking-wide text-gray-700">
          <ol className="flex flex-wrap gap-1.5">
            <li>ADMINISTRACIÓN</li>
            <li aria-hidden="true">/</li>
            <li>AUDITORÍA</li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-bold text-gray-900">
              INCIDENCIAS
            </li>
          </ol>
        </nav>
        <AuditWorkspace />
      </div>
    </AdminShell>
  )
}
