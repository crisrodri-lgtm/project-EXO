import type { Metadata } from 'next'
import { AdminShell } from '@/components/admin/admin-shell'
import { CashierWorkspace } from '@/components/circulacion/cashier-workspace'

export const metadata: Metadata = {
  title: 'Sanciones y cobros · Caja | Biblionexo',
  description: 'Consulta deudas, registra pagos presenciales y actualiza el acceso a préstamos en Biblionexo.',
}

export default function SanctionsPage() {
  return (
    <AdminShell>
      <CashierWorkspace />
    </AdminShell>
  )
}
