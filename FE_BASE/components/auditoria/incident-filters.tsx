'use client'

import { useState } from 'react'
import { CalendarRange, ChevronDown, Search } from 'lucide-react'
import { SectionCard, inputClass } from '@/components/circulacion/section-card'
import { STATUS_OPTIONS, formatDate, type IncidentStatus } from '@/components/auditoria/incident-data'

export type IncidentFilterState = {
  query: string
  status: IncidentStatus | 'TODOS'
  from: string
  to: string
}

type IncidentFiltersProps = {
  filters: IncidentFilterState
  onChange: (filters: IncidentFilterState) => void
}

const labelClass = 'mb-1.5 block text-sm font-semibold text-gray-800'

function rangeLabel(from: string, to: string) {
  if (!from && !to) return 'Seleccionar rango de fechas'
  if (from && to) return `${formatDate(from)} – ${formatDate(to)}`
  return from ? `Desde ${formatDate(from)}` : `Hasta ${formatDate(to)}`
}

export function IncidentFilters({ filters, onChange }: IncidentFiltersProps) {
  const [dateOpen, setDateOpen] = useState(false)
  const update = (patch: Partial<IncidentFilterState>) => onChange({ ...filters, ...patch })
  const hasRange = Boolean(filters.from || filters.to)

  return (
    <SectionCard id="seccion-filtros" title="1. BÚSQUEDA Y FILTROS">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="lg:flex-[2]">
          <label htmlFor="busqueda-incidencia" className={labelClass}>
            Búsqueda
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-500"
            />
            <input
              id="busqueda-incidencia"
              type="search"
              value={filters.query}
              onChange={(event) => update({ query: event.target.value })}
              placeholder="Buscar por ID, Código de libro o Cédula"
              autoComplete="off"
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>

        <div className="lg:flex-1">
          <label htmlFor="filtro-estado" className={labelClass}>
            Estado
          </label>
          <div className="relative">
            <select
              id="filtro-estado"
              value={filters.status}
              onChange={(event) => update({ status: event.target.value as IncidentFilterState['status'] })}
              className={`${inputClass} appearance-none pr-10`}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-gray-600"
            />
          </div>
        </div>

        <div className="lg:flex-[1.4]">
          <span id="filtro-fecha-label" className={labelClass}>
            Fecha
          </span>
          <button
            type="button"
            aria-expanded={dateOpen}
            aria-controls="filtro-fecha-panel"
            aria-describedby="filtro-fecha-label"
            onClick={() => setDateOpen((open) => !open)}
            className={`${inputClass} flex items-center gap-2 text-left`}
          >
            <CalendarRange className="size-5 shrink-0 text-gray-500" aria-hidden="true" />
            <span className={hasRange ? 'truncate text-gray-900' : 'truncate text-gray-500'}>
              {rangeLabel(filters.from, filters.to)}
            </span>
            <ChevronDown className="ml-auto size-5 shrink-0 text-gray-600" aria-hidden="true" />
          </button>
          {dateOpen && (
            <div
              id="filtro-fecha-panel"
              className="mt-2 flex flex-col gap-3 rounded-md border border-gray-300 bg-gray-50 p-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="fecha-desde" className="mb-1 block text-xs font-semibold text-gray-800">
                    Desde
                  </label>
                  <input
                    id="fecha-desde"
                    type="date"
                    value={filters.from}
                    max={filters.to || undefined}
                    onChange={(event) => update({ from: event.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="fecha-hasta" className="mb-1 block text-xs font-semibold text-gray-800">
                    Hasta
                  </label>
                  <input
                    id="fecha-hasta"
                    type="date"
                    value={filters.to}
                    min={filters.from || undefined}
                    onChange={(event) => update({ to: event.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              {hasRange && (
                <button
                  type="button"
                  onClick={() => update({ from: '', to: '' })}
                  className="self-start text-sm font-semibold text-[#1E3A8A] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
                >
                  Limpiar rango
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  )
}
