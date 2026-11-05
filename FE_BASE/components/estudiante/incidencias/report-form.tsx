'use client'

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import Image from 'next/image'
import { Camera, CheckCircle2, ImagePlus, ShieldCheck, Trash2 } from 'lucide-react'
import { CATEGORIAS, MOCK_PRESTAMOS, type CategoriaIncidencia } from './mock-data'

const MAX_EVIDENCE_BYTES = 300 * 1024
const MAX_SOURCE_BYTES = 8 * 1024 * 1024

type ProcessedEvidence = { file: File; previewUrl: string }
type NewReportInput = { prestamoCodigo: string; categoria: CategoriaIncidencia; descripcion: string; fotoUrl?: string }

function formatKilobytes(bytes: number) {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

async function compressEvidence(source: File): Promise<File> {
  if (!source.type.startsWith('image/')) throw new Error('Selecciona un archivo de imagen válido.')
  if (source.size > MAX_SOURCE_BYTES) throw new Error('La imagen original supera el límite seguro de 8 MB.')

  const bitmap = await createImageBitmap(source, { resizeWidth: 1280, resizeQuality: 'high' })
  const canvas = document.createElement('canvas')
  const ratio = Math.min(1, 1280 / bitmap.width, 1280 / bitmap.height)
  canvas.width = Math.max(1, Math.round(bitmap.width * ratio))
  canvas.height = Math.max(1, Math.round(bitmap.height * ratio))
  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    throw new Error('No fue posible procesar la imagen en este dispositivo.')
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

  let quality = 0.78
  let blob: Blob | null = null
  for (let attempt = 0; attempt < 7; attempt += 1) {
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (blob && blob.size < MAX_EVIDENCE_BYTES) break
    quality = Math.max(0.38, quality - 0.08)
    canvas.width = Math.max(320, Math.round(canvas.width * 0.82))
    canvas.height = Math.max(320, Math.round(canvas.height * 0.82))
    const resizedContext = canvas.getContext('2d')
    if (!resizedContext) break
    resizedContext.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  }

  bitmap.close()
  if (!blob || blob.size >= MAX_EVIDENCE_BYTES) throw new Error('No se pudo reducir la fotografía a menos de 300 KB. Prueba con otra imagen.')
  return new File([blob], `${source.name.replace(/\.[^.]+$/, '') || 'evidencia'}.jpg`, { type: 'image/jpeg' })
}

export function ReportForm({ onSubmit }: { onSubmit: (report: NewReportInput) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [evidence, setEvidence] = useState<ProcessedEvidence | null>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => () => {
    if (evidence) URL.revokeObjectURL(evidence.previewUrl)
  }, [evidence])

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const source = event.target.files?.[0]
    event.target.value = ''
    if (!source) return

    setError('')
    setNotice('')
    setProcessing(true)
    try {
      const compressed = await compressEvidence(source)
      const previewUrl = URL.createObjectURL(compressed)
      setEvidence((previous) => {
        if (previous) URL.revokeObjectURL(previous.previewUrl)
        return { file: compressed, previewUrl }
      })
      setNotice(`Fotografía lista · ${formatKilobytes(compressed.size)} en el dispositivo`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo procesar la imagen.')
    } finally {
      setProcessing(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (processing) return
    const formData = new FormData(event.currentTarget)
    const prestamoCodigo = String(formData.get('prestamo') ?? '')
    const categoria = String(formData.get('categoria') ?? '') as CategoriaIncidencia
    const descripcion = String(formData.get('descripcion') ?? '').trim()
    if (!prestamoCodigo || !categoria || descripcion.length < 10) {
      setError('Completa los campos requeridos y describe el detalle con al menos 10 caracteres.')
      return
    }
    onSubmit({ prestamoCodigo, categoria, descripcion, fotoUrl: evidence?.previewUrl })
    setEvidence(null)
    setNotice('')
    event.currentTarget.reset()
  }

  function removeEvidence() {
    if (evidence) URL.revokeObjectURL(evidence.previewUrl)
    setEvidence(null)
    setNotice('')
    setError('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#1E3A8A] shadow-sm">
            <ShieldCheck aria-hidden="true" className="size-[18px]" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Tu reporte ayuda a cuidar el material</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">El registro se vincula al préstamo activo. Tu identidad no se muestra en el historial público del ejemplar.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
          Préstamo activo <span className="text-[#1E3A8A]">*</span>
          <select name="prestamo" required defaultValue={MOCK_PRESTAMOS.find((item) => item.activo)?.codigo} className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100">
            {MOCK_PRESTAMOS.filter((prestamo) => prestamo.activo).map((prestamo) => (
              <option key={prestamo.codigo} value={prestamo.codigo}>
                {prestamo.codigo}: {prestamo.ejemplar.titulo} · {prestamo.ejemplar.codigo}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
          Categoría del imperfecto <span className="text-[#1E3A8A]">*</span>
          <select name="categoria" required defaultValue="" className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100">
            <option value="" disabled>Selecciona una categoría</option>
            {CATEGORIAS.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        Descripción detallada <span className="text-[#1E3A8A]">*</span>
        <textarea
          name="descripcion"
          required
          minLength={10}
          maxLength={800}
          rows={5}
          placeholder="Cuéntanos qué observaste y, si puedes, indica la página o zona del libro."
          className="min-h-32 resize-y rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm font-normal leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100"
        />
        <span className="text-xs font-normal text-slate-500">Evita incluir información personal en la descripción.</span>
      </label>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-slate-700">Evidencia fotográfica <span className="font-normal text-slate-500">(opcional)</span></span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
            <ShieldCheck aria-hidden="true" className="size-3.5 text-[#1E3A8A]" /> RAM Guard · &lt; 300 KB
          </span>
        </div>
        <div className="grid gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 sm:grid-cols-[minmax(0,1fr)_8.5rem] sm:items-center">
          <div className="flex flex-col items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
              {evidence ? <ImagePlus aria-hidden="true" className="size-5" /> : <Camera aria-hidden="true" className="size-5" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{evidence ? evidence.file.name : 'Agrega una foto clara del imperfecto'}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">JPG, PNG o WEBP. La foto se optimiza en este dispositivo antes de adjuntarse.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={processing} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#4B5563] px-4 text-xs font-bold text-white transition hover:bg-[#374151] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] disabled:cursor-wait disabled:opacity-60">
                {processing ? <span className="size-3.5 animate-spin rounded-full border-2 border-white/50 border-t-white" aria-hidden="true" /> : <Camera aria-hidden="true" className="size-4" />}
                {processing ? 'OPTIMIZANDO…' : evidence ? 'CAMBIAR FOTO' : 'CAPTURAR O ELEGIR FOTO'}
              </button>
              {evidence && <button type="button" onClick={removeEvidence} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"><Trash2 aria-hidden="true" className="size-4" /> Quitar</button>}
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={handleFileChange} className="sr-only" aria-label="Capturar o elegir evidencia fotográfica" />
            {notice && <p role="status" className="text-xs font-medium text-emerald-700">{notice}</p>}
            {error && <p role="alert" className="text-xs font-semibold text-rose-700">{error}</p>}
          </div>
          {evidence ? (
            <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element -- preview uses a temporary local object URL */}
              <img src={evidence.previewUrl} alt="Previsualización de la evidencia fotográfica" className="size-full object-cover" />
              <span className="absolute bottom-2 right-2 rounded-md bg-white/95 px-2 py-1 text-[10px] font-bold text-slate-700 shadow">{formatKilobytes(evidence.file.size)}</span>
            </div>
          ) : (
            <div className="hidden aspect-square items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-300 sm:flex">
              <ImagePlus aria-hidden="true" className="size-8" />
            </div>
          )}
        </div>
        <p className="text-[11px] text-slate-500">Límite de imagen original: 8 MB. La evidencia final se mantiene bajo 300 KB.</p>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">Los campos con <span className="font-semibold text-[#1E3A8A]">*</span> son obligatorios.</p>
        <button type="submit" disabled={processing} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#1E3A8A] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#183174] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] disabled:cursor-wait disabled:opacity-60">
          <CheckCircle2 aria-hidden="true" className="size-[18px]" /> Enviar auto-reporte
        </button>
      </div>
    </form>
  )
}
