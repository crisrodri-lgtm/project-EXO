'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { AlertCircle, ArrowUpRight, ClipboardList, FilePlus2, Search, ShieldCheck } from 'lucide-react'
import { AnonymousHistory } from './anonymous-history'
import { MOCK_REPORTES, type Incidencia, type EstadoIncidencia } from './mock-data'
import { ReportForm } from './report-form'
import { SentReportsTable } from './sent-reports-table'

type TabId = 'new' | 'sent' | 'history'
const TABS: { id: TabId; label: string; icon: typeof FilePlus2 }[] = [
  { id: 'new', label: 'Nuevo auto-reporte', icon: FilePlus2 },
  { id: 'sent', label: 'Mis reportes enviados', icon: ClipboardList },
  { id: 'history', label: 'Historial anónimo', icon: Search },
]

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`))
}

export function IncidentPortal({ initialTab }: { initialTab: TabId }) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)
  const [reports, setReports] = useState<Incidencia[]>(MOCK_REPORTES)
  const [confirmation, setConfirmation] = useState('')
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  function handleReportSubmit(input: { prestamoCodigo: string; categoria: Incidencia['categoria']; descripcion: string; fotoUrl?: string }) {
    const reportCode = `REP-${new Date().getFullYear()}-${String(reports.length + 88).padStart(3, '0')}`
    const report: Incidencia = {
      codigo: reportCode,
      prestamoCodigo: input.prestamoCodigo,
      ejemplarCodigo: input.prestamoCodigo === 'PR-882' ? 'EJ-MAT-04' : 'EJ-LIT-18',
      fecha: new Date().toISOString().slice(0, 10),
      categoria: input.categoria,
      descripcion: input.descripcion,
      estado: 'PENDIENTE_REVISION' as EstadoIncidencia,
      fotoUrl: input.fotoUrl,
    }
    setReports((current) => [report, ...current])
    setConfirmation(reportCode)
    setActiveTab('sent')
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === 'ArrowRight' ? (index + 1) % TABS.length : event.key === 'ArrowLeft' ? (index - 1 + TABS.length) % TABS.length : -1
    if (next < 0) return
    event.preventDefault()
    setActiveTab(TABS[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-9 lg:py-9">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500" aria-label="Ruta de navegación">
        <span>Portal</span><span aria-hidden="true">/</span><span>Estudiante</span><span aria-hidden="true">/</span><span className="font-semibold text-slate-800">Incidencias</span>
      </div>

      <section className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-[#1E3A8A]">
            <span className="size-1.5 rounded-full bg-[#1E3A8A]" aria-hidden="true" /> PWA · ESTUDIANTE
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[2rem]">Auto-reporte de incidencias</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Reporta un imperfecto durante tu préstamo y consulta el historial del ejemplar con privacidad protegida.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-600 shadow-sm">
          <ShieldCheck aria-hidden="true" className="size-4 text-[#1E3A8A]" /> Privacidad protegida
        </div>
      </section>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A]"><ClipboardList aria-hidden="true" className="size-[18px]" /></span>
          <div><p className="text-xl font-bold leading-6 text-slate-900">{reports.length}</p><p className="mt-1 text-xs text-slate-500">Reportes enviados</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700"><AlertCircle aria-hidden="true" className="size-[18px]" /></span>
          <div><p className="text-xl font-bold leading-6 text-slate-900">{reports.filter((report) => report.estado === 'PENDIENTE_REVISION').length}</p><p className="mt-1 text-xs text-slate-500">En revisión</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><ArrowUpRight aria-hidden="true" className="size-[18px]" /></span>
          <div><p className="text-xl font-bold leading-6 text-slate-900">{formatDate(new Date().toISOString().slice(0, 10))}</p><p className="mt-1 text-xs text-slate-500">Última actividad</p></div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div role="tablist" aria-label="Secciones de incidencias" className="grid w-full grid-cols-3 border-b border-slate-200 px-1 sm:flex sm:px-5">
          {TABS.map(({ id, label, icon: Icon }, index) => {
            const selected = activeTab === id
            return (
              <button
                key={id}
                ref={(element) => { tabRefs.current[index] = element }}
                type="button"
                id={`tab-${id}`}
                role="tab"
                aria-selected={selected}
                aria-controls={`panel-${id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => { setActiveTab(id); setConfirmation('') }}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={`inline-flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 border-b-2 px-1 text-center text-[10px] font-semibold leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1E3A8A] sm:flex-row sm:gap-2 sm:px-4 sm:text-sm ${selected ? 'border-[#1E3A8A] text-[#1E3A8A]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                <Icon aria-hidden="true" className="size-4" /> {label}
              </button>
            )
          })}
        </div>

        <div className="p-4 sm:p-6 lg:p-7">
          <div id="panel-new" role="tabpanel" aria-labelledby="tab-new" hidden={activeTab !== 'new'}>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">Cuéntanos qué ocurrió</h2>
              <p className="mt-1 text-sm text-slate-500">Vincularemos tu reporte con uno de tus préstamos activos.</p>
            </div>
            <ReportForm onSubmit={handleReportSubmit} />
          </div>
          <div id="panel-sent" role="tabpanel" aria-labelledby="tab-sent" hidden={activeTab !== 'sent'}>
            {confirmation && <div role="status" className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" /><div><p className="font-semibold">Reporte enviado correctamente</p><p className="mt-1 text-xs">Número de seguimiento: <span className="font-bold">{confirmation}</span>. Ya aparece en tu historial personal.</p></div></div>}
            <SentReportsTable reports={reports} />
          </div>
          <div id="panel-history" role="tabpanel" aria-labelledby="tab-history" hidden={activeTab !== 'history'}>
            <div id="historial-anonimo"><AnonymousHistory /></div>
          </div>
        </div>
      </div>

      <p className="mt-5 text-center text-[11px] leading-5 text-slate-500">¿Necesitas ayuda? Acércate al personal de biblioteca con el código de seguimiento de tu reporte.</p>
    </div>
  )
}
