import { CheckCircle2, X } from 'lucide-react'

type SuccessToastProps = {
  receipt: string
  onDismiss: () => void
  message?: string
  receiptLabel?: string
}

export function SuccessToast({
  receipt,
  onDismiss,
  message = 'Préstamo registrado correctamente. Comprobante enviado por correo.',
  receiptLabel = 'Comprobante N.º',
}: SuccessToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-start gap-3 rounded-md border-2 border-[#1E3A8A] bg-white p-4 shadow-lg md:inset-x-auto md:right-6 md:bottom-6"
    >
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#1E3A8A]" aria-hidden="true" />
      <div className="flex-1 text-sm">
        <p className="font-bold tracking-wide text-gray-900">ÉXITO: OPERACIÓN COMPLETADA</p>
        <p className="mt-1 text-gray-800">{message}</p>
        <p className="mt-1 font-mono text-xs text-gray-600">
          {receiptLabel} {receipt}
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
      >
        <X className="size-4" aria-hidden="true" />
        <span className="sr-only">Cerrar notificación</span>
      </button>
    </div>
  )
}
