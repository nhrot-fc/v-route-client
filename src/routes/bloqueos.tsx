import { createFileRoute } from '@tanstack/react-router'
import BloqueosPage from '@/pages/bloqueos/page'

export const Route = createFileRoute('/bloqueos')({
  component: BloqueosPage,
}) 