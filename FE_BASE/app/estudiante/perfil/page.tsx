import type { Metadata } from 'next'
import { ProfileDashboard } from '@/components/profile/profile-dashboard'
import type { DemoAccountScenario } from '@/components/profile/profile-data'

export const metadata: Metadata = {
  title: 'Mi perfil de estudiante',
  description: 'Consulta tu carnet digital, estado de cuenta e historial de lectura de Biblonexo.',
}

type SearchParams = Promise<{ tab?: string; demo?: string; firstLoginOtp?: string }>

export default async function StudentProfilePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const initialTab = params.tab === 'configuracion' ? 'configuracion' : 'informacion'
  const demoScenario: DemoAccountScenario = params.demo === 'prestamo' || params.demo === 'multa' || params.demo === 'limpio' ? params.demo : 'actual'

  return (
    <ProfileDashboard
      kind="ESTUDIANTE"
      initialTab={initialTab}
      demoScenario={demoScenario}
      requirePasswordUpdate={params.firstLoginOtp === '1'}
    />
  )
}
