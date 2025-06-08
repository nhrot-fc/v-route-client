"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useVehicles } from "@/hooks/use-vehicles"
import type { Vehicle, VehicleStatusEnum, VehicleTypeEnum } from "@/lib/api-client"

interface VehicleFormProps {
  onSuccess: () => void   // ← añadimos la prop
}

export function VehicleForm({ onSuccess }: VehicleFormProps) {
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    id: "",
    type: undefined,
    glpCapacity: undefined,
    fuelCapacity: undefined,
    currentGLP: 0,
    currentFuel: 0,
    status: "AVAILABLE",
    currentPosition: { x: 0, y: 0 },
  })
  const { toast } = useToast()
  const { createVehicle } = useVehicles()

  const handleChange = (field: keyof Vehicle, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePositionChange = (field: 'x'|'y', value: string) => {
    const num = parseInt(value) || 0
    setFormData(prev => ({
      ...prev,
      currentPosition: {
        ...prev.currentPosition!,
        [field]: num
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación básica
    if (!formData.id || !formData.type || !formData.glpCapacity || !formData.fuelCapacity) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    try {
      await createVehicle(formData as Vehicle)

      // Limpieza y toast
      setFormData({
        id: "",
        type: undefined,
        glpCapacity: undefined,
        fuelCapacity: undefined,
        currentGLP: 0,
        currentFuel: 0,
        status: "AVAILABLE",
        currentPosition: { x: 0, y: 0 },
      })
      toast({
        title: "Éxito",
        description: "Vehículo registrado exitosamente.",
      })

      // ← aquí disparas el popup de éxito en el padre
      onSuccess()
    } catch {
      // el error ya sale por el hook
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="id">ID del Vehículo</Label>
          <Input
            id="id"
            value={formData.id}
            onChange={(e) => handleChange('id', e.target.value)}
            placeholder="ej. VEH-001"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Vehículo</Label>
          <Select value={formData.type} onValueChange={(value: VehicleTypeEnum) => handleChange('type', value)} required>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TA">TA - Cisterna Pequeña</SelectItem>
              <SelectItem value="TB">TB - Cisterna Mediana</SelectItem>
              <SelectItem value="TC">TC - Cisterna Grande</SelectItem>
              <SelectItem value="TD">TD - Cisterna Extra Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="glpCapacity">Capacidad GLP (L)</Label>
          <Input
            id="glpCapacity"
            type="number"
            min="0"
            step="0.01"
            value={formData.glpCapacity || ""}
            onChange={(e) => handleChange('glpCapacity', parseFloat(e.target.value) || undefined)} // Allow undefined if empty
            placeholder="ej. 5000"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fuelCapacity">Capacidad Combustible (L)</Label>
          <Input
            id="fuelCapacity"
            type="number"
            min="0"
            step="0.01"
            value={formData.fuelCapacity || ""}
            onChange={(e) => handleChange('fuelCapacity', parseFloat(e.target.value) || undefined)} // Allow undefined if empty
            placeholder="ej. 200"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="currentGLP">GLP Actual (L)</Label>
          <Input
            id="currentGLP"
            type="number"
            min="0"
            step="0.01"
            value={formData.currentGLP || ""}
            onChange={(e) => handleChange('currentGLP', parseFloat(e.target.value) || 0)}
            placeholder="ej. 2500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentFuel">Combustible Actual (L)</Label>
          <Input
            id="currentFuel"
            type="number"
            min="0"
            step="0.01"
            value={formData.currentFuel || ""}
            onChange={(e) => handleChange('currentFuel', parseFloat(e.target.value) || 0)}
            placeholder="ej. 150"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="positionX">Posición X</Label>
          <Input
            id="positionX"
            type="number"
            value={formData.currentPosition?.x || ""}
            onChange={(e) => handlePositionChange('x', e.target.value)}
            placeholder="ej. 10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="positionY">Posición Y</Label>
          <Input
            id="positionY"
            type="number"
            value={formData.currentPosition?.y || ""}
            onChange={(e) => handlePositionChange('y', e.target.value)}
            placeholder="ej. 20"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Estado</Label>
        <Select value={formData.status} onValueChange={(value: VehicleStatusEnum) => handleChange('status', value)} required>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AVAILABLE">Disponible</SelectItem>
            <SelectItem value="IN_TRANSIT">En Tránsito</SelectItem>
            <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
            <SelectItem value="BROKEN_DOWN">Averiado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">
        Registrar Vehículo
      </Button>
    </form>
  )
}
