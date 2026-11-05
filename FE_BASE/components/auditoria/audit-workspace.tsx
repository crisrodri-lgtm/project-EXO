'use client'

import { useMemo, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { primaryButtonClass } from '@/components/circulacion/section-card'
import { SuccessToast } from '@/components/circulacion/success-toast'
import { IncidentFilters, type IncidentFilterState } from '@/components/auditoria/incident-filters'
import { IncidentList } from '@/components/auditoria/incident-list'
import { IncidentFormPanel, type NewIncidentInput } from '@/components/auditoria/incident-form-panel'
import { INITIAL_INCIDENTS, type Incident } from '@/components/auditoria/incident-data'

const EMPTY_FILTERS: IncidentFilterState = { query: '', status: 'TODOS', from: '', to: '' }

function matchesFilters(incident: Incident, { query, status, from, to }: IncidentFilterState) {
  if (status !== 'TODOS' && incident.status !== status) return false
  if (from && incident.date < from) return false
  if (to && incident.date > to) return false
  const term = query.trim().toLowerCase()
  if (!term) return true
  return [incident.id, incident.involvedCode, incident.involvedDetail].some((value) =>
    value.toLowerCase().includes(term),
  )
}

export function AuditWorkspace() {
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS)
  const [filters, setFilters] = useState<IncidentFilterState>(EMPTY_FILTERS)
  const [formOpen, setFormOpen] = useState(true)
  const [savedId, setSavedId] = useState<string | null>(null)
  const firstFieldRef = useRef<HTMLSelectElement>(null)

  const visible = useMemo(() => incidents.filter((incident) => matchesFilters(incident, filters)), [incidents, filters])

  function openForm() {
    setFormOpen(true)
    requestAnimationFrame(() => {
      document.getElementById('panel-nueva-incidencia')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      firstFieldRef.current?.focus({ preventScroll: true })
    })
  }

  function handleSave({ type, involved, description, evidences }: NewIncidentInput) {
    const sequence = 143 + incidents.length - INITIAL_INCIDENTS.length
    const id = `INC-2026-${String(sequence).padStart(4, '0')}`
    const isCedula = /^\d{10}$/.test(involved)
    const incident: Incident = {
      id,
      date: new Date().toISOString().slice(0, 10),
      type,
      involvedLabel: isCedula ? 'Usuario (C.I.)' : 'Libro',
      involvedCode: involved,
      involvedDetail: isCedula ? `Cédula ${involved}` : `Ejemplar ${involved}`,
      status: 'ABIERTO',
      description,
      reportedBy: 'Bibliotecario en turno',
      evidences,
    }
    setIncidents((current) => [incident, ...current])
    setSavedId(id)
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 text-balance md:text-3xl">
            AUDITORÍA MANUAL E INCIDENCIAS
          </h1>
          <p className="text-sm text-gray-700 md:text-base">
            RF05 / RF07 · Registre, consulte y dé seguimiento a novedades del material bibliográfico.
          </p>
        </div>
        <button
          type="button"
          onClick={openForm}
          aria-controls="panel-nueva-incidencia"
          aria-expanded={formOpen}
          className={`${primaryButtonClass} gap-2`}
        >
          <Plus className="size-5" aria-hidden="true" />
          REGISTRAR NUEVA INCIDENCIA
        </button>
      </div>

      <div className={formOpen ? 'grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]' : 'grid gap-6'}>
        <div className="flex min-w-0 flex-col gap-6">
          <IncidentFilters filters={filters} onChange={setFilters} />
          <IncidentList incidents={visible} total={incidents.length} />
        </div>
        {formOpen && (
          <div className="min-w-0">
            <IncidentFormPanel firstFieldRef={firstFieldRef} onSave={handleSave} onCancel={() => setFormOpen(false)} />
          </div>
        )}
      </div>

      {savedId && (
        <SuccessToast
          receipt={savedId}
          receiptLabel="ID de incidencia:"
          message="Reporte de incidencia guardado. ESTADO: ABIERTO."
          onDismiss={() => setSavedId(null)}
        />
      )}
    </>
  )
}
