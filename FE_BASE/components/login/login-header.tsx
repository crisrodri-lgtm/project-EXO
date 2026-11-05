import { BrandLogo } from '@/components/brand-logo'

export function LoginHeader() {
  return (
    <header className="border-b border-gray-300 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8 md:py-4">
        <div className="flex items-center gap-3 md:gap-5">
          <BrandLogo priority />
          <span aria-hidden="true" className="h-8 w-px bg-gray-300 md:h-10" />
          <p className="text-sm font-semibold tracking-wide text-gray-700 md:text-base">CDEB-PD</p>
        </div>
        <a
          href="#ayuda"
          className="rounded-md border border-gray-400 bg-white px-3 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
        >
          [ Ayuda / FAQs ]
        </a>
      </div>
    </header>
  )
}
