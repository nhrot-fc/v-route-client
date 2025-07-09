import { createFileRoute } from '@tanstack/react-router'
import SimulacionPage from '@/pages/simulacion/page'

export const Route = createFileRoute('/simulacion')({
  component: SimulacionPage,
}) 