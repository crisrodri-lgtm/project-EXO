import type { Metadata } from 'next'
import { InventoryManager } from '@/components/admin/inventory-manager'

export const metadata: Metadata = { title: 'Gestor de inventario y catálogo' }

export default function InventoryPage() {
  return <InventoryManager />
}
