'use client'

import { Fragment, useState } from 'react'
import { SectionCard } from '@/components/circulacion/section-card'
import { StatusLabel } from '@/components/auditoria/status-label'
import { formatDate, type Incident } from '@/components/auditoria/incident-data'
import { EvidenceThumbnails } from '@/components/auditoria/evidence-thumbnails'
import { EvidenceLightbox, type LightboxState } from '@/components/auditoria/evidence-lightbox'

const detailsButtonClass =
  'inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-[#4B5563] px-4 text-xs font-bold tracking-wide text-white hover:bg-[#374151] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]'

type OpenEvidence = (incident: Incident, index: number) => void

function IncidentDetails({ incident, onOpenEvidence }: { incident: Incident; onOpenEvidence: OpenEvidence }) {
  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      <div className="sm:col-span-2">
        <dt className="text-xs font-bold tracking-wider text-gray-700">DESCRIPCIÓN</dt>
        <dd className="mt-1 text-pretty text-gray-900">{incident.description}</dd>
      </div>
      <div>
        <dt className="text-xs font-bold tracking-wider text-gray-700">DETALLE DEL INVOLUCRADO</dt>
        <dd className="mt-1 text-gray-900">{incident.involvedDetail}</dd>
      </div>
      <div>
        <dt className="text-xs font-bold tracking-wider text-gray-700">REPORTADO POR</dt>
        <dd className="mt-1 text-gray-900">{incident.reportedBy}</dd>
      </div>
      <div className="sm:col-span-2">
        <dt className="text-xs font-bold tracking-wider text-gray-700">
          EVIDENCIA FOTOGRÁFICA ({incident.evidences.length})
        </dt>
        <dd className="mt-2">
          <EvidenceThumbnails
            incidentId={incident.id}
            images={incident.evidences}
            onOpen={(index) => onOpenEvidence(incident, index)}
          />
        </dd>
      </div>
    </dl>
  )
}

function Involved({ incident }: { incident: Incident }) {
  return (
    <>
      <span className="block font-mono font-semibold text-gray-900">{incident.involvedCode}</span>
      <span className="block text-xs text-gray-700">{incident.involvedLabel}</span>
    </>
  )
}

export function IncidentList({ incidents, total }: { incidents: Incident[]; total: number }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const toggle = (id: string) => setExpandedId((current) => (current === id ? null : id))
  const [lightbox, setLightbox] = useState<LightboxState | null>(null)
  const openEvidence: OpenEvidence = (incident, index) =>
    setLightbox({ incidentId: incident.id, images: incident.evidences, index })

  return (
    <SectionCard
      id="seccion-listado"
      title="2. REGISTRO DE INCIDENCIAS"
      description={`Mostrando ${incidents.length} de ${total} incidencias registradas.`}
    >
      {incidents.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray-400 px-4 py-8 text-center text-sm text-gray-700">
          SIN RESULTADOS. Ajuste la búsqueda o los filtros aplicados.
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-3 lg:hidden">
            {incidents.map((incident) => {
              const expanded = expandedId === incident.id
              const panelId = `detalle-movil-${incident.id}`
              return (
                <li key={incident.id} className="rounded-md border border-gray-300 bg-white">
                  <div className="flex flex-col gap-3 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-sm font-bold text-gray-900">{incident.id}</p>
                        <p className="text-xs text-gray-700">{formatDate(incident.date)}</p>
                      </div>
                      <StatusLabel status={incident.status} />
                    </div>
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-xs font-bold tracking-wider text-gray-700">TIPO</dt>
                        <dd className="mt-0.5 font-medium text-gray-900">{incident.type}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-bold tracking-wider text-gray-700">INVOLUCRADO</dt>
                        <dd className="mt-0.5">
                          <Involved incident={incident} />
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-xs font-bold tracking-wider text-gray-700">EVIDENCIAS</dt>
                        <dd className="mt-1">
                          <EvidenceThumbnails
                            incidentId={incident.id}
                            images={incident.evidences}
                            onOpen={(index) => openEvidence(incident, index)}
                            size="sm"
                          />
                        </dd>
                      </div>
                    </dl>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      onClick={() => toggle(incident.id)}
                      className={`${detailsButtonClass} w-full`}
                    >
                      {expanded ? 'OCULTAR DETALLES' : 'VER DETALLES'}
                    </button>
                  </div>
                  {expanded && (
                    <div id={panelId} className="border-t border-gray-300 bg-gray-50 p-4">
                      <IncidentDetails incident={incident} onOpenEvidence={openEvidence} />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="hidden overflow-x-auto rounded-md border border-gray-300 lg:block">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">Listado de incidencias registradas</caption>
              <thead className="bg-gray-100">
                <tr className="text-xs tracking-wider text-gray-800">
                  <th scope="col" className="px-4 py-3 font-bold">ID INCIDENCIA</th>
                  <th scope="col" className="px-4 py-3 font-bold">FECHA</th>
                  <th scope="col" className="px-4 py-3 font-bold">TIPO</th>
                  <th scope="col" className="px-4 py-3 font-bold">INVOLUCRADO</th>
                  <th scope="col" className="px-4 py-3 font-bold">EVIDENCIAS</th>
                  <th scope="col" className="px-4 py-3 font-bold">ESTADO</th>
                  <th scope="col" className="px-4 py-3 text-right font-bold">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => {
                  const expanded = expandedId === incident.id
                  const panelId = `detalle-${incident.id}`
                  return (
                    <Fragment key={incident.id}>
                      <tr className="border-t border-gray-300 align-middle">
                        <th scope="row" className="whitespace-nowrap px-4 py-3 font-mono font-bold text-gray-900">
                          {incident.id}
                        </th>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-900">{formatDate(incident.date)}</td>
                        <td className="px-4 py-3 text-gray-900">{incident.type}</td>
                        <td className="px-4 py-3">
                          <Involved incident={incident} />
                        </td>
                        <td className="px-4 py-3">
                          <EvidenceThumbnails
                            incidentId={incident.id}
                            images={incident.evidences}
                            onOpen={(index) => openEvidence(incident, index)}
                            size="sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <StatusLabel status={incident.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            aria-expanded={expanded}
                            aria-controls={panelId}
                            onClick={() => toggle(incident.id)}
                            className={detailsButtonClass}
                          >
                            {expanded ? 'OCULTAR DETALLES' : 'VER DETALLES'}
                          </button>
                        </td>
                      </tr>
                      {expanded && (
                        <tr id={panelId} className="bg-gray-50">
                          <td colSpan={7} className="border-t border-gray-200 px-4 py-4">
                            <IncidentDetails incident={incident} onOpenEvidence={openEvidence} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
      <EvidenceLightbox
        state={lightbox}
        onIndexChange={(index) => setLightbox((current) => (current ? { ...current, index } : current))}
        onClose={() => setLightbox(null)}
      />
    </SectionCard>
  )
}
