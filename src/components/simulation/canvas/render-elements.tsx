import React from "react";
import { Group, Line, Rect } from "react-konva";
import type { SimulationStateDTO, DepotDTO, OrderDTO } from "@/lib/api-client";
import type {
  TooltipInfo,
  EnhancedTooltipInfo,
  RoutePoint,
  EnhancedOrderDTO,
} from "./types";
import { MapIcon } from "./map-icon";
import { ColoredText } from "./colored-text";
import { ProgressBar } from "./progress-bar";
import {
  getGlpColorLevel,
  getOrderSizeCategory,
  enhanceVehicleWithPlan,
  enhanceOrderWithVehicles,
} from "./utils";
import { handleElementHover } from "./hover-handler";

interface RenderElementsProps {
  simulationState: SimulationStateDTO | null;
  zoom: number;
  tooltip: TooltipInfo;
  mapToScreenCoords: (x: number, y: number) => { x: number; y: number };
  setTooltip: React.Dispatch<React.SetStateAction<TooltipInfo>>;
  setEnhancedTooltip: React.Dispatch<React.SetStateAction<EnhancedTooltipInfo>>;
  selectedVehicleId?: string | null;
  selectedOrder?: (OrderDTO & { isOverdue?: boolean }) | null;
  selectedDepot?: {
    depot: DepotDTO;
    isMainDepot: boolean;
    index?: number;
  } | null;
  onVehicleSelect?: (vehicleId: string | null) => void;
  onDepotSelect?: (
    depot: DepotDTO | null,
    isMainDepot: boolean,
    index?: number
  ) => void;
  onOrderSelect?: (order: EnhancedOrderDTO | null) => void;
  highlightedVehicleIds?: string[];
  highlightedOrderIds?: string[];
}

/**
 * Render all elements on the simulation map
 * Handles drawing blockages, orders, depots, and vehicles
 */
