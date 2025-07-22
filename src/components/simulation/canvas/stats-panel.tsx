import React, { useState } from "react";
import {
  BarChart3,
  Package,
  TruckIcon,
  Warehouse,
  X,
  Search,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { StatsIncidents } from "./stats-incidents";
import {
  type SimulationStateDTO,
  type OrderDTO,
  type DepotDTO,
  type VehicleDTO,
  type IncidentCreateDTO,
  IncidentCreateDTOTypeEnum,
  type ActionDTO,
} from "@/lib/api-client";
import { useSimulation } from "@/hooks/use-simulation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPercentageValue } from "./utils";

// Define panel tab types (agrego 'incidents')
type TabType = "general" | "vehicles" | "orders" | "depots" | "blockages" | "incidents";

interface StatsPanelProps {
  simulationId?: string;
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
  simulationId,
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

  // Estado para referencia del contenedor de pestañas
  const tabsRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Efecto para actualizar si se puede hacer scroll
  React.useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollTabs = (dir: "left" | "right") => {
    const el = tabsRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

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
    <div className="absolute top-20 right-4 bg-white/95 rounded-lg shadow-lg border border-gray-200 z-20 w-[36rem] max-h-[700px] flex flex-col">
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
      <div className="relative">
        {canScrollLeft && (
          <button
            className="absolute left-0 top-0 bottom-0 z-10 bg-gradient-to-r from-white/90 to-transparent px-1 flex items-center"
            onClick={() => scrollTabs("left")}
            style={{ height: "100%" }}
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
        )}
        <div
          className="flex border-b overflow-x-auto no-scrollbar"
          ref={tabsRef}
          style={{ scrollBehavior: "smooth" }}
        >
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
          <button
            className={`flex-1 py-2 px-4 flex items-center justify-center gap-1 ${
              activeTab === "incidents"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("incidents")}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>INCIDENTES</span>
          </button>
        </div>
        {canScrollRight && (
          <button
            className="absolute right-0 top-0 bottom-0 z-10 bg-gradient-to-l from-white/90 to-transparent px-1 flex items-center"
            onClick={() => scrollTabs("right")}
            style={{ height: "100%" }}
          >
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        )}
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
            {...(simulationId ? { simulationId } : {})}
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

        {activeTab === "incidents" && (
          <StatsIncidents
            simulationState={simulationState}
            isCollapsed={false}
            searchQuery={searchQuery}
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

  // Filter and order based on search query and remaining time
  const filteredOrders = (searchQuery
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
      const aRestante = new Date(a.deadlineTime).getTime() - new Date(simulationState.currentTime).getTime();
      const bRestante = new Date(b.deadlineTime).getTime() - new Date(simulationState.currentTime).getTime();
      return aRestante - bRestante;
    });

  // Get vehicles serving the selected order
  const getVehiclesServingOrder = (orderId: string) => {
    const vehicles = simulationState.vehicles || [];
    const vehiclePlans = simulationState.currentVehiclePlans || [];
    
    return vehicles.filter(vehicle => {
      const vehiclePlan = vehiclePlans.find(plan => plan.vehicleId === vehicle.id);
      if (!vehiclePlan?.actions) return false;
      
      return vehiclePlan.actions.some(action => action.orderId === orderId);
    });
  };

  const vehiclesServingSelectedOrder = selectedOrder 
    ? getVehiclesServingOrder(selectedOrder.id || '')
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

      {/* Vehicles serving selected order */}
      {selectedOrder && vehiclesServingSelectedOrder.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <TruckIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Vehículos atendiendo este pedido ({vehiclesServingSelectedOrder.length})
            </span>
          </div>
          
          <div className="space-y-2">
            {vehiclesServingSelectedOrder.map((vehicle) => {
              const glpPercentage = ((vehicle.currentGlpM3 || 0) / (vehicle.glpCapacityM3 || 1)) * 100;
              const fuelPercentage = ((vehicle.currentFuelGal || 0) / (vehicle.fuelCapacityGal || 25)) * 100;
              
              // Get vehicle plan for this order
              const vehiclePlan = simulationState.currentVehiclePlans?.find(
                plan => plan.vehicleId === vehicle.id
              );
              
              // Find the action for this specific order
              const orderAction = vehiclePlan?.actions?.find(
                action => action.orderId === selectedOrder.id
              );
              
              // Calcular progreso para este pedido usando el estado del pedido seleccionado
              const isDelivered = selectedOrder?.delivered || false;
              const orderProgress = isDelivered ? 100 : ((orderAction?.progress ?? 0) * 100);
              
              return (
                <div key={vehicle.id} className="bg-white p-3 rounded border border-blue-100">
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
                      <span className="font-medium">{orderProgress.toFixed(1)}%</span>
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
                          {formatPercentageValue(vehicle.currentGlpM3 || 0, vehicle.glpCapacityM3 || 1).formattedPercentage}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${glpPercentage}%`,
                            backgroundColor: glpPercentage <= 20 ? "#ef4444" : glpPercentage <= 40 ? "#f97316" : "#10b981"
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Combustible</span>
                        <span className="font-medium">
                          {formatPercentageValue(vehicle.currentFuelGal || 0, vehicle.fuelCapacityGal || 25).formattedPercentage}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${fuelPercentage}%`,
                            backgroundColor: fuelPercentage <= 20 ? "#ef4444" : fuelPercentage <= 40 ? "#f97316" : "#10b981"
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
            <AlertTriangle className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              No hay vehículos asignados a este pedido actualmente
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Vehicle state panel component
const VehicleStatePanel: React.FC<{
  simulationId?: string;
  simulationState: SimulationStateDTO;
  searchQuery: string;
  selectedVehicleId: string | null;
  onVehicleSelect?: (vehicleId: string | null) => void;
}> = ({
  simulationId,
  simulationState,
  searchQuery,
  selectedVehicleId,
  onVehicleSelect,
}) => {
  const vehicles = simulationState.vehicles || [];
  const { createVehicleBreakdown, isLoading: isBreakdownLoading } =
    useSimulation();

  // Get future actions for selected vehicle
  const getFutureActions = (vehicleId: string) => {
    const vehiclePlan = simulationState.currentVehiclePlans?.find(
      plan => plan.vehicleId === vehicleId
    );
    
    if (!vehiclePlan?.actions) return [];
    
    const futureActions = [];
    let foundCurrentPosition = false;
    
    for (const action of vehiclePlan.actions) {
      // Check if this action contains the current vehicle position
      if (!foundCurrentPosition && action.path && action.path.length > 0) {
        const currentVehicle = vehicles.find(v => v.id === vehicleId);
        if (currentVehicle?.currentPosition) {
          const currentX = currentVehicle.currentPosition.x || 0;
          const currentY = currentVehicle.currentPosition.y || 0;
          
          // Check if current position is in this action's path
          const isInCurrentAction = action.path.some(point => 
            Math.abs((point.x || 0) - currentX) < 0.1 && 
            Math.abs((point.y || 0) - currentY) < 0.1
          );
          
          if (isInCurrentAction) {
            foundCurrentPosition = true;
            // Include this action but mark it as current
            futureActions.push({ ...action, isCurrent: true });
          }
        }
      } else if (foundCurrentPosition) {
        // All subsequent actions are future
        futureActions.push({ ...action, isCurrent: false });
      }
    }
    
    return futureActions;
  };

  const selectedVehicleFutureActions = selectedVehicleId 
    ? getFutureActions(selectedVehicleId)
    : [];

  // State for breakdown dialog
  const [isBreakdownDialogOpen, setIsBreakdownDialogOpen] = useState(false);
  const [selectedVehicleForBreakdown, setSelectedVehicleForBreakdown] =
    useState<VehicleDTO | null>(null);

  // State for breakdown form
  const [breakdownType, setBreakdownType] = useState<IncidentCreateDTOTypeEnum>(
    IncidentCreateDTOTypeEnum.Ti1
  );
  const [breakdownError, setBreakdownError] = useState<string | null>(null);

  // Filter based on search query
  const filteredVehicles = searchQuery
    ? vehicles.filter(
        (vehicle) =>
          vehicle.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.type?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : vehicles;

  const handleOpenBreakdownDialog = (vehicle: VehicleDTO) => {
    setSelectedVehicleForBreakdown(vehicle);
    setIsBreakdownDialogOpen(true);
    setBreakdownError(null); // Reset error on open
  };

  const handleBreakdownSubmit = async () => {
    if (!selectedVehicleForBreakdown || !simulationId) {
      setBreakdownError(
        "No se ha seleccionado un vehículo o simulación válida."
      );
      return;
    }

    const occurrenceTime = new Date(simulationState.currentTime || Date.now());

    const breakdownData: IncidentCreateDTO = {
      type: breakdownType,
      occurrenceTime: occurrenceTime.toISOString(),
    };

    const result = await createVehicleBreakdown(
      simulationId,
      selectedVehicleForBreakdown.id!,
      breakdownData
    );

    if (result) {
      setIsBreakdownDialogOpen(false);
      // Optionally, trigger a refresh or show a success toast
    } else {
      setBreakdownError("No se pudo reportar la avería. Intente de nuevo.");
    }
  };

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
            <th className="py-2 px-3 text-left">Acciones</th>
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
                className={`border-t hover:bg-blue-50 ${
                  selectedVehicleId === vehicle.id ? "bg-blue-50" : ""
                }`}
              >
                <td
                  className="py-2 px-3 cursor-pointer"
                  onClick={() =>
                    onVehicleSelect && onVehicleSelect(vehicle.id || null)
                  }
                >
                  {vehicle.id}
                </td>
                <td
                  className="py-2 px-3 cursor-pointer"
                  onClick={() =>
                    onVehicleSelect && onVehicleSelect(vehicle.id || null)
                  }
                >
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
                <td
                  className="py-2 px-3 cursor-pointer"
                  onClick={() =>
                    onVehicleSelect && onVehicleSelect(vehicle.id || null)
                  }
                >
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
                <td
                  className="py-2 px-3 cursor-pointer"
                  onClick={() =>
                    onVehicleSelect && onVehicleSelect(vehicle.id || null)
                  }
                >
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
                <td
                  className="py-2 px-3 cursor-pointer"
                  onClick={() =>
                    onVehicleSelect && onVehicleSelect(vehicle.id || null)
                  }
                >
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
                <td className="py-2 px-3">
                  <button
                    onClick={() => handleOpenBreakdownDialog(vehicle)}
                    className="p-1 text-red-500 hover:bg-red-100 rounded-full"
                    title="Reportar avería"
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Breakdown Dialog */}
      <Dialog
        open={isBreakdownDialogOpen}
        onOpenChange={setIsBreakdownDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Reportar Avería para {selectedVehicleForBreakdown?.id}
            </DialogTitle>
            <DialogDescription>
              Complete los detalles del incidente para inmovilizar el vehículo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="breakdown-type" className="text-right">
                Tipo
              </Label>
              <Select
                value={breakdownType}
                onValueChange={(value) =>
                  setBreakdownType(value as IncidentCreateDTOTypeEnum)
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={IncidentCreateDTOTypeEnum.Ti1}>
                    T1
                  </SelectItem>
                  <SelectItem value={IncidentCreateDTOTypeEnum.Ti2}>
                    T2
                  </SelectItem>
                  <SelectItem value={IncidentCreateDTOTypeEnum.Ti3}>
                    T3
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {breakdownError && (
              <p className="text-red-500 text-sm col-span-4 text-center">
                {breakdownError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBreakdownDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={() => void handleBreakdownSubmit()} disabled={isBreakdownLoading}>
              {isBreakdownLoading ? "Reportando..." : "Reportar Avería"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Future actions for selected vehicle */}
      {selectedVehicleId && selectedVehicleFutureActions.length > 0 && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <TruckIcon className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">
              Plan de ruta del vehículo ({selectedVehicleFutureActions.length} acciones)
            </span>
          </div>
          
          <div className="space-y-2">
            {selectedVehicleFutureActions.map((action: ActionDTO & { isCurrent: boolean }, index: number) => {
              const actionTypeColors = {
                DRIVE: "bg-blue-100 text-blue-700",
                SERVE: "bg-green-100 text-green-700",
                RELOAD: "bg-amber-100 text-amber-700",
                REFUEL: "bg-orange-100 text-orange-700",
                MAINTENANCE: "bg-gray-100 text-gray-700",
                WAIT: "bg-slate-100 text-slate-700",
              };
              
              const actionTypeColor = actionTypeColors[action.type as keyof typeof actionTypeColors] || "bg-gray-100 text-gray-700";
              
              return (
                <div key={index} className={`bg-white p-3 rounded border ${action.isCurrent ? 'border-purple-300 bg-purple-50' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${actionTypeColor.replace('100', '500').replace('700', 'white')}`}>
                        {action.type}
                      </span>
                      {action.isCurrent && (
                        <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                          Actual
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      Acción {index + 1}
                    </span>
                  </div>
                  
                  {/* Order information if applicable */}
                  {action.orderId && (
                    <div className="mb-2 p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="text-xs text-blue-700">
                        <span className="font-medium">Pedido:</span> {action.orderId}
                      </div>
                      {action.progress !== undefined && (
                        <div className="mt-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progreso</span>
                            <span className="font-medium">{(action.progress * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-blue-500"
                              style={{ width: `${action.progress * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Path information */}
                  {action.path && action.path.length > 0 && (
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Ruta:</span> {action.path.length} puntos
                      {action.path.length > 0 && (
                        <div className="mt-1">
                          <span className="font-medium">Desde:</span> ({action.path[0]?.x?.toFixed(1) || 0}, {action.path[0]?.y?.toFixed(1) || 0})
                          <br />
                          <span className="font-medium">Hasta:</span> ({action.path[action.path.length - 1]?.x?.toFixed(1) || 0}, {action.path[action.path.length - 1]?.y?.toFixed(1) || 0})
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
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
            let currentStock = depot.depot.currentGlpM3 ?? 0;
            if (depot.depot.id === 'MAIN') {
              currentStock = capacity;
            }
            const stockPercentage = capacity > 0 ? (currentStock / capacity) * 100 : 0;

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
