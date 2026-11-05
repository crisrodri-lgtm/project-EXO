'use client'

import { useState, type FormEvent } from 'react'
import { Check, ScanBarcode, X } from 'lucide-react'
import { SectionCard, inputClass, primaryButtonClass } from '@/components/circulacion/section-card'
import type { Borrower } from '@/components/circulacion/loan-data'

type BorrowerSectionProps = {
  borrower: Borrower | null
  pendingItems: number
  onSearch: (query: string) => void
  onScan?: () => void
}

export function BorrowerSection({ borrower, pendingItems, onSearch, onScan }: BorrowerSectionProps) {
  const [query, setQuery] = useState(borrower?.id ?? '')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (query.trim()) onSearch(query.trim())
  }

  return (
    <SectionCard
      id="seccion-usuario"
      title="1. IDENTIFICACIÓN DE USUARIO"
      description="Ubique al prestatario antes de registrar el material."
    >
      <form onSubmit={handleSubmit} role="search" aria-label="Buscar usuario">
        <label htmlFor="busqueda-usuario" className="mb-1.5 block text-sm font-semibold text-gray-800">
          Cédula, Matrícula o Escáner
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex min-w-0 flex-1 gap-2">
            <div className="relative min-w-0 flex-1">
              <ScanBarcode
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-500"
              />
              <input
                id="busqueda-usuario"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ej. V-27.845.391"
                autoComplete="off"
                className={`${inputClass} pl-10`}
              />
            </div>
            <button type="submit" className={primaryButtonClass}>
              BUSCAR
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              const scannedId = borrower?.id ?? 'V-27.845.391'
              setQuery(scannedId)
              if (onScan) onScan()
              else onSearch(scannedId)
            }}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-gray-400 bg-white px-3 text-xs font-bold tracking-wide text-gray-800 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
          >
            <ScanBarcode aria-hidden="true" className="size-4" /> Leer carnet PWA
          </button>
        </div>
      </form>

      {borrower && (
        <article
          aria-label="Ficha del prestatario"
          className="mt-5 grid gap-4 rounded-md border border-gray-300 bg-gray-50 p-4 md:grid-cols-[1fr_auto] md:items-center"
        >
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="inline-flex size-12 shrink-0 items-center justify-center rounded-md bg-gray-200 text-base font-bold text-gray-700"
            >
              MG
            </span>
            <div className="min-w-0">
              <p className="text-lg font-bold leading-tight text-gray-900 text-pretty">{borrower.name}</p>
              <p className="mt-1 text-sm text-gray-700">{borrower.career}</p>
              <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-gray-600">IDENTIFICACIÓN</dt>
                  <dd className="font-mono font-semibold text-gray-900">{borrower.id}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-gray-600">TIPO DE USUARIO</dt>
                  <dd className="font-semibold text-gray-900">{borrower.type}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-gray-600">LÍMITE DE PRÉSTAMOS</dt>
                  <dd className="font-semibold text-gray-900">
                    {borrower.activeLoans} / {borrower.loanLimit} libros
                    <span className="font-normal text-gray-600"> (+{pendingItems} en esta operación)</span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          <p
            role="status"
            className={`inline-flex items-center gap-2 self-start justify-self-start rounded-md border px-3 py-1.5 text-sm font-bold tracking-wide md:self-center ${borrower.status === 'HABILITADO' ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-rose-300 bg-rose-50 text-rose-900'}`}
          >
            {borrower.status === 'HABILITADO' ? (
              <Check className="size-4" strokeWidth={3} aria-hidden="true" />
            ) : (
              <X className="size-4" strokeWidth={3} aria-hidden="true" />
            )}
            {borrower.status === 'HABILITADO' ? 'AL DÍA' : `BLOQUEADO · RD$ ${borrower.debtAmount?.toLocaleString('es-DO') ?? '0'}`}
          </p>
        </article>
      )}
    </SectionCard>
  )
}
