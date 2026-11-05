import Link from 'next/link'
import { ArrowUpRight, Construction } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

type ModulePlaceholderProps = {
  section: string
  title: string
  description: string
  backHref: string
  actionLabel: string
}

export function ModulePlaceholder({ section, title, description, backHref, actionLabel }: ModulePlaceholderProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-9 lg:py-9">
      <nav aria-label="Ruta de navegación" className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
        <span>Biblonexo</span>
        <span aria-hidden="true">/</span>
        <span>{section}</span>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="font-semibold text-slate-800">{title}</span>
      </nav>

      <header className="mb-8 max-w-3xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#1E3A8A]">{section}</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
      </header>

      <Card className="max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-sm ring-0">
        <CardHeader className="gap-3 p-6 sm:p-8">
          <span className="inline-flex size-11 items-center justify-center rounded-xl bg-blue-50 text-[#1E3A8A]">
            <Construction aria-hidden="true" className="size-5" />
          </span>
          <CardTitle className="text-lg font-semibold text-slate-900">Módulo disponible en esta versión</CardTitle>
          <CardDescription className="max-w-xl text-sm leading-6 text-slate-600">
            La ruta ya está habilitada para la navegación. El flujo de gestión se integrará en una próxima iteración.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 sm:px-8">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Puedes continuar usando los módulos disponibles sin salir del portal.
          </div>
        </CardContent>
        <CardFooter className="border-t border-slate-200 bg-white p-6 sm:px-8">
          <Link href={backHref} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#1E3A8A] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1E3A8A]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]">
            {actionLabel}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
