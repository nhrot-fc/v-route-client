import { useState, useEffect, useCallback } from "react";
import { serveRecordApi, type ServeRecordDTO } from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";

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
  const [serveRecords, setServeRecords] = useState<ServeRecordDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  // Extract pagination values to use in dependencies
  const page = paginationParams?.page;
  const size = paginationParams?.size;
  const sortBy = paginationParams?.sortBy;
  const direction = paginationParams?.direction;

  // Extract filter values
  const orderId = filter?.orderId;
  const vehicleId = filter?.vehicleId;
  const startDate = filter?.startDate;
  const endDate = filter?.endDate;

  const fetchServeRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Set up pagination parameters
      const isPaginated = !!paginationParams;
      const { page, size, sortBy, direction } = paginationParams || {
        page: 0,
        size: 10,
      };

      // Call API with parameters
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
      if (
        isPaginated &&
        responseData &&
        typeof responseData === "object" &&
        "content" in responseData
      ) {
        const {
          content,
          totalElements,
          totalPages: pages,
        } = responseData as {
          content: ServeRecordDTO[];
          totalElements: number;
          totalPages: number;
        };
        setServeRecords(content);
        setTotalItems(totalElements || content.length);
        setTotalPages(pages || 1);
      } else {
        // Handle non-paginated response
        const recordsList = Array.isArray(responseData)
          ? responseData
          : [responseData].filter(Boolean);
        setServeRecords(recordsList);
        setTotalItems(recordsList.length);
        setTotalPages(1);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error al cargar registros de entrega";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    orderId,
    vehicleId,
    startDate,
    endDate,
    page,
    size,
    sortBy,
    direction,
    toast,
  ]);

  useEffect(() => {
    fetchServeRecords();
  }, [fetchServeRecords]);

  const createRecord = async (recordData: ServeRecordDTO) => {
    try {
      const response = await serveRecordApi.create1(recordData);
      await fetchServeRecords(); // Refresh the list
      toast({
        title: "Éxito",
        description: "Registro de entrega creado exitosamente",
      });
      return response.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error al crear registro de entrega";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      await serveRecordApi.delete1(id);
      await fetchServeRecords(); // Refresh the list
      toast({
        title: "Éxito",
        description: "Registro de entrega eliminado exitosamente",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error al eliminar registro de entrega";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  return {
    serveRecords,
    loading,
    error,
    refetch: fetchServeRecords,
    createRecord,
    deleteRecord,
    totalItems,
    totalPages,
  };
}

export function useServeRecord(id: string) {
  const [serveRecord, setServeRecord] = useState<ServeRecordDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchServeRecord = useCallback(async () => {
    if (!id) {
      setServeRecord(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await serveRecordApi.getById1(id);
      setServeRecord(response.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : `Error al cargar el registro de entrega ${id}`;
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
    fetchServeRecord();
  }, [fetchServeRecord]);

  return {
    serveRecord,
    loading,
    error,
    refetch: fetchServeRecord,
  };
}
