import type { Metadata } from 'next'
import { ProfileDashboard } from '@/components/profile/profile-dashboard'
import type { StaffRole } from '@/components/profile/profile-data'

export const metadata: Metadata = {
  title: 'Perfil del funcionario',
  description: 'Consulta la ficha de funcionario y revisa tareas pendientes de auditoría y aprobación en Biblonexo.',
}

type SearchParams = Promise<{ tab?: string; demoRole?: string; firstLoginOtp?: string }>

export default async function StaffProfilePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const initialTab = params.tab === 'configuracion' ? 'configuracion' : 'informacion'
  const staffRole: StaffRole = params.demoRole === 'auxiliar' ? 'AUXILIAR' : 'ADMINISTRADOR'

  return (
    <ProfileDashboard
      kind="FUNCIONARIO"
      staffRole={staffRole}
      initialTab={initialTab}
      requirePasswordUpdate={params.firstLoginOtp === '1'}
    />
  )
}
