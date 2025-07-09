import { createFileRoute } from '@tanstack/react-router'
import EntregasPage from '@/pages/entregas/page'

export const Route = createFileRoute('/entregas')({
  component: EntregasPage,
}) 