import type { Metadata } from 'next'
import { UserManagementWorkspace } from '@/components/users/user-management-workspace'

export const metadata: Metadata = {
  title: 'Gestión de usuarios y solicitudes',
  description: 'Administra usuarios, registros PWA, solicitudes de baja y credenciales de Biblonexo.',
}

type SearchParams = Promise<{ tab?: string; solicitud?: string }>

export default async function UsersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const initialTab = params.tab === 'aprobaciones' ? 'solicitudes' : 'directorio'
  const initialRequestTab = params.solicitud === 'bajas' ? 'bajas' : params.solicitud === 'recuperacion' ? 'recuperacion' : 'registros'

  return (
    <UserManagementWorkspace
      initialTab={initialTab}
      initialRequestTab={initialRequestTab}
    />
  )
}
