"use client"

import { useState } from "react"
import {
  BarChart3,
  Truck,
  Settings,
  FuelIcon as GasPump,
  ClipboardList,
  PlayCircle,
  Menu,
  Wrench,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)
  const { isMobile } = useSidebar()

  const isActive = (path: string) => pathname === path
  const toggleSidebar = () => setOpen((prev) => !prev)

  return (
    <>
      {/* Botón flotante para móviles */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 bg-white rounded p-2 shadow md:hidden"
          onClick={toggleSidebar}
          aria-label="Abrir sidebar"
        >
          <Menu />
        </button>
      )}

      {/* Botón para reabrir en desktop si está cerrado */}
      {!isMobile && !open && (
        <button
          className="fixed top-4 left-4 z-50 hidden md:flex bg-white rounded p-2 shadow border"
          onClick={toggleSidebar}
          aria-label="Abrir sidebar"
        >
          <Menu />
        </button>
      )}

      {/* Sidebar principal */}
      {open && (
  <Sidebar>
        <SidebarHeader className="flex items-center px-4 py-2">
          <div className="flex items-center gap-2">
            <GasPump className="h-6 w-6 text-green-600" />
            <span className="text-xl font-bold">PLG</span>
          </div>

          {/* Botón para cerrar en desktop */}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="ml-auto hidden md:block p-1 text-gray-500 hover:text-black"
              aria-label="Cerrar sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/")}>
                <Link href="/">
                  <BarChart3 />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/pedidos")}>
                <Link href="/pedidos">
                  <ClipboardList />
                  <span>Pedidos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/vehiculos")}>
                <Link href="/vehiculos">
                  <Truck />
                  <span>Vehículos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/mantenimientos")}>
                <Link href="/mantenimientos">
                  <Wrench />
                  <span>Mantenimientos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/bloqueos")}>
                <Link href="/bloqueos">
                  <AlertTriangle />
                  <span>Bloqueos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/simulacion")}>
                <Link href="/simulacion">
                  <PlayCircle />
                  <span>Simulación</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/configuracion")}>
                <Link href="/configuracion">
                  <Settings />
                  <span>Configuración</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar> )}
    </>
  )
}
