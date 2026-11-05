import { AlertTriangle, ArrowDownRight, ArrowUpRight, BookOpenCheck, Clock3, Search, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Kpi, KpiId } from './dashboard-data'

const KPI_ICONS: Record<KpiId, LucideIcon> = {
  prestamos: BookOpenCheck,
  devolucion: Clock3,
  incidencias: AlertTriangle,
  opac: Search,
}

export function KpiCards({ kpis }: { kpis: Kpi[] }) {
  return (
    <section aria-label="Indicadores clave" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} />
      ))}
    </section>
  )
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = KPI_ICONS[kpi.id]
  const increased = kpi.change >= 0
  const favorable = increased === kpi.higherIsBetter
  const TrendIcon = increased ? ArrowUpRight : ArrowDownRight

  return (
    <Card className="gap-0 rounded-md bg-white p-5 py-5 text-gray-900 shadow-none ring-1 ring-gray-300">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-snug text-gray-700">{kpi.label}</h3>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#1E3A8A]/10 text-[#1E3A8A]">
          <Icon className="size-6" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tabular-nums tracking-tight">{kpi.value}</span>
        {kpi.unit && <span className="text-sm font-medium text-gray-600">{kpi.unit}</span>}
      </p>
      <p className="mt-3 flex items-center gap-1.5 text-sm">
        <span
          className={cn(
            'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-bold tabular-nums',
            favorable ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800',
          )}
        >
          <TrendIcon className="size-4" aria-hidden="true" />
          <span className="sr-only">{increased ? 'Aumento de' : 'Disminución de'}</span>
          {Math.abs(kpi.change)}%
        </span>
        <span className="text-gray-600">{kpi.comparison}</span>
      </p>
    </Card>
  )
}
