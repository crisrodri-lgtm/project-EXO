'use client'

import { useEffect, useRef, type KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export type LightboxState = { incidentId: string; images: string[]; index: number }

type EvidenceLightboxProps = {
  state: LightboxState | null
  onIndexChange: (index: number) => void
  onClose: () => void
}

const controlClass =
  'inline-flex size-10 items-center justify-center rounded-md border border-gray-500 bg-white text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-40'

export function EvidenceLightbox({ state, onIndexChange, onClose }: EvidenceLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const isOpen = state !== null

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  const total = state?.images.length ?? 0
  const index = state?.index ?? 0
  const hasMany = total > 1

  function go(step: number) {
    if (!state || !hasMany) return
    onIndexChange((index + step + total) % total)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === 'ArrowRight') go(1)
    if (event.key === 'ArrowLeft') go(-1)
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="titulo-visor-evidencia"
      onClose={onClose}
      onKeyDown={handleKeyDown}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="m-auto w-[min(64rem,calc(100vw-2rem))] max-w-none rounded-md border border-gray-300 bg-white p-0 shadow-xl backdrop:bg-gray-900/70"
    >
      {state && (
        <div className="flex flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-gray-300 bg-gray-50 px-4 py-3">
            <div className="min-w-0">
              <h2 id="titulo-visor-evidencia" className="text-sm font-bold tracking-wider text-gray-900">
                EVIDENCIA FOTOGRÁFICA
              </h2>
              <p className="font-mono text-xs text-gray-700">
                {state.incidentId} · Imagen {index + 1} de {total}
              </p>
            </div>
            <button type="button" onClick={onClose} className={controlClass}>
              <X className="size-5" aria-hidden="true" />
              <span className="sr-only">Cerrar visor</span>
            </button>
          </header>

          <div className="flex items-center justify-center bg-gray-900">
            {/* eslint-disable-next-line @next/next/no-img-element -- admite URLs blob: de archivos recién cargados */}
            <img
              src={state.images[index]}
              alt={`Evidencia ${index + 1} de ${total} de la incidencia ${state.incidentId}`}
              className="max-h-[70dvh] w-auto max-w-full object-contain"
            />
          </div>

          {hasMany && (
            <footer className="flex items-center justify-between gap-3 border-t border-gray-300 px-4 py-3">
              <button type="button" onClick={() => go(-1)} className={controlClass}>
                <ChevronLeft className="size-5" aria-hidden="true" />
                <span className="sr-only">Imagen anterior</span>
              </button>
              <ul className="flex gap-2 overflow-x-auto" aria-label="Miniaturas">
                {state.images.map((src, thumbIndex) => (
                  <li key={src}>
                    <button
                      type="button"
                      onClick={() => onIndexChange(thumbIndex)}
                      aria-current={thumbIndex === index ? 'true' : undefined}
                      className={`block size-12 overflow-hidden rounded-sm border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] ${
                        thumbIndex === index ? 'border-[#1E3A8A]' : 'border-gray-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="size-full object-cover" />
                      <span className="sr-only">Ver imagen {thumbIndex + 1}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => go(1)} className={controlClass}>
                <ChevronRight className="size-5" aria-hidden="true" />
                <span className="sr-only">Imagen siguiente</span>
              </button>
            </footer>
          )}
        </div>
      )}
    </dialog>
  )
}
