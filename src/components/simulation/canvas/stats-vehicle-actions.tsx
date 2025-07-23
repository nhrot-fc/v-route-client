import React from "react";
import { TruckIcon, Package } from "lucide-react";
import type { ActionDTO, SimulationStateDTO } from "@/lib/api-client";

interface StatsVehicleActionsProps {
  simulationState: SimulationStateDTO;
  selectedVehicleId: string | null;
}

/**
 * Componente para mostrar las acciones planificadas para un vehículo seleccionado
 */
export const StatsVehicleActions: React.FC<StatsVehicleActionsProps> = ({
  simulationState,
  selectedVehicleId,
}) => {
  // Get future actions for selected vehicle
  const getFutureActions = (vehicleId: string) => {
    const vehiclePlan = simulationState.currentVehiclePlans?.find(
      (plan) => plan.vehicleId === vehicleId
    );

    if (!vehiclePlan?.actions) return [];

    const futureActions = [];

    const currentActionIndex = vehiclePlan.currentActionIndex;
    for (let i = 0; i < vehiclePlan.actions.length; i++) {
      futureActions.push({
        ...vehiclePlan.actions[i],
        isCurrent: i === currentActionIndex,
      });
    }

    return futureActions;
  };

  const selectedVehicleFutureActions = selectedVehicleId
    ? getFutureActions(selectedVehicleId)
    : [];

  if (!selectedVehicleId || selectedVehicleFutureActions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TruckIcon className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-800">
            Plan de ruta del vehículo
          </span>
        </div>
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md">
          {selectedVehicleFutureActions.length} acciones
        </span>
      </div>

      {/* Timeline view of actions */}
      <div className="space-y-0">
        {selectedVehicleFutureActions.map(
          (action: ActionDTO & { isCurrent: boolean }, index: number) => {
            // Action type styling
            const actionTypeStyles = {
              DRIVE: {
                icon: "→",
                bg: "bg-blue-500",
                text: "Conducir",
                lightBg: "bg-blue-50",
                border: "border-blue-200",
              },
              SERVE: {
                icon: "↓",
                bg: "bg-green-500",
                text: "Entregar",
                lightBg: "bg-green-50",
                border: "border-green-200",
              },
              RELOAD: {
                icon: "↑",
                bg: "bg-amber-500",
                text: "Cargar GLP",
                lightBg: "bg-amber-50",
                border: "border-amber-200",
              },
              REFUEL: {
                icon: "⛽",
                bg: "bg-orange-500",
                text: "Recargar combustible",
                lightBg: "bg-orange-50",
                border: "border-orange-200",
              },
              MAINTENANCE: {
                icon: "🔧",
                bg: "bg-gray-500",
                text: "Mantenimiento",
                lightBg: "bg-gray-50",
                border: "border-gray-200",
              },
              WAIT: {
                icon: "⏱️",
                bg: "bg-slate-500",
                text: "Esperar",
                lightBg: "bg-slate-50",
                border: "border-slate-200",
              },
            };

            const actionStyle =
              actionTypeStyles[action.type as keyof typeof actionTypeStyles] ||
              {
                icon: "•",
                bg: "bg-gray-500",
                text: action.type,
                lightBg: "bg-gray-50",
                border: "border-gray-200",
              };

            // Calculate if this is the last item
            const isLast = index === selectedVehicleFutureActions.length - 1;

            return (
              <div key={index} className="relative">
                {/* Timeline connector */}
                {!isLast && (
                  <div
                    className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200"
                    style={{ top: "2.5rem" }}
                  />
                )}
                
                {/* Action card */}
                <div 
                  className={`relative pl-9 pr-3 py-3 rounded-lg mb-1 ${
                    action.isCurrent 
                      ? `${actionStyle.lightBg} border ${actionStyle.border}` 
                      : "hover:bg-gray-50"
                  }`}
                >
                  {/* Timeline node */}
                  <div 
                    className={`absolute left-2 top-4 w-5 h-5 rounded-full flex items-center justify-center text-white ${actionStyle.bg}`}
                  >
                    <span className="text-xs">{actionStyle.icon}</span>
                  </div>
                  
                  {/* Action header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {actionStyle.text}
                      </span>
                      {action.isCurrent && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-700">
                          Actual
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Progress bar for current action */}
                  {action.isCurrent && action.progress !== undefined && (
                    <div className="my-2 mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Progreso</span>
                        <span className="font-medium">
                          {(action.progress * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${actionStyle.bg}`}
                          style={{ width: `${action.progress * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Action details */}
                  <div className="grid gap-2">
                    {/* Order information */}
                    {action.orderId && (
                      <div className={`p-2 rounded text-xs ${action.isCurrent ? "bg-white" : "bg-blue-50"} border border-blue-200`}>
                        <div className="flex items-center gap-1">
                          <Package className="w-3 h-3 text-blue-500" />
                          <span className="font-medium text-blue-700">Pedido:</span>
                          <span>{action.orderId}</span>
                        </div>
                      </div>
                    )}

                    {/* Path information - simplified and more compact */}
                    {action.path && action.path.length > 0 && (
                      <div className={`p-2 rounded text-xs ${action.isCurrent ? "bg-white" : "bg-gray-50"} border border-gray-200`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-600">Ruta</span>
                          <span className="text-gray-500">{action.path.length} puntos</span>
                        </div>
                        <div className="flex justify-between text-gray-600 mt-1.5">
                          <div>
                            <span className="text-gray-500">Desde:</span>{" "}
                            ({action.path[0]?.x?.toFixed(1) || 0},{" "}
                            {action.path[0]?.y?.toFixed(1) || 0})
                          </div>
                          <div>
                            <span className="text-gray-500">Hasta:</span>{" "}
                            ({action.path[action.path.length - 1]?.x?.toFixed(1) || 0},{" "}
                            {action.path[action.path.length - 1]?.y?.toFixed(1) || 0})
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}; 