"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  AlertTriangle, 
  Calendar, 
  Clock, 
  MapPin, 
  Search, 
  X 
} from "lucide-react"
import { useBlockages } from "@/hooks/use-blockages"
import { Blockage } from "@/lib/api-client"

export function BlockagesTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("all")
  const { blockages, loading, error, deleteBlockage } = useBlockages()
  
  // Filter blockages based on search term and selected month
  const filteredBlockages = blockages.filter(blockage => {
    const matchesSearch = searchTerm === "" || 
      (blockage.linePoints && blockage.linePoints.toLowerCase().includes(searchTerm.toLowerCase()))
    
    if (selectedMonth === "all") return matchesSearch
    
    // Extract month from start time
    if (!blockage.startTime) return matchesSearch
    const month = new Date(blockage.startTime).getMonth() + 1
    return matchesSearch && month.toString().padStart(2, '0') === selectedMonth
  })

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este bloqueo?")) {
      await deleteBlockage(id)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("es-ES")
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleTimeString("es-ES", { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatLinePoints = (linePoints?: string) => {
    if (!linePoints) return "-"
    
    const parts = linePoints.split('-')
    if (parts.length !== 2) return linePoints
    
    const start = parts[0].split(',')
    const end = parts[1].split(',')
    
    if (start.length !== 2 || end.length !== 2) return linePoints
    
    return `(${start[0]}, ${start[1]}) → (${end[0]}, ${end[1]})`
  }

  if (loading) {
    return <div className="flex justify-center p-4">Cargando bloqueos...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bloqueos de Calles</CardTitle>
        <CardDescription>
          Lista de bloqueos programados en las calles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por coordenadas..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Seleccionar mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los meses</SelectItem>
              <SelectItem value="01">Enero</SelectItem>
              <SelectItem value="02">Febrero</SelectItem>
              <SelectItem value="03">Marzo</SelectItem>
              <SelectItem value="04">Abril</SelectItem>
              <SelectItem value="05">Mayo</SelectItem>
              <SelectItem value="06">Junio</SelectItem>
              <SelectItem value="07">Julio</SelectItem>
              <SelectItem value="08">Agosto</SelectItem>
              <SelectItem value="09">Septiembre</SelectItem>
              <SelectItem value="10">Octubre</SelectItem>
              <SelectItem value="11">Noviembre</SelectItem>
              <SelectItem value="12">Diciembre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead>Hora Inicio</TableHead>
                <TableHead>Fecha Fin</TableHead>
                <TableHead>Hora Fin</TableHead>
                <TableHead>Nodos</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBlockages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No se encontraron bloqueos.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBlockages.map((blockage) => (
                  <TableRow key={blockage.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {blockage.startTime ? formatDate(blockage.startTime) : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        {blockage.startTime ? formatTime(blockage.startTime) : '-'}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {blockage.endTime ? formatDate(blockage.endTime) : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        {blockage.endTime ? formatTime(blockage.endTime) : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        {formatLinePoints(blockage.linePoints)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-red-500" 
                          onClick={() => handleDelete(blockage.id || 0)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 