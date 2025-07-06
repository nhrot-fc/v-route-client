"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useVehicles } from "@/hooks/use-vehicles"
import { Vehicle, VehicleStatusEnum, VehicleTypeEnum } from "@/lib/api-client"
import { Loader2 } from "lucide-react"

interface VehicleFormProps {
  onClose: () => void
  initialData?: Partial<Vehicle>
}

export function VehicleForm({ onClose, initialData }: VehicleFormProps) {
  const { createVehicle } = useVehicles()
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    id: initialData?.id || "",
    type: initialData?.type || undefined,
    currentPosition: initialData?.currentPosition || {
      x: 0,
      y: 0,
    },
    status: VehicleStatusEnum.Available,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    field: keyof Vehicle,
    value: string | number | { x: number; y: number } | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.id || !formData.type) {
      setError("ID y tipo de vehículo son requeridos")
      setLoading(false)
      return
    }

    try {
      // Siempre establecemos el estado como AVAILABLE
      const vehicleData = {
        ...formData,
        status: VehicleStatusEnum.Available
      }
      
      await createVehicle(vehicleData)
      onClose()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al crear vehículo"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      id: "",
      type: undefined,
      currentPosition: {
        x: 0,
        y: 0,
      },
      status: VehicleStatusEnum.Available,
    })
    setError(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Datos del Vehículo</h3>
        <p className="text-sm text-muted-foreground">
          Ingresa los datos del nuevo vehículo
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="id"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              ID del Vehículo
            </label>
            <Input
              id="id"
              value={formData.id || ""}
              onChange={(e) => handleChange("id", e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="type"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Tipo de Vehículo
            </label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleChange("type", value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={VehicleTypeEnum.Ta}>Tipo TA</SelectItem>
                <SelectItem value={VehicleTypeEnum.Tb}>Tipo TB</SelectItem>
                <SelectItem value={VehicleTypeEnum.Tc}>Tipo TC</SelectItem>
                <SelectItem value={VehicleTypeEnum.Td}>Tipo TD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="positionX"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Posición X
            </label>
            <Input
              id="positionX"
              type="number"
              value={formData.currentPosition?.x || 0}
              onChange={(e) =>
                handleChange("currentPosition", {
                  x: parseFloat(e.target.value) || 0,
                  y: formData.currentPosition?.y || 0,
                })
              }
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="positionY"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Posición Y
            </label>
            <Input
              id="positionY"
              type="number"
              value={formData.currentPosition?.y || 0}
              onChange={(e) =>
                handleChange("currentPosition", {
                  x: formData.currentPosition?.x || 0,
                  y: parseFloat(e.target.value) || 0,
                })
              }
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Vehículo"}
          </Button>
        </div>
      </form>
    </div>
  )
}
