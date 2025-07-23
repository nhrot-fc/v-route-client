import React from "react";
import { TruckIcon } from "lucide-react";
import type { 
  SimulationStateDTO, 
  OrderDTO 
} from "@/lib/api-client";
import { formatPercentageValue } from "./utils";

interface StatsOrdersProps {
  simulationState: SimulationStateDTO;
  searchQuery: string;
  selectedOrder: (OrderDTO & { isOverdue?: boolean }) | null;
  onOrderSelect?: (order: (OrderDTO & { isOverdue?: boolean }) | null) => void;
}

/**
 * Componente para mostrar información sobre los pedidos
 */
export const StatsOrders: React.FC<StatsOrdersProps> = ({
  simulationState,
  searchQuery,
  selectedOrder,
  onOrderSelect,
}) => {
  const orders = simulationState.pendingOrders || [];

  // Filter and order based on search query and remaining time
  const filteredOrders = (
    searchQuery
      ? orders.filter(
          (order) =>
            order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (
              order.position?.x?.toString() +
              "," +
              order.position?.y?.toString()
            ).includes(searchQuery)
        )
      : orders
  )
    .slice() // copia para no mutar el original
    .sort((a, b) => {
      // Si falta alguna fecha, los manda al final
      if (!a.deadlineTime || !simulationState.currentTime) return 1;
      if (!b.deadlineTime || !simulationState.currentTime) return -1;
      const aRestante =
        new Date(a.deadlineTime).getTime() -
        new Date(simulationState.currentTime).getTime();
      const bRestante =
        new Date(b.deadlineTime).getTime() -
        new Date(simulationState.currentTime).getTime();
      return aRestante - bRestante;
    });

  // Get vehicles serving the selected order
  const getVehiclesServingOrder = (orderId: string) => {
    const vehicles = simulationState.vehicles || [];
    const vehiclePlans = simulationState.currentVehiclePlans || [];
    
    return vehicles.filter((vehicle) => {
      const vehiclePlan = vehiclePlans.find(
        (plan) => plan.vehicleId === vehicle.id
      );
      if (!vehiclePlan?.actions) return false;
      
      return vehiclePlan.actions.some((action) => action.orderId === orderId);
    });
  };

  const vehiclesServingSelectedOrder = selectedOrder
    ? getVehiclesServingOrder(selectedOrder.id || "")
    : [];

  return (
    <div>
      {/* Orders table */}
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-2 px-3 text-left">Código</th>
            <th className="py-2 px-3 text-left">Estado</th>
            <th className="py-2 px-3 text-left">Tiempo Restante</th>
            <th className="py-2 px-3 text-left">Solicitado (m³)</th>
            <th className="py-2 px-3 text-left">Restante (m³)</th>
            <th className="py-2 px-3 text-left">Ubicación</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => {
            const isOverdue = order.deadlineTime
              ? new Date(order.deadlineTime) <
                new Date(simulationState.currentTime || "")
              : false;
            const isDelivered = order.delivered || false;

            // Calculate remaining time
            let remainingTime = "";
            if (order.deadlineTime && simulationState.currentTime) {
              const deadline = new Date(order.deadlineTime).getTime();
              const current = new Date(simulationState.currentTime).getTime();
              const diff = deadline - current;

              if (diff > 0) {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor(
                  (diff % (1000 * 60 * 60)) / (1000 * 60)
                );
                remainingTime = `${hours}h ${minutes}min`;
              } else {
                remainingTime = "Vencido";
              }
            }

            return (
              <tr
                key={order.id}
                className={`border-t hover:bg-blue-50 cursor-pointer ${
                  selectedOrder?.id === order.id ? "bg-blue-50" : ""
                }`}
                onClick={() =>
                  onOrderSelect && onOrderSelect({ ...order, isOverdue })
                }
              >
                <td className="py-2 px-3">{order.id}</td>
                <td className="py-2 px-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs text-white ${
                      isDelivered
                        ? "bg-green-500"
                        : isOverdue
                          ? "bg-red-500"
                          : "bg-teal-500"
                    }`}
                  >
                    {isDelivered
                      ? "Entregado"
                      : isOverdue
                        ? "Vencido"
                        : "En Ruta"}
                  </span>
                </td>
                <td className="py-2 px-3">
                  <span
                    className={`${isOverdue ? "text-red-500" : "text-green-500"}`}
                  >
                    {remainingTime}
                  </span>
                </td>
                <td className="py-2 px-3">
                  {order.glpRequestM3?.toFixed(1) || 0}
                </td>
                <td className="py-2 px-3">
                  {order.remainingGlpM3?.toFixed(1) || 0}
                </td>
                <td className="py-2 px-3">
                  ({order.position?.x?.toFixed(0) || 0},{" "}
                  {order.position?.y?.toFixed(0) || 0})
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Vehicles serving selected order */}
      {selectedOrder && vehiclesServingSelectedOrder.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <TruckIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Vehículos atendiendo este pedido (
              {vehiclesServingSelectedOrder.length})
            </span>
          </div>
          
          <div className="space-y-2">
            {vehiclesServingSelectedOrder.map((vehicle) => {
              const glpPercentage =
                ((vehicle.currentGlpM3 || 0) / (vehicle.glpCapacityM3 || 1)) *
                100;
              const fuelPercentage =
                ((vehicle.currentFuelGal || 0) /
                  (vehicle.fuelCapacityGal || 25)) *
                100;
              
              // Get vehicle plan for this order
              const vehiclePlan = simulationState.currentVehiclePlans?.find(
                (plan) => plan.vehicleId === vehicle.id
              );
              
              // Find the action for this specific order
              const orderAction = vehiclePlan?.actions?.find(
                (action) => action.orderId === selectedOrder.id
              );
              
              // Calcular progreso para este pedido usando el estado del pedido seleccionado
              const isDelivered = selectedOrder?.delivered || false;
              const orderProgress = isDelivered
                ? 100
                : (orderAction?.progress ?? 0) * 100;
              
              return (
                <div
                  key={vehicle.id}
                  className="bg-white p-3 rounded border border-blue-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{vehicle.id}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs text-white ${
                          vehicle.type === "TA"
                            ? "bg-red-500"
                            : vehicle.type === "TB"
                            ? "bg-blue-500"
                            : vehicle.type === "TC"
                            ? "bg-amber-500"
                            : "bg-purple-500"
                        }`}
                      >
                        {vehicle.type}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        vehicle.status?.toLowerCase() === "active"
                          ? "bg-green-100 text-green-700"
                          : vehicle.status?.toLowerCase() === "maintenance"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {vehicle.status || "Desconocido"}
                    </span>
                  </div>
                  
                  {/* Progress for this specific order */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progreso del pedido</span>
                      <span className="font-medium">
                        {orderProgress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${orderProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Vehicle status indicators */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>GLP</span>
                        <span className="font-medium">
                          {
                            formatPercentageValue(
                              vehicle.currentGlpM3 || 0,
                              vehicle.glpCapacityM3 || 1
                            ).formattedPercentage
                          }
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${glpPercentage}%`,
                            backgroundColor:
                              glpPercentage <= 20
                                ? "#ef4444"
                                : glpPercentage <= 40
                                  ? "#f97316"
                                  : "#10b981",
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Combustible</span>
                        <span className="font-medium">
                          {
                            formatPercentageValue(
                              vehicle.currentFuelGal || 0,
                              vehicle.fuelCapacityGal || 25
                            ).formattedPercentage
                          }
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${fuelPercentage}%`,
                            backgroundColor:
                              fuelPercentage <= 20
                                ? "#ef4444"
                                : fuelPercentage <= 40
                                  ? "#f97316"
                                  : "#10b981",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Current position */}
                  <div className="mt-2 text-xs text-gray-600">
                    <span className="font-medium">Posición actual:</span> (
                    {vehicle.currentPosition?.x?.toFixed(1) || 0},{" "}
                    {vehicle.currentPosition?.y?.toFixed(1) || 0})
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* No vehicles serving message */}
      {selectedOrder && vehiclesServingSelectedOrder.length === 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <TruckIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              No hay vehículos asignados a este pedido actualmente
            </span>
          </div>
        </div>
      )}
    </div>
  );
}; 