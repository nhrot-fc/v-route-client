import { createFileRoute } from '@tanstack/react-router'
import PedidosPage from '@/pages/pedidos/page'

export const Route = createFileRoute('/pedidos')({
  component: PedidosPage,
}) 