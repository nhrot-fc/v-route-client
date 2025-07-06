"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, MoreHorizontal, Pencil, Trash2, PenToolIcon as Tool, AlertTriangle, Loader2 } from "lucide-react"
import { useVehicles } from "@/hooks/use-vehicles"
import type { Vehicle } from "@/lib/api-client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import { VehicleStatusEnum, VehicleTypeEnum } from "@/lib/api-client"

interface VehiclesTableProps {
  filter?: string;
  search?: string;
}

export function VehiclesTable({ filter, search }: VehiclesTableProps) {
  const { vehicles, loading, error, updateVehicleStatus, deleteVehicle } = useVehicles(filter)
  const q = search?.trim().toLowerCase() ?? ""
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogVehicle, setDeleteDialogVehicle] = useState<Vehicle | null>(null)

  const filtered = useMemo(() => {
    return vehicles.filter(v => 
      !q || (v.id && v.id.toLowerCase().includes(q))
    ).filter(v => 
      !searchTerm || (v.id && v.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [vehicles, q, searchTerm]);

  const handleStatusChange = async (vehicleId: string, newStatus: string) => {
    await updateVehicleStatus(vehicleId, newStatus);
  };

  const handleDelete = async (vehicleId: string) => {
    if (vehicleId) {
      await deleteVehicle(vehicleId);
      setDeleteDialogVehicle(null);
    }
  };

  const getVehicleType = (type: string) => {
    switch (type) {
      case VehicleTypeEnum.Ta:
        return "Tipo TA"
      case VehicleTypeEnum.Tb:
        return "Tipo TB"
      case VehicleTypeEnum.Tc:
        return "Tipo TC"
      case VehicleTypeEnum.Td:
        return "Tipo TD"
      default:
        return "Desconocido"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case VehicleStatusEnum.Available:
        return <Badge className="bg-green-500">Disponible</Badge>
      case VehicleStatusEnum.Driving:
        return <Badge className="bg-blue-500">En Tránsito</Badge>
      case VehicleStatusEnum.Maintenance:
        return <Badge className="bg-yellow-500">Mantenimiento</Badge>
      case VehicleStatusEnum.Incident:
        return <Badge className="bg-red-500">Averiado</Badge>
      case VehicleStatusEnum.Idle:
        return <Badge className="bg-gray-500">Inactivo</Badge>
      case VehicleStatusEnum.Refueling:
        return <Badge className="bg-purple-500">Reabasteciendo</Badge>
      case VehicleStatusEnum.Reloading:
        return <Badge className="bg-indigo-500">Recargando</Badge>
      case VehicleStatusEnum.Serving:
        return <Badge className="bg-pink-500">En Servicio</Badge>
      default:
        return <Badge className="bg-gray-500">Desconocido</Badge>
    }
  }

  const formatPosition = (vehicle: Vehicle) => {
    if (!vehicle.currentPosition) return "N/A"
    const x = vehicle.currentPosition.x ?? 0
    const y = vehicle.currentPosition.y ?? 0
    return `(${x.toFixed(2)}, ${y.toFixed(2)})`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando vehículos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600">
        <AlertTriangle className="h-8 w-8 mr-2" />
        <span>Error al cargar vehículos: {error}</span>
      </div>
    )
  }

  if (vehicles.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        <span>No se encontraron vehículos</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por ID..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {filtered.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Capacidad GLP</TableHead>
                <TableHead>GLP Actual</TableHead>
                <TableHead>Combustible</TableHead>
                <TableHead>Posición</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>{vehicle.id}</TableCell>
                  <TableCell>{getVehicleType(vehicle.type || '')}</TableCell>
                  <TableCell>{vehicle.glpCapacityM3?.toFixed(2) || '0'} m³</TableCell>
                  <TableCell>{vehicle.currentGlpM3?.toFixed(2) || '0'} m³</TableCell>
                  <TableCell>{vehicle.currentFuelGal?.toFixed(2) || '0'} / {vehicle.fuelCapacityGal?.toFixed(2) || '0'} gal</TableCell>
                  <TableCell>{formatPosition(vehicle)}</TableCell>
                  <TableCell>{getStatusBadge(vehicle.status || '')}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStatusChange(vehicle.id || '', VehicleStatusEnum.Available)}>
                          <Tool className="mr-2 h-4 w-4" />
                          <span>Marcar como disponible</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(vehicle.id || '', VehicleStatusEnum.Maintenance)}>
                          <Tool className="mr-2 h-4 w-4" />
                          <span>Enviar a mantenimiento</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(vehicle.id || '', VehicleStatusEnum.Incident)}>
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          <span>Reportar avería</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteDialogVehicle(vehicle)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No se encontraron vehículos.
          </CardContent>
        </Card>
      )}
      
      <AlertDialog open={!!deleteDialogVehicle} onOpenChange={(isOpen) => !isOpen && setDeleteDialogVehicle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el vehículo {deleteDialogVehicle?.id} y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteDialogVehicle && handleDelete(deleteDialogVehicle.id || '')}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
