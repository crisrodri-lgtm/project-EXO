import type { Metadata } from 'next'
import { OpacCatalog } from '@/components/opac/opac-catalog'

export const metadata: Metadata = {
  title: 'Catálogo OPAC | Biblionexo',
  description: 'Catálogo público en línea: busca libros por título, autor o categoría y consulta su disponibilidad.',
}

export default function OpacPage() {
  return (
    <div className="flex min-h-full flex-col bg-gray-50">
      <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-8 md:py-10">
        <OpacCatalog />
      </section>
      <footer className="border-t border-gray-300 bg-white">
        <p className="mx-auto max-w-5xl px-4 py-3 text-xs text-gray-600 md:px-8">
          Biblionexo · Catálogo público de acceso en línea (OPAC)
        </p>
      </footer>
    </div>
  )
}
