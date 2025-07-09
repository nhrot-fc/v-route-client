import { createFileRoute } from '@tanstack/react-router'
import IncidentesPage from '@/pages/incidentes/page'

export const Route = createFileRoute('/incidentes')({
  component: IncidentesPage,
}) 