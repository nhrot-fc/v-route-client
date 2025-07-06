import { useState, useEffect, useCallback } from 'react'
import { vehiclesApi, type Vehicle } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'

// Define an interface that combines the old field names with the new ones for transition
interface VehicleWithLegacyFields extends Vehicle {
  currentGLP?: number; // Legacy field
  currentFuel?: number; // Legacy field
  glpCapacity?: number; // Legacy field
  fuelCapacity?: number; // Legacy field
}

export function useVehicles(filter?: string) {
  const [vehicles, setVehicles] = useState<VehicleWithLegacyFields[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      let response
      if (filter) {
        // Map Spanish filter names to API status values
        const statusMap: Record<string, string> = {
          'disponible': 'AVAILABLE',
          'en-ruta': 'DRIVING',
          'mantenimiento': 'MAINTENANCE',
          'averiado': 'INCIDENT'
        }
        
        const apiStatus = statusMap[filter]
        if (apiStatus) {
          response = await vehiclesApi.list(undefined, apiStatus as any)
        } else {
          response = await vehiclesApi.list()
        }
      } else {
        response = await vehiclesApi.list()
      }
      
      const vehiclesData = Array.isArray(response.data) ? response.data : [response.data].filter(Boolean)
      
      // Map the received vehicles to include legacy fields for compatibility
      const mappedVehicles = vehiclesData.map(v => ({
        ...v,
        currentGLP: v.currentGlpM3, // Map new field to legacy field
        currentFuel: v.currentFuelGal, // Map new field to legacy field
        glpCapacity: v.glpCapacityM3, // Map new field to legacy field
        fuelCapacity: v.fuelCapacityGal // Map new field to legacy field
      }))
      
      setVehicles(mappedVehicles)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar vehículos'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [filter, toast])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  const createVehicle = async (vehicleData: Partial<VehicleWithLegacyFields>) => {
    try {
      // Create a new vehicle DTO with the correct field names
      const vehicleDTO = {
        ...vehicleData,
        currentGlpM3: vehicleData.currentGLP ?? vehicleData.currentGlpM3,
        currentFuelGal: vehicleData.currentFuel ?? vehicleData.currentFuelGal,
        glpCapacityM3: vehicleData.glpCapacity ?? vehicleData.glpCapacityM3,
        fuelCapacityGal: vehicleData.fuelCapacity ?? vehicleData.fuelCapacityGal
      } 
      
      const response = await vehiclesApi.create(vehicleDTO as any)
      await fetchVehicles() // Refresh the list
      toast({
        title: 'Éxito',
        description: 'Vehículo creado exitosamente',
      })
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear vehículo'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    }
  }

  const updateVehicleStatus = async (id: string, status: string) => {
    try {
      // Get the current vehicle first
      const vehicleResponse = await vehiclesApi.getById(id)
      const currentVehicle = vehicleResponse.data
      
      // Update only the status
      const vehicleDTO = {
        ...currentVehicle,
        status: status // The API expects a specific enum value
      }
      
      await vehiclesApi.update(id, vehicleDTO as any)
      await fetchVehicles() // Refresh the list
      toast({
        title: 'Éxito',
        description: 'Estado del vehículo actualizado',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar estado'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    }
  }

  const deleteVehicle = async (id: string) => {
    try {
      await vehiclesApi._delete(id)
      await fetchVehicles() // Refresh the list
      toast({
        title: 'Éxito',
        description: 'Vehículo eliminado exitosamente',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar vehículo'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    }
  }
  
  const updateVehicle = async (id: string, data: Partial<VehicleWithLegacyFields>) => {
    try {
      const vehicleDTO = {
        ...data,
        currentGlpM3: data.currentGLP ?? data.currentGlpM3,
        currentFuelGal: data.currentFuel ?? data.currentFuelGal,
        glpCapacityM3: data.glpCapacity ?? data.glpCapacityM3,
        fuelCapacityGal: data.fuelCapacity ?? data.fuelCapacityGal
      }
      
      await vehiclesApi.update(id, vehicleDTO as any)
      await fetchVehicles()
      toast({ title: 'Éxito', description: 'Vehículo actualizado' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar vehículo'
      toast({ title: 'Error', description: msg, variant: 'destructive' })
      throw err
    }
  }
  return {
    vehicles,
    loading,
    error,
    refetch: fetchVehicles,
    createVehicle,
    updateVehicleStatus,
    deleteVehicle,
    updateVehicle,
  }
}

export function useVehicle(id: string) {
  const [vehicle, setVehicle] = useState<VehicleWithLegacyFields | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await vehiclesApi.getById(id)
        // Map the vehicle to include legacy fields for compatibility
        const vehicleWithLegacy = {
          ...response.data,
          currentGLP: response.data.currentGlpM3,
          currentFuel: response.data.currentFuelGal,
          glpCapacity: response.data.glpCapacityM3,
          fuelCapacity: response.data.fuelCapacityGal
        }
        setVehicle(vehicleWithLegacy)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar vehículo'
        setError(errorMessage)
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchVehicle()
    }
  }, [id, toast])

  return { vehicle, loading, error }
}
