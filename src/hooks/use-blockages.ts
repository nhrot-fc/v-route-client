import { useState, useEffect, useCallback } from "react";
import { blockagesApi, type Blockage } from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";

// Define pagination parameters
interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
}

export function useBlockages(paginationParams?: PaginationParams) {
  const [blockages, setBlockages] = useState<Blockage[]>([]);
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

  const fetchBlockages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const isPaginated = !!paginationParams;
      
      const response = await blockagesApi.list5(
        undefined, // activeAt
        undefined, // inactiveAt
        undefined, // id
        isPaginated,
        page,
        size,
        sortBy,
        direction
      );

      if (isPaginated && response.data && typeof response.data === "object" && "content" in response.data) {
        const { content, totalElements, totalPages: pages } = response.data as {
          content: Blockage[];
          totalElements: number;
          totalPages: number;
        };

        setBlockages(content);
        setTotalItems(totalElements || 0);
        setTotalPages(pages || 1);
      } else {
        const blockagesData = Array.isArray(response.data)
          ? response.data
          : [response.data].filter(Boolean);

        setBlockages(blockagesData);
        setTotalItems(blockagesData.length);
        setTotalPages(1);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar bloqueos";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [page, size, sortBy, direction, toast]);

  useEffect(() => {
    void fetchBlockages();
  }, [fetchBlockages]);

  const createBlockage = async (blockageData: Partial<Blockage>) => {
    try {
      const response = await blockagesApi.create5(blockageData as Blockage);
      await fetchBlockages();
      toast({
        title: "Éxito",
        description: "Bloqueo creado exitosamente",
      });
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear bloqueo";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteBlockage = async (id: string) => {
    try {
      await blockagesApi.delete4(id);
      await fetchBlockages();
      toast({
        title: "Éxito",
        description: "Bloqueo eliminado exitosamente",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar bloqueo";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateBlockage = async (id: string, blockageData: Partial<Blockage>) => {
    try {
      const response = await blockagesApi.update3(id, blockageData as Blockage);
      await fetchBlockages();
      toast({
        title: "Éxito",
        description: "Bloqueo actualizado exitosamente",
      });
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar bloqueo";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const createBulkBlockages = async (blockagesData: Partial<Blockage>[]) => {
    try {
      const response = await blockagesApi.createBulk1(blockagesData as Blockage[]);
      await fetchBlockages();
      toast({
        title: "Éxito",
        description: `${blockagesData.length} bloqueos creados exitosamente`,
      });
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear bloqueos en masa";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  return {
    blockages,
    loading,
    error,
    refetch: fetchBlockages,
    createBlockage,
    deleteBlockage,
    updateBlockage,
    createBulkBlockages,
    totalItems,
    totalPages,
  };
}

export function useActiveBlockages() {
  const [blockages, setBlockages] = useState<Blockage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchActiveBlockages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date().toISOString();
      const response = await blockagesApi.list5(now);

      const blockagesData = Array.isArray(response.data)
        ? response.data
        : [response.data].filter(Boolean);

      setBlockages(blockagesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar bloqueos activos";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchActiveBlockages();
  }, [fetchActiveBlockages]);

  return {
    blockages,
    loading,
    error,
    refetch: fetchActiveBlockages,
  };
}
