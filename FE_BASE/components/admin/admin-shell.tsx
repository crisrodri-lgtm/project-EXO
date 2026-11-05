import type { ReactNode } from 'react'

export function AdminShell({ children }: { children: ReactNode }) {
  return <div className="min-h-full bg-gray-100 text-gray-900">{children}</div>
}
