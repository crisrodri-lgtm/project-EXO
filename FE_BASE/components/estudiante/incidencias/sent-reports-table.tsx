import { CalendarDays, ChevronRight, ClipboardList } from 'lucide-react'
import type { EstadoIncidencia, Incidencia } from './mock-data'

const STATUS_STYLES: Record<EstadoIncidencia, string> = {
  PENDIENTE_REVISION: 'border-amber-200 bg-amber-50 text-amber-800',
  RESOLVIDO_ACEPTADO: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  DESESTIMADO: 'border-slate-200 bg-slate-100 text-slate-600',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`))
}

export function SentReportsTable({ reports }: { reports: Incidencia[] }) {
  return (
    <section aria-label="Seguimiento de mis reportes" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">Mis reportes enviados</h2>
          <p className="mt-1 text-sm text-slate-500">Consulta el estado de tus reportes asociados a préstamos.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"><ClipboardList aria-hidden="true" className="size-4" /> {reports.length} reportes</span>
      </div>
      {reports.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <caption className="sr-only">Reportes de incidencias enviados por la estudiante activa</caption>
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                <th scope="col" className="px-6 py-3">Reporte / fecha</th>
                <th scope="col" className="px-6 py-3">Ejemplar</th>
                <th scope="col" className="px-6 py-3">Categoría</th>
                <th scope="col" className="px-6 py-3">Estado</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">Abrir detalle</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((report) => (
                <tr key={report.codigo} className="text-sm text-slate-700 transition-colors hover:bg-slate-50/80">
                  <td className="px-6 py-4">
                    <span className="block font-semibold text-slate-900">{report.codigo}</span>
                    <span className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays aria-hidden="true" className="size-3.5" /> {formatDate(report.fecha)}</span>
                  </td>
                  <td className="px-6 py-4 font-medium">{report.ejemplarCodigo}</td>
                  <td className="px-6 py-4"><span className="inline-flex rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold tracking-wide text-slate-600">{report.categoria}</span></td>
                  <td className="px-6 py-4"><span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide ${STATUS_STYLES[report.estado]}`}>{report.estado}</span></td>
                  <td className="px-6 py-4 text-right"><button type="button" aria-label={`Ver detalle de ${report.codigo}`} className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-[#1E3A8A]"><ChevronRight aria-hidden="true" className="size-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><ClipboardList aria-hidden="true" className="size-5" /></span>
          <p className="font-semibold text-slate-800">Aún no has enviado reportes</p>
          <p className="text-sm text-slate-500">Cuando envíes un auto-reporte aparecerá aquí.</p>
        </div>
      )}
    </section>
  )
}