export const renderElements = ({
  simulationState,
  zoom,
  tooltip,
  mapToScreenCoords,
  setTooltip,
  setEnhancedTooltip,
  selectedVehicleId,
  selectedOrder,
  selectedDepot,
  onVehicleSelect,
  onDepotSelect,
  onOrderSelect,
  highlightedVehicleIds = [],
  highlightedOrderIds = [],
}: RenderElementsProps) => {
  if (!simulationState) return null;

  const elements: React.ReactNode[] = [];

  // Process vehicles first para obtener enhancedVehicles
  const enhancedVehicles = (simulationState.vehicles || []).map((vehicle) =>
    enhanceVehicleWithPlan(
      vehicle,
      simulationState.currentVehiclePlans || [],
      simulationState.pendingOrders || []
    )
  );

  // Si hay un vehículo seleccionado, filtra solo ese vehículo y los pedidos que va a atender
  let filteredVehicles = enhancedVehicles;
  let filteredOrders = simulationState.pendingOrders || [];
  let selectedVehiclePlan = null;
  let selectedVehicleOrderIds: string[] = [];
  if (selectedVehicleId) {
    // Solo el vehículo seleccionado
    filteredVehicles = enhancedVehicles.filter(v => v.id === selectedVehicleId);
    // Encuentra el plan del vehículo seleccionado
    selectedVehiclePlan = simulationState.currentVehiclePlans?.find(plan => plan.vehicleId === selectedVehicleId) || null;
    selectedVehicleOrderIds = (selectedVehiclePlan?.actions?.filter(a => a.orderId).map(a => a.orderId).filter(Boolean) as string[]) || [];
    // Filtra los pedidos que están en el plan del vehículo
    filteredOrders = filteredOrders.filter(order => order.id && selectedVehicleOrderIds.includes(order.id));
  }

  // Procesa los pedidos con asignación de vehículos
  let enhancedOrders = filteredOrders.map((order) =>
    enhanceOrderWithVehicles(
      order,
      enhancedVehicles,
      simulationState.currentTime || ""
    )
  );

  // --- FILTRADO ESPECIAL AL SELECCIONAR UN PEDIDO ---
  if (selectedOrder) {
    // 1. Solo mostrar el pedido seleccionado
    enhancedOrders = enhancedOrders.filter(order => order.id === selectedOrder.id);

    // 2. Obtener los vehículos que atienden este pedido
    let servingVehicleIds: string[] = [];
    if (enhancedOrders[0]?.servingVehicles && enhancedOrders[0].servingVehicles.length > 0) {
      servingVehicleIds = enhancedOrders[0].servingVehicles.map(v => v.id).filter(Boolean) as string[];
    } else if (simulationState.currentVehiclePlans) {
      // Buscar manualmente en los planes de vehículos
      servingVehicleIds = simulationState.currentVehiclePlans
        .filter(plan => plan.actions && plan.actions.some(action => action.orderId === selectedOrder.id))
        .map(plan => plan.vehicleId)
        .filter((id): id is string => typeof id === 'string');
    }

    // 3. Filtrar vehículos: solo los que atienden el pedido, pero solo si hay alguno
    if (servingVehicleIds.length > 0) {
      filteredVehicles = enhancedVehicles.filter(v => v.id && servingVehicleIds.includes(v.id));
    } else {
      // Si no hay vehículos asignados, no mostrar ningún vehículo
      filteredVehicles = [];
    }
  }

  // Draw blockages
  if (simulationState.activeBlockages) {
    simulationState.activeBlockages.forEach((blockage, blockIdx) => {
      if (blockage.lines && blockage.lines.length > 1) {
        // Create points array for blockage lines
        const points: number[] = [];
        blockage.lines.forEach((point) => {
          const { x, y } = mapToScreenCoords(point.x || 0, point.y || 0);
          points.push(x, y);
        });

        // Add blockage line
        elements.push(
          <Line
            key={`blockage-line-${blockIdx}`}
            points={points}
            stroke="red"
            strokeWidth={3 * (zoom / 15)}
            dash={[8 * (zoom / 15), 4 * (zoom / 15)]}
            lineCap="round"
            shadowColor="rgba(0,0,0,0.2)"
            shadowBlur={5}
            shadowOffset={{ x: 1, y: 1 }}
            shadowOpacity={0.5}
          />
        );

        // Add blockage icons
        for (let i = 0; i < blockage.lines.length - 1; i++) {
          const point1 = blockage.lines[i];
          const point2 = blockage.lines[i + 1];
          const midX = ((point1.x || 0) + (point2.x || 0)) / 2;
          const midY = ((point1.y || 0) + (point2.y || 0)) / 2;
          const { x, y } = mapToScreenCoords(midX, midY);

          elements.push(
            <Group
              key={`blockage-icon-${blockIdx}-${i}`}
              x={x}
              y={y}
              onMouseEnter={(e) => {
                const stage = e.target.getStage();
                const pointerPosition = stage?.getPointerPosition();
                handleElementHover(
                  {
                    type: "blockage",
                    x: midX,
                    y: midY,
                    radius: 15,
                    data: blockage,
                  },
                  pointerPosition || null,
                  setTooltip,
                  setEnhancedTooltip
                );
              }}
              onMouseLeave={() =>
                handleElementHover(null, null, setTooltip, setEnhancedTooltip)
              }
            >
              <MapIcon
                src="/icons/blocked-road.svg"
                x={0}
                y={0}
                size={15 * (zoom / 15)}
              />
            </Group>
          );
        }
      }
    });
  }

  // Draw orders con filteredOrders/enhancedOrders
  if (enhancedOrders && enhancedOrders.length > 0) {
    enhancedOrders.forEach((order, idx) => {
      const isOverdue = order.isOverdue || false;
      const iconColor = order.delivered ? "green" : isOverdue ? "red" : "blue";
      const x = order.position?.x || 0;
      const y = order.position?.y || 0;
      const { x: screenX, y: screenY } = mapToScreenCoords(x, y);

      // Determine order size for icon sizing
      const orderSize = getOrderSizeCategory(order.glpRequestM3 || 0);
      const sizeMap = { small: 12, medium: 16, large: 20 };
      const iconSize = sizeMap[orderSize] * (zoom / 15);

      // Get volume text color
      const volume = order.glpRequestM3 || 0;
      let volumeColor = "#3b82f6"; // Default blue
      if (volume <= 3)
        volumeColor = "#10b981"; // green - small
      else if (volume <= 10)
        volumeColor = "#eab308"; // yellow - medium
      else volumeColor = "#f97316"; // orange - large

      // Highlight orders if they are being served by vehicles, if this is the selected order, or if this order is in a selected vehicle's plan
      const isBeingServed =
        order.servingVehicles && order.servingVehicles.length > 0;
      const isSelectedOrder = selectedOrder?.id === order.id;
      const isHighlightedOrder = highlightedOrderIds.includes(order.id || '');

      elements.push(
        <Group
          key={`order-${idx}`}
          x={screenX}
          y={screenY}
          onMouseEnter={(e) => {
            const stage = e.target.getStage();
            const pointerPosition = stage?.getPointerPosition();
            handleElementHover(
              {
                type: "order",
                x,
                y,
                radius: iconSize + 5,
                data: order,
              },
              pointerPosition || null,
              setTooltip,
              setEnhancedTooltip
            );
          }}
          onMouseLeave={() =>
            handleElementHover(null, null, setTooltip, setEnhancedTooltip)
          }
          onClick={() => {
            // Select order on click
            if (onOrderSelect) {
              onOrderSelect(order);
            }
          }}
          onTap={() => {
            // For touch devices
            if (onOrderSelect) {
              onOrderSelect(order);
            }
          }}
        >
          {/* Add highlight if being served, if this is the selected order, or if this order is highlighted */}
          {(isSelectedOrder || isHighlightedOrder) && (
            <>
              {/* Contorno interno semitransparente */}
              <Rect
                x={-iconSize - 2}
                y={-iconSize - 2}
                width={iconSize * 2 + 4}
                height={iconSize * 2 + 4}
                fill="rgba(147, 51, 234, 0.2)"
                stroke="transparent"
                cornerRadius={3}
              />
              {/* Contorno externo morado */}
              <Rect
                x={-iconSize - 3}
                y={-iconSize - 3}
                width={iconSize * 2 + 6}
                height={iconSize * 2 + 6}
                fill="transparent"
                stroke="#9333ea"
                strokeWidth={2}
                cornerRadius={4}
              />
            </>
          )}

          <MapIcon
            src={`/icons/colored/${iconColor}/customer.svg`}
            x={0}
            y={0}
            size={iconSize}
          />

          {/* Only show if not being hovered */}
          {!tooltip.show && (
            <>
              {/* Order ID with background - only show if selected */}
              {isSelectedOrder && (
                <>
                  <Rect
                    x={iconSize + 2 * (zoom / 15)}
                    y={-8 * (zoom / 15)}
                    width={40 * (zoom / 15)}
                    height={16 * (zoom / 15)}
                    fill="rgba(255, 255, 255, 0.7)"
                    cornerRadius={2}
                  />
                  <ColoredText
                    x={iconSize + 2 * (zoom / 15)}
                    y={-8 * (zoom / 15)}
                    text={`${order.id || "N/A"}`}
                    fontSize={10 * (zoom / 15)}
                    color={
                      order.delivered
                        ? "#16a34a"
                        : isOverdue
                          ? "#dc2626"
                          : "#1d4ed8"
                    }
                  />
                </>
              )}

              {/* GLP indicator with volume-based color */}
              <Rect
                x={-15 * (zoom / 15)}
                y={iconSize + 2 * (zoom / 15)}
                width={30 * (zoom / 15)}
                height={16 * (zoom / 15)}
                fill={`rgba(0, 0, 0, 0.5)`}
                cornerRadius={2}
                stroke={volumeColor}
                strokeWidth={1.5}
              />
              <ColoredText
                x={-15 * (zoom / 15)}
                y={iconSize + 2 * (zoom / 15)}
                width={30 * (zoom / 15)}
                text={`${volume.toFixed(1)}m³`}
                fontSize={9 * (zoom / 15)}
                color="#ffffff"
                align="center"
              />
            </>
          )}
        </Group>
      );
    });
  }

  // Draw main depot
  if (simulationState.mainDepot) {
    const x = simulationState.mainDepot.position?.x || 0;
    const y = simulationState.mainDepot.position?.y || 0;
    const { x: screenX, y: screenY } = mapToScreenCoords(x, y);
    const depotSize = 25 * (zoom / 15);

    elements.push(
      <Group
        key="main-depot"
        x={screenX}
        y={screenY}
        onMouseEnter={(e) => {
          const stage = e.target.getStage();
          const pointerPosition = stage?.getPointerPosition();
          handleElementHover(
            {
              type: "depot",
              x,
              y,
              radius: depotSize,
              data: simulationState.mainDepot || {},
            },
            pointerPosition || null,
            setTooltip,
            setEnhancedTooltip
          );
        }}
        onMouseLeave={() =>
          handleElementHover(null, null, setTooltip, setEnhancedTooltip)
        }
        onClick={() => {
          // Select depot on click
          if (onDepotSelect) {
            onDepotSelect(simulationState.mainDepot || null, true);
          }
        }}
        onTap={() => {
          // For touch devices
          if (onDepotSelect) {
            onDepotSelect(simulationState.mainDepot || null, true);
          }
        }}
      >
        <MapIcon
          src="/icons/colored/blue/main-warehouse.svg"
          x={0}
          y={0}
          size={depotSize}
        />

        {/* Only show if not being hovered */}
        {!tooltip.show && (
          <>
            {/* Depot info - only show if selected */}
            {selectedDepot?.depot.id === simulationState.mainDepot?.id && (
              <>
                <Rect
                  x={depotSize}
                  y={-8 * (zoom / 15)}
                  width={160 * (zoom / 15)}
                  height={60 * (zoom / 15)}
                  fill="rgba(255, 255, 255, 0.95)"
                  cornerRadius={6}
                  shadowColor="#000"
                  shadowBlur={8}
                  shadowOpacity={0.12}
                />
                <ColoredText
                  x={depotSize + 8 * (zoom / 15)}
                  y={-6 * (zoom / 15)}
                  text={`Depósito Principal`}
                  fontSize={13 * (zoom / 15)}
                  fontStyle="bold"
                  color="#1e40af"
                />
                <ColoredText
                  x={depotSize + 8 * (zoom / 15)}
                  y={10 * (zoom / 15)}
                  text={`GLP: ${(selectedDepot?.isMainDepot ? (simulationState.mainDepot.glpCapacityM3 ?? 0) : (simulationState.mainDepot.currentGlpM3 ?? 0)).toLocaleString()} m³`}
                  fontSize={11 * (zoom / 15)}
                  color="#0f172a"
                />
                <ColoredText
                  x={depotSize + 8 * (zoom / 15)}
                  y={22 * (zoom / 15)}
                  text={`Capacidad: ${(simulationState.mainDepot.glpCapacityM3 ?? 0).toLocaleString()} m³`}
                  fontSize={11 * (zoom / 15)}
                  color="#64748b"
                />
                <ColoredText
                  x={depotSize + 8 * (zoom / 15)}
                  y={34 * (zoom / 15)}
                  text={`%: ${simulationState.mainDepot.glpCapacityM3 ? ((simulationState.mainDepot.currentGlpM3 ?? 0) / (simulationState.mainDepot.glpCapacityM3 ?? 1) * 100).toFixed(1) : '0'}%`}
                  fontSize={11 * (zoom / 15)}
                  color="#0ea5e9"
                />
                <ColoredText
                  x={depotSize + 8 * (zoom / 15)}
                  y={46 * (zoom / 15)}
                  text={`Ubicación: (${simulationState.mainDepot.position?.x ?? 0}, ${simulationState.mainDepot.position?.y ?? 0})`}
                  fontSize={10 * (zoom / 15)}
                  color="#334155"
                />
              </>
            )}
          </>
        )}
      </Group>
    );
  }

  // Draw auxiliary depots
  if (simulationState.auxDepots) {
    simulationState.auxDepots.forEach((depot, index) => {
      const x = depot.position?.x || 0;
      const y = depot.position?.y || 0;
      const { x: screenX, y: screenY } = mapToScreenCoords(x, y);
      const depotSize = 20 * (zoom / 15);

      elements.push(
        <Group
          key={`aux-depot-${index}`}
          x={screenX}
          y={screenY}
          onMouseEnter={(e) => {
            const stage = e.target.getStage();
            const pointerPosition = stage?.getPointerPosition();
            handleElementHover(
              {
                type: "auxDepot",
                x,
                y,
                radius: depotSize,
                data: {
                  ...depot,
                  id: depot.id?.toString() || `aux-depot-${index + 1}`,
                  glpCapacityM3: 160,
                },
              },
              pointerPosition || null,
              setTooltip,
              setEnhancedTooltip
            );
          }}
          onMouseLeave={() =>
            handleElementHover(null, null, setTooltip, setEnhancedTooltip)
          }
          onClick={() => {
            // Select depot on click
            if (onDepotSelect) {
              onDepotSelect(depot, false, index + 1);
            }
          }}
          onTap={() => {
            // For touch devices
            if (onDepotSelect) {
              onDepotSelect(depot, false, index + 1);
            }
          }}
        >
          <MapIcon
            src="/icons/colored/blue/warehouse.svg"
            x={0}
            y={0}
            size={depotSize}
          />

          {/* Only show if not being hovered */}
          {!tooltip.show && (
            <>
              {/* Depot info - only show if selected */}
              {selectedDepot?.depot.id === depot.id && !selectedDepot?.isMainDepot && (
                <>
                  <Rect
                    x={depotSize}
                    y={-8 * (zoom / 15)}
                    width={150 * (zoom / 15)}
                    height={56 * (zoom / 15)}
                    fill="rgba(255, 255, 255, 0.95)"
                    cornerRadius={6}
                    shadowColor="#000"
                    shadowBlur={8}
                    shadowOpacity={0.12}
                  />
                  <ColoredText
                    x={depotSize + 8 * (zoom / 15)}
                    y={-6 * (zoom / 15)}
                    text={`Depósito Aux. ${index + 1}`}
                    fontSize={12 * (zoom / 15)}
                    fontStyle="bold"
                    color="#3b82f6"
                  />
                  <ColoredText
                    x={depotSize + 8 * (zoom / 15)}
                    y={8 * (zoom / 15)}
                    text={`GLP: ${(depot.currentGlpM3 ?? 0).toLocaleString()} m³`}
                    fontSize={11 * (zoom / 15)}
                    color="#0f172a"
                  />
                  <ColoredText
                    x={depotSize + 8 * (zoom / 15)}
                    y={20 * (zoom / 15)}
                    text={`Capacidad: ${(depot.glpCapacityM3 ?? 0).toLocaleString()} m³`}
                    fontSize={11 * (zoom / 15)}
                    color="#64748b"
                  />
                  <ColoredText
                    x={depotSize + 8 * (zoom / 15)}
                    y={32 * (zoom / 15)}
                    text={`%: ${depot.glpCapacityM3 ? ((depot.currentGlpM3 ?? 0) / (depot.glpCapacityM3 ?? 1) * 100).toFixed(1) : '0'}%`}
                    fontSize={11 * (zoom / 15)}
                    color="#0ea5e9"
                  />
                  <ColoredText
                    x={depotSize + 8 * (zoom / 15)}
                    y={44 * (zoom / 15)}
                    text={`Ubicación: (${depot.position?.x ?? 0}, ${depot.position?.y ?? 0})`}
                    fontSize={10 * (zoom / 15)}
                    color="#334155"
                  />
                </>
              )}
            </>
          )}
        </Group>
      );
    });
  }

  // Draw vehicle routes y vehicles usando filteredVehicles
  if (filteredVehicles) {
    filteredVehicles.forEach((vehicle, index) => {
      if (!vehicle.currentPosition) return;
      const plan = vehicle.currentPlan;
      if (!plan || !plan.actions || plan.actions.length === 0) return;

      // 1. Agrupa las acciones en bloques (cada bloque termina en SERVE)
      const actionBlocks: (typeof plan.actions)[] = [];
      let tempBlock: typeof plan.actions = [];
      plan.actions.forEach((action) => {
        if (action.type === "DRIVE" && tempBlock.length > 0) {
          actionBlocks.push([...tempBlock]);
          tempBlock = [];
        }
        tempBlock.push(action);
        if (action.type === "SERVE") {
          actionBlocks.push([...tempBlock]);
          tempBlock = [];
        }
      });
      if (tempBlock.length > 0) actionBlocks.push([...tempBlock]);

      // 2. Busca el bloque cuyo path contiene la posición actual del camión
      let blockToDraw: typeof plan.actions | null = null;
      let currentActionIdx = -1;
      let indexFrom = 0;

      for (const block of actionBlocks) {
        for (let i = 0; i < block.length; i++) {
          const action = block[i];
          if (!action.path || action.path.length < 2) continue;
          const idx = action.path.findIndex(
            (p) =>
              Math.abs((p.x ?? 0) - (vehicle.currentPosition?.x ?? 0)) < 1 &&
              Math.abs((p.y ?? 0) - (vehicle.currentPosition?.y ?? 0)) < 1
          );
          if (idx !== -1) {
            blockToDraw = block;
            currentActionIdx = i;
            indexFrom = idx;
            break;
          }
        }
        if (blockToDraw) break;
      }

      if (!blockToDraw) return; // No hay bloque que contenga la posición actual

      // Definir si el vehículo está resaltado
      const isHighlightedVehicle = highlightedVehicleIds.includes(vehicle.id || '');
      const isSelectedVehicle = selectedVehicleId === vehicle.id;

      // 3. Imprime la ruta futura (desde la posición actual hasta el final)
      // Si hay un vehículo seleccionado, solo se muestra su ruta futura
      if (selectedVehicleId) {
        // Nueva lógica: encontrar la acción y el índice actual en el plan
        let fullPath: { x: number; y: number }[] = [];
        let found = false;
        for (let actionIdx = 0; actionIdx < plan.actions.length; actionIdx++) {
          const action = plan.actions[actionIdx];
          if (!action.path || action.path.length < 2) continue;
          if (!found) {
            // Buscar si la posición actual está en este path
            const idx = action.path.findIndex(
              (p) =>
                Math.abs((p.x ?? 0) - (vehicle.currentPosition?.x ?? 0)) < 1 &&
                Math.abs((p.y ?? 0) - (vehicle.currentPosition?.y ?? 0)) < 1
            );
            if (idx !== -1) {
              // Desde aquí empieza la ruta futura
              const pathSlice = action.path.slice(idx).map(p => ({ x: p.x ?? 0, y: p.y ?? 0 }));
              fullPath = fullPath.concat(pathSlice);
              found = true;
              continue;
            }
          }
          if (found) {
            // Acciones siguientes: todo el path
            const pathMapped = action.path.map(p => ({ x: p.x ?? 0, y: p.y ?? 0 }));
            fullPath = fullPath.concat(pathMapped);
          }
        }
        if (fullPath.length >= 2) {
          const screenPoints: number[] = [];
          fullPath.forEach((point) => {
            const { x, y } = mapToScreenCoords(point.x, point.y);
            screenPoints.push(x, y);
          });
          elements.push(
            <Line
              key={`route-${vehicle.id}-full`}
              points={screenPoints}
              stroke="#9333ea"
              strokeWidth={3 * (zoom / 15)}
              dash={[4 * (zoom / 15), 2 * (zoom / 15)]}
              lineCap="round"
              lineJoin="round"
              opacity={0.9}
              shadowColor="rgba(0,0,0,0.2)"
              shadowBlur={5}
              shadowOffset={{ x: 1, y: 1 }}
              shadowOpacity={0.5}
              onClick={() => {
                alert(`Ruta del camión: ${vehicle.id}`);
              }}
              cursor="pointer"
            />
          );
        }
      } else if (isHighlightedVehicle) {
        // Modo resaltado normal (sin selección): mostrar ruta futura del vehículo resaltado
        // --- NUEVA LÓGICA: mostrar solo desde la posición actual hasta el final ---
        let fullPath: { x: number; y: number }[] = [];
        let found = false;
        for (let actionIdx = 0; actionIdx < plan.actions.length; actionIdx++) {
          const action = plan.actions[actionIdx];
          if (!action.path || action.path.length < 2) continue;
          if (!found) {
            // Buscar si la posición actual está en este path
            const idx = action.path.findIndex(
              (p) =>
                Math.abs((p.x ?? 0) - (vehicle.currentPosition?.x ?? 0)) < 1 &&
                Math.abs((p.y ?? 0) - (vehicle.currentPosition?.y ?? 0)) < 1
            );
            if (idx !== -1) {
              // Desde aquí empieza la ruta futura
              const pathSlice = action.path.slice(idx).map(p => ({ x: p.x ?? 0, y: p.y ?? 0 }));
              fullPath = fullPath.concat(pathSlice);
              found = true;
              continue;
            }
          }
          if (found) {
            // Acciones siguientes: todo el path
            const pathMapped = action.path.map(p => ({ x: p.x ?? 0, y: p.y ?? 0 }));
            fullPath = fullPath.concat(pathMapped);
          }
        }
        if (fullPath.length >= 2) {
          const screenPoints: number[] = [];
          fullPath.forEach((point) => {
            const { x, y } = mapToScreenCoords(point.x, point.y);
            screenPoints.push(x, y);
          });
          elements.push(
            <Line
              key={`route-${vehicle.id}-full`}
              points={screenPoints}
              stroke="#9333ea"
              strokeWidth={3 * (zoom / 15)}
              dash={[4 * (zoom / 15), 2 * (zoom / 15)]}
              lineCap="round"
              lineJoin="round"
              opacity={0.9}
              shadowColor="rgba(0,0,0,0.2)"
              shadowBlur={5}
              shadowOffset={{ x: 1, y: 1 }}
              shadowOpacity={0.5}
              onClick={() => {
                alert(`Ruta del camión: ${vehicle.id}`);
              }}
              cursor="pointer"
            />
          );
        }
      } else {
        // Para vehículos normales, mostrar solo la ruta actual
        blockToDraw.forEach((action, actionIdx) => {
          if (!action.path || action.path.length < 2) return;
          let pathToDraw: { x: number; y: number }[] = [];
          if (actionIdx < currentActionIdx) {
            // Ya recorrida, no se pinta
            return;
          } else if (actionIdx === currentActionIdx) {
            pathToDraw = action.path.slice(indexFrom).map(p => ({ x: p.x ?? 0, y: p.y ?? 0 }));
          } else {
            pathToDraw = action.path.map(p => ({ x: p.x ?? 0, y: p.y ?? 0 }));
          }
          if (pathToDraw.length >= 2) {
            const screenPoints: number[] = [];
            pathToDraw.forEach((point) => {
              const { x, y } = mapToScreenCoords(point.x, point.y);
              screenPoints.push(x, y);
            });
            // Color normal según tipo de acción
            const actionColorMap = {
              DRIVE: "#4f46e5",
              SERVE: "#16a34a",
              RELOAD: "#eab308",
              REFUEL: "#f97316",
              MAINTENANCE: "#64748b",
              WAIT: "#a3a3a3",
            };
            const lineColor = action.type
              ? actionColorMap[action.type] || "#4f46e5"
              : "#4f46e5";
            elements.push(
              <Line
                key={`route-${vehicle.id}-action-${actionIdx}`}
                points={screenPoints}
                stroke={lineColor}
                strokeWidth={2 * (zoom / 15)}
                dash={[4 * (zoom / 15), 2 * (zoom / 15)]}
                lineCap="round"
                lineJoin="round"
                opacity={0.7}
                shadowColor="rgba(0,0,0,0.2)"
                shadowBlur={3}
                shadowOffset={{ x: 1, y: 1 }}
                shadowOpacity={0.3}
                onClick={() => {
                  alert(`Ruta del camión: ${vehicle.id}`);
                }}
                cursor="pointer"
              />
            );
          }
        });
      }

      // Imprime SIEMPRE el camión en su posición actual
      const x = vehicle.currentPosition?.x || 0;
      const y = vehicle.currentPosition?.y || 0;
      const { x: screenX, y: screenY } = mapToScreenCoords(x, y);
      const vehicleSize = 20 * (zoom / 15);

      let direction = vehicle.currentOrientation || "east";

      const action = blockToDraw?.[currentActionIdx];
      const path = action?.path;

      if (
        Array.isArray(path) &&
        path.length > indexFrom + 1 &&
        path[indexFrom] &&
        path[indexFrom + 1]
      ) {
        const current = path[indexFrom];
        const next = path[indexFrom + 1];

        if (
          typeof current.x === "number" &&
          typeof current.y === "number" &&
          typeof next.x === "number" &&
          typeof next.y === "number"
        ) {
          direction = getAutoDirection(
            { x: current.x, y: current.y },
            { x: next.x, y: next.y }
          );
        }
      }

      const glpColor = getGlpColorLevel(
        vehicle.currentGlpM3 || 0,
        vehicle.glpCapacityM3 || 1
      );
      const isSelected = selectedVehicleId === vehicle.id;
      const isHighlighted = highlightedVehicleIds.includes(vehicle.id || '');
      const hasActiveOrders =
        vehicle.currentOrders && vehicle.currentOrders.length > 0;

      elements.push(
        <Group
          key={`vehicle-${index}`}
          x={screenX}
          y={screenY}
          onMouseEnter={(e) => {
            const stage = e.target.getStage();
            const pointerPosition = stage?.getPointerPosition();
            handleElementHover(
              {
                type: "vehicle",
                x,
                y,
                radius: vehicleSize,
                data: vehicle,
              },
              pointerPosition || null,
              setTooltip,
              setEnhancedTooltip
            );
          }}
          onMouseLeave={() =>
            handleElementHover(null, null, setTooltip, setEnhancedTooltip)
          }
          onClick={() => {
            if (onVehicleSelect) {
              onVehicleSelect(isSelected ? null : vehicle.id || null);
            }
          }}
          onTap={() => {
            if (onVehicleSelect) {
              onVehicleSelect(isSelected ? null : vehicle.id || null);
            }
          }}
        >
          {isSelected && (
            <Rect
              x={-vehicleSize - 3}
              y={-vehicleSize - 3}
              width={vehicleSize * 2 + 6}
              height={vehicleSize * 2 + 6}
              fill="transparent"
              stroke="#3b82f6"
              strokeWidth={2}
              cornerRadius={4}
            />
          )}
          
          {isHighlighted && !isSelected && (
            <>
              {/* Contorno interno semitransparente */}
              <Rect
                x={-vehicleSize - 2}
                y={-vehicleSize - 2}
                width={vehicleSize * 2 + 4}
                height={vehicleSize * 2 + 4}
                fill="rgba(147, 51, 234, 0.2)"
                stroke="transparent"
                cornerRadius={3}
              />
              {/* Contorno externo morado */}
              <Rect
                x={-vehicleSize - 3}
                y={-vehicleSize - 3}
                width={vehicleSize * 2 + 6}
                height={vehicleSize * 2 + 6}
                fill="transparent"
                stroke="#9333ea"
                strokeWidth={3}
                cornerRadius={4}
                dash={[5, 5]}
              />
            </>
          )}

          <MapIcon
            src={`/icons/colored/${glpColor}/truck-${direction}.svg`}
            x={0}
            y={0}
            size={vehicleSize}
          />

          {!tooltip.show && (
            <>
              {/* Vehicle ID - only show if selected */}
              {isSelected && (
                <>
                  <Rect
                    x={vehicleSize}
                    y={-8 * (zoom / 15)}
                    width={40 * (zoom / 15)}
                    height={16 * (zoom / 15)}
                    fill="rgba(255, 255, 255, 0.7)"
                    cornerRadius={2}
                  />
                  <ColoredText
                    x={vehicleSize + 2 * (zoom / 15)}
                    y={-8 * (zoom / 15)}
                    text={`${vehicle.id?.substring(0, 5) || "N/A"}`}
                    fontSize={10 * (zoom / 15)}
                    color={
                      vehicle.status?.toLowerCase() === "active"
                        ? "#16a34a"
                        : vehicle.status?.toLowerCase() === "maintenance"
                          ? "#f97316"
                          : "#1d4ed8"
                    }
                  />
                </>
              )}

              <ProgressBar
                x={-vehicleSize / 2}
                y={vehicleSize + 3 * (zoom / 15)}
                width={vehicleSize}
                height={4 * (zoom / 15)}
                value={
                  (vehicle.currentGlpM3 || 0) / (vehicle.glpCapacityM3 || 1)
                }
                color={glpColor === "red" ? "#dc2626" : "#10b981"}
                background="rgba(0, 0, 0, 0.2)"
                strokeWidth={0.5}
              />

              {hasActiveOrders && (
                <>
                  <Rect
                    x={-vehicleSize - 5}
                    y={-vehicleSize - 3}
                    width={20 * (zoom / 15)}
                    height={16 * (zoom / 15)}
                    fill="#3b82f6"
                    cornerRadius={2}
                  />
                  <ColoredText
                    x={-vehicleSize - 5}
                    y={-vehicleSize - 3}
                    width={20 * (zoom / 15)}
                    text={`${vehicle.currentOrders?.length || 0}`}
                    fontSize={10 * (zoom / 15)}
                    color="#ffffff"
                    align="center"
                  />
                </>
              )}
            </>
          )}
        </Group>
      );
    });
  }

  return elements;
};

// Función para calcular la orientación
function getAutoDirection(
  current: { x: number; y: number },
  next: { x: number; y: number }
): "north" | "south" | "east" | "west" {
  const dx = (next.x ?? 0) - (current.x ?? 0);
  const dy = (next.y ?? 0) - (current.y ?? 0);
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "east" : "west";
  } else {
    return dy > 0 ? "south" : "north";
  }
}