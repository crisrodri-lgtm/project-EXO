import type { ReactNode } from 'react'

type SectionCardProps = {
  id: string
  title: string
  description?: string
  children: ReactNode
}

export function SectionCard({ id, title, description, children }: SectionCardProps) {
  return (
    <section aria-labelledby={id} className="rounded-md border border-gray-300 bg-white">
      <header className="border-b border-gray-300 px-4 py-3 md:px-6">
        <h2 id={id} className="text-sm font-bold tracking-wider text-gray-900 md:text-base">
          {title}
        </h2>
        {description && <p className="mt-0.5 text-sm text-gray-600">{description}</p>}
      </header>
      <div className="p-4 md:p-6">{children}</div>
    </section>
  )
}

export const inputClass =
  'h-11 w-full min-w-0 rounded-md border border-gray-500 bg-white px-3 text-base text-gray-900 placeholder:text-gray-500 focus-visible:border-[#1E3A8A] focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[#1E3A8A]'

export const primaryButtonClass =
  'inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-[#1E3A8A] px-5 text-sm font-bold tracking-wide text-white hover:bg-[#172E6E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] disabled:cursor-not-allowed disabled:bg-gray-400'
