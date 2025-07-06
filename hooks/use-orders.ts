import { useState, useEffect, useCallback } from "react";
import { ordersApi, type Order, type OrderDTO, type DeliveryRecordDTO } from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";

// Define an interface that combines the old field names with the new ones for transition
interface OrderWithLegacyFields extends Order {
  glpRequest?: number; // Legacy field mapping to glpRequestM3
  remainingGLP?: number; // Legacy field mapping to remainingGlpM3
  arriveDate?: string; // Legacy field mapping to arriveTime
  dueDate?: string; // Legacy field mapping to dueTime
  deliveryDate?: string; // Legacy field that might not be in the new API
  routeId?: string; // ID de la ruta asignada
}

// Define pagination parameters
interface PaginationParams {
  page: number;
  size: number;
  sortBy?: string;
  direction?: string;
}

// Define filter parameters
interface OrderFilterParams {
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

  // Extract pagination and filter values to use in dependencies
  const page = paginationParams?.page;
  const size = paginationParams?.size;
  const sortBy = paginationParams?.sortBy;
  const direction = paginationParams?.direction;
  
  // Extract filter values
  const pending = filterParams?.pending || (filterTab === 'pendiente' ? true : undefined);
  const overdueAt = filterParams?.overdueAt;
  const availableAt = filterParams?.availableAt;

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

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
        pending,
        overdueAt,
        availableAt
      };
      
      // Combine parameters
      const params = {
        ...paginatedParams,
        ...filterParams
      };
      
      // Call API with parameters
      const response = await ordersApi.list2(
        params.pending as boolean | undefined,
        params.overdueAt,
        params.availableAt,
        params.paginated,
        params.page,
        params.size,
        params.sortBy,
        params.direction
      );
      
      const responseData = response.data;
      
      // Handle paginated response
      if (isPaginated && responseData && typeof responseData === 'object' && 'content' in responseData) {
        const { content, totalElements, totalPages: pages } = responseData as any;
        setOrders(content);
        setTotalItems(totalElements);
        setTotalPages(pages);
      } else {
        // Handle non-paginated response
        const ordersList = Array.isArray(responseData) ? responseData : [];
        setOrders(ordersList);
        setTotalItems(ordersList.length);
        setTotalPages(1);
      }
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : "Error al cargar pedidos";
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      console.error("Error fetching orders:", err);
    }
  }, [page, size, sortBy, direction, pending, overdueAt, availableAt, toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createOrder = async (orderData: Partial<OrderWithLegacyFields>) => {
    try {
      // Map the legacy fields to the new API format
      const orderDTO: OrderDTO = {
        ...orderData,
        glpRequestM3: orderData.glpRequest ?? orderData.glpRequestM3,
        remainingGlpM3: orderData.remainingGLP ?? orderData.remainingGlpM3,
        arriveTime: orderData.arriveDate ?? orderData.arriveTime,
        dueTime: orderData.dueDate ?? orderData.dueTime,
      } as any;

      const response = await ordersApi.create2(orderDTO);
      await fetchOrders(); // Refresh the list
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

  const updateOrder = async (id: string, orderData: Partial<OrderWithLegacyFields>) => {
    try {
      // Map the legacy fields to the new API format
      const orderDTO: OrderDTO = {
        ...orderData,
        glpRequestM3: orderData.glpRequest ?? orderData.glpRequestM3,
        remainingGlpM3: orderData.remainingGLP ?? orderData.remainingGlpM3,
        arriveTime: orderData.arriveDate ?? orderData.arriveTime,
        dueTime: orderData.dueDate ?? orderData.dueTime,
      } as any;

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

  const recordDelivery = async (id: string, amount: number) => {
    try {
      const deliveryRecordDTO: DeliveryRecordDTO = {
        vehicleId: "DEFAULT", // This should be replaced with the actual vehicle ID
        volumeM3: amount,
        serveDate: new Date().toISOString()
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

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    recordDelivery,
    totalItems,
    totalPages,
  };
}

export function usePendingOrders(paginationParams?: PaginationParams) {
  const [orders, setOrders] = useState<OrderWithLegacyFields[]>([]);
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

  const fetchPendingOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const isPaginated = !!paginationParams;
      const { page, size, sortBy, direction } = paginationParams || { page: 0, size: 10 };
      
      const response = await ordersApi.list2(true, undefined, undefined, isPaginated, page, size, sortBy, direction);
      
      const responseData = response.data;

      // Handle paginated response
      if (isPaginated && responseData && typeof responseData === 'object' && 'content' in responseData) {
        const { content, totalElements, totalPages: pages } = responseData as any;
        
        // Process the data and map legacy fields
        const mappedOrders = content.map((order: OrderDTO) => ({
          ...order,
          glpRequest: order.glpRequestM3,
          remainingGLP: order.remainingGlpM3,
          arriveDate: order.arriveTime,
          dueDate: order.dueTime,
        }));

        setOrders(mappedOrders);
        setTotalItems(totalElements || content.length);
        setTotalPages(pages || 1);
      } else {
        // Handle non-paginated response (backward compatibility)
        const ordersData = Array.isArray(responseData) ? responseData : [responseData].filter(Boolean);
        const mappedOrders = ordersData.map(order => ({
          ...order,
          glpRequest: order.glpRequestM3,
          remainingGLP: order.remainingGlpM3,
          arriveDate: order.arriveTime,
          dueDate: order.dueTime,
        }));

        setOrders(mappedOrders);
        setTotalItems(mappedOrders.length);
        setTotalPages(1);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar pedidos pendientes";
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
    fetchPendingOrders();
  }, [fetchPendingOrders]);

  return { 
    orders, 
    loading, 
    error,
    totalItems,
    totalPages,
    refetch: fetchPendingOrders
  };
}

export function useUrgentOrders(hoursAhead: number = 24, paginationParams?: PaginationParams) {
  const [orders, setOrders] = useState<OrderWithLegacyFields[]>([]);
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

  const fetchUrgentOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // We'll use overdueAt parameter with current time to get urgent orders
      const now = new Date();
      const overdueDate = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
      
      const isPaginated = !!paginationParams;
      const { page, size, sortBy, direction } = paginationParams || { page: 0, size: 10 };
      
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
      
      const responseData = response.data;

      // Handle paginated response
      if (isPaginated && responseData && typeof responseData === 'object' && 'content' in responseData) {
        const { content, totalElements, totalPages: pages } = responseData as any;
        
        // Process the data and map legacy fields
        const mappedOrders = content.map((order: OrderDTO) => ({
          ...order,
          glpRequest: order.glpRequestM3,
          remainingGLP: order.remainingGlpM3,
          arriveDate: order.arriveTime,
          dueDate: order.dueTime,
        }));

        setOrders(mappedOrders);
        setTotalItems(totalElements || content.length);
        setTotalPages(pages || 1);
      } else {
        // Handle non-paginated response (backward compatibility)
        const ordersData = Array.isArray(responseData) ? responseData : [responseData].filter(Boolean);
        const mappedOrders = ordersData.map(order => ({
          ...order,
          glpRequest: order.glpRequestM3,
          remainingGLP: order.remainingGlpM3,
          arriveDate: order.arriveTime,
          dueDate: order.dueTime,
        }));

        setOrders(mappedOrders);
        setTotalItems(mappedOrders.length);
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
    fetchUrgentOrders();
  }, [fetchUrgentOrders]);

  return { 
    orders, 
    loading, 
    error,
    totalItems,
    totalPages,
    refetch: fetchUrgentOrders
  };
}
