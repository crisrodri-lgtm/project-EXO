'use client'

import { useId, useRef, useState, type DragEvent } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ACCEPTED_EVIDENCE_TYPES,
  MAX_EVIDENCES,
  MAX_EVIDENCE_SIZE_MB,
} from '@/components/auditoria/incident-data'

export type EvidenceFile = { id: string; url: string; name: string }

type EvidenceUploaderProps = {
  files: EvidenceFile[]
  onChange: (files: EvidenceFile[]) => void
}

export function EvidenceUploader({ files, onChange }: EvidenceUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hintId = useId()
  const errorId = useId()
  const remaining = MAX_EVIDENCES - files.length

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return
    const incoming = Array.from(list)
    const rejected: string[] = []
    const accepted: EvidenceFile[] = []

    for (const file of incoming) {
      if (!ACCEPTED_EVIDENCE_TYPES.includes(file.type)) {
        rejected.push(`${file.name}: formato no admitido`)
      } else if (file.size > MAX_EVIDENCE_SIZE_MB * 1024 * 1024) {
        rejected.push(`${file.name}: supera ${MAX_EVIDENCE_SIZE_MB} MB`)
      } else if (accepted.length < remaining) {
        accepted.push({ id: crypto.randomUUID(), url: URL.createObjectURL(file), name: file.name })
      } else {
        rejected.push(`${file.name}: máximo ${MAX_EVIDENCES} imágenes`)
      }
    }

    setError(rejected.length > 0 ? `ERROR: ${rejected.join(' · ')}` : null)
    if (accepted.length > 0) onChange([...files, ...accepted])
  }

  function remove(id: string) {
    const target = files.find((file) => file.id === id)
    if (target) URL.revokeObjectURL(target.url)
    onChange(files.filter((file) => file.id !== id))
    setError(null)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    addFiles(event.dataTransfer.files)
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-semibold text-gray-800">Evidencia fotográfica</span>

      <div
        onDragOver={(event) => {
          event.preventDefault()
          if (remaining > 0) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center gap-2 rounded-md border-2 border-dashed px-4 py-5 text-center transition-colors',
          dragging ? 'border-[#1E3A8A] bg-blue-50' : 'border-gray-400 bg-gray-50',
          remaining === 0 && 'opacity-60',
        )}
      >
        <ImagePlus className="size-8 text-gray-600" aria-hidden="true" />
        <p className="text-sm text-gray-800">
          Arrastre las fotografías aquí o
        </p>
        <button
          type="button"
          disabled={remaining === 0}
          onClick={() => inputRef.current?.click()}
          aria-describedby={error ? `${hintId} ${errorId}` : hintId}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#4B5563] px-4 text-xs font-bold tracking-wide text-white hover:bg-[#374151] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          SELECCIONAR ARCHIVOS
        </button>
        <p id={hintId} className="text-xs text-gray-700">
          JPG, PNG o WEBP · máx. {MAX_EVIDENCE_SIZE_MB} MB c/u · {files.length}/{MAX_EVIDENCES} imágenes
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EVIDENCE_TYPES.join(',')}
          multiple
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
          onChange={(event) => {
            addFiles(event.target.files)
            event.target.value = ''
          }}
        />
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm font-semibold text-gray-900">
          {error}
        </p>
      )}

      {files.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 xl:grid-cols-3" aria-label="Fotografías seleccionadas">
          {files.map((file, index) => (
            <li key={file.id} className="relative aspect-square overflow-hidden rounded-md border border-gray-400 bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element -- previsualización de URL blob: local */}
              <img src={file.url} alt={`Vista previa ${index + 1}: ${file.name}`} className="size-full object-cover" />
              <button
                type="button"
                onClick={() => remove(file.id)}
                className="absolute right-1 top-1 inline-flex size-8 items-center justify-center rounded-md bg-white/95 text-gray-900 shadow-sm hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1E3A8A]"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                <span className="sr-only">Eliminar {file.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
