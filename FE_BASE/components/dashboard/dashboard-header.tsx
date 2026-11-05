'use client'

import { CalendarRange, FileDown, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DATE_RANGE_OPTIONS, type DateRange } from './dashboard-data'

type DashboardHeaderProps = {
  range: DateRange
  onRangeChange: (range: DateRange) => void
  onExportPdf: () => void
  onExportXlsx: () => void
}

export function DashboardHeader({ range, onRangeChange, onExportPdf, onExportXlsx }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl text-balance">Tablero Gerencial MIS</h1>
        <p className="mt-1 text-sm text-gray-700 md:text-base text-pretty">
          Resumen ejecutivo de operaciones, estadísticas de uso y alertas del sistema
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <Select
          value={range}
          items={DATE_RANGE_OPTIONS}
          onValueChange={(value) => {
            if (value) onRangeChange(value as DateRange)
          }}
        >
          <SelectTrigger aria-label="Rango de fechas" className="h-9 min-w-44 border-gray-400 bg-white text-gray-900">
            <CalendarRange className="size-4 text-gray-600" aria-hidden="true" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={onExportXlsx} className="h-9 border-gray-400 bg-white text-gray-900">
          <FileSpreadsheet className="size-4" aria-hidden="true" />
          Exportar XLSX
        </Button>
        <Button onClick={onExportPdf} className="h-9 bg-[#1E3A8A] text-white hover:bg-[#172E6E]">
          <FileDown className="size-4" aria-hidden="true" />
          Exportar PDF
        </Button>
      </div>
    </header>
  )
}
