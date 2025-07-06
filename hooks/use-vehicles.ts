import { useState, useEffect, useCallback } from 'react'
import { vehiclesApi, type Vehicle, VehicleStatusEnum, ListStatusEnum, ListTypeEnum } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'

// Define pagination parameters
interface PaginationParams {
  page: number;
  size: number;
  sortBy?: string;
  direction?: string;
}

// Define filter parameters
interface VehicleFilterParams {
  status?: VehicleStatusEnum;
  type?: string;
  minGlp?: number;
  minFuel?: number;
}

export function useVehicles(
  filterTab?: string, 
  paginationParams?: PaginationParams,
  filterParams?: VehicleFilterParams
) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast()

  // Extract pagination and filter values to use in dependencies
  const page = paginationParams?.page;
  const size = paginationParams?.size;
  const sortBy = paginationParams?.sortBy;
  const direction = paginationParams?.direction;
  
  // Extract filter values
  const status = filterParams?.status || (filterTab ? mapFilterTabToStatus(filterTab) : undefined);
  const type = filterParams?.type;
  const minGlp = filterParams?.minGlp;
  const minFuel = filterParams?.minFuel;

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Set up pagination parameters
      const isPaginated = !!paginationParams;
      const paginatedParams = isPaginated ? {
        paginated: true,
        page: page || 0,
        size: size || 10,
        sortBy,
        direction
      } : {};
      
      // Set up filter parameters
      const filterParams = {
        status: status as ListStatusEnum | undefined,
        type: type as ListTypeEnum | undefined,
        minGlp,
        minFuel
      };
      
      // Combine parameters
      const params = {
        ...paginatedParams,
        ...filterParams
      };
      
      // Call API with parameters
      const response = await vehiclesApi.list(
        params.type,
        params.status,
        params.minGlp,
        params.minFuel,
        params.paginated,
        params.page,
        params.size,
        params.sortBy,
        params.direction
      );
      
      const responseData = response.data;
      
      // Handle paginated response
      if (isPaginated && responseData && typeof responseData === 'object' && 'content' in responseData) {
        const { content, totalElements, totalPages: pages } = responseData as { content: Vehicle[], totalElements: number, totalPages: number };
        setVehicles(content);
        setTotalItems(totalElements);
        setTotalPages(pages);
      } else {
        // Handle non-paginated response
        const vehiclesList = Array.isArray(responseData) ? responseData : [];
        setVehicles(vehiclesList);
        setTotalItems(vehiclesList.length);
        setTotalPages(1);
      }
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : "Error al cargar vehículos";
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      console.error("Error fetching vehicles:", err);
    }
  }, [page, size, sortBy, direction, status, type, minGlp, minFuel, toast])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  const createVehicle = async (vehicleData: Partial<Vehicle>) => {
    try {
      // Create a new vehicle DTO with the correct field names
      const vehicleDTO = {
        ...vehicleData,
      } 
      
      const response = await vehiclesApi.create(vehicleDTO)
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

  const updateVehicleStatus = async (vehicleId: string, newStatus: VehicleStatusEnum) => {
    try {
      // Get the current vehicle first
      const vehicleResponse = await vehiclesApi.getById(vehicleId);
      const currentVehicle = vehicleResponse.data;
      
      // Update only the status
      const vehicleDTO = {
        ...currentVehicle,
        status: newStatus
      };
      
      await vehiclesApi.update(vehicleId, vehicleDTO);
      
      // Update local state
      setVehicles(prevVehicles => 
        prevVehicles.map(vehicle => 
          vehicle.id === vehicleId ? { ...vehicle, status: newStatus } : vehicle
        )
      );
      
      toast({
        title: "Éxito",
        description: `Estado del vehículo ${vehicleId} actualizado a ${getStatusLabel(newStatus)}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar estado";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  const deleteVehicle = async (vehicleId: string) => {
    try {
      await vehiclesApi._delete(vehicleId);
      
      // Update local state
      setVehicles(prevVehicles => prevVehicles.filter(vehicle => vehicle.id !== vehicleId));
      
      toast({
        title: "Éxito",
        description: `Vehículo ${vehicleId} eliminado correctamente`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar vehículo";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }
  
  const updateVehicle = async (id: string, data: Partial<Vehicle>) => {
    try {
      const vehicleDTO = {
        ...data,
      }
      
      await vehiclesApi.update(id, vehicleDTO)
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
    totalItems,
    totalPages,
  }
}

export function useVehicle(id: string) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await vehiclesApi.getById(id)
        setVehicle(response.data)
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

// Helper function to map filter tab IDs to vehicle status enum
function mapFilterTabToStatus(filterTab: string): VehicleStatusEnum | undefined {
  switch (filterTab) {
    case 'disponibles':
      return VehicleStatusEnum.Available;
    case 'en-ruta':
      return VehicleStatusEnum.Driving;
    case 'mantenimiento':
      return VehicleStatusEnum.Maintenance;
    case 'averiados':
      return VehicleStatusEnum.Incident;
    default:
      return undefined;
  }
}

// Helper function to get human-readable status label
function getStatusLabel(status: VehicleStatusEnum): string {
  switch (status) {
    case VehicleStatusEnum.Available:
      return "Disponible";
    case VehicleStatusEnum.Driving:
      return "En Ruta";
    case VehicleStatusEnum.Maintenance:
      return "Mantenimiento";
    case VehicleStatusEnum.Incident:
      return "Averiado";
    default:
      return "Desconocido";
  }
}
