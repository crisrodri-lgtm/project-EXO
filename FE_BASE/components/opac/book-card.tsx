'use client'

import { useState } from 'react'
import { BookmarkPlus, Check, Hash, ListPlus, MapPin, Tag, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BookCover } from '@/components/opac/book-cover'
import { FifoCountdown } from '@/components/opac/fifo-countdown'
import type { Book } from '@/components/opac/book-data'

export function BookCard({ book }: { book: Book }) {
  const [requested, setRequested] = useState(false)
  const isAvailable = book.status === 'DISPONIBLE'
  const queuePosition = (book.waitlistCount ?? 0) + 1

  return (
    <Card className="flex-row gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-900 shadow-none ring-0 sm:gap-5 sm:p-5">
      <BookCover src={book.coverUrl} title={book.title} />

      <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <Badge
            className={
              isAvailable
                ? 'h-6 rounded-sm border-emerald-700 bg-emerald-50 px-2 text-xs font-bold tracking-wide text-emerald-800'
                : 'h-6 rounded-sm border-amber-600 bg-amber-50 px-2 text-xs font-bold tracking-wide text-amber-800'
            }
          >
            {`[ ${book.status} ]`}
          </Badge>

          <div>
            <h3 className="text-pretty text-base font-bold leading-snug sm:text-lg">{book.title}</h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-700">
              <UserRound className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
              {book.author}
            </p>
          </div>

          <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <dt>
                <Tag className="h-4 w-4 text-gray-500" aria-hidden="true" />
                <span className="sr-only">Categoría</span>
              </dt>
              <dd>{book.category}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt>
                <MapPin className="h-4 w-4 text-gray-500" aria-hidden="true" />
                <span className="sr-only">Ubicación</span>
              </dt>
              <dd>{book.location}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt>
                <Hash className="h-4 w-4 text-gray-500" aria-hidden="true" />
                <span className="sr-only">Código</span>
              </dt>
              <dd className="font-mono text-xs">{book.id}</dd>
            </div>
          </dl>

          {!isAvailable && book.availableInSeconds !== undefined && (
            <FifoCountdown seconds={book.availableInSeconds} />
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-1 md:items-end">
          {isAvailable ? (
            <Button
              size="lg"
              onClick={() => setRequested(true)}
              disabled={requested}
              className="bg-[#1E3A8A] px-4 text-white hover:bg-[#1E3A8A]/90 disabled:opacity-100"
            >
              {requested ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <BookmarkPlus className="h-4 w-4" aria-hidden="true" />
              )}
              {requested ? 'Reserva solicitada' : 'Reservar Ejemplar'}
            </Button>
          ) : (
            <Button
              size="lg"
              variant="outline"
              onClick={() => setRequested(true)}
              disabled={requested}
              className="border-gray-400 bg-white px-4 text-gray-800 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-100"
            >
              {requested ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ListPlus className="h-4 w-4" aria-hidden="true" />
              )}
              {requested ? 'En lista de espera' : 'Unirse a Lista de Espera'}
            </Button>
          )}
          <p className="text-xs text-gray-500" aria-live="polite">
            {isAvailable
              ? requested
                ? 'Inicia sesión para confirmar la reserva.'
                : 'Retiro en mostrador en 48 h.'
              : requested
                ? `Tu posición en la cola FIFO: #${queuePosition}`
                : `${book.waitlistCount ?? 0} en lista de espera`}
          </p>
        </div>
      </div>
    </Card>
  )
}
