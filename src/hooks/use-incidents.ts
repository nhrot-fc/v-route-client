import { useState, useEffect, useCallback } from 'react';
import { incidentsApi, type IncidentDTO, type IncidentCreateDTO } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';

// Define pagination parameters
interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
}

// Define filter parameters
export interface IncidentFilterParams {
  vehicleId?: string | undefined;
  type?: string | undefined;
  resolved?: boolean | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
}

export function useIncidents(
  filter?: IncidentFilterParams, 
  paginationParams?: PaginationParams
) {
  const [incidents, setIncidents] = useState<IncidentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  // Extract pagination values
  const page = paginationParams?.page ?? 0;
  const size = paginationParams?.size ?? 10;
  const sortBy = paginationParams?.sortBy ?? 'id';
  const direction = paginationParams?.direction ?? 'asc';

  // Extract filter values
  const vehicleId = filter?.vehicleId;
  const resolved = filter?.resolved;
  const startDate = filter?.startDate;
  const endDate = filter?.endDate;

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const isPaginated = !!paginationParams;
      
      const response = await incidentsApi.list3(
        vehicleId, 
        undefined, // type
        undefined, // shift
        startDate,
        endDate,
        resolved,
        isPaginated,
        page,
        size,
        sortBy,
        direction
      );
      
      if (isPaginated && response.data && typeof response.data === 'object' && 'content' in response.data) {
        const { content, totalElements, totalPages: pages } = response.data as { 
          content: IncidentDTO[]; 
          totalElements: number; 
          totalPages: number 
        };
        setIncidents(content);
        setTotalItems(totalElements || 0);
        setTotalPages(pages || 1);
      } else {
        const incidentsList = Array.isArray(response.data) ? response.data : [response.data].filter(Boolean);
        setIncidents(incidentsList);
        setTotalItems(incidentsList.length);
        setTotalPages(1);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar incidentes';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [vehicleId, resolved, startDate, endDate, page, size, sortBy, direction, toast]);

  useEffect(() => {
    void fetchIncidents();
  }, [fetchIncidents]);

  const createIncident = async (incidentData: IncidentCreateDTO) => {
    try {
      const response = await incidentsApi.create3(incidentData);
      await fetchIncidents();
      toast({
        title: 'Éxito',
        description: 'Incidente registrado exitosamente',
      });
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear incidente';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const resolveIncident = async (id: string) => {
    try {
      await incidentsApi.resolveIncident(id);
      await fetchIncidents();
      toast({
        title: 'Éxito',
        description: 'Incidente resuelto exitosamente',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al resolver incidente';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  return {
    incidents,
    loading,
    error,
    refetch: fetchIncidents,
    createIncident,
    resolveIncident,
    totalItems,
    totalPages,
  };
}

export function useIncident(id: string) {
  const [incident, setIncident] = useState<IncidentDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchIncident = useCallback(async () => {
    if (!id) {
      setIncident(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await incidentsApi.getById3(id);
      setIncident(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Error al cargar el incidente ${id}`;
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    void fetchIncident();
  }, [fetchIncident]);

  const resolveIncident = async () => {
    if (!id) return;
    
    try {
      await incidentsApi.resolveIncident(id);
      await fetchIncident();
      toast({
        title: 'Éxito',
        description: 'Incidente resuelto exitosamente',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al resolver incidente';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  return { 
    incident, 
    loading, 
    error, 
    refetch: fetchIncident,
    resolveIncident
  };
} 