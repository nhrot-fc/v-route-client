import { useState, useEffect, useCallback } from "react";
import { ordersApi, type Order } from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";

export function useOrders(filter?: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      const statusMap: Record<string, string> = {
        pendiente: "PENDING",
        "en-ruta": "IN_TRANSIT",
        entregado: "DELIVERED",
      };

      if (filter) {
        const apiStatus = statusMap[filter];
        if (apiStatus) {
          response = await ordersApi.getOrdersByStatus(apiStatus as any);
        } else {
          response = await ordersApi.getAllOrders();
        }
      } else {
        response = await ordersApi.getAllOrders();
      }

      setOrders(
        Array.isArray(response.data)
          ? response.data
          : [response.data].filter(Boolean)
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar órdenes";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filter, toast]); // Aquí está la clave: filter en dependencias

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createOrder = async (orderData: Partial<Order>) => {
    try {
      const response = await ordersApi.createOrder(orderData as Order);
      await fetchOrders();
      toast({
        title: "Éxito",
        description: "Orden creada exitosamente",
      });
      return response.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al crear orden";
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
      const response = await fetch(`http://localhost:8080/api/orders/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la orden");
      }

      // Actualizar el estado local removiendo la orden eliminada
      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    }
  };

  const recordDelivery = async (id: string, amount: number) => {
    try {
      await ordersApi.recordDelivery(id, amount);
      await fetchOrders();
      toast({
        title: "Éxito",
        description: "Entrega registrada exitosamente",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al registrar entrega";
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
    deleteOrder,
    recordDelivery,
  };
}

export function usePendingOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ordersApi.getPendingOrders();
        setOrders(
          Array.isArray(response.data)
            ? response.data
            : [response.data].filter(Boolean)
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error al cargar órdenes pendientes";
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

export function useUrgentOrders(hoursAhead: number = 4) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUrgentOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ordersApi.getUrgentOrders(hoursAhead);
        setOrders(
          Array.isArray(response.data)
            ? response.data
            : [response.data].filter(Boolean)
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error al cargar órdenes urgentes";
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
