import DashboardPage from '@/pages/home'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})