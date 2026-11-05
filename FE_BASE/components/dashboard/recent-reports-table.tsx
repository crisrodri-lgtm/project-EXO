'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { RECENT_REPORTS, formatDate, type AuditReport } from './dashboard-data'
import { ReportDetailDialog } from './report-detail-dialog'
import { ReportStatusBadge } from './report-status-badge'

export function RecentReportsTable() {
  const [selected, setSelected] = useState<AuditReport | null>(null)
  const pending = RECENT_REPORTS.filter((report) => report.status !== 'Atendido').length

  return (
    <Card className="gap-0 rounded-md bg-white py-0 text-gray-900 shadow-none ring-1 ring-gray-300">
      <CardHeader className="border-b border-gray-300 px-4 py-3 md:px-6">
        <CardTitle className="text-base font-bold text-gray-900">
          Últimos reportes de auditoría e incidencias críticas
        </CardTitle>
        <CardDescription className="text-sm text-gray-600">
          {pending} de {RECENT_REPORTS.length} reportes requieren atención
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-20 pl-4 text-xs font-bold tracking-wider text-gray-700 md:pl-6">EVIDENCIA</TableHead>
              <TableHead className="text-xs font-bold tracking-wider text-gray-700">DETALLE</TableHead>
              <TableHead className="text-xs font-bold tracking-wider text-gray-700">INCIDENCIA</TableHead>
              <TableHead className="text-xs font-bold tracking-wider text-gray-700">FECHA</TableHead>
              <TableHead className="text-xs font-bold tracking-wider text-gray-700">ESTADO</TableHead>
              <TableHead className="pr-4 text-right text-xs font-bold tracking-wider text-gray-700 md:pr-6">
                <span className="sr-only">Acción</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {RECENT_REPORTS.map((report) => (
              <TableRow key={report.code} className="border-gray-200">
                <TableCell className="py-3 pl-4 md:pl-6">
                  <button
                    type="button"
                    onClick={() => setSelected(report)}
                    className="block size-14 overflow-hidden rounded-md border border-gray-300 bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
                  >
                    <Image
                      src={report.image}
                      alt={`Ampliar evidencia de ${report.code}`}
                      width={56}
                      height={56}
                      className="size-full object-cover transition-transform hover:scale-105"
                    />
                  </button>
                </TableCell>
                <TableCell className="min-w-48">
                  <p className="font-mono text-xs font-semibold text-gray-600">{report.code}</p>
                  <p className="font-semibold text-gray-900">{report.bookTitle}</p>
                  <p className="font-mono text-xs text-gray-600">{report.inventoryCode}</p>
                </TableCell>
                <TableCell className="text-gray-800">{report.incidentType}</TableCell>
                <TableCell className="tabular-nums text-gray-800">
                  <time dateTime={report.date}>{formatDate(report.date)}</time>
                </TableCell>
                <TableCell>
                  <ReportStatusBadge status={report.status} />
                </TableCell>
                <TableCell className="pr-4 text-right md:pr-6">
                  <Button variant="outline" size="sm" onClick={() => setSelected(report)}>
                    <FileText className="size-4" aria-hidden="true" />
                    Ver informe
                    <span className="sr-only"> {report.code}</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <ReportDetailDialog report={selected} onClose={() => setSelected(null)} />
    </Card>
  )
}
