'use client'

import { useState, type FormEvent, type RefObject } from 'react'
import { X } from 'lucide-react'
import { inputClass, primaryButtonClass } from '@/components/circulacion/section-card'
import { INCIDENT_TYPE_OPTIONS, type IncidentType } from '@/components/auditoria/incident-data'
import { EvidenceUploader, type EvidenceFile } from '@/components/auditoria/evidence-uploader'

export type NewIncidentInput = {
  type: IncidentType
  involved: string
  description: string
  evidences: string[]
}

type IncidentFormPanelProps = {
  firstFieldRef: RefObject<HTMLSelectElement | null>
  onSave: (input: NewIncidentInput) => void
  onCancel: () => void
}

type Errors = Partial<Record<keyof NewIncidentInput, string>>

const labelClass = 'mb-1.5 block text-sm font-semibold text-gray-800'
const errorClass = 'mt-1.5 text-sm font-semibold text-gray-900'
const MIN_DESCRIPTION = 15

export function IncidentFormPanel({ firstFieldRef, onSave, onCancel }: IncidentFormPanelProps) {
  const [type, setType] = useState<IncidentType | ''>('')
  const [involved, setInvolved] = useState('')
  const [description, setDescription] = useState('')
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([])
  const [errors, setErrors] = useState<Errors>({})

  function reset({ discardEvidences }: { discardEvidences: boolean }) {
    if (discardEvidences) evidenceFiles.forEach((file) => URL.revokeObjectURL(file.url))
    setType('')
    setInvolved('')
    setDescription('')
    setEvidenceFiles([])
    setErrors({})
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next: Errors = {}
    if (!type) next.type = 'ERROR: Seleccione el tipo de incidencia.'
    if (!involved.trim()) next.involved = 'ERROR: Ingrese el código de barras o la cédula involucrada.'
    if (description.trim().length < MIN_DESCRIPTION)
      next.description = `ERROR: La descripción es obligatoria (mínimo ${MIN_DESCRIPTION} caracteres).`
    setErrors(next)
    if (Object.keys(next).length > 0 || !type) return
    onSave({
      type,
      involved: involved.trim().toUpperCase(),
      description: description.trim(),
      evidences: evidenceFiles.map((file) => file.url),
    })
    reset({ discardEvidences: false })
  }

  function handleCancel() {
    reset({ discardEvidences: true })
    onCancel()
  }

  return (
    <section
      id="panel-nueva-incidencia"
      aria-labelledby="titulo-nueva-incidencia"
      className="rounded-md border-2 border-[#1E3A8A] bg-white shadow-sm xl:sticky xl:top-[89px]"
    >
      <header className="flex items-start justify-between gap-3 border-b border-gray-300 bg-gray-50 px-4 py-3 md:px-6">
        <div>
          <h2 id="titulo-nueva-incidencia" className="text-sm font-bold tracking-wider text-gray-900 md:text-base">
            3. NUEVO REPORTE DE INCIDENCIA
          </h2>
          <p className="mt-0.5 text-sm text-gray-700">Los campos marcados con * son obligatorios.</p>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-gray-800 hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
        >
          <X className="size-5" aria-hidden="true" />
          <span className="sr-only">Cerrar formulario</span>
        </button>
      </header>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 p-4 md:p-6">
        <div>
          <label htmlFor="tipo-incidencia" className={labelClass}>
            Tipo de Incidencia *
          </label>
          <select
            ref={firstFieldRef}
            id="tipo-incidencia"
            value={type}
            onChange={(event) => setType(event.target.value as IncidentType)}
            aria-invalid={Boolean(errors.type)}
            aria-describedby={errors.type ? 'error-tipo' : undefined}
            className={inputClass}
          >
            <option value="" disabled>
              Seleccione una opción
            </option>
            {INCIDENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.type && (
            <p id="error-tipo" className={errorClass}>
              {errors.type}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="involucrado" className={labelClass}>
            Código de Barras / Cédula involucrada *
          </label>
          <input
            id="involucrado"
            value={involved}
            onChange={(event) => setInvolved(event.target.value)}
            placeholder="Ej. BN-010277 o 1712345678"
            autoComplete="off"
            aria-invalid={Boolean(errors.involved)}
            aria-describedby={errors.involved ? 'error-involucrado' : undefined}
            className={inputClass}
          />
          {errors.involved && (
            <p id="error-involucrado" className={errorClass}>
              {errors.involved}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="descripcion" className={labelClass}>
            Descripción detallada *
          </label>
          <textarea
            id="descripcion"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            required
            placeholder="Describa el estado del material, circunstancias y acciones tomadas."
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? 'error-descripcion contador-descripcion' : 'contador-descripcion'}
            className={`${inputClass} h-auto resize-y py-2.5 leading-relaxed`}
          />
          <p id="contador-descripcion" className="mt-1 text-xs text-gray-700">
            {description.trim().length} caracteres (mínimo {MIN_DESCRIPTION})
          </p>
          {errors.description && (
            <p id="error-descripcion" className={errorClass}>
              {errors.description}
            </p>
          )}
        </div>

        <EvidenceUploader files={evidenceFiles} onChange={setEvidenceFiles} />

        <div className="flex flex-col gap-2 pt-1 sm:flex-row-reverse">
          <button type="submit" className={`${primaryButtonClass} sm:flex-1`}>
            GUARDAR REPORTE
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex h-11 items-center justify-center rounded-md bg-[#4B5563] px-5 text-sm font-bold tracking-wide text-white hover:bg-[#374151] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] sm:flex-1"
          >
            CANCELAR
          </button>
        </div>
      </form>
    </section>
  )
}
