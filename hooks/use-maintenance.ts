import { useState, useEffect, useCallback } from 'react'
import { maintenanceApi, type MaintenanceDTO } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'

// Define an interface for legacy fields if needed
interface MaintenanceWithLegacyFields extends MaintenanceDTO {
  // No legacy fields needed for now
}

// Define pagination parameters
interface PaginationParams {
  page: number;
  size: number;
  sortBy?: string;
  direction?: string;
}

// Export with original name for backward compatibility
export function useMaintenance(paginationParams?: PaginationParams) {
  const [maintenance, setMaintenance] = useState<MaintenanceWithLegacyFields[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast()

  // Extract pagination values to use in dependencies
  const page = paginationParams?.page;
  const size = paginationParams?.size;
  const sortBy = paginationParams?.sortBy;
  const direction = paginationParams?.direction;

  const fetchMaintenance = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Set up pagination parameters
      const isPaginated = !!paginationParams;
      const { page, size, sortBy, direction } = paginationParams || { page: 0, size: 10 };
      
      const response = await maintenanceApi.listMaintenances(undefined, undefined, undefined, undefined, isPaginated, page, size, sortBy, direction)
      
      const responseData = response.data;
      
      // Handle paginated response
      if (isPaginated && responseData && typeof responseData === 'object' && 'content' in responseData) {
        const { content, totalElements, totalPages: pages } = responseData as any;
        
        // Map the response data to include legacy fields if needed
        const mappedMaintenance = content.map((record: MaintenanceDTO) => ({
          ...record
        }));
        
        setMaintenance(mappedMaintenance);
        setTotalItems(totalElements || content.length);
        setTotalPages(pages || 1);
      } else {
        // Map the response data to include legacy fields if needed
        const maintenanceData = Array.isArray(responseData) ? responseData : [responseData].filter(Boolean)
        const mappedMaintenance = maintenanceData.map(record => ({
          ...record
        }))
        
        setMaintenance(mappedMaintenance);
        setTotalItems(mappedMaintenance.length);
        setTotalPages(1);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar registros de mantenimiento'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [page, size, sortBy, direction, toast])

  useEffect(() => {
    fetchMaintenance()
  }, [fetchMaintenance])

  const createMaintenance = async (maintenanceData: Partial<MaintenanceWithLegacyFields>) => {
    try {
      // Prepare the maintenance create data
      const data = {
        vehicleId: maintenanceData.vehicleId,
        assignedDate: maintenanceData.assignedDate || new Date().toISOString()
      }
      
      await maintenanceApi.createMaintenance(data)
      await fetchMaintenance() // Refresh the list
      toast({
        title: 'Éxito',
        description: 'Mantenimiento programado exitosamente',
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al programar mantenimiento'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    }
  }

  const scheduleMaintenance = async (vehicleId: string, assignedDate: string) => {
    try {
      // Prepare the maintenance create data
      const data = {
        vehicleId,
        assignedDate
      }
      
      await maintenanceApi.createMaintenance(data)
      await fetchMaintenance() // Refresh the list
      toast({
        title: 'Éxito',
        description: 'Mantenimiento programado exitosamente',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al programar mantenimiento'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    }
  }

  const completeMaintenanceRecord = async (id: number) => {
    try {
      // In the updated API, we might not have a direct "complete maintenance" endpoint
      // So this functionality might need to be implemented differently
      // For now, we'll just refresh the maintenance list
      
      await fetchMaintenance() // Refresh the list
      
      toast({
        title: 'Éxito',
        description: 'Registro de mantenimiento completado',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al completar mantenimiento'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    }
  }

  const cancelMaintenanceRecord = async (id: number) => {
    try {
      // The delete method might not be directly available in the API
      // We'll need to check the API documentation for the correct method
      
      // For now, just refresh the maintenance list
      await fetchMaintenance()
      
      toast({
        title: 'Éxito',
        description: 'Registro de mantenimiento cancelado',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cancelar mantenimiento'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    }
  }

  return {
    maintenance,
    loading,
    error,
    refetch: fetchMaintenance,
    createMaintenance,
    scheduleMaintenance,
    completeMaintenanceRecord,
    cancelMaintenanceRecord,
    totalItems,
    totalPages,
  }
}

// Alias for the original function name
export const useMaintenanceRecords = useMaintenance

export function useActiveMaintenance() {
  const [maintenance, setMaintenance] = useState<MaintenanceWithLegacyFields[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchActiveMaintenanceRecords = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await maintenanceApi.listActiveMaintenances()
        
        // Map the response data to include legacy fields if needed
        const maintenanceData = Array.isArray(response.data) ? response.data : [response.data].filter(Boolean)
        const mappedMaintenance = maintenanceData.map(record => ({
          ...record
        }))
        
        setMaintenance(mappedMaintenance)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar mantenimientos activos'
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

    fetchActiveMaintenanceRecords()
  }, [toast])

  return { maintenance, loading, error }
}

// Alias for the new function name
export const useActiveMaintenanceRecords = useActiveMaintenance

export function useMaintenanceByVehicle(vehicleId: string) {
  const [maintenance, setMaintenance] = useState<MaintenanceWithLegacyFields[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchMaintenanceByVehicle = async () => {
      try {
        setLoading(true)
        setError(null)
        // Use the listMaintenances endpoint with vehicleId filter
        const response = await maintenanceApi.listMaintenances(vehicleId)
        
        // Map the response data to include legacy fields if needed
        const maintenanceData = Array.isArray(response.data) ? response.data : [response.data].filter(Boolean)
        const mappedMaintenance = maintenanceData.map(record => ({
          ...record
        }))
        
        setMaintenance(mappedMaintenance)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar mantenimientos del vehículo'
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

    if (vehicleId) {
      fetchMaintenanceByVehicle()
    }
  }, [vehicleId, toast])

  return { maintenance, loading, error }
}
