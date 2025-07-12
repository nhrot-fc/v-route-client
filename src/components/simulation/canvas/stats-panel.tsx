import React, { useState } from "react";
import type { SimulationStateDTO, OrderDTO, DepotDTO } from "@/lib/api-client";
import {
  BarChart3,
  TruckIcon,
  Package,
  Warehouse,
  Search,
  X,
  AlertTriangle,
} from "lucide-react";
import { formatPercentageValue } from "./utils";

// Define panel tab types
type TabType = "general" | "vehicles" | "orders" | "depots" | "blockages";

interface StatsPanelProps {
  simulationState: SimulationStateDTO | null;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;

  // Selection handlers
  selectedVehicleId?: string | null;
  onVehicleSelect?: (vehicleId: string | null) => void;

  selectedDepot?: {
    depot: DepotDTO;
    isMainDepot: boolean;
    index?: number;
  } | null;
  onDepotSelect?: (
    depot: DepotDTO | null,
    isMainDepot: boolean,
    index?: number
  ) => void;

  selectedOrder?: (OrderDTO & { isOverdue?: boolean }) | null;
  onOrderSelect?: (order: (OrderDTO & { isOverdue?: boolean }) | null) => void;

  // Add blockage selection if needed
  // selectedBlockage?: BlockageDTO | null;
  // onBlockageSelect?: (blockage: BlockageDTO | null) => void;
}

/**
 * Main component to display simulation statistics and entity states
 */
