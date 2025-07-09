import { useState, useEffect, useCallback } from 'react'
import { maintenanceApi, type MaintenanceDTO, type MaintenanceCreateDTO } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'

// Define pagination parameters
interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
}

export function useMaintenance(
  filter?: {
    vehicleId?: string;
    startDate?: string;
    endDate?: string;
  },
  paginationParams?: PaginationParams
) {
  const [maintenance, setMaintenance] = useState<MaintenanceDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  // Extract pagination values
  const page = paginationParams?.page ?? 0
  const size = paginationParams?.size ?? 10
  const sortBy = paginationParams?.sortBy ?? 'assignedDate'
  const direction = paginationParams?.direction ?? 'asc'
  
  // Extract filter values
  const vehicleId = filter?.vehicleId
  const startDate = filter?.startDate
  const endDate = filter?.endDate

  const fetchMaintenance = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const isPaginated = !!paginationParams
      
      const response = await maintenanceApi.listMaintenances(
        vehicleId,
        undefined, // date parameter is undefined
        startDate,
        endDate,
        isPaginated,
        page,
        size,
        sortBy,
        direction
      )
      
      if (isPaginated && response.data && typeof response.data === 'object' && 'content' in response.data) {
        const { content, totalElements, totalPages: pages } = response.data as { 
          content: MaintenanceDTO[]; 
          totalElements: number; 
          totalPages: number 
        }
        setMaintenance(content)
        setTotalItems(totalElements || 0)
        setTotalPages(pages || 1)
      } else {
        const maintenanceData = Array.isArray(response.data) ? response.data : [response.data].filter(Boolean)
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
  }, [vehicleId, startDate, endDate, page, size, sortBy, direction, toast])

  useEffect(() => {
    void fetchMaintenance()
  }, [fetchMaintenance])

  const createMaintenance = async (maintenanceData: Partial<MaintenanceDTO>) => {
    try {
      const data: MaintenanceCreateDTO = {
        vehicleId: maintenanceData.vehicleId || '',
        assignedDate: maintenanceData.assignedDate || new Date().toISOString()
      }
      
      await maintenanceApi.createMaintenance(data)
      await fetchMaintenance()
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
      
      const response = await maintenanceApi.listActiveMaintenances()
      
      if (response.data && typeof response.data === 'object' && 'content' in response.data) {
        const { content, totalElements, totalPages: pages } = response.data as { 
          content: MaintenanceDTO[]; 
          totalElements: number; 
          totalPages: number 
        }
        setMaintenance(content)
        setTotalItems(totalElements || 0)
        setTotalPages(pages || 1)
      } else {
        const maintenanceData = Array.isArray(response.data) ? response.data : [response.data].filter(Boolean)
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
    void fetchActiveMaintenances()
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
    if (!vehicleId) {
      setMaintenance([])
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await maintenanceApi.listMaintenances(vehicleId)
      
      if (response.data && typeof response.data === 'object' && 'content' in response.data) {
        const { content, totalElements, totalPages: pages } = response.data as { 
          content: MaintenanceDTO[]; 
          totalElements: number; 
          totalPages: number 
        }
        setMaintenance(content)
        setTotalItems(totalElements || 0)
        setTotalPages(pages || 1)
      } else {
        const maintenanceData = Array.isArray(response.data) ? response.data : [response.data].filter(Boolean)
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
    void fetchMaintenanceByVehicle()
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
