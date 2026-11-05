'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate, type AuditReport } from './dashboard-data'
import { ReportStatusBadge } from './report-status-badge'

type ReportDetailDialogProps = {
  report: AuditReport | null
  onClose: () => void
}

export function ReportDetailDialog({ report, onClose }: ReportDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (report && !dialog.open) dialog.showModal()
    if (!report && dialog.open) dialog.close()
  }, [report])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="reporte-titulo"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="m-auto w-[min(100%-2rem,48rem)] rounded-md border border-gray-300 bg-white p-0 text-gray-900 backdrop:bg-gray-900/60"
    >
      {report && (
        <div className="flex max-h-[90dvh] flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-gray-300 px-4 py-3 md:px-6">
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold text-gray-600">{report.code}</p>
              <h2 id="reporte-titulo" className="text-base font-bold text-gray-900 md:text-lg">
                {report.incidentType} — {report.bookTitle}
              </h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar informe">
              <X className="size-4" aria-hidden="true" />
            </Button>
          </header>
          <div className="grid gap-5 overflow-y-auto p-4 md:grid-cols-[3fr_2fr] md:p-6">
            <figure className="overflow-hidden rounded-md border border-gray-300 bg-gray-100">
              <Image
                src={report.image}
                alt={`Evidencia fotográfica: ${report.incidentType.toLowerCase()} en ${report.bookTitle}`}
                width={800}
                height={600}
                className="h-auto w-full object-cover"
              />
              <figcaption className="border-t border-gray-300 bg-white px-3 py-2 text-xs text-gray-600">
                Evidencia registrada el {formatDate(report.date)}
              </figcaption>
            </figure>
            <dl className="flex flex-col gap-3 text-sm">
              <div>
                <dt className="font-semibold text-gray-600">Estado</dt>
                <dd className="mt-1">
                  <ReportStatusBadge status={report.status} />
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-600">Código de inventario</dt>
                <dd className="font-mono text-gray-900">{report.inventoryCode}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-600">Reportado por</dt>
                <dd className="text-gray-900">{report.reportedBy}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-600">Resumen</dt>
                <dd className="leading-relaxed text-gray-900">{report.summary}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </dialog>
  )
}
