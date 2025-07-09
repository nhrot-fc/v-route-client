import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { WebSocketProvider } from "@/lib/websocket-context"
import "@/styles.css"

export const Route = createRootRoute({
  component: () => (
    <div className="app-root bg-background min-h-screen font-sans antialiased" suppressHydrationWarning>
      <SidebarProvider defaultOpen={true}>
          <WebSocketProvider>
            <div className="flex w-full h-screen overflow-hidden">
              <AppSidebar />
              <SidebarInset className="w-full overflow-auto">
                <Outlet />
              </SidebarInset>
            </div>
            <Toaster />
          </WebSocketProvider>
        </SidebarProvider>
      <TanStackRouterDevtools />
    </div>
  ),
})
