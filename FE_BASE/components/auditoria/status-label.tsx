import type { IncidentStatus } from '@/components/auditoria/incident-data'

export function StatusLabel({ status }: { status: IncidentStatus }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-sm border border-gray-700 bg-white px-2 py-1 text-xs font-bold tracking-wide text-gray-900">
      ESTADO: {status}
    </span>
  )
}
