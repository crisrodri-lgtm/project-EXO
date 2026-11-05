import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

type AppHeaderProps = {
  mobileMenuOpen: boolean
  onToggleMobileMenu: () => void
}

export function AppHeader({ mobileMenuOpen, onToggleMobileMenu }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-300 bg-white">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 md:px-6 md:py-3">
        <div className="flex items-center gap-3 md:gap-5">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="menu-admin"
            className="inline-flex size-10 items-center justify-center rounded-md border border-gray-400 text-gray-800 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] md:hidden"
          >
            {mobileMenuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            <span className="sr-only">{mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}</span>
          </button>

          <Link
            href="/admin/circulacion/prestamo"
            className="inline-flex items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E3A8A]"
          >
            {/* Desktop / espacios amplios: logo biblionexo 1 (completo) */}
            <Image
              src="/brand/logo-full.png"
              width={801}
              height={301}
              alt="Biblionexo"
              priority
              className="hidden h-10 w-auto md:block lg:h-11"
            />
            {/* Móvil / espacios compactos: logo biblionexo 2 (isotipo) */}
            <Image
              src="/brand/logo-icon.png"
              width={444}
              height={528}
              alt="Biblionexo"
              priority
              className="h-9 w-auto md:hidden"
            />
          </Link>

          <span aria-hidden="true" className="hidden h-8 w-px bg-gray-300 sm:block" />
          <p className="hidden text-sm font-semibold tracking-wide text-gray-700 sm:block">
            CIRCULACIÓN · MOSTRADOR
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right lg:block">
            <p className="text-sm font-semibold text-gray-900">Lic. Carmen Rivas</p>
            <p className="text-xs text-gray-600">ROL: BIBLIOTECARIO</p>
          </div>
          <span
            aria-hidden="true"
            className="inline-flex size-10 items-center justify-center rounded-md border border-gray-400 bg-gray-100 text-sm font-bold text-gray-800"
          >
            CR
          </span>
        </div>
      </div>
    </header>
  )
}
