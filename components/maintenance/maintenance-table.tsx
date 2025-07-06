"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, FileDown } from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { downloadToCSV } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { useMaintenance } from "@/hooks/use-maintenance"
import { MaintenanceDTO } from "@/lib/api-client"

export function MaintenanceTable() {
  const { maintenance, loading, error } = useMaintenance()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const getMaintenanceStatus = (item: MaintenanceDTO): string => {
    if (item.active === false && item.realEnd) return "completado"
    if (item.active === true) return "activo"
    return "pendiente"
  }

  const filteredMaintenance = maintenance.filter(item => {
    // Apply status filter
    const status = getMaintenanceStatus(item)
    if (statusFilter !== "all" && status !== statusFilter) {
      return false
    }

    // Apply search filter
    if (searchTerm && !item.vehicleId?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    return true
  })

  const handleDownloadCSV = () => {
    if (!filteredMaintenance.length) return
    
    const data = filteredMaintenance.map(item => ({
      ID: item.id,
      'ID Vehículo': item.vehicleId,
      'Fecha Asignada': item.assignedDate ? new Date(item.assignedDate).toLocaleDateString() : 'N/A',
      'Fecha Inicio': item.realStart ? new Date(item.realStart).toLocaleDateString() : 'Pendiente',
      'Fecha Fin': item.realEnd ? new Date(item.realEnd).toLocaleDateString() : 'Pendiente',
      'Duración (horas)': item.durationHours || 'N/A',
      'Estado': getMaintenanceStatus(item)
    }))

    downloadToCSV(data, 'mantenimientos.csv')
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center space-x-2 flex-grow">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por ID de vehículo..." 
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="completado">Completados</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleDownloadCSV}
          >
            <FileDown size={16} />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
      </div>
      
      {filteredMaintenance.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Fecha Asignada</TableHead>
                <TableHead>Inicio Real</TableHead>
                <TableHead>Fin Real</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaintenance.map((item) => {
                const status = getMaintenanceStatus(item)
                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.vehicleId}</TableCell>
                    <TableCell>
                      {item.assignedDate ? new Date(item.assignedDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {item.realStart ? new Date(item.realStart).toLocaleDateString() : 'Pendiente'}
                    </TableCell>
                    <TableCell>
                      {item.realEnd ? new Date(item.realEnd).toLocaleDateString() : 'Pendiente'}
                    </TableCell>
                    <TableCell>{item.durationHours || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={
                        status === 'activo' ? 'default' : 
                        status === 'completado' ? 'outline' : 'secondary'
                      }>
                        {status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No se encontraron registros de mantenimiento.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
