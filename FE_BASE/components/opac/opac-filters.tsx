'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type QuickFilter = 'all' | 'available' | 'category'

const OPTIONS: { value: QuickFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'available', label: 'Disponibles' },
  { value: 'category', label: 'Por Categoría' },
]

type OpacFiltersProps = {
  filter: QuickFilter
  onFilterChange: (f: QuickFilter) => void
  categories: string[]
  category: string | null
  onCategoryChange: (c: string | null) => void
}

export function OpacFilters({ filter, onFilterChange, categories, category, onCategoryChange }: OpacFiltersProps) {
  const items = categories.map((c) => ({ value: c, label: c }))

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-medium text-gray-700" id="quick-filters-label">
        Filtros:
      </span>
      <div role="group" aria-labelledby="quick-filters-label" className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => {
          const active = filter === opt.value
          return (
            <Button
              key={opt.value}
              type="button"
              variant="outline"
              aria-pressed={active}
              onClick={() => onFilterChange(opt.value)}
              className={cn(
                'h-9 rounded-full px-4',
                active
                  ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white hover:bg-[#1E3A8A]/90 hover:text-white'
                  : 'border-gray-400 bg-white text-gray-800 hover:bg-gray-100 hover:text-gray-900',
              )}
            >
              {opt.label}
            </Button>
          )
        })}
      </div>

      {filter === 'category' && (
        <Select items={items} value={category} onValueChange={(v) => onCategoryChange(v as string | null)}>
          <SelectTrigger
            aria-label="Seleccionar categoría"
            className="h-9 min-w-52 border-gray-400 bg-white text-gray-800 dark:bg-white dark:hover:bg-gray-50"
          >
            <SelectValue placeholder="Elige una categoría" />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
