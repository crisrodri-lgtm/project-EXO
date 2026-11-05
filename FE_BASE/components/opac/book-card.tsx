'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookmarkPlus, Check, Hash, ListPlus, Lock, MapPin, Tag, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BookCover } from '@/components/opac/book-cover'
import { FifoCountdown } from '@/components/opac/fifo-countdown'
import { useAuth } from '@/lib/auth-context'
import type { Book } from '@/components/opac/book-data'

// Bloque de tarjeta de libro

export function BookCard({ book }: { book: Book }) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [requested, setRequested] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const isAvailable = book.status === 'DISPONIBLE'
  const queuePosition = (book.waitlistCount ?? 0) + 1

  function handleAction() {
    if (!isAuthenticated) {
      setShowPrompt(true)
      return
    }
    setRequested(true)
  }

  function confirmLoginRedirect() {
    setShowPrompt(false)
    router.push('/login')
  }

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
            {book.status}
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
              onClick={handleAction}
              disabled={requested}
              className="bg-[#1E3A8A] px-4 text-white hover:bg-[#1E3A8A]/90 disabled:opacity-100"
            >
              {requested ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : !isAuthenticated ? (
                <Lock className="h-4 w-4" aria-hidden="true" />
              ) : (
                <BookmarkPlus className="h-4 w-4" aria-hidden="true" />
              )}
              {requested ? 'Reserva solicitada' : 'Reservar Ejemplar'}
            </Button>
          ) : (
            <Button
              size="lg"
              variant="outline"
              onClick={handleAction}
              disabled={requested}
              className="border-gray-400 bg-white px-4 text-gray-800 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-100"
            >
              {requested ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : !isAuthenticated ? (
                <Lock className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ListPlus className="h-4 w-4" aria-hidden="true" />
              )}
              {requested ? 'En lista de espera' : 'Unirse a Lista de Espera'}
            </Button>
          )}
          <p className="text-xs text-gray-500" aria-live="polite">
            {isAvailable
              ? requested
                ? 'Reserva confirmada.'
                : !isAuthenticated
                  ? 'Inicia sesión para reservar este ejemplar.'
                  : 'Retiro en mostrador en 48 h.'
              : requested
                ? `Tu posición en la cola FIFO: #${queuePosition}`
                : !isAuthenticated
                  ? 'Inicia sesión para unirte a la lista de espera.'
                  : `${book.waitlistCount ?? 0} en lista de espera`}
          </p>
        </div>
      </div>

      {showPrompt && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="book-login-prompt-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex justify-center">
              <span className="inline-flex size-12 items-center justify-center rounded-xl bg-blue-50 text-[#1E3A8A]">
                <Lock className="size-6" aria-hidden="true" />
              </span>
            </div>
            <h2 id="book-login-prompt-title" className="text-center text-lg font-bold text-slate-900">
              ¿Quieres iniciar sesión para continuar este proceso?
            </h2>
            <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">
              Para solicitar préstamos, reservas o hacer seguimiento de libros necesitas una cuenta activa.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Button
                type="button"
                onClick={confirmLoginRedirect}
                className="min-h-11 bg-[#1E3A8A] font-bold hover:bg-[#172E6E]"
              >
                Iniciar Sesión
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowPrompt(false)}
                className="min-h-10 font-semibold text-slate-600"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
