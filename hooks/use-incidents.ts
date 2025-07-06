import { useState, useEffect, useCallback } from 'react';
import { incidentsApi, IncidentDTO, IncidentCreateDTO } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';

// Define an interface that extends IncidentDTO if needed
interface IncidentWithLegacyFields extends IncidentDTO {
  // Add any legacy fields here if needed for compatibility
}

// Define pagination parameters
interface PaginationParams {
  page: number;
  size: number;
  sortBy?: string;
  direction?: string;
}

export function useIncidents(
  filter?: {
    vehicleId?: string;
    resolved?: boolean;
    startDate?: string;
    endDate?: string;
  }, 
  paginationParams?: PaginationParams
) {
  const [incidents, setIncidents] = useState<IncidentWithLegacyFields[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  // Extract pagination and filter values to use in dependencies
  const page = paginationParams?.page;
  const size = paginationParams?.size;
  const sortBy = paginationParams?.sortBy;
  const direction = paginationParams?.direction;
  const vehicleId = filter?.vehicleId;
  const resolved = filter?.resolved;
  const startDate = filter?.startDate;
  const endDate = filter?.endDate;

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Set up pagination parameters
      const isPaginated = !!paginationParams;
      const { page, size, sortBy, direction } = paginationParams || { page: 0, size: 10 };
      
      // Extract filter parameters
      const { vehicleId, resolved, startDate, endDate } = filter || {};
      
      // Call the API with all parameters
      const response = await incidentsApi.list3(
        vehicleId,
        startDate,
        endDate,
        resolved,
        isPaginated,
        page,
        size,
        sortBy,
        direction
      );
      
      const responseData = response.data;
      
      // Handle paginated response
      if (isPaginated && responseData && typeof responseData === 'object' && 'content' in responseData) {
        const { content, totalElements, totalPages: pages } = responseData as any;
        
        // Map the received incidents to include any legacy fields if needed
        const mappedIncidents = content.map((incident: IncidentDTO) => ({
          ...incident,
          // Map new fields to legacy fields if needed
        }));
        
        setIncidents(mappedIncidents);
        setTotalItems(totalElements);
        setTotalPages(pages);
      } else {
        // Handle non-paginated response
        const incidentsList = Array.isArray(responseData) ? responseData : [];
        setIncidents(incidentsList);
        setTotalItems(incidentsList.length);
        setTotalPages(1);
      }
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : "Error al cargar incidentes";
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      console.error("Error fetching incidents:", err);
    }
  }, [page, size, sortBy, direction, vehicleId, resolved, startDate, endDate, toast]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const createIncident = async (incidentData: IncidentCreateDTO) => {
    try {
      await incidentsApi.create3(incidentData);
      await fetchIncidents();
      
      toast({
        title: "Éxito",
        description: "Incidente registrado exitosamente",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al registrar incidente";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    }
  };

  const resolveIncident = async (id: number) => {
    try {
      await incidentsApi.resolveIncident(id);
      await fetchIncidents();
      
      toast({
        title: "Éxito",
        description: "Incidente resuelto exitosamente",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al resolver incidente";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
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

export function useIncident(id: number) {
  const [incident, setIncident] = useState<IncidentWithLegacyFields | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchIncident = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await incidentsApi.getById3(id);
      
      setIncident(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : "Error al cargar el incidente";
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      console.error("Error fetching incident:", err);
    }
  }, [id, toast]);

  useEffect(() => {
    if (id) {
      fetchIncident();
    }
  }, [id, fetchIncident]);

  return {
    incident,
    loading,
    error,
    refetch: fetchIncident,
  };
} 