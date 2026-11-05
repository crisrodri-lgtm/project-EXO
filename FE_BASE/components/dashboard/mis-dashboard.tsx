'use client'

import { useState } from 'react'
import { DashboardHeader } from './dashboard-header'
import { DATE_RANGE_OPTIONS, INVENTORY, RECENT_REPORTS, getKpis, getTrend, type DateRange } from './dashboard-data'
import { InventoryStatus } from './inventory-status'
import { KpiCards } from './kpi-cards'
import { LoansTrendChart } from './loans-trend-chart'
import { RecentReportsTable } from './recent-reports-table'

function toCsvCell(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`
}

export function MisDashboard() {
  const [range, setRange] = useState<DateRange>('30d')
  const rangeLabel = DATE_RANGE_OPTIONS.find((option) => option.value === range)?.label ?? ''
  const kpis = getKpis(range)
  const trend = getTrend(range)

  function exportSpreadsheet() {
    const rows: (string | number)[][] = [
      ['Tablero Gerencial MIS', rangeLabel],
      [],
      ['Indicador', 'Valor', 'Unidad', 'Variación %'],
      ...kpis.map((kpi) => [kpi.label, kpi.value, kpi.unit ?? '', kpi.change]),
      [],
      ['Periodo', 'Sistemas', 'Ingeniería', 'Literatura', 'Ciencias básicas'],
      ...trend.map((point) => [point.periodo, point.sistemas, point.ingenieria, point.literatura, point.ciencias]),
      [],
      ['Estado de inventario', 'Ejemplares'],
      ...INVENTORY.map((segment) => [segment.label, segment.value]),
      [],
      ['Código', 'Libro', 'Incidencia', 'Fecha', 'Estado'],
      ...RECENT_REPORTS.map((report) => [report.code, report.bookTitle, report.incidentType, report.date, report.status]),
    ]
    const csv = '\uFEFF' + rows.map((row) => row.map(toCsvCell).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `tablero-mis-${range}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        range={range}
        onRangeChange={setRange}
        onExportPdf={() => window.print()}
        onExportXlsx={exportSpreadsheet}
      />
      <KpiCards kpis={kpis} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <LoansTrendChart data={trend} rangeLabel={rangeLabel} />
        </div>
        <InventoryStatus />
      </div>
      <RecentReportsTable />
    </div>
  )
}
