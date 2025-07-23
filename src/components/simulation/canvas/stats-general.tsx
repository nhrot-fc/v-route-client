import React from "react";
import { Package, TruckIcon, AlertTriangle } from "lucide-react";
import type { SimulationStateDTO } from "@/lib/api-client";

interface StatsGeneralProps {
  simulationState: SimulationStateDTO;
}

/**
 * Componente que muestra las estadísticas generales de la simulación
 */
export const StatsGeneral: React.FC<StatsGeneralProps> = ({
  simulationState,
}) => {
  // Calculate statistics
  const pendingOrders = simulationState.pendingOrdersCount || 0;
  const deliveredOrders = simulationState.deliveredOrdersCount || 0;
  const overdueOrders = simulationState.overdueOrdersCount || 0;
  const totalOrders = pendingOrders + deliveredOrders;
  const deliveryRate =
    totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

  const availableVehicles = simulationState.availableVehiclesCount || 0;
  const totalVehicles = simulationState.vehicles?.length || 0;
  const busyVehicles = totalVehicles - availableVehicles;

  return (
    <div className="p-3 space-y-4">
      {/* Orders section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium">Pedidos</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-xs text-gray-600">Pendientes</div>
            <div className="text-lg font-bold text-blue-700">
              {pendingOrders}
            </div>
          </div>
          <div className="bg-green-50 p-2 rounded">
            <div className="text-xs text-gray-600">Entregados</div>
            <div className="text-lg font-bold text-green-700">
              {deliveredOrders}
            </div>
          </div>
          <div className="bg-red-50 p-2 rounded">
            <div className="text-xs text-gray-600">Vencidos</div>
            <div className="text-lg font-bold text-red-700">
              {overdueOrders}
            </div>
          </div>
        </div>

        {/* Delivery rate progress bar */}
        <div className="mt-1">
          <div className="flex justify-between text-xs mb-1">
            <span>Tasa de entrega</span>
            <span className="font-medium">{deliveryRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${deliveryRate}%`,
                backgroundColor:
                  deliveryRate < 50
                    ? "#ef4444" // red
                    : deliveryRate < 75
                      ? "#eab308" // yellow
                      : "#10b981", // green
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Vehicles section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <TruckIcon className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">Vehículos</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-xs text-gray-600">Total</div>
            <div className="text-lg font-bold text-blue-700">
              {totalVehicles}
            </div>
          </div>
          <div className="bg-green-50 p-2 rounded">
            <div className="text-xs text-gray-600">Disponibles</div>
            <div className="text-lg font-bold text-green-700">
              {availableVehicles}
            </div>
          </div>
          <div className="bg-amber-50 p-2 rounded">
            <div className="text-xs text-gray-600">En ruta</div>
            <div className="text-lg font-bold text-amber-700">
              {busyVehicles}
            </div>
          </div>
        </div>
      </div>

      {/* Incidents section */}
      {simulationState.activeIncidents &&
        simulationState.activeIncidents.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium">Incidentes activos</span>
            </div>

            <div className="text-center bg-red-50 p-2 rounded">
              <div className="text-lg font-bold text-red-700">
                {simulationState.activeIncidents.length}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}; 