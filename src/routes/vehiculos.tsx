import { createFileRoute } from '@tanstack/react-router'
import VehiculosPage from '@/pages/vehiculos/page'

export const Route = createFileRoute('/vehiculos')({
  component: VehiculosPage,
}) 