'use client'

import { useMemo, useState } from 'react'
import { SearchX } from 'lucide-react'
import { BookCard } from '@/components/opac/book-card'
import { BOOKS, CATEGORIES, normalize } from '@/components/opac/book-data'
import { OpacFilters, type QuickFilter } from '@/components/opac/opac-filters'
import { OpacSearch } from '@/components/opac/opac-search'

const INITIAL_QUERY = 'Sistemas'

export function OpacCatalog() {
  const [query, setQuery] = useState(INITIAL_QUERY)
  const [filter, setFilter] = useState<QuickFilter>('all')
  const [category, setCategory] = useState<string | null>(null)

  const results = useMemo(() => {
    const q = normalize(query)
    return BOOKS.filter((book) => {
      if (q && ![book.title, book.author, book.category].some((field) => normalize(field).includes(q))) return false
      if (filter === 'available' && book.status !== 'DISPONIBLE') return false
      if (filter === 'category' && category && book.category !== category) return false
      return true
    })
  }, [query, filter, category])

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="opac-title" className="flex flex-col gap-4">
        <div>
          <h1 id="opac-title" className="text-balance text-2xl font-bold text-gray-900 md:text-3xl">
            Consulta el catálogo de la biblioteca
          </h1>
          <p className="mt-1 text-sm text-gray-600 md:text-base">
            Busca ejemplares, revisa su disponibilidad y únete a la lista de espera FIFO.
          </p>
        </div>
        <OpacSearch initialQuery={INITIAL_QUERY} onSearch={setQuery} />
        <OpacFilters
          filter={filter}
          onFilterChange={setFilter}
          categories={CATEGORIES}
          category={category}
          onCategoryChange={setCategory}
        />
      </section>

      <section aria-labelledby="results-title" className="flex flex-col gap-3">
        <h2 id="results-title" className="text-sm font-semibold text-gray-800 md:text-base" aria-live="polite">
          {`Resultados encontrados (${results.length})`}
          {query ? ` para '${query}':` : ':'}
        </h2>

        {results.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {results.map((book) => (
              <li key={book.id}>
                <BookCard book={book} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-12 text-center">
            <SearchX className="h-8 w-8 text-gray-400" aria-hidden="true" />
            <p className="font-medium text-gray-800">No encontramos ejemplares con esos criterios.</p>
            <p className="text-sm text-gray-600">Prueba con otro término o cambia los filtros.</p>
          </div>
        )}
      </section>
    </div>
  )
}
