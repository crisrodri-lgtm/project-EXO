import { IncidentPortal } from '@/components/estudiante/incidencias/incident-portal'

type IncidentsSearchParams = { tab?: string }

export default async function StudentIncidentsPage({ searchParams }: { searchParams: Promise<IncidentsSearchParams> }) {
  const params = await searchParams
  const initialTab = params.tab === 'history' ? 'history' : 'new'

  return <IncidentPortal initialTab={initialTab} />
}
