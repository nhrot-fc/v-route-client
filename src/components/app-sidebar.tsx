import {
  BarChart3,
  Truck,
  ClipboardList,
  PlayCircle,
  Menu,
  Wrench,
  AlertTriangle,
  X,
  Flame,
  MapPin,
  AlertCircle,
  HelpCircle,
  LogOut,
  Package,
} from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";

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
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AppSidebar() {
  const location = useLocation();
  const { open, setOpen, isMobile } = useSidebar();
  
  const isActive = (path: string) => location.pathname === path;
  const toggleSidebar = () => setOpen(!open);

  return (
    <>
      {/* Botón flotante para móviles */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 bg-primary text-white rounded-full p-2.5 shadow-lg md:hidden transition-transform hover:scale-110"
          onClick={toggleSidebar}
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Botón para reabrir en desktop si está cerrado */}
      {!isMobile && !open && (
        <button
          className="fixed top-4 left-4 z-50 hidden md:flex bg-white rounded-full p-2.5 shadow-lg border hover:bg-gray-50 transition-all"
          onClick={toggleSidebar}
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5 text-primary" />
        </button>
      )}

      <Sidebar className="border-r shadow-sm">
        <SidebarHeader className="flex items-center px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <img
                src="/icons/glp-icon.svg"
                alt="V-Route Logo"
                width={32}
                height={32}
                className="transition-transform duration-300 hover:scale-110"
              />
            </div>
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
                V-ROUTE
              </span>
              <span className="text-xs block text-gray-500">
                Distribución GLP
              </span>
            </div>
          </div>

          {/* Botón para cerrar */}
          <button
            onClick={toggleSidebar}
            className="ml-auto p-1 text-gray-400 hover:text-black rounded-full hover:bg-gray-100"
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" />
          </button>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/")}
                className={isActive("/") ? "bg-blue-50 text-blue-700" : ""}
              >
                <Link to="/">
                  <BarChart3
                    className={isActive("/") ? "text-blue-600" : ""}
                  />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/pedidos")}
                className={
                  isActive("/pedidos") ? "bg-blue-50 text-blue-700" : ""
                }
              >
                <Link to="/pedidos">
                  <ClipboardList
                    className={isActive("/pedidos") ? "text-blue-600" : ""}
                  />
                  <span>Pedidos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/entregas")}
                className={
                  isActive("/entregas") ? "bg-blue-50 text-blue-700" : ""
                }
              >
                <Link to="/entregas">
                  <Package
                    className={isActive("/entregas") ? "text-blue-600" : ""}
                  />
                  <span>Entregas</span>
                  <Badge
                    variant="outline"
                    className="ml-auto text-xs py-0 px-1.5 bg-blue-50"
                  >
                    Nuevo
                  </Badge>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/vehiculos")}
                className={
                  isActive("/vehiculos") ? "bg-blue-50 text-blue-700" : ""
                }
              >
                <Link to="/vehiculos">
                  <Truck
                    className={isActive("/vehiculos") ? "text-blue-600" : ""}
                  />
                  <span>Vehículos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/mantenimientos")}
                className={
                  isActive("/mantenimientos")
                    ? "bg-blue-50 text-blue-700"
                    : ""
                }
              >
                <Link to="/mantenimientos">
                  <Wrench
                    className={
                      isActive("/mantenimientos") ? "text-blue-600" : ""
                    }
                  />
                  <span>Mantenimientos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/incidentes")}
                className={
                  isActive("/incidentes") ? "bg-blue-50 text-blue-700" : ""
                }
              >
                <Link to="/incidentes">
                  <AlertCircle
                    className={isActive("/incidentes") ? "text-blue-600" : ""}
                  />
                  <span>Incidentes</span>
                  <Badge
                    variant="outline"
                    className="ml-auto text-xs py-0 px-1.5 bg-blue-50"
                  >
                    Nuevo
                  </Badge>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/bloqueos")}
                className={
                  isActive("/bloqueos") ? "bg-blue-50 text-blue-700" : ""
                }
              >
                <Link to="/bloqueos">
                  <AlertTriangle
                    className={isActive("/bloqueos") ? "text-blue-600" : ""}
                  />
                  <span>Bloqueos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarSeparator />

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/simulacion")}
                className={
                  isActive("/simulacion") ? "bg-blue-50 text-blue-700" : ""
                }
              >
                <Link to="/simulacion">
                  <PlayCircle
                    className={isActive("/simulacion") ? "text-blue-600" : ""}
                  />
                  <span>Simulación</span>
                  <Badge
                    variant="outline"
                    className="ml-auto text-xs py-0 px-1.5 bg-amber-50 text-amber-600 border-amber-200"
                  >
                    Beta
                  </Badge>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t">
          <div className="p-3 bg-blue-50/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <Flame className="h-4 w-4 text-primary-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium truncate">
                  GLP Distribución
                </p>
                <p className="text-xs text-muted-foreground">
                  Sistema de Gestión
                </p>
              </div>
            </div>
          </div>
          <SidebarMenu>
            <div className="flex px-2 mb-2 justify-around">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-2.5 text-gray-500 hover:text-primary rounded-full hover:bg-primary-50 transition-colors">
                    <MapPin className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Explorar mapa</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-2.5 text-gray-500 hover:text-primary rounded-full hover:bg-primary-50 transition-colors">
                    <AlertCircle className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reportar problema</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-2.5 text-gray-500 hover:text-primary rounded-full hover:bg-primary-50 transition-colors">
                    <HelpCircle className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ayuda</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-2.5 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors">
                    <LogOut className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cerrar sesión</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
