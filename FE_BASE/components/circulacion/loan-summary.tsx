import type { Borrower, LoanItem } from '@/components/circulacion/loan-data'

type LoanSummaryProps = {
  id: string
  borrower: Borrower | null
  items: LoanItem[]
  onConfirm: () => void
  onCancel: () => void
  blockedMessage?: string
}

export function LoanSummary({ id, borrower, items, onConfirm, onCancel, blockedMessage }: LoanSummaryProps) {
  const latestDue = items.map((item) => item.dueDate).sort().at(-1) ?? '—'
  const canConfirm = Boolean(borrower) && items.length > 0 && borrower?.status === 'HABILITADO'
  const issuedAt = new Intl.DateTimeFormat('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(new Date())

  return (
    <section
      aria-labelledby={id}
      className="rounded-md border border-gray-300 bg-white lg:sticky lg:top-[89px]"
    >
      <header className="border-b border-gray-300 px-4 py-3 md:px-6">
        <h2 id={id} className="text-sm font-bold tracking-wider text-gray-900 md:text-base">
          3. RESUMEN DE OPERACIÓN
        </h2>
      </header>
      <div className="p-4 md:p-6">
        <dl className="flex flex-col divide-y divide-gray-200 text-sm">
          <SummaryRow label="Fecha de emisión" value={issuedAt} mono />
          <SummaryRow label="Prestatario" value={borrower?.name ?? 'SIN IDENTIFICAR'} />
          <SummaryRow label="Tipo de usuario" value={borrower?.type ?? '—'} />
          <SummaryRow label="Ítems a prestar" value={String(items.length)} />
          <SummaryRow
            label="Cupo tras préstamo"
            value={borrower ? `${borrower.activeLoans + items.length} / ${borrower.loanLimit}` : '—'}
          />
          <SummaryRow label="Devolución hasta" value={latestDue} mono />
        </dl>

        {blockedMessage && <p id={`${id}-block-message`} role="alert" className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold leading-relaxed text-rose-900">{blockedMessage}</p>}
        <p className="mt-4 rounded-md bg-gray-100 px-3 py-2 text-xs leading-relaxed text-gray-700">
          Al confirmar, se generará un comprobante y se enviará al correo institucional o de contacto registrado.
        </p>

        <div className="mt-5 flex flex-col gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            aria-describedby={blockedMessage ? `${id}-block-message` : undefined}
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#1E3A8A] px-4 py-3 text-sm font-bold tracking-wide text-white hover:bg-[#172E6E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            CONFIRMAR PRÉSTAMO ({items.length} {items.length === 1 ? 'ÍTEM' : 'ÍTEMS'})
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#4B5563] px-4 py-3 text-sm font-bold tracking-wide text-white hover:bg-[#374151] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
          >
            CANCELAR OPERACIÓN
          </button>
        </div>
      </div>
    </section>
  )
}

function SummaryRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-gray-600">{label}</dt>
      <dd className={`text-right font-semibold text-gray-900 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  )
}
