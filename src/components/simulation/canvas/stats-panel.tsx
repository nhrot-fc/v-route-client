import React, { useState, useRef, useEffect } from "react";
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
  WrenchIcon,
} from "lucide-react";
import {
  type SimulationStateDTO,
  type OrderDTO,
  type DepotDTO,
  type ServeRecordDTO,
} from "@/lib/api-client";
import { StatsIncidents } from "./stats-incidents";
import { StatsMaintenance } from "./stats-maintenance";
import { StatsGeneral } from "./stats-general";
import { StatsOrders } from "./stats-orders";
import { StatsVehicles } from "./stats-vehicles";
import { StatsDepots } from "./stats-depots";
import { StatsVehicleActions } from "./stats-vehicle-actions";

// Define panel tab types
type TabType =
  | "general"
  | "vehicles"
  | "orders"
  | "depots"
  | "blockages"
  | "incidents"
  | "maintenance";

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
  const tabsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Efecto para actualizar si se puede hacer scroll
  useEffect(() => {
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
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
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
          <button
            className={`flex-1 py-2 px-4 flex items-center justify-center gap-1 ${
              activeTab === "maintenance"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("maintenance")}
          >
            <WrenchIcon className="w-4 h-4" />
            <span>MANTENIMIENTOS</span>
            <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {simulationState.scheduledMaintenances?.length || 0}
            </span>
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
          <StatsGeneral simulationState={simulationState} />
        )}

        {activeTab === "orders" && (
          <StatsOrders
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
          <>
            <StatsVehicles
              simulationId={simulationId || ""}
              simulationState={simulationState}
              searchQuery={searchQuery}
              selectedVehicleId={selectedVehicleId || null}
              onVehicleSelect={
                onVehicleSelect as (vehicleId: string | null) => void
              }
            />
            
            {/* Show vehicle actions for selected vehicle */}
            {selectedVehicleId && (
              <StatsVehicleActions
                simulationState={simulationState}
                selectedVehicleId={selectedVehicleId}
              />
            )}
          </>
        )}

        {activeTab === "depots" && (
          <StatsDepots
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

        {activeTab === "maintenance" && (
          <StatsMaintenance
            simulationState={simulationState}
            isCollapsed={false}
            searchQuery={searchQuery}
          />
        )}
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
const attendedOrdersSet = new Set<string>(); // GLOBAL (fuera del componente)
const StatsOverview: React.FC<{ simulationState: SimulationStateDTO }> = ({
  simulationState,
}) => {
  // Calcular pedidos atendidos usando serveRecords
  const orders = [
    ...(simulationState.pendingOrders || []),
  ];
  orders.forEach((order) => {
    const serveRecords = (order as any).serveRecords as ServeRecordDTO[] | undefined;
    if (!order.id || typeof order.glpRequestM3 !== "number" || !Array.isArray(serveRecords)) return;
    const totalEntregado = serveRecords.reduce(
      (acc: number, rec: ServeRecordDTO) => acc + (typeof rec.glpVolumeM3 === "number" ? rec.glpVolumeM3 : 0),
      0
    );
    if (totalEntregado >= order.glpRequestM3) {
      attendedOrdersSet.add(order.id);
    }
  });
  const deliveredOrders = attendedOrdersSet.size;
  const pendingOrders = simulationState.pendingOrdersCount || 0;
  const totalVehicles = simulationState.vehicles?.length || 0;
  const availableVehicles = simulationState.availableVehiclesCount || 0;
  const busyVehicles = totalVehicles - availableVehicles;
  // Calcular porcentaje de stock de GLP solo en depósitos auxiliares
  const auxDepots = simulationState.auxDepots || [];
  const totalAuxGlp = auxDepots.reduce((acc, depot) => acc + (depot.currentGlpM3 || 0), 0);
  const totalAuxCapacity = auxDepots.reduce((acc, depot) => acc + (depot.glpCapacityM3 || 0), 0);
  const stockPercentage = totalAuxCapacity > 0 ? Math.round((totalAuxGlp / totalAuxCapacity) * 100) : 0;
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
