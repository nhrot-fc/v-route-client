import { useState, useEffect, useCallback } from 'react'
import { maintenanceApi, type MaintenanceDTO, type MaintenanceCreateDTO } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'

// Define pagination parameters
interface PaginationParams {
  page: number;
  size: number;
  sortBy?: string;
  direction?: string;
}

export function useMaintenance(paginationParams?: PaginationParams) {
  const [maintenance, setMaintenance] = useState<MaintenanceDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  // Extract pagination values to use in dependencies
  const page = paginationParams?.page
  const size = paginationParams?.size
  const sortBy = paginationParams?.sortBy
  const direction = paginationParams?.direction

  const fetchMaintenance = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Set up pagination parameters
      const isPaginated = !!paginationParams
      const { page, size, sortBy, direction } = paginationParams || { page: 0, size: 10 }
      
      const response = await maintenanceApi.listMaintenances(undefined, undefined, undefined, undefined, isPaginated, page, size, sortBy, direction)
      
      const responseData = response.data
      
      // Handle paginated response
      if (isPaginated && responseData && typeof responseData === 'object' && 'content' in responseData) {
        const { content, totalElements, totalPages: pages } = responseData as { content: MaintenanceDTO[]; totalElements: number; totalPages: number }
        setMaintenance(content)
        setTotalItems(totalElements || content.length)
        setTotalPages(pages || 1)
      } else {
        // Handle non-paginated response
        const maintenanceData = Array.isArray(responseData) ? responseData : [responseData].filter(Boolean)
        setMaintenance(maintenanceData)
        setTotalItems(maintenanceData.length)
        setTotalPages(1)
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

  const createMaintenance = async (maintenanceData: Partial<MaintenanceDTO>) => {
    try {
      // Prepare the maintenance create data
      const data: MaintenanceCreateDTO = {
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

  return {
    maintenance,
    loading,
    error,
    totalItems,
    totalPages,
    createMaintenance,
    refetch: fetchMaintenance
  }
}

export function useActiveMaintenance() {
  const [maintenance, setMaintenance] = useState<MaintenanceDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  const fetchActiveMaintenances = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Configurar para obtener solo mantenimientos activos
      const response = await maintenanceApi.listActiveMaintenances()
      
      const responseData = response.data
      
      if (responseData && typeof responseData === 'object' && 'content' in responseData) {
        const { content, totalElements, totalPages: pages } = responseData as { content: MaintenanceDTO[]; totalElements: number; totalPages: number }
        setMaintenance(content)
        setTotalItems(totalElements || content.length)
        setTotalPages(pages || 1)
      } else {
        const maintenanceData = Array.isArray(responseData) ? responseData : [responseData].filter(Boolean)
        setMaintenance(maintenanceData)
        setTotalItems(maintenanceData.length)
        setTotalPages(1)
      }
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
  }, [toast])

  useEffect(() => {
    fetchActiveMaintenances()
  }, [fetchActiveMaintenances])

  return { 
    maintenance, 
    loading, 
    error,
    totalItems,
    totalPages,
    refetch: fetchActiveMaintenances 
  }
}

// Alias for the new function name
export const useActiveMaintenanceRecords = useActiveMaintenance

export function useMaintenanceByVehicle(vehicleId: string) {
  const [maintenance, setMaintenance] = useState<MaintenanceDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  const fetchMaintenanceByVehicle = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!vehicleId) {
        setMaintenance([])
        setLoading(false)
        return
      }
      
      // Use the listMaintenances endpoint with vehicleId filter
      const response = await maintenanceApi.listMaintenances(vehicleId)
      
      const responseData = response.data
      
      if (responseData && typeof responseData === 'object' && 'content' in responseData) {
        const { content, totalElements, totalPages: pages } = responseData as { content: MaintenanceDTO[]; totalElements: number; totalPages: number }
        setMaintenance(content)
        setTotalItems(totalElements || content.length)
        setTotalPages(pages || 1)
      } else {
        const maintenanceData = Array.isArray(responseData) ? responseData : [responseData].filter(Boolean)
        setMaintenance(maintenanceData)
        setTotalItems(maintenanceData.length)
        setTotalPages(1)
      }
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
  }, [vehicleId, toast])

  useEffect(() => {
    fetchMaintenanceByVehicle()
  }, [fetchMaintenanceByVehicle])

  return { 
    maintenance, 
    loading, 
    error,
    totalItems,
    totalPages,
    refetch: fetchMaintenanceByVehicle 
  }
}
