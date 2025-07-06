"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VehiclesTable } from "@/components/vehicles/vehicles-table"
import { VehicleForm } from "@/components/vehicles/vehicle-form"
import { VehicleUploadForm } from "@/components/vehicles/vehicle-upload-form"
import { 
  Plus, 
  Upload, 
  CheckCircle, 
  Search, 
  Truck,
  TruckIcon, 
  AlertTriangle, 
  Wrench, 
  ClipboardList,
  FilterX 
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { PageContainer } from "@/components/ui/page-container"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"

export default function VehiculosPage() {
  const [newOpen, setNewOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [successOpen, setSuccessOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("todos")

  const handleSearch = () => {
    setSearchQuery(searchTerm.trim())
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "todos": return <ClipboardList className="h-4 w-4 mr-2" />
      case "disponibles": return <Truck className="h-4 w-4 mr-2" />
      case "en-ruta": return <TruckIcon className="h-4 w-4 mr-2" />
      case "mantenimiento": return <Wrench className="h-4 w-4 mr-2" />
      case "averiados": return <AlertTriangle className="h-4 w-4 mr-2" />
      default: return null
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Gestión de Vehículos" 
        description="Administración de la flota de vehículos para distribución"
        actions={[
          { 
            icon: <Upload className="h-4 w-4" />, 
            label: "Importar", 
            variant: "outline",
            onClick: () => setImportOpen(true)
          },
          { 
            icon: <Plus className="h-4 w-4" />, 
            label: "Nuevo Vehículo",
            onClick: () => setNewOpen(true)
          }
        ]}
      />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-blue-600" />
              <CardTitle>Flota de Vehículos</CardTitle>
            </div>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar vehículos..."
                className="h-9"
              />
              <Button onClick={handleSearch} variant="secondary" size="sm" className="h-9">
                <Search className="h-4 w-4 mr-1" />
                Buscar
              </Button>
            </div>
          </div>
          <CardDescription className="pt-1">
            Gestione el estado y la información de su flota de distribución
          </CardDescription>
        </CardHeader>

        <div className="px-6">
          <Tabs 
            value={activeTab}
            onValueChange={handleTabChange}
            className="space-y-4"
          >
            <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
              <TabsTrigger 
                value="todos"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                {getTabIcon("todos")}
                <span>Todos</span>
                <Badge variant="secondary" className="ml-2 bg-gray-100">32</Badge>
              </TabsTrigger>
              <TabsTrigger value="disponibles">
                {getTabIcon("disponibles")}
                <span>Disponibles</span>
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">15</Badge>
              </TabsTrigger>
              <TabsTrigger value="en-ruta">
                {getTabIcon("en-ruta")}
                <span>En Ruta</span>
                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">8</Badge>
              </TabsTrigger>
              <TabsTrigger value="mantenimiento">
                {getTabIcon("mantenimiento")}
                <span>Mantenimiento</span>
                <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800">6</Badge>
              </TabsTrigger>
              <TabsTrigger value="averiados">
                {getTabIcon("averiados")}
                <span>Averiados</span>
                <Badge variant="secondary" className="ml-2 bg-red-100 text-red-800">3</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="todos" className="p-0 border-0">
              <VehiclesTable filter={undefined} search={searchQuery} />
            </TabsContent>
            
            <TabsContent value="disponibles" className="p-0 border-0">
              <VehiclesTable filter="disponible" search={searchQuery} />
            </TabsContent>
            
            <TabsContent value="en-ruta" className="p-0 border-0">
              <VehiclesTable filter="en-ruta" search={searchQuery} />
            </TabsContent>
            
            <TabsContent value="mantenimiento" className="p-0 border-0">
              <VehiclesTable filter="mantenimiento" search={searchQuery} />
            </TabsContent>
            
            <TabsContent value="averiados" className="p-0 border-0">
              <VehiclesTable filter="averiado" search={searchQuery} />
            </TabsContent>
          </Tabs>
        </div>
      </Card>

      {/* Modal de registro de vehículo */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2 text-blue-600" />
              <span>Registro de Vehículo</span>
            </DialogTitle>
            <DialogDescription>Añade un nuevo vehículo a la flota</DialogDescription>
          </DialogHeader>
          <VehicleForm onClose={() => setNewOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Modal de importación de vehículos */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2 text-blue-600" />
              <span>Carga Masiva de Vehículos</span>
            </DialogTitle>
            <DialogDescription>Sube un archivo CSV con vehículos</DialogDescription>
          </DialogHeader>
          <VehicleUploadForm onClose={() => setImportOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmación</DialogTitle>
            <DialogDescription>{confirmMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setConfirmOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de éxito */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Éxito</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-6">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="text-lg font-semibold">Registro correcto</p>
            <Button onClick={() => setSuccessOpen(false)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
