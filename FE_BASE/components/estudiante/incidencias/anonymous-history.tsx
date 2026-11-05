'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { CalendarDays, Search, ShieldCheck } from 'lucide-react'
import { MOCK_HISTORIAL_ANONIMO } from './mock-data'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`))
}

export function AnonymousHistory() {
  const [query, setQuery] = useState('EJ-MAT-04')
  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return MOCK_HISTORIAL_ANONIMO.filter((item) => !normalized || item.ejemplarCodigo.toLowerCase().includes(normalized))
  }, [query])

  return (
    <section className="flex flex-col gap-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Historial anónimo por libro</h2>
            <p className="mt-1 text-sm text-slate-500">Consulta antecedentes del ejemplar sin revelar a quién los reportó.</p>
          </div>
          <form onSubmit={(event) => event.preventDefault()} role="search" className="w-full sm:max-w-sm">
            <label htmlFor="buscar-ejemplar" className="mb-2 block text-xs font-semibold text-slate-600">Código de ejemplar</label>
            <div className="flex h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 transition focus-within:border-[#1E3A8A] focus-within:ring-2 focus-within:ring-blue-100">
              <Search aria-hidden="true" className="size-4 shrink-0 text-slate-400" />
              <input id="buscar-ejemplar" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej. EJ-MAT-04" className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" />
              <button type="submit" className="rounded-md bg-[#1E3A8A] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#183174] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]">Buscar</button>
            </div>
          </form>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <p className="text-sm font-bold text-slate-800">Antecedentes del ejemplar <span className="text-[#1E3A8A]">{query.trim() || '—'}</span></p>
          <p className="mt-1 text-xs text-slate-500">{matches.length} {matches.length === 1 ? 'incidencia encontrada' : 'incidencias encontradas'}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500"><ShieldCheck aria-hidden="true" className="size-3.5 text-[#1E3A8A]" /> Identidad protegida</span>
      </div>

      {matches.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {matches.map((item) => (
            <li key={item.codigo} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_7rem] sm:items-center sm:p-5">
              <article className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold tracking-wide text-slate-700">{item.categoria}</span>
                  <span className="text-xs text-slate-400">{item.codigo}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{item.descripcion}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5"><CalendarDays aria-hidden="true" className="size-3.5" /> {formatDate(item.fecha)}</span>
                  <span className="font-medium text-slate-600">Reportado por: Usuario Anónimo</span>
                </div>
              </article>
              {item.fotoUrl ? (
                <a href={item.fotoUrl} target="_blank" rel="noreferrer" className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]">
                  <Image src={item.fotoUrl} alt={`Evidencia fotográfica de ${item.categoria} en ${item.ejemplarCodigo}`} fill sizes="(max-width: 640px) 100vw, 112px" className="object-cover transition-transform group-hover:scale-105" />
                  <span className="sr-only">Abrir fotografía en una pestaña nueva</span>
                </a>
              ) : <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">Sin foto</div>}
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <Search aria-hidden="true" className="mx-auto size-6 text-slate-400" />
          <p className="mt-3 font-semibold text-slate-800">Sin antecedentes para este código</p>
          <p className="mt-1 text-sm text-slate-500">Revisa el código del ejemplar e inténtalo nuevamente.</p>
        </div>
      )}
    </section>
  )
}
