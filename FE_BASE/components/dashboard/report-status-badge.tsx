import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ReportStatus } from './dashboard-data'

const STATUS_STYLES: Record<ReportStatus, string> = {
  Atendido: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  Pendiente: 'border-amber-300 bg-amber-50 text-amber-900',
  'En revisión': 'border-blue-300 bg-blue-50 text-blue-900',
}

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return (
    <Badge variant="outline" className={cn('font-semibold', STATUS_STYLES[status])}>
      {status}
    </Badge>
  )
}
