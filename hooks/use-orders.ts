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

export function useOrders(status?: string) {
  const [orders, setOrders] = useState<OrderWithLegacyFields[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (status) {
        // Map Spanish status to API parameters
        if (status === "pendiente") {
          response = await ordersApi.list2(true); // pendingOnly = true
        } else if (status === "entregado") {
          response = await ordersApi.list2(false); // pendingOnly = false
        } else {
          response = await ordersApi.list2(); // Get all
        }
      } else {
        response = await ordersApi.list2();
      }

      // Process the data and map legacy fields
      const ordersData = Array.isArray(response.data) ? response.data : [response.data].filter(Boolean);
      const mappedOrders = ordersData.map(order => ({
        ...order,
        glpRequest: order.glpRequestM3,
        remainingGLP: order.remainingGlpM3,
        arriveDate: order.arriveTime,
        dueDate: order.dueTime,
      }));

      setOrders(mappedOrders);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar pedidos";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [status, toast]);

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
  };
}

export function usePendingOrders() {
  const [orders, setOrders] = useState<OrderWithLegacyFields[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ordersApi.list2(true);
        
        // Process the data and map legacy fields
        const ordersData = Array.isArray(response.data) ? response.data : [response.data].filter(Boolean);
        const mappedOrders = ordersData.map(order => ({
          ...order,
          glpRequest: order.glpRequestM3,
          remainingGLP: order.remainingGlpM3,
          arriveDate: order.arriveTime,
          dueDate: order.dueTime,
        }));
        
        setOrders(mappedOrders);
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
    };

    fetchPendingOrders();
  }, [toast]);

  return { orders, loading, error };
}

export function useUrgentOrders(hoursAhead: number = 24) {
  const [orders, setOrders] = useState<OrderWithLegacyFields[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUrgentOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        // We'll use overdueAt parameter with current time to get urgent orders
        const now = new Date();
        const overdueDate = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
        const response = await ordersApi.list2(true, overdueDate.toISOString());
        
        // Process the data and map legacy fields
        const ordersData = Array.isArray(response.data) ? response.data : [response.data].filter(Boolean);
        const mappedOrders = ordersData.map(order => ({
          ...order,
          glpRequest: order.glpRequestM3,
          remainingGLP: order.remainingGlpM3,
          arriveDate: order.arriveTime,
          dueDate: order.dueTime,
        }));
        
        setOrders(mappedOrders);
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
    };

    fetchUrgentOrders();
  }, [hoursAhead, toast]);

  return { orders, loading, error };
}
