'use client'

import { useState, type FormEvent } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function OpacSearch({ initialQuery, onSearch }: { initialQuery: string; onSearch: (q: string) => void }) {
  const [value, setValue] = useState(initialQuery)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSearch(value.trim())
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <label htmlFor="opac-query" className="sr-only">
        Buscar en el catálogo
      </label>
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
          aria-hidden="true"
        />
        <Input
          id="opac-query"
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Buscar por título, autor o categoría..."
          className="h-12 rounded-md border-gray-400 bg-white pl-11 text-base text-gray-900 placeholder:text-gray-500 dark:bg-white md:text-base"
        />
      </div>
      <Button
        type="submit"
        className="h-12 rounded-md bg-[#1E3A8A] px-6 text-base font-semibold text-white hover:bg-[#1E3A8A]/90"
      >
        <Search className="h-5 w-5" aria-hidden="true" />
        Buscar
      </Button>
    </form>
  )
}
