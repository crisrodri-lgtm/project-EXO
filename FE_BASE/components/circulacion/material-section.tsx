'use client'

import { useRef, useState, type FormEvent } from 'react'
import { Barcode, ScanBarcode } from 'lucide-react'
import { SectionCard, inputClass, primaryButtonClass } from '@/components/circulacion/section-card'
import type { LoanItem } from '@/components/circulacion/loan-data'

type MaterialSectionProps = {
  id: string
  items: LoanItem[]
  canAdd: boolean
  feedback: string | null
  onAdd: (query: string) => void
  onRemove: (code: string) => void
}

const removeButtonClass =
  'inline-flex h-9 items-center justify-center rounded-md border border-gray-400 bg-gray-200 px-3 text-xs font-bold tracking-wide text-gray-800 hover:bg-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]'

export function MaterialSection({ id, items, canAdd, feedback, onAdd, onRemove }: MaterialSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [scanReady, setScanReady] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onAdd(query.trim())
    setQuery('')
    setScanReady(false)
  }

  return (
    <SectionCard
      id={id}
      title="2. REGISTRO DE MATERIAL"
      description="Escanee o digite el identificador de cada ejemplar."
    >
      <form onSubmit={handleSubmit} aria-label="Agregar material">
        <label htmlFor={`${id}-scan-code`} className="mb-1.5 block text-sm font-semibold text-gray-800">
          Código de Barras / ISBN / Signatura Topográfica
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Barcode
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-500"
            />
            <input
              ref={inputRef}
              id={`${id}-scan-code`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ej. EJ-MAT-04 o BN-010277"
              autoComplete="off"
              aria-describedby={`${id}-material-feedback`}
              className={`${inputClass} pl-10`}
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setScanReady(true); inputRef.current?.focus() }} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-gray-400 bg-white px-3 text-xs font-bold tracking-wide text-gray-800 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]">
              <ScanBarcode aria-hidden="true" className="size-4" /> ESCANEAR
            </button>
            <button type="submit" disabled={!canAdd} className={primaryButtonClass}>
              AGREGAR
            </button>
          </div>
        </div>
        <p id={`${id}-material-feedback`} aria-live="polite" className="mt-2 min-h-5 text-sm font-medium text-gray-700">
          {scanReady ? 'Lector USB/teclado listo; escanea el código del ejemplar. ' : ''}{feedback}
        </p>
      </form>

      <div className="mt-2">
        <p className="mb-2 text-sm font-semibold text-gray-800">
          Ítems en esta operación: <span className="font-bold">{items.length}</span>
        </p>

        {items.length === 0 ? (
          <p className="rounded-md border border-dashed border-gray-400 px-4 py-8 text-center text-sm text-gray-600">
            SIN MATERIAL AGREGADO. Escanee un ejemplar para comenzar.
          </p>
        ) : (
          <table className="w-full border-collapse text-left text-sm md:rounded-md md:border md:border-gray-300">
            <caption className="sr-only">Material bibliográfico agregado al préstamo</caption>
            <thead className="hidden bg-gray-100 md:table-header-group">
              <tr className="text-xs tracking-wider text-gray-700">
                <th scope="col" className="px-4 py-3 font-bold">CÓDIGO</th>
                <th scope="col" className="px-4 py-3 font-bold">TÍTULO</th>
                <th scope="col" className="px-4 py-3 font-bold">TIPO</th>
                <th scope="col" className="px-4 py-3 font-bold">FECHA DE DEVOLUCIÓN</th>
                <th scope="col" className="px-4 py-3 text-right font-bold">ACCIÓN</th>
              </tr>
            </thead>
            <tbody className="flex flex-col gap-3 md:table-row-group">
              {items.map((item) => (
                <tr
                  key={item.code}
                  className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border border-gray-300 p-4 md:table-row md:rounded-none md:border-0 md:border-t md:p-0"
                >
                  <td className="col-span-2 md:px-4 md:py-3">
                    <span className="block text-xs font-semibold tracking-wide text-gray-600 md:hidden">CÓDIGO</span>
                    <span className="font-mono font-semibold text-gray-900">{item.code}</span>
                  </td>
                  <td className="col-span-2 md:px-4 md:py-3">
                    <span className="block text-xs font-semibold tracking-wide text-gray-600 md:hidden">TÍTULO</span>
                    <span className="block font-semibold text-gray-900">{item.title}</span>
                    <span className="block text-gray-600">{item.author}</span>
                  </td>
                  <td className="md:px-4 md:py-3">
                    <span className="block text-xs font-semibold tracking-wide text-gray-600 md:hidden">TIPO</span>
                    <span className="font-medium text-gray-900">{item.type}</span>
                  </td>
                  <td className="md:px-4 md:py-3">
                    <span className="block text-xs font-semibold tracking-wide text-gray-600 md:hidden">
                      FECHA DE DEVOLUCIÓN
                    </span>
                    <span className="font-mono font-medium text-gray-900">{item.dueDate}</span>
                  </td>
                  <td className="col-span-2 md:px-4 md:py-3 md:text-right">
                    <button
                      type="button"
                      onClick={() => onRemove(item.code)}
                      className={`${removeButtonClass} w-full md:w-auto`}
                    >
                      QUITAR<span className="sr-only"> {item.title}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </SectionCard>
  )
}
