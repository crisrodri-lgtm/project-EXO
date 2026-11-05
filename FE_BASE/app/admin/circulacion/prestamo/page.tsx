import type { Metadata } from 'next'
import { AdminShell } from '@/components/admin/admin-shell'
import { LoanWorkspace } from '@/components/circulacion/loan-workspace'

export const metadata: Metadata = {
  title: 'Registro de Préstamo · Circulación | Biblionexo',
  description: 'Préstamos presenciales, solicitudes PWA, identidades manuales y validación de multas en mostrador.',
}

export default function PrestamoPage() {
  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-8">
        <nav aria-label="Ruta de navegación" className="mb-2 text-xs font-medium tracking-wide text-gray-600">
          <ol className="flex flex-wrap gap-1.5">
            <li>ADMINISTRACIÓN</li>
            <li aria-hidden="true">/</li>
            <li>CIRCULACIÓN</li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-bold text-gray-900">PRÉSTAMO</li>
          </ol>
        </nav>
        <div className="mb-6 flex flex-col gap-1 md:mb-8">
          <h1 className="text-2xl font-bold text-gray-900 text-balance md:text-3xl">Registro de Préstamo en Mostrador</h1>
          <p className="text-sm text-gray-700 md:text-base">
            RF02 / RF03 · Identifique al usuario, registre el material y confirme la operación.
          </p>
        </div>
        <LoanWorkspace />
      </div>
    </AdminShell>
  )
}
