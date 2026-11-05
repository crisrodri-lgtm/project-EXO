import Image from 'next/image'
import { BookOpen } from 'lucide-react'

export function BookCover({ src, title }: { src?: string; title: string }) {
  return (
    <div className="relative aspect-[2/3] w-20 shrink-0 self-start overflow-hidden rounded-md border border-gray-200 bg-gray-100 sm:w-28">
      {src ? (
        <Image src={src} alt={`Portada de ${title}`} fill sizes="112px" className="object-cover" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-gray-400">
          <BookOpen className="h-8 w-8" aria-hidden="true" />
          <span className="text-[10px] font-medium uppercase tracking-wide">Sin portada</span>
          <span className="sr-only">{`Portada no disponible para ${title}`}</span>
        </div>
      )}
    </div>
  )
}
