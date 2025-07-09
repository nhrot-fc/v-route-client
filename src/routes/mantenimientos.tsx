import { createFileRoute } from '@tanstack/react-router'
import MantenimientosPage from '@/pages/mantenimientos/page'

export const Route = createFileRoute('/mantenimientos')({
  component: MantenimientosPage,
}) 