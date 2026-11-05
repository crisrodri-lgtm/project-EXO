'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LockKeyhole, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Bloque de modal de inicio de sesión requerido

export function LoginPromptModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  function goToLogin() {
    onClose()
    router.push('/login')
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-prompt-title"
    >
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <span className="inline-flex size-12 items-center justify-center rounded-xl bg-blue-50 text-[#1E3A8A]">
            <LockKeyhole className="size-6" aria-hidden="true" />
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <h2 id="login-prompt-title" className="text-lg font-bold text-slate-900">
          ¿Quieres iniciar sesión para continuar este proceso?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Para solicitar préstamos, reservas o hacer seguimiento de libros necesitas una cuenta activa en el sistema.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button
            type="button"
            onClick={goToLogin}
            className="min-h-11 bg-[#1E3A8A] font-bold hover:bg-[#172E6E]"
          >
            Iniciar Sesión
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="min-h-10 font-semibold text-slate-600"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}
