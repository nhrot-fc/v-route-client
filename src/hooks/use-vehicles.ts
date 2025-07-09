import { useState, useEffect, useCallback } from "react";
import {
  vehiclesApi,
  type VehicleDTO,
  VehicleStatusEnum,
  ListTypeEnum,
} from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";

// Define pagination parameters
export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
}

// Define filter parameters
export interface VehicleFilterParams {
  status?: VehicleStatusEnum;
  type?: ListTypeEnum;
  minGlp?: number;
  minFuel?: number;
}

export function useVehicles(
  filterTab?: string,
  paginationParams?: PaginationParams,
  filterParams?: VehicleFilterParams
) {
  const [vehicles, setVehicles] = useState<VehicleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  // Extract pagination and filter values
  const page = paginationParams?.page ?? 0;
  const size = paginationParams?.size ?? 10;
  const sortBy = paginationParams?.sortBy ?? 'id';
  const direction = paginationParams?.direction ?? 'asc';

  // Extract filter values
  const status = filterParams?.status || (filterTab ? mapFilterTabToStatus(filterTab) : undefined);
  const type = filterParams?.type;
  const minGlp = filterParams?.minGlp;
  const minFuel = filterParams?.minFuel;

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const isPaginated = !!paginationParams;
      
      const response = await vehiclesApi.list(
        type,
        status,
        minGlp,
        minFuel,
        isPaginated,
        page,
        size,
        sortBy,
        direction
      );

      if (isPaginated && response.data && typeof response.data === "object" && "content" in response.data) {
        const { content, totalElements, totalPages: pages } = response.data as {
          content: VehicleDTO[];
          totalElements: number;
          totalPages: number;
        };
        setVehicles(content);
        setTotalItems(totalElements || 0);
        setTotalPages(pages || 1);
      } else {
        const vehiclesList = Array.isArray(response.data)
          ? response.data
          : [response.data].filter(Boolean);
        setVehicles(vehiclesList);
        setTotalItems(vehiclesList.length);
        setTotalPages(1);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar vehículos";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error fetching vehicles:", err);
    } finally {
      setLoading(false);
    }
  }, [page, size, sortBy, direction, status, type, minGlp, minFuel, toast]);

  useEffect(() => {
    void fetchVehicles();
  }, [fetchVehicles]);

  const createVehicle = async (vehicleData: Partial<VehicleDTO>) => {
    try {
      const response = await vehiclesApi.create(vehicleData);
      await fetchVehicles();
      toast({
        title: "Éxito",
        description: "Vehículo creado exitosamente",
      });
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear vehículo";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateVehicleStatus = async (vehicleId: string, newStatus: VehicleStatusEnum) => {
    try {
      const vehicleResponse = await vehiclesApi.getById(vehicleId);
      await vehiclesApi.update(vehicleId, { ...vehicleResponse.data, status: newStatus });

      setVehicles((prevVehicles) =>
        prevVehicles.map((vehicle) =>
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
  };

  const deleteVehicle = async (vehicleId: string) => {
    try {
      await vehiclesApi._delete(vehicleId);
      setVehicles((prevVehicles) => prevVehicles.filter((vehicle) => vehicle.id !== vehicleId));
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
  };

  const updateVehicle = async (id: string, data: Partial<VehicleDTO>) => {
    try {
      await vehiclesApi.update(id, data);
      await fetchVehicles();
      toast({ title: "Éxito", description: "Vehículo actualizado" });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar vehículo";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      throw err;
    }
  };

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
  };
}
export function useVehicle(id: string) {
  const [vehicle, setVehicle] = useState<VehicleDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchVehicle = useCallback(async () => {
    if (!id) {
      setVehicle(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await vehiclesApi.getById(id);
      setVehicle(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar vehículo";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    void fetchVehicle();
  }, [fetchVehicle]);

  return { vehicle, loading, error, refetch: fetchVehicle };
}

// Helper function to map filter tab IDs to vehicle status enum
function mapFilterTabToStatus(filterTab: string): VehicleStatusEnum | undefined {
  switch (filterTab) {
    case "disponibles": return VehicleStatusEnum.Available;
    case "en-ruta": return VehicleStatusEnum.Driving;
    case "mantenimiento": return VehicleStatusEnum.Maintenance;
    case "averiados": return VehicleStatusEnum.Incident;
    default: return undefined;
  }
}

// Helper function to get human-readable status label
function getStatusLabel(status: VehicleStatusEnum): string {
  switch (status) {
    case VehicleStatusEnum.Available: return "Disponible";
    case VehicleStatusEnum.Driving: return "En Ruta";
    case VehicleStatusEnum.Maintenance: return "Mantenimiento";
    case VehicleStatusEnum.Incident: return "Averiado";
    default: return "Desconocido";
  }
}

