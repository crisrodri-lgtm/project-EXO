import type { Metadata } from 'next'
import { LoginHeader } from '@/components/login/login-header'
import { LoginForm } from '@/components/login/login-form'
import { StatusBar } from '@/components/login/status-bar'

export const metadata: Metadata = {
  title: 'Acceso Unificado | Biblionexo',
  description: 'Inicia sesión, solicita una cuenta o recupera el acceso al portal de biblioteca Biblonexo.',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      <LoginHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-8 md:py-12">
        <LoginForm />
      </main>
      <StatusBar />
    </div>
  )
}
