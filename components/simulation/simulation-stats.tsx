"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimulationStateDTO } from "@/lib/api-client";

interface SimulationStatsProps {
  simulationState: SimulationStateDTO | undefined;
  currentTime: string;
}

export function SimulationStats({ simulationState, currentTime }: SimulationStatsProps) {
  if (!simulationState) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Cargando estadísticas...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Tiempo Actual</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold">{currentTime}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Órdenes Pendientes</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold">{simulationState.pendingOrdersCount || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">
            De un total de {(simulationState.pendingOrdersCount || 0) + (simulationState.deliveredOrdersCount || 0)} órdenes
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Órdenes Entregadas</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold">{simulationState.deliveredOrdersCount || 0}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {simulationState.overdueOrdersCount || 0} con retraso
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Vehículos Disponibles</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold">{simulationState.availableVehiclesCount || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">
            De un total de {simulationState.vehicles?.length || 0} vehículos
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 