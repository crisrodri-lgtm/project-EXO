import { redirect } from 'next/navigation'
import { OpacCatalog } from '@/components/opac/opac-catalog'

// Bloque de página por defecto — OPAC
export default function Page() {
  return <OpacCatalog />
}
