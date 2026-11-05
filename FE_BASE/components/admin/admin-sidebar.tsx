import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BookCopy,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = { label: string; href: string; icon: LucideIcon }

const NAV_ITEMS: NavItem[] = [
  { label: 'Panel general', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Préstamo', href: '/admin/circulacion/prestamo', icon: ArrowUpFromLine },
  { label: 'Devolución', href: '#', icon: ArrowDownToLine },
  { label: 'Auditoría e incidencias', href: '/admin/auditoria/incidencias', icon: ClipboardList },
  { label: 'Catálogo', href: '#', icon: BookCopy },
  { label: 'Usuarios', href: '#', icon: Users },
  { label: 'Reportes', href: '#', icon: FileBarChart },
]

type AdminSidebarProps = {
  collapsed: boolean
  onToggleCollapsed: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

export function AdminSidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname()
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={onCloseMobile}
          className="fixed inset-0 top-[57px] z-20 bg-gray-900/40 md:hidden"
        />
      )}
      <aside
        id="menu-admin"
        aria-label="Navegación de administración"
        className={cn(
          'fixed bottom-0 left-0 top-[57px] z-20 flex w-64 flex-col border-r border-gray-300 bg-white transition-transform md:sticky md:top-[65px] md:h-[calc(100dvh-65px)] md:translate-x-0 md:transition-[width]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'md:w-16' : 'md:w-60',
        )}
      >
        <p className={cn('px-4 pb-2 pt-5 text-xs font-bold tracking-wider text-gray-600', collapsed && 'md:sr-only')}>
          MÓDULO DE CIRCULACIÓN
        </p>
        <nav className="flex-1 px-2">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const current = href !== '#' && pathname === href
              return (
              <li key={label}>
                <Link
                  href={href}
                  aria-current={current ? 'page' : undefined}
                  title={collapsed ? label : undefined}
                  onClick={onCloseMobile}
                  className={cn(
                    'flex items-center gap-3 rounded-md border-l-4 px-3 py-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]',
                    current
                      ? 'border-[#1E3A8A] bg-gray-100 font-bold text-[#1E3A8A]'
                      : 'border-transparent text-gray-800 hover:bg-gray-100',
                    collapsed && 'md:justify-center md:px-0',
                  )}
                >
                  <Icon className="size-5 shrink-0" aria-hidden="true" />
                  <span className={cn(collapsed && 'md:sr-only')}>{label}</span>
                  {current && <span className={cn('ml-auto text-xs', collapsed && 'md:hidden')}>ACTUAL</span>}
                </Link>
              </li>
              )
            })}
          </ul>
        </nav>
        <div className="flex flex-col gap-1 border-t border-gray-300 p-2">
          <Link
            href="/login"
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]',
              collapsed && 'md:justify-center md:px-0',
            )}
          >
            <LogOut className="size-5 shrink-0" aria-hidden="true" />
            <span className={cn(collapsed && 'md:sr-only')}>Cerrar sesión</span>
          </Link>
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-expanded={!collapsed}
            aria-controls="menu-admin"
            className={cn(
              'hidden items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] md:flex',
              collapsed && 'md:justify-center md:px-0',
            )}
          >
            {collapsed ? (
              <ChevronsRight className="size-5 shrink-0" aria-hidden="true" />
            ) : (
              <ChevronsLeft className="size-5 shrink-0" aria-hidden="true" />
            )}
            <span className={cn(collapsed && 'sr-only')}>{collapsed ? 'Expandir menú' : 'Contraer menú'}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
