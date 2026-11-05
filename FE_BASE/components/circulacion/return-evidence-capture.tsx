'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Camera, CheckCircle2, ImagePlus, ShieldCheck, Trash2, Upload, Video, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Evidence = { file: File; previewUrl: string }
type ReturnEvidenceCaptureProps = { onEvidenceChange: (hasEvidence: boolean) => void }

const MAX_EVIDENCE_BYTES = 300 * 1024
const MAX_SOURCE_BYTES = 8 * 1024 * 1024
const ACCEPTED_EVIDENCE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function formatKilobytes(bytes: number) {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
}

async function compressEvidence(source: Blob, name: string) {
  if (!ACCEPTED_EVIDENCE_TYPES.has(source.type)) throw new Error('Selecciona una imagen JPG, PNG o WEBP.')
  if (source.size > MAX_SOURCE_BYTES) throw new Error('La imagen original supera el límite seguro de 8 MB.')

  const bitmap = await createImageBitmap(source)
  try {
    const scale = Math.min(1, 1440 / bitmap.width, 1440 / bitmap.height)
    let width = Math.max(1, Math.round(bitmap.width * scale))
    let height = Math.max(1, Math.round(bitmap.height * scale))
    let quality = 0.82

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) throw new Error('No fue posible procesar la imagen en este dispositivo.')
      context.drawImage(bitmap, 0, 0, width, height)

      const blob = await canvasToBlob(canvas, quality)
      if (blob && blob.size < MAX_EVIDENCE_BYTES) {
        const safeName = name.replace(/\.[^.]+$/, '').trim() || 'evidencia'
        return new File([blob], `${safeName}.jpg`, { type: 'image/jpeg' })
      }

      quality = Math.max(0.4, quality - 0.07)
      width = Math.max(1, Math.round(width * 0.82))
      height = Math.max(1, Math.round(height * 0.82))
    }
  } finally {
    bitmap.close()
  }

  throw new Error('No se pudo reducir la foto a menos de 300 KB. Intenta con otra imagen.')
}

export function ReturnEvidenceCapture({ onEvidenceChange }: ReturnEvidenceCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [evidence, setEvidence] = useState<Evidence | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    onEvidenceChange(Boolean(evidence))
  }, [evidence, onEvidenceChange])

  useEffect(() => {
    if (!evidence) return
    return () => URL.revokeObjectURL(evidence.previewUrl)
  }, [evidence])

  useEffect(() => {
    const video = videoRef.current
    if (!cameraOpen || !streamRef.current || !video) return
    video.srcObject = streamRef.current
    void video.play().catch(() => setError('No se pudo iniciar la vista previa de la cámara.'))
    return () => {
      video.srcObject = null
    }
  }, [cameraOpen])

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  async function processSource(source: Blob, name: string) {
    setProcessing(true)
    setError('')
    setNotice('')
    try {
      const file = await compressEvidence(source, name)
      const previewUrl = URL.createObjectURL(file)
      setEvidence({ file, previewUrl })
      setNotice(`Evidencia optimizada localmente · ${formatKilobytes(file.size)} · lista para adjuntar`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo preparar la evidencia.')
    } finally {
      setProcessing(false)
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const source = event.target.files?.[0]
    event.target.value = ''
    if (!source) return
    await processSource(source, source.name)
  }

  async function openCamera() {
    setError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('La cámara no está disponible en este navegador o conexión.')
      return
    }
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      setCameraOpen(true)
    } catch {
      setError('No se pudo acceder a la cámara. Revisa el permiso del navegador o elige un archivo.')
    }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraOpen(false)
  }

  async function captureFrame() {
    const video = videoRef.current
    if (!video?.videoWidth || !video.videoHeight) {
      setError('La cámara todavía no está lista. Intenta de nuevo en un momento.')
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (!context) {
      setError('No fue posible preparar la captura en este dispositivo.')
      return
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const snapshot = await canvasToBlob(canvas, 0.9)
    if (!snapshot) {
      setError('No se pudo capturar la fotografía.')
      return
    }
    closeCamera()
    await processSource(snapshot, `evidencia-${Date.now()}`)
  }

  function removeEvidence() {
    setEvidence(null)
    setNotice('')
    setError('')
  }

  return (
    <section aria-labelledby="evidence-title" className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="evidence-title" className="text-sm font-bold text-slate-900">Evidencia fotográfica <span className="font-normal text-slate-500">(opcional)</span></h3>
          <p className="mt-1 text-xs leading-5 text-slate-600">Toma la foto con la cámara del mostrador o elige un archivo. Se comprime antes de adjuntarse.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
          <ShieldCheck aria-hidden="true" className="size-3.5" /> RAM Guard · &lt; 300 KB
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_9rem] sm:items-start">
        <div className="flex flex-col items-start gap-3">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="lg" onClick={() => fileInputRef.current?.click()} disabled={processing} className="min-h-10 border-slate-300 bg-white text-slate-700">
              <Upload data-icon="inline-start" /> Elegir archivo
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={cameraOpen ? closeCamera : openCamera} disabled={processing} className="min-h-10 border-slate-300 bg-white text-slate-700">
              {cameraOpen ? <X data-icon="inline-start" /> : <Video data-icon="inline-start" />}
              {cameraOpen ? 'Cerrar cámara' : 'Abrir webcam'}
            </Button>
            {evidence && (
              <Button type="button" variant="ghost" size="lg" onClick={removeEvidence} className="min-h-10 text-slate-600">
                <Trash2 data-icon="inline-start" /> Quitar foto
              </Button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={handleFileChange} className="sr-only" aria-label="Elegir evidencia fotográfica" />
          {cameraOpen && (
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-3">
              <video ref={videoRef} autoPlay playsInline muted aria-label="Vista previa de la webcam" className="aspect-video w-full rounded-lg bg-slate-950 object-cover" />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" onClick={captureFrame} className="min-h-10 bg-[#1E3A8A] text-white hover:bg-[#183174]">
                  <Camera data-icon="inline-start" /> Capturar fotografía
                </Button>
                <Button type="button" variant="outline" onClick={closeCamera} className="min-h-10">Cancelar</Button>
              </div>
            </div>
          )}
          {processing && <p role="status" className="text-xs font-medium text-slate-600">Optimizando imagen en este dispositivo…</p>}
          {notice && <p role="status" className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800"><CheckCircle2 aria-hidden="true" className="size-4" />{notice}</p>}
          {error && <p role="alert" className="text-xs font-semibold text-rose-700">{error}</p>}
          <p className="text-[11px] leading-5 text-slate-500">Original máximo: 8 MB · JPG, PNG o WEBP · la evidencia permanece en memoria local en esta demo.</p>
        </div>
        {evidence ? (
          <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL is a temporary compressed preview */}
            <img src={evidence.previewUrl} alt="Vista previa de la evidencia del daño" className="size-full object-cover" />
            <span className="absolute bottom-2 right-2 rounded-md bg-white/95 px-2 py-1 text-[10px] font-bold text-slate-700 shadow">{formatKilobytes(evidence.file.size)}</span>
          </div>
        ) : (
          <div className="hidden aspect-square items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-slate-300 sm:flex">
            <ImagePlus aria-hidden="true" className="size-8" />
          </div>
        )}
      </div>
      <p className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        El envío a Supabase Storage está desactivado en el modo de pantalla; la foto solo queda previsualizada en este navegador.
      </p>
    </section>
  )
}
