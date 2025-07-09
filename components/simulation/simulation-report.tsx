"use client";

import { useState, useEffect } from "react";
import { useSimulationWebSocket } from "@/hooks/use-simulation-websocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function SimulationReport() {
  const [simulationStats, setSimulationStats] = useState<{
    totalVehicles: number;
    ordersDelivered: number;
    ordersPending: number;
    ordersOverdue: number;
    vehiclesAvailable: number;
    vehiclesUnavailable: number;
    currentTime: string;
  }>({
    totalVehicles: 0,
    ordersDelivered: 0,
    ordersPending: 0,
    ordersOverdue: 0,
    vehiclesAvailable: 0,
    vehiclesUnavailable: 0,
    currentTime: "",
  });

  const { simulationState, simulationInfo } = useSimulationWebSocket();

  useEffect(() => {
    if (simulationState && simulationInfo) {
      const totalVehicles = simulationState.vehicles?.length || 0;
      const vehiclesAvailable = simulationState.availableVehiclesCount || 0;

      setSimulationStats({
        totalVehicles,
        ordersDelivered: simulationState.deliveredOrdersCount || 0,
        ordersPending: simulationState.pendingOrdersCount || 0,
        ordersOverdue: simulationState.overdueOrdersCount || 0,
        vehiclesAvailable,
        vehiclesUnavailable: totalVehicles - vehiclesAvailable,
        currentTime: formatDate(simulationInfo.simulatedCurrentTime),
      });
    }
  }, [simulationState, simulationInfo]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";

    try {
      const date = new Date(dateStr);
      return format(date, "PPpp", { locale: es });
    } catch {
      return dateStr;
    }
  };

  if (!simulationState || !simulationInfo) {
    return (
      <div className="text-center py-10 text-gray-500">
        No hay información de simulación disponible.
        <br />
        Selecciona una simulación activa en la pestaña del mapa.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estado de la Simulación</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-medium">ID:</dt>
              <dd>{simulationInfo.id || "N/A"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Tipo:</dt>
              <dd>{simulationInfo.type || "N/A"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Estado:</dt>
              <dd>{simulationInfo.status || "N/A"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Hora simulada:</dt>
              <dd>{simulationStats.currentTime}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-medium">Pedidos Pendientes:</dt>
              <dd>{simulationStats.ordersPending}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Pedidos Entregados:</dt>
              <dd>{simulationStats.ordersDelivered}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Pedidos Retrasados:</dt>
              <dd>{simulationStats.ordersOverdue}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Total:</dt>
              <dd>
                {simulationStats.ordersDelivered +
                  simulationStats.ordersPending}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vehículos</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-medium">Vehículos Disponibles:</dt>
              <dd>{simulationStats.vehiclesAvailable}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Vehículos En Uso:</dt>
              <dd>{simulationStats.vehiclesUnavailable}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Total:</dt>
              <dd>{simulationStats.totalVehicles}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
