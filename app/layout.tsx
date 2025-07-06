import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: "V-Route | Sistema de Gestión de Distribución GLP",
  description: "Plataforma de administración y optimización de rutas para distribución de GLP con simulación y planificación",
  keywords: "GLP, distribución, logística, optimización de rutas, gestión de flota, simulación",
  generator: 'v0.dev',
  icons: {
    icon: [
      {
        url: "/icons/glp-icon.svg",
        href: "/icons/glp-icon.svg",
      }
    ],
    apple: {
      url: "/icons/glp-icon.svg",
      href: "/icons/glp-icon.svg",
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <body className="bg-surface min-h-screen font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <SidebarProvider>
            <div className="flex flex-1 h-screen overflow-hidden">
              <AppSidebar />
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
            <Toaster />
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}