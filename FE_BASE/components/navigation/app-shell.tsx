'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Suspense, useState, type ReactNode } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  Archive,
  ArrowLeftRight,
  BookOpen,
  BookMarked,
  Bell,
  CircleDollarSign,
  ChevronDown,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldCheck,
  Undo2,
  Users,
  UserRound,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type AppRole = 'ESTUDIANTE' | 'ADMIN' | 'AUXILIAR'
type NavigationItem = { label: string; href: string; icon: typeof Home }
type NavigationGroup = { label: string; items: NavigationItem[] }

const STUDENT_NAVIGATION: NavigationGroup[] = [
  {
    label: 'Portal estudiantil',
    items: [
      { label: 'Inicio', href: '/estudiante/dashboard', icon: Home },
      { label: 'Catálogo OPAC', href: '/opac', icon: BookOpen },
      { label: 'Mis préstamos', href: '/estudiante/prestamos', icon: BookMarked },
      { label: 'Auto-reporte de incidencias', href: '/estudiante/incidencias', icon: ClipboardList },
      { label: 'Historial anónimo', href: '/estudiante/incidencias?tab=history', icon: Archive },
      { label: 'Mi perfil', href: '/estudiante/perfil', icon: UserRound },
    ],
  },
]

const STAFF_NAVIGATION: NavigationGroup[] = [
  {
    label: 'Operaciones',
    items: [
      { label: 'Panel general', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Préstamos', href: '/admin/circulacion/prestamo', icon: ArrowLeftRight },
      { label: 'Devoluciones', href: '/admin/circulacion/devolucion', icon: Undo2 },
      { label: 'Auditoría e incidencias', href: '/admin/auditoria/incidencias', icon: ShieldCheck },
    ],
  },
  {
    label: 'Administración',
    items: [
      { label: 'Gestión de inventario', href: '/admin/inventario', icon: Package },
      { label: 'Sanciones y cobros', href: '/admin/sanciones-cobros', icon: CircleDollarSign },
      { label: 'Usuarios y roles', href: '/admin/usuarios', icon: Users },
    ],
  },
]

function roleForPath(pathname: string, demoRole?: string): AppRole {
  if (pathname === '/admin/perfil' && demoRole === 'auxiliar') return 'AUXILIAR'
  if (pathname.startsWith('/auxiliar/')) return 'AUXILIAR'
  if (pathname.startsWith('/admin/')) return 'ADMIN'
  return 'ESTUDIANTE'
}

function Brand({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
        aria-expanded={!collapsed}
        aria-controls="biblonexo-navigation"
        title={collapsed ? 'Expandir menú' : 'Contraer menú'}
        className="hidden min-h-12 items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E3A8A] md:inline-flex"
      >
        <Image
          src="/brand/logo-full.png"
          width={801}
          height={301}
          alt="Biblonexo — contraer o expandir el menú"
          priority
          className={cn('h-10 w-auto transition-all', collapsed && 'lg:h-9')}
        />
      </button>
      <span className="inline-flex items-center md:hidden">
        <Image
          src="/brand/logo-icon.png"
          width={444}
          height={528}
          alt="Biblonexo"
          priority
          className="h-9 w-auto"
        />
      </span>
    </>
  )
}

function Sidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
  onToggleCollapsed,
  role,
  name,
}: {
  collapsed: boolean
  mobileOpen: boolean
  onCloseMobile: () => void
  onToggleCollapsed: () => void
  role: AppRole
  name: string
}) {
  const pathname = usePathname()
  const navigationGroups = role === 'ESTUDIANTE' ? STUDENT_NAVIGATION : STAFF_NAVIGATION
  const profileHref = role === 'ESTUDIANTE'
    ? '/estudiante/perfil'
    : `/admin/perfil${role === 'AUXILIAR' ? '?demoRole=auxiliar' : ''}`
  const settingsHref = `${profileHref}${profileHref.includes('?') ? '&' : '?'}tab=configuracion`

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú lateral"
          onClick={onCloseMobile}
          className="fixed inset-0 top-[4.5rem] z-30 bg-slate-950/35 md:hidden"
        />
      )}
      <aside
        id="biblonexo-navigation"
        aria-label="Navegación principal"
        className={cn(
          'fixed bottom-0 left-0 top-[4.5rem] z-40 flex w-[17rem] flex-col border-r border-slate-200 bg-white transition-[width,transform] duration-200 md:sticky md:top-[4.5rem] md:h-[calc(100dvh-4.5rem)] md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'md:w-[4.75rem]' : 'md:w-[17rem]',
        )}
      >
        <div className="flex-1 overflow-y-auto px-3 pb-3 pt-5">
          {navigationGroups.map((group) => (
            <section key={group.label} className="mb-5">
              <h2 className={cn('mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400', collapsed && 'md:sr-only')}>
                {group.label}
              </h2>
              <ul className="flex flex-col gap-1">
                {group.items.map(({ label, href, icon: Icon }) => {
                  const hrefPath = href.split(/[?#]/)[0]
                  const current = !href.includes('#') && !href.includes('?tab=history') && pathname === hrefPath
                  return (
                    <li key={label}>
                      <Link
                        href={href}
                        aria-current={current ? 'page' : undefined}
                        title={collapsed ? label : undefined}
                        onClick={onCloseMobile}
                        className={cn(
                          'flex min-h-10 items-center gap-3 rounded-lg border-l-[3px] px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#1E3A8A] focus-visible:ring-offset-2',
                          current
                            ? 'border-[#1E3A8A] bg-blue-50 font-semibold text-[#1E3A8A]'
                            : 'border-transparent font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                          collapsed && 'md:justify-center md:px-0',
                        )}
                      >
                        <Icon aria-hidden="true" className="size-[18px] shrink-0" />
                        <span className={cn('min-w-0 truncate', collapsed && 'md:sr-only')}>{label}</span>
                        {current && !collapsed && <span className="ml-auto size-1.5 rounded-full bg-[#1E3A8A]" aria-hidden="true" />}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
        <div className="border-t border-slate-200 p-3">
          <details className="group relative mb-3">
            <summary
              aria-label="Abrir menú de usuario"
              className={cn(
                'flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-lg bg-slate-50 p-2.5 outline-none transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#1E3A8A] [&::-webkit-details-marker]:hidden',
                collapsed && 'md:justify-center md:px-1',
              )}
            >
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700" aria-hidden="true">
                {name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
              </span>
              <span className={cn('min-w-0 flex-1', collapsed && 'md:sr-only')}>
                <span className="block truncate text-xs font-semibold text-slate-800">{name}</span>
                <span className="block text-[10px] text-slate-500">{role === 'ESTUDIANTE' ? 'Estudiante · 2019-0832' : `${role} · Personal de biblioteca`}</span>
              </span>
              <ChevronDown aria-hidden="true" className={cn('size-4 text-slate-500 transition-transform group-open:rotate-180', collapsed && 'md:sr-only')} />
            </summary>
            <nav aria-label="Opciones de usuario" className="absolute bottom-[calc(100%+0.5rem)] left-0 z-50 hidden w-full min-w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl group-open:block">
              <ul className="flex flex-col gap-0.5">
                <li>
                  <Link href={profileHref} onClick={onCloseMobile} className="flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-[#1E3A8A]">
                    <UserRound aria-hidden="true" className="size-4" /> Mi Perfil
                  </Link>
                </li>
                <li>
                  <Link href={settingsHref} onClick={onCloseMobile} className="flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-[#1E3A8A]">
                    <Settings aria-hidden="true" className="size-4" /> Configuración
                  </Link>
                </li>
                <li>
                  <Link href="/login" onClick={onCloseMobile} className="flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-rose-700 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-rose-700">
                    <LogOut aria-hidden="true" className="size-4" /> Cerrar Sesión
                  </Link>
                </li>
              </ul>
            </nav>
          </details>
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-expanded={!collapsed}
            aria-controls="biblonexo-navigation"
            className="hidden w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] md:flex"
          >
            {collapsed ? <PanelLeftOpen aria-hidden="true" className="size-4 shrink-0" /> : <PanelLeftClose aria-hidden="true" className="size-4 shrink-0" />}
            <span className={cn(collapsed && 'md:sr-only')}>{collapsed ? 'Expandir menú' : 'Contraer menú'}</span>
          </button>
        </div>
      </aside>
    </>
  )
}

function AppShellContent({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const role = roleForPath(pathname, searchParams.get('demoRole') ?? undefined)
  const name = role === 'ESTUDIANTE' ? 'María Fernanda' : role === 'AUXILIAR' ? 'Luis García' : 'M. Andrade'
  const initials = role === 'ESTUDIANTE' ? 'MF' : role === 'AUXILIAR' ? 'LG' : 'MA'

  if (pathname === '/login' || pathname.startsWith('/login/')) return <>{children}</>

  return (
    <div className="min-h-dvh bg-slate-100 text-slate-900">
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-[#1E3A8A] focus:shadow"
      >
        Saltar al contenido principal
      </a>
      <header className="sticky top-0 z-50 h-[4.5rem] border-b border-slate-200 bg-white">
        <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileOpen}
              aria-controls="biblonexo-navigation"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] md:hidden"
            >
              {mobileOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
            </button>
            <Brand collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
            <span aria-hidden="true" className="hidden h-8 w-px bg-slate-200 sm:block" />
            <p className="hidden truncate text-xs font-semibold tracking-[0.12em] text-slate-500 sm:block">{role === 'ESTUDIANTE' ? 'PORTAL ESTUDIANTIL' : 'ADMINISTRACIÓN DE BIBLIOTECA'}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              aria-label="Notificaciones"
              className="inline-flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
            >
              <Bell aria-hidden="true" className="size-[18px]" />
            </button>
            <span className="hidden text-right sm:block">
              <span className="block text-xs font-semibold text-slate-800">{name}</span>
              <span className="block text-[10px] text-slate-500">{role}</span>
            </span>
            <span aria-hidden="true" className="inline-flex size-9 items-center justify-center rounded-full bg-[#1E3A8A] text-xs font-bold text-white sm:hidden">{initials}</span>
            <span aria-hidden="true" className="hidden size-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#1E3A8A] sm:inline-flex">{initials}</span>
          </div>
        </div>
      </header>
      <div className="flex min-h-[calc(100dvh-4.5rem)]">
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          onToggleCollapsed={() => setCollapsed((value) => !value)}
          role={role}
          name={name}
        />
        <main id="contenido-principal" className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-slate-100">{children}</main>}>
      <AppShellContent>{children}</AppShellContent>
    </Suspense>
  )
}
