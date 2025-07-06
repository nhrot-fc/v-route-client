import { useState, useEffect, useCallback } from 'react';
import { serveRecordApi, type ServeRecordDTO } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';

// Define an interface that extends ServeRecordDTO if needed
interface ServeRecordWithLegacyFields extends ServeRecordDTO {
  // Add any legacy fields here if needed for compatibility
}

// Define pagination parameters
interface PaginationParams {
  page: number;
  size: number;
  sortBy?: string;
  direction?: string;
}

export function useServeRecords(
  filter?: {
    orderId?: string;
    vehicleId?: string;
    startDate?: string;
    endDate?: string;
  }, 
  paginationParams?: PaginationParams
) {
  const [records, setRecords] = useState<ServeRecordWithLegacyFields[]>([]);
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
  const orderId = filter?.orderId;
  const vehicleId = filter?.vehicleId;
  const startDate = filter?.startDate;
  const endDate = filter?.endDate;

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Set up pagination parameters
      const isPaginated = !!paginationParams;
      const { page, size, sortBy, direction } = paginationParams || { page: 0, size: 10 };
      
      // Extract filter parameters
      const { orderId, vehicleId, startDate, endDate } = filter || {};
      
      // Call the API with all parameters
      const response = await serveRecordApi.list1(
        orderId,
        vehicleId,
        startDate,
        endDate,
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
        
        // Map the received records to include any legacy fields if needed
        const mappedRecords = content.map((record: ServeRecordDTO) => ({
          ...record,
          // Map new fields to legacy fields if needed
        }));
        
        setRecords(mappedRecords);
        setTotalItems(totalElements);
        setTotalPages(pages);
      } else {
        // Handle non-paginated response
        const recordsList = Array.isArray(responseData) ? responseData : [];
        setRecords(recordsList);
        setTotalItems(recordsList.length);
        setTotalPages(1);
      }
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : "Error al cargar registros de entrega";
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      console.error("Error fetching serve records:", err);
    }
  }, [page, size, sortBy, direction, orderId, vehicleId, startDate, endDate, toast]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const createRecord = async (recordData: ServeRecordDTO) => {
    try {
      await serveRecordApi.create1(recordData);
      await fetchRecords();
      
      toast({
        title: "Éxito",
        description: "Registro de entrega creado exitosamente",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear registro de entrega";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    }
  };

  const deleteRecord = async (id: number) => {
    try {
      await serveRecordApi.delete1(id);
      await fetchRecords();
      
      toast({
        title: "Éxito",
        description: "Registro de entrega eliminado exitosamente",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar registro de entrega";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    }
  };

  return {
    records,
    loading,
    error,
    refetch: fetchRecords,
    createRecord,
    deleteRecord,
    totalItems,
    totalPages,
  };
}

export function useServeRecord(id: number) {
  const [record, setRecord] = useState<ServeRecordWithLegacyFields | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRecord = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await serveRecordApi.getById1(id);
      
      setRecord(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : "Error al cargar el registro de entrega";
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      console.error("Error fetching serve record:", err);
    }
  }, [id, toast]);

  useEffect(() => {
    if (id) {
      fetchRecord();
    }
  }, [id, fetchRecord]);

  return {
    record,
    loading,
    error,
    refetch: fetchRecord,
  };
} 