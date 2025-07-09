import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { type OrderDTO } from "@/lib/api-client";
import { useOrders } from "@/hooks/use-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export function RecentOrders() {
  const { orders, loading, error } = useOrders();
  const [urgentOrders, setUrgentOrders] = useState<OrderDTO[]>([]);

  useEffect(() => {
    if (!loading && !error && orders.length > 0) {
      // Get orders that are not delivered and sort them by due time
      const pending = orders
        .filter((order) => !order.delivered)
        .sort((a, b) => {
          if (!a.deadlineTime) return 1;
          if (!b.deadlineTime) return -1;
          return (
            new Date(a.deadlineTime).getTime() -
            new Date(b.deadlineTime).getTime()
          );
        });
      setUrgentOrders(pending.slice(0, 5));
    }
  }, [orders, loading, error]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Urgentes</CardTitle>
        </CardHeader>
        <CardContent>Cargando pedidos...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Urgentes</CardTitle>
        </CardHeader>
        <CardContent className="text-red-500">Error: {error}</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos Urgentes</CardTitle>
      </CardHeader>
      <CardContent>
        {urgentOrders.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No hay pedidos pendientes
          </div>
        ) : (
          <div className="space-y-4">
            {urgentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between pb-3 border-b border-border last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="font-medium">{order.id}</p>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>
                      {order.glpRequestM3?.toFixed(2) || "0"} m³ solicitados
                    </span>
                    <span>•</span>
                    <span>
                      {order.remainingGlpM3?.toFixed(2) || "0"} m³ restantes
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  {order.deadlineTime && (
                    <p className="text-sm font-medium">
                      {formatDate(new Date(order.deadlineTime))}
                    </p>
                  )}
                  <Badge
                    variant="outline"
                    className="bg-amber-100 text-amber-800 border-amber-200 mt-1"
                  >
                    Pendiente
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
