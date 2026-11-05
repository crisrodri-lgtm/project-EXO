import type { Metadata } from 'next'
import { ReturnWorkspace } from '@/components/circulacion/return-workspace'

export const metadata: Metadata = {
  title: 'Recepción de devoluciones · Circulación | Biblonexo',
  description: 'Recibe devoluciones en mostrador, consulta la trazabilidad de custodia y gestiona la reasignación FIFO y las incidencias.',
}

export default function ReturnsPage() {
  return <ReturnWorkspace />
}
