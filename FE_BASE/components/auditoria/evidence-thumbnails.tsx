import { ImageOff, Images } from 'lucide-react'

type EvidenceThumbnailsProps = {
  incidentId: string
  images: string[]
  onOpen: (index: number) => void
  size?: 'sm' | 'md'
}

export function EvidenceThumbnails({ incidentId, images, onOpen, size = 'md' }: EvidenceThumbnailsProps) {
  if (images.length === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-700">
        <ImageOff className="size-4" aria-hidden="true" />
        Sin evidencias
      </span>
    )
  }

  if (size === 'sm') {
    return (
      <button
        type="button"
        onClick={() => onOpen(0)}
        className="group inline-flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
      >
        <span className="relative block size-10 overflow-hidden rounded-sm border border-gray-400">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[0]} alt="" className="size-full object-cover group-hover:opacity-80" />
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-900">
          <Images className="size-4" aria-hidden="true" />
          {images.length}
        </span>
        <span className="sr-only">Ver evidencias de la incidencia {incidentId}</span>
      </button>
    )
  }

  return (
    <ul className="flex flex-wrap gap-2" aria-label={`Evidencias de la incidencia ${incidentId}`}>
      {images.map((src, index) => (
        <li key={src}>
          <button
            type="button"
            onClick={() => onOpen(index)}
            className="group block size-20 overflow-hidden rounded-md border border-gray-400 bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] md:size-24"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Evidencia ${index + 1} de la incidencia ${incidentId}`}
              className="size-full object-cover transition-opacity group-hover:opacity-80"
            />
            <span className="sr-only">Ampliar</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
