import Link from 'next/link'
import { LogIn } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function OpacHeader() {
  return (
    <header className="border-b border-gray-300 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-8 md:py-4">
        <Link
          href="/opac"
          className="flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] md:gap-5"
        >
          <BrandLogo priority />
          <span aria-hidden="true" className="h-8 w-px bg-gray-300 md:h-10" />
          <span className="text-sm font-semibold tracking-wide text-gray-700 md:text-base">Catálogo OPAC</span>
        </Link>
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'lg' }),
            'border-gray-400 bg-white px-3 text-gray-800 hover:bg-gray-100 hover:text-gray-900',
          )}
        >
          <LogIn className="h-4 w-4" aria-hidden="true" />
          Login
        </Link>
      </div>
    </header>
  )
}
