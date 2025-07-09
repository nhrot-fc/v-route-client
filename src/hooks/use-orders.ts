import { useState, useEffect, useCallback } from "react";
import {
  ordersApi,
  type OrderDTO,
  type DeliveryRecordDTO,
} from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";

// Define pagination parameters
interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
}

// Define filter parameters
export interface OrderFilterParams {
  pending?: boolean;
  overdueAt?: string;
  availableAt?: string;
}

export function useOrders(
  filterTab?: string,
  paginationParams?: PaginationParams,
  filterParams?: OrderFilterParams
) {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
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
  const pending = filterParams?.pending || (filterTab === "pendiente" ? true : undefined);
  const overdueAt = filterParams?.overdueAt;
  const availableAt = filterParams?.availableAt;

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const isPaginated = !!paginationParams;

      const response = await ordersApi.list2(
        pending,
        overdueAt,
        availableAt,
        isPaginated,
        page,
        size,
        sortBy,
        direction
      );

      if (isPaginated && response.data && typeof response.data === "object" && "content" in response.data) {
        const { content, totalElements, totalPages: pages } = response.data as {
          content: OrderDTO[];
          totalElements: number;
          totalPages: number;
        };
        setOrders(content);
        setTotalItems(totalElements || 0);
        setTotalPages(pages || 1);
      } else {
        const ordersList = Array.isArray(response.data)
          ? response.data
          : [response.data].filter(Boolean);
        setOrders(ordersList);
        setTotalItems(ordersList.length);
        setTotalPages(1);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar pedidos";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, [page, size, sortBy, direction, pending, overdueAt, availableAt, toast]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const createOrder = async (orderData: Partial<OrderDTO>) => {
    try {
      const response = await ordersApi.create2(orderData);
      await fetchOrders();
      toast({
        title: "Éxito",
        description: "Pedido creado exitosamente",
      });
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear pedido";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateOrder = async (id: string, orderData: Partial<OrderDTO>) => {
    try {
      const orderDTO: OrderDTO = { ...orderData } as OrderDTO;
      await ordersApi.update1(id, orderDTO);
      await fetchOrders();
      toast({
        title: "Éxito",
        description: "Pedido actualizado exitosamente",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar pedido";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const recordDelivery = async (id: string, amount: number, vehicleId?: string) => {
    try {
      const deliveryRecordDTO: DeliveryRecordDTO = {
        vehicleId: vehicleId || "DEFAULT",
        volumeM3: amount,
        serveDate: new Date().toISOString(),
      };

      await ordersApi.recordDelivery(id, deliveryRecordDTO);
      await fetchOrders();
      toast({
        title: "Éxito",
        description: "Entrega registrada exitosamente",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al registrar entrega";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await ordersApi.delete2(id);
      await fetchOrders();
      toast({
        title: "Éxito",
        description: "Pedido eliminado exitosamente",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar pedido";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const createBulkOrders = async (ordersData: Partial<OrderDTO>[]) => {
    try {
      const orderDTOs: OrderDTO[] = ordersData.map(orderData => ({
        ...orderData,
      }) as OrderDTO);

      const response = await ordersApi.createBulk(orderDTOs);
      await fetchOrders();
      toast({
        title: "Éxito",
        description: `${orderDTOs.length} pedidos creados exitosamente`,
      });
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear pedidos en masa";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    recordDelivery,
    createBulkOrders,
    totalItems,
    totalPages,
  };
}

export function usePendingOrders(paginationParams?: PaginationParams) {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
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

  const fetchPendingOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const isPaginated = !!paginationParams;

      const response = await ordersApi.list2(
        true,
        undefined,
        undefined,
        isPaginated,
        page,
        size,
        sortBy,
        direction
      );

      if (isPaginated && response.data && typeof response.data === "object" && "content" in response.data) {
        const { content, totalElements, totalPages: pages } = response.data as {
          content: OrderDTO[];
          totalElements: number;
          totalPages: number;
        };
        setOrders(content);
        setTotalItems(totalElements || 0);
        setTotalPages(pages || 1);
      } else {
        const ordersData = Array.isArray(response.data)
          ? response.data
          : [response.data].filter(Boolean);
        setOrders(ordersData);
        setTotalItems(ordersData.length);
        setTotalPages(1);
      }
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : "Error al cargar pedidos pendientes";
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
    void fetchPendingOrders();
  }, [fetchPendingOrders]);

  return {
    orders,
    loading,
    error,
    totalItems,
    totalPages,
    refetch: fetchPendingOrders,
  };
}

export function useUrgentOrders(
  hoursAhead: number = 24,
  paginationParams?: PaginationParams
) {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
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

  const fetchUrgentOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate overdue date based on hoursAhead
      const now = new Date();
      const overdueTimestamp = now.getTime() + hoursAhead * 60 * 60 * 1000;
      const overdueDate = new Date(overdueTimestamp);

      const isPaginated = !!paginationParams;

      const response = await ordersApi.list2(
        true,
        overdueDate.toISOString(),
        undefined,
        isPaginated,
        page,
        size,
        sortBy,
        direction
      );

      if (isPaginated && response.data && typeof response.data === "object" && "content" in response.data) {
        const { content, totalElements, totalPages: pages } = response.data as {
          content: OrderDTO[];
          totalElements: number;
          totalPages: number;
        };
        setOrders(content);
        setTotalItems(totalElements || 0);
        setTotalPages(pages || 1);
      } else {
        const ordersData = Array.isArray(response.data)
          ? response.data
          : [response.data].filter(Boolean);
        setOrders(ordersData);
        setTotalItems(ordersData.length);
        setTotalPages(1);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar pedidos urgentes";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [hoursAhead, page, size, sortBy, direction, toast]);

  useEffect(() => {
    void fetchUrgentOrders();
  }, [fetchUrgentOrders]);

  return {
    orders,
    loading,
    error,
    totalItems,
    totalPages,
    refetch: fetchUrgentOrders,
  };
}
