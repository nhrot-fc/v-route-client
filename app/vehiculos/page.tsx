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
  import { Plus, Upload,CheckCircle } from "lucide-react"
  import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
  } from "@/components/ui/dialog"

  export default function VehiculosPage() {
    const [newOpen, setNewOpen] = useState(false)
    const [importOpen, setImportOpen] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [confirmMessage, setConfirmMessage] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [successOpen, setSuccessOpen] = useState(false)

    const handleNewSubmit = () => {
      setNewOpen(false)      // cierra el formulario
      setSuccessOpen(true)   // abre el pequeño pop-up
    }

    const handleImportSubmit = () => {
      setImportOpen(false)
      setConfirmMessage("Importación completada con éxito.")
      setConfirmOpen(true)
    }

    const handleSearch = () => {
      // Al hacer clic, fijamos la consulta de búsqueda
      setSearchQuery(searchTerm.trim())
    }

    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Encabezado y botones */}
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Vehículos</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
            <Button onClick={() => setNewOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Vehículo
            </Button>
          </div>
        </div>

        {/* Tabs y Buscador */}
        <Tabs defaultValue="todos" className="space-y-4">
          <div className="flex justify-between">
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="disponibles">Disponibles</TabsTrigger>
              <TabsTrigger value="en-ruta">En Ruta</TabsTrigger>
              <TabsTrigger value="mantenimiento">Mantenimiento</TabsTrigger>
              <TabsTrigger value="averiados">Averiados</TabsTrigger>
            </TabsList>

            <div className="flex w-full max-w-sm items-center space-x-2 ml-auto">
              <Input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar vehículos..."
              />
              <Button onClick={handleSearch} variant="secondary">
                Buscar
              </Button>
            </div>
          </div>

          {/* Contenidos de pestañas con filtro por estado y búsqueda por ID */}
          {[
            { key: "todos", title: "Todos los Vehículos", desc: "Listado completo de vehículos registrados", filter: undefined },
            { key: "disponibles", title: "Vehículos Disponibles", desc: "Vehículos listos para asignar", filter: "disponible" },
            { key: "en-ruta", title: "Vehículos En Ruta", desc: "Vehículos en entrega", filter: "en-ruta" },
            { key: "mantenimiento", title: "Vehículos En Mantenimiento", desc: "Vehículos en mantenimiento", filter: "mantenimiento" },
            { key: "averiados", title: "Vehículos Averiados", desc: "Vehículos fuera de servicio", filter: "averiado" },
          ].map(({ key, title, desc, filter }) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <VehiclesTable filter={filter} search={searchQuery} />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Diálogos para formularios y confirmación */}
        <Dialog open={newOpen} onOpenChange={setNewOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registro de Vehículo</DialogTitle>
              <DialogDescription>Añade un nuevo vehículo a la flota</DialogDescription>
            </DialogHeader>
            <VehicleForm onSuccess={handleNewSubmit} />
          </DialogContent>
        </Dialog>

        <Dialog open={importOpen} onOpenChange={setImportOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Carga Masiva de Vehículos</DialogTitle>
              <DialogDescription>Sube un archivo CSV con vehículos</DialogDescription>
            </DialogHeader>
            <VehicleUploadForm onClose={() => setImportOpen(false)} />
          </DialogContent>
        </Dialog>

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
        {/* Pop-up pequeño de éxito */}
        <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
          <DialogContent className="max-w-xs">
            {/* --- Header accesible --- */}
            <DialogHeader>
              <DialogTitle>Éxito</DialogTitle>
            </DialogHeader>

            {/* --- Tu contenido --- */}
            <div className="flex flex-col items-center space-y-4 py-6">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-lg font-semibold">Registro correcto</p>
              <Button onClick={() => setSuccessOpen(false)}>Cerrar</Button>
            </div>
          </DialogContent>
        </Dialog>


      </div>
    )
  }
