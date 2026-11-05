import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { AppShell } from '@/components/navigation/app-shell'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Biblonexo · Portal de biblioteca',
    template: '%s · Biblonexo',
  },
  description: 'Portal de Biblonexo para consultar el catálogo, gestionar préstamos, reservas, incidencias y operaciones bibliotecarias.',
  applicationName: 'Biblonexo',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#1E3A8A',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="light">
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