export const StatsPanel: React.FC<StatsPanelProps> = ({
  simulationState,
  isCollapsed = false,
  onToggleCollapse,
  selectedVehicleId,
  onVehicleSelect,
  selectedDepot,
  onDepotSelect,
  selectedOrder,
  onOrderSelect,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [searchQuery, setSearchQuery] = useState("");

  if (!simulationState) return null;

  // If collapsed, show minimal info
  if (isCollapsed) {
    return (
      <div
        className="absolute top-20 right-4 bg-white/90 p-2 rounded-lg shadow-md backdrop-blur-sm z-10 border border-gray-100 cursor-pointer"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">Panel de información</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-20 right-4 bg-white/95 rounded-lg shadow-lg border border-gray-200 z-20 w-96 max-h-[600px] flex flex-col">
      {/* Header with title and close button */}
      <div className="flex justify-between items-center p-3 border-b">
        <h3 className="font-bold text-blue-800">Panel de información</h3>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Stats summary */}
      <StatsOverview simulationState={simulationState} />

      {/* Tab navigation */}
      <div className="flex border-b">
        <button
          className={`flex-1 py-2 px-4 flex items-center justify-center gap-1 ${
            activeTab === "general"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("general")}
        >
          <BarChart3 className="w-4 h-4" />
          <span>GENERAL</span>
        </button>
        <button
          className={`flex-1 py-2 px-4 flex items-center justify-center gap-1 ${
            activeTab === "orders"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("orders")}
        >
          <Package className="w-4 h-4" />
          <span>PEDIDOS</span>
          <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {simulationState.pendingOrders?.length || 0}
          </span>
        </button>
        <button
          className={`flex-1 py-2 px-4 flex items-center justify-center gap-1 ${
            activeTab === "vehicles"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("vehicles")}
        >
          <TruckIcon className="w-4 h-4" />
          <span>CAMIONES</span>
          <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {simulationState.vehicles?.length || 0}
          </span>
        </button>
        <button
          className={`flex-1 py-2 px-4 flex items-center justify-center gap-1 ${
            activeTab === "depots"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("depots")}
        >
          <Warehouse className="w-4 h-4" />
          <span>ALMACENES</span>
          <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {(simulationState.mainDepot ? 1 : 0) +
              (simulationState.auxDepots?.length || 0)}
          </span>
        </button>
      </div>

      {/* Search bar */}
      {activeTab !== "general" && (
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Buscar ${
                activeTab === "orders"
                  ? "pedidos por código, estado o ubicación"
                  : activeTab === "vehicles"
                    ? "vehículos por ID o tipo"
                    : activeTab === "depots"
                      ? "almacenes por ID o ubicación"
                      : ""
              }...`}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "general" && (
          <GeneralStatePanel simulationState={simulationState} />
        )}

        {activeTab === "orders" && (
          <OrderStatePanel
            simulationState={simulationState}
            searchQuery={searchQuery}
            selectedOrder={selectedOrder || null}
            onOrderSelect={
              onOrderSelect as (
                order: (OrderDTO & { isOverdue?: boolean }) | null
              ) => void
            }
          />
        )}

        {activeTab === "vehicles" && (
          <VehicleStatePanel
            simulationState={simulationState}
            searchQuery={searchQuery}
            selectedVehicleId={selectedVehicleId || null}
            onVehicleSelect={
              onVehicleSelect as (vehicleId: string | null) => void
            }
          />
        )}

        {activeTab === "depots" && (
          <DepotStatePanel
            simulationState={simulationState}
            searchQuery={searchQuery}
            selectedDepot={selectedDepot || null}
            onDepotSelect={
              onDepotSelect as (
                depot: DepotDTO | null,
                isMainDepot: boolean,
                index?: number
              ) => void
            }
          />
        )}

        {/* Add BlockageStatePanel when needed */}
      </div>

      {/* Last update timestamp */}
      <div className="p-2 text-xs text-gray-500 border-t">
        Última actualización:{" "}
        {new Date(simulationState.currentTime || "").toLocaleTimeString()}
      </div>
    </div>
  );
};

// Overview stats component
const StatsOverview: React.FC<{ simulationState: SimulationStateDTO }> = ({
  simulationState,
}) => {
  // Calculate statistics
  const pendingOrders = simulationState.pendingOrdersCount || 0;
  const deliveredOrders = simulationState.deliveredOrdersCount || 0;
  const totalVehicles = simulationState.vehicles?.length || 0;
  const availableVehicles = simulationState.availableVehiclesCount || 0;
  const busyVehicles = totalVehicles - availableVehicles;

  // Mock stock percentage (would come from real data in production)
  const stockPercentage = 92;

  return (
    <div className="flex justify-between p-3 border-b text-sm">
      <div className="text-center">
        <div className="font-bold text-xl text-green-600">
          {deliveredOrders}
        </div>
        <div className="text-gray-500">Pedidos Atendidos</div>
      </div>
      <div className="text-center">
        <div className="font-bold text-xl text-blue-600">{pendingOrders}</div>
        <div className="text-gray-500">Pedidos Pendientes</div>
      </div>
      <div className="text-center">
        <div className="font-bold text-xl text-amber-500">
          {Math.round((busyVehicles / totalVehicles) * 100)}%
        </div>
        <div className="text-gray-500">Utilización de flota</div>
      </div>
      <div className="text-center">
        <div className="font-bold text-xl text-green-600">
          {stockPercentage}%
        </div>
        <div className="text-gray-500">Stock Intermedios</div>
      </div>
    </div>
  );
};

// General state panel component
const GeneralStatePanel: React.FC<{ simulationState: SimulationStateDTO }> = ({
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

// Order state panel component
const OrderStatePanel: React.FC<{
  simulationState: SimulationStateDTO;
  searchQuery: string;
  selectedOrder: (OrderDTO & { isOverdue?: boolean }) | null;
  onOrderSelect?: (order: (OrderDTO & { isOverdue?: boolean }) | null) => void;
}> = ({ simulationState, searchQuery, selectedOrder, onOrderSelect }) => {
  const orders = simulationState.pendingOrders || [];

  // Filter based on search query
  const filteredOrders = searchQuery
    ? orders.filter(
        (order) =>
          order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (
            order.position?.x?.toString() +
            "," +
            order.position?.y?.toString()
          ).includes(searchQuery)
      )
    : orders;

  return (
    <div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-2 px-3 text-left">Código</th>
            <th className="py-2 px-3 text-left">Estado</th>
            <th className="py-2 px-3 text-left">Tiempo Restante</th>
            <th className="py-2 px-3 text-left">Volumen (m³)</th>
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
                  {order.glpRequestM3?.toFixed(0) || 0}
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
    </div>
  );
};

// Vehicle state panel component
const VehicleStatePanel: React.FC<{
  simulationState: SimulationStateDTO;
  searchQuery: string;
  selectedVehicleId: string | null;
  onVehicleSelect?: (vehicleId: string | null) => void;
}> = ({ simulationState, searchQuery, selectedVehicleId, onVehicleSelect }) => {
  const vehicles = simulationState.vehicles || [];

  // Filter based on search query
  const filteredVehicles = searchQuery
    ? vehicles.filter(
        (vehicle) =>
          vehicle.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.type?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : vehicles;

  return (
    <div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-2 px-3 text-left">ID</th>
            <th className="py-2 px-3 text-left">Tipo</th>
            <th className="py-2 px-3 text-left">Estado</th>
            <th className="py-2 px-3 text-left">GLP</th>
            <th className="py-2 px-3 text-left">Combustible</th>
          </tr>
        </thead>
        <tbody>
          {filteredVehicles.map((vehicle) => {
            const glpPercentage =
              ((vehicle.currentGlpM3 || 0) / (vehicle.glpCapacityM3 || 1)) *
              100;
            const fuelPercentage =
              ((vehicle.currentFuelGal || 0) /
                (vehicle.fuelCapacityGal || 25)) *
              100;

            const glpFormatted = formatPercentageValue(
              vehicle.currentGlpM3 || 0,
              vehicle.glpCapacityM3 || 1
            );

            const fuelFormatted = formatPercentageValue(
              vehicle.currentFuelGal || 0,
              vehicle.fuelCapacityGal || 25
            );

            return (
              <tr
                key={vehicle.id}
                className={`border-t hover:bg-blue-50 cursor-pointer ${
                  selectedVehicleId === vehicle.id ? "bg-blue-50" : ""
                }`}
                onClick={() =>
                  onVehicleSelect && onVehicleSelect(vehicle.id || null)
                }
              >
                <td className="py-2 px-3">{vehicle.id}</td>
                <td className="py-2 px-3">
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
                </td>
                <td className="py-2 px-3">
                  <span
                    className={`${
                      vehicle.status?.toLowerCase() === "active"
                        ? "text-green-500"
                        : vehicle.status?.toLowerCase() === "maintenance"
                          ? "text-amber-500"
                          : "text-red-500"
                    }`}
                  >
                    {vehicle.status || "Desconocido"}
                  </span>
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${glpPercentage}%`,
                          backgroundColor: glpFormatted.color,
                        }}
                      ></div>
                    </div>
                    <span
                      className="text-xs"
                      style={{ color: glpFormatted.color }}
                    >
                      {Math.round(glpPercentage)}%
                    </span>
                  </div>
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${fuelPercentage}%`,
                          backgroundColor: fuelFormatted.color,
                        }}
                      ></div>
                    </div>
                    <span
                      className="text-xs"
                      style={{ color: fuelFormatted.color }}
                    >
                      {Math.round(fuelPercentage)}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Depot state panel component
const DepotStatePanel: React.FC<{
  simulationState: SimulationStateDTO;
  searchQuery: string;
  selectedDepot: {
    depot: DepotDTO;
    isMainDepot: boolean;
    index?: number;
  } | null;
  onDepotSelect?: (
    depot: DepotDTO | null,
    isMainDepot: boolean,
    index?: number
  ) => void;
}> = ({ simulationState, searchQuery, selectedDepot, onDepotSelect }) => {
  // Get all depots
  const depots = [
    ...(simulationState.mainDepot
      ? [{ depot: simulationState.mainDepot, isMain: true, index: 0 }]
      : []),
    ...(simulationState.auxDepots
      ? simulationState.auxDepots.map((depot, index) => ({
          depot,
          isMain: false,
          index: index + 1,
        }))
      : []),
  ];

  // Filter based on search query
  const filteredDepots = searchQuery
    ? depots.filter(
        (depot) =>
          depot.depot.id
            ?.toString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (depot.isMain ? "principal" : "auxiliar").includes(
            searchQuery.toLowerCase()
          ) ||
          (
            depot.depot.position?.x?.toString() +
            "," +
            depot.depot.position?.y?.toString()
          ).includes(searchQuery)
      )
    : depots;

  return (
    <div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-2 px-3 text-left">ID</th>
            <th className="py-2 px-3 text-left">Tipo</th>
            <th className="py-2 px-3 text-left">Nivel GLP</th>
            <th className="py-2 px-3 text-left">Ubicación</th>
          </tr>
        </thead>
        <tbody>
          {filteredDepots.map((depot) => {
            // Calculate capacity and stock values
            const capacity = depot.depot.glpCapacityM3 ?? 0;
            const currentStock = depot.depot.currentGlpM3 ?? 0;
            const stockPercentage = (currentStock / capacity) * 100;

            // Get color based on stock level
            const getStockColor = (percentage: number) => {
              if (percentage <= 20) return "#ef4444"; // red
              if (percentage <= 40) return "#f97316"; // orange
              if (percentage <= 60) return "#eab308"; // yellow
              if (percentage <= 80) return "#10b981"; // green
              return "#3b82f6"; // blue
            };

            const stockColor = getStockColor(stockPercentage);

            return (
              <tr
                key={`${depot.isMain ? "main" : "aux"}-${depot.depot.id}`}
                className={`border-t hover:bg-blue-50 cursor-pointer ${
                  selectedDepot?.depot.id === depot.depot.id ? "bg-blue-50" : ""
                }`}
                onClick={() =>
                  onDepotSelect &&
                  onDepotSelect(
                    depot.depot,
                    depot.isMain,
                    depot.isMain ? undefined : depot.index
                  )
                }
              >
                <td className="py-2 px-3">{depot.depot.id}</td>
                <td className="py-2 px-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs text-white ${
                      depot.isMain ? "bg-blue-700" : "bg-blue-500"
                    }`}
                  >
                    {depot.isMain ? "Principal" : `Auxiliar ${depot.index}`}
                  </span>
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${stockPercentage}%`,
                          backgroundColor: stockColor,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs" style={{ color: stockColor }}>
                      {Math.round(stockPercentage)}%
                    </span>
                  </div>
                </td>
                <td className="py-2 px-3">
                  ({depot.depot.position?.x?.toFixed(0) || 0},{" "}
                  {depot.depot.position?.y?.toFixed(0) || 0})
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Add BlockageStatePanel if needed
