import Image from 'next/image'
import { cn } from '@/lib/utils'

type BrandLogoProps = {
  /**
   * auto: isotipo en pantallas pequeñas, logotipo completo desde `md`.
   * full / icon: fuerza una variante concreta.
   */
  variant?: 'auto' | 'full' | 'icon'
  className?: string
  priority?: boolean
}

const FULL = { src: '/brand/logo-full.png', width: 801, height: 301 }
const ICON = { src: '/brand/logo-icon.png', width: 444, height: 528 }

export function BrandLogo({ variant = 'auto', className, priority }: BrandLogoProps) {
  const showIcon = variant === 'icon' || variant === 'auto'
  const showFull = variant === 'full' || variant === 'auto'

  return (
    <span className={cn('inline-flex items-center', className)}>
      {showIcon && (
        <Image
          src={ICON.src}
          width={ICON.width}
          height={ICON.height}
          alt="Biblionexo"
          priority={priority}
          className={cn('h-10 w-auto', variant === 'auto' && 'md:hidden')}
        />
      )}
      {showFull && (
        <Image
          src={FULL.src}
          width={FULL.width}
          height={FULL.height}
          alt="Biblionexo"
          priority={priority}
          className={cn('h-10 w-auto lg:h-12', variant === 'auto' && 'hidden md:block')}
        />
      )}
    </span>
  )
}
