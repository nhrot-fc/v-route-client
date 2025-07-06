"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { PageLayout } from "@/components/ui/page-layout"
import { Divider } from "@/components/ui/divider"
import { DataTable } from "@/components/ui/data-table"
import { VehicleForm } from "@/components/vehicles/vehicle-form"
import { VehicleUploadForm } from "@/components/vehicles/vehicle-upload-form"
import { useVehicles } from "@/hooks/use-vehicles"
import { StatusBadge } from "@/components/ui/status-badge"
import { Vehicle, VehicleStatusEnum } from "@/lib/api-client"

import { 
  Plus, 
  Upload, 
  CheckCircle, 
  Truck,
  TruckIcon, 
  AlertTriangle, 
  Wrench, 
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { SectionContainer } from "@/components/ui/section-container"

export default function VehiculosPage() {
  const [newOpen, setNewOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmMessage] = useState("")
  const [successOpen, setSuccessOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("todos")

  const { vehicles, loading, error, updateVehicleStatus, deleteVehicle } = useVehicles()

  // Count vehicles by status
  const availableCount = vehicles.filter(v => v.status === VehicleStatusEnum.Available).length
  const inRouteCount = vehicles.filter(v => v.status === VehicleStatusEnum.Driving).length
  const maintenanceCount = vehicles.filter(v => v.status === VehicleStatusEnum.Maintenance).length
  const incidentCount = vehicles.filter(v => v.status === VehicleStatusEnum.Incident).length

  // Format vehicle position
  const formatPosition = (vehicle: Vehicle) => {
    if (!vehicle.currentPosition) return "N/A"
    const x = vehicle.currentPosition.x ?? 0
    const y = vehicle.currentPosition.y ?? 0
    return `(${x.toFixed(2)}, ${y.toFixed(2)})`
  }

  // Define status display function
  const getVehicleStatus = (status: string | undefined) => {
    switch (status) {
      case VehicleStatusEnum.Available:
        return <StatusBadge status="success" text="Disponible" />;
      case VehicleStatusEnum.Driving:
        return <StatusBadge status="info" text="En Ruta" />;
      case VehicleStatusEnum.Maintenance:
        return <StatusBadge status="warning" text="Mantenimiento" />;
      case VehicleStatusEnum.Incident:
        return <StatusBadge status="error" text="Averiado" />;
      default:
        return <StatusBadge status="pending" text="Desconocido" />;
    }
  };

  // Define table columns
  const columns = [
    {
      header: "ID",
      accessorKey: "id" as keyof Vehicle,
      className: "font-medium",
    },
    {
      header: "Tipo",
      accessorKey: "type" as keyof Vehicle,
      cell: (vehicle: Vehicle) => {
        const type = vehicle.type || "";
        return <span>Tipo {type.toUpperCase()}</span>
      },
    },
    {
      header: "Capacidad GLP",
      accessorKey: "glpCapacityM3" as keyof Vehicle,
      cell: (vehicle: Vehicle) => `${vehicle.glpCapacityM3?.toFixed(2) || '0'} m³`,
    },
    {
      header: "GLP Actual",
      accessorKey: "currentGlpM3" as keyof Vehicle,
      cell: (vehicle: Vehicle) => `${vehicle.currentGlpM3?.toFixed(2) || '0'} m³`,
    },
    {
      header: "Combustible",
      accessorKey: "currentFuelGal" as keyof Vehicle,
      cell: (vehicle: Vehicle) => (
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ 
                width: `${vehicle.fuelCapacityGal ? (vehicle.currentFuelGal || 0) / vehicle.fuelCapacityGal * 100 : 0}%` 
              }}
            />
          </div>
          <span className="text-xs">
            {vehicle.currentFuelGal?.toFixed(1) || '0'}/{vehicle.fuelCapacityGal?.toFixed(1) || '0'} gal
          </span>
        </div>
      ),
    },
    {
      header: "Posición",
      accessorKey: (vehicle: Vehicle) => formatPosition(vehicle),
    },
    {
      header: "Estado",
      accessorKey: "status" as keyof Vehicle,
      cell: (vehicle: Vehicle) => getVehicleStatus(vehicle.status),
    },
  ];

  // Define filter tabs
  const filterTabs = [
    {
      id: "disponibles",
      label: "Disponibles",
      icon: <Truck className="h-4 w-4" />,
      count: availableCount,
      filter: (vehicle: Vehicle) => vehicle.status === VehicleStatusEnum.Available,
    },
    {
      id: "en-ruta",
      label: "En Ruta",
      icon: <TruckIcon className="h-4 w-4" />,
      count: inRouteCount,
      filter: (vehicle: Vehicle) => vehicle.status === VehicleStatusEnum.Driving,
    },
    {
      id: "mantenimiento",
      label: "Mantenimiento",
      icon: <Wrench className="h-4 w-4" />,
      count: maintenanceCount,
      filter: (vehicle: Vehicle) => vehicle.status === VehicleStatusEnum.Maintenance,
    },
    {
      id: "averiados",
      label: "Averiados",
      icon: <AlertTriangle className="h-4 w-4" />,
      count: incidentCount,
      filter: (vehicle: Vehicle) => vehicle.status === VehicleStatusEnum.Incident,
    },
  ];

  // Define actions
  const actions = [
    {
      id: "service",
      label: "Enviar a mantenimiento",
      icon: <Wrench className="h-4 w-4" />,
      onClick: (vehicle: Vehicle) => updateVehicleStatus(vehicle.id || "", VehicleStatusEnum.Maintenance),
      hidden: (vehicle: Vehicle) => vehicle.status === VehicleStatusEnum.Maintenance,
    },
    {
      id: "report",
      label: "Reportar avería",
      icon: <AlertTriangle className="h-4 w-4" />,
      onClick: (vehicle: Vehicle) => updateVehicleStatus(vehicle.id || "", VehicleStatusEnum.Incident),
      hidden: (vehicle: Vehicle) => vehicle.status === VehicleStatusEnum.Incident,
    },
    {
      id: "available",
      label: "Marcar como disponible",
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (vehicle: Vehicle) => updateVehicleStatus(vehicle.id || "", VehicleStatusEnum.Available),
      hidden: (vehicle: Vehicle) => vehicle.status === VehicleStatusEnum.Available || vehicle.status === VehicleStatusEnum.Driving,
    },
    {
      id: "delete",
      label: "Eliminar vehículo",
      icon: <Plus className="h-4 w-4 rotate-45" />,
      onClick: (vehicle: Vehicle) => {
        if (vehicle.id) {
          deleteVehicle(vehicle.id);
        }
      },
    },
  ];

  return (
    <PageLayout
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
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border">
          <CardContent className="p-4 flex items-center">
            <div className="bg-green-50 p-3 rounded-md mr-3">
              <Truck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Disponibles</div>
              <div className="text-2xl font-semibold">{availableCount}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border">
          <CardContent className="p-4 flex items-center">
            <div className="bg-blue-50 p-3 rounded-md mr-3">
              <TruckIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">En Ruta</div>
              <div className="text-2xl font-semibold">{inRouteCount}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border">
          <CardContent className="p-4 flex items-center">
            <div className="bg-amber-50 p-3 rounded-md mr-3">
              <Wrench className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Mantenimiento</div>
              <div className="text-2xl font-semibold">{maintenanceCount}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border">
          <CardContent className="p-4 flex items-center">
            <div className="bg-red-50 p-3 rounded-md mr-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Averiados</div>
              <div className="text-2xl font-semibold">{incidentCount}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <SectionContainer
        title="Flota de Vehículos"
        description="Gestione el estado y la información de su flota de distribución"
        icon={<Truck className="h-5 w-5" />}
        variant="card"
        className="p-4"
      >
        <DataTable
          data={vehicles}
          columns={columns}
          actions={actions}
          filterTabs={filterTabs}
          searchable={{
            field: "id" as keyof Vehicle,
            placeholder: "Buscar por ID...",
          }}
          isLoading={loading}
          error={error}
          activeFilter={activeTab}
          onFilterChange={setActiveTab}
          noDataMessage="No se encontraron vehículos con los filtros seleccionados."
        />
      </SectionContainer>

      {/* Modal de registro de vehículo */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2 text-primary" />
              <span>Registro de Vehículo</span>
            </DialogTitle>
            <DialogDescription>Añade un nuevo vehículo a la flota</DialogDescription>
          </DialogHeader>
          <Divider className="my-2" />
          <VehicleForm onClose={() => setNewOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Modal de importación de vehículos */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2 text-primary" />
              <span>Carga Masiva de Vehículos</span>
            </DialogTitle>
            <DialogDescription>Sube un archivo CSV con vehículos</DialogDescription>
          </DialogHeader>
          <Divider className="my-2" />
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
    </PageLayout>
  )
}
