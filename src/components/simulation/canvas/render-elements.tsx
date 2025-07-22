import React from "react";
import { Group, Line, Rect } from "react-konva";
import {
  type SimulationStateDTO,
  type DepotDTO,
  type OrderDTO,
} from "@/lib/api-client";
import type {
  TooltipInfo,
  EnhancedTooltipInfo,
  EnhancedOrderDTO,
} from "./types";
import { MapIcon } from "./map-icon";
import { ColoredText } from "./colored-text";
import {
  getOrderSizeCategory,
  enhanceVehicleWithPlan,
  enhanceOrderWithVehicles,
  prepareVehicleForRendering,
  calculateRemainingPathPoints,
  getVehicleRenderStyle,
  getVehiclePlanPaths,
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
    filteredVehicles = enhancedVehicles.filter(
      (v) => v.id === selectedVehicleId
    );
    // Encuentra el plan del vehículo seleccionado
    selectedVehiclePlan =
      simulationState.currentVehiclePlans?.find(
        (plan) => plan.vehicleId === selectedVehicleId
      ) || null;
    selectedVehicleOrderIds =
      (selectedVehiclePlan?.actions
        ?.filter((a) => a.orderId)
        .map((a) => a.orderId)
        .filter(Boolean) as string[]) || [];
    // Filtra los pedidos que están en el plan del vehículo
    filteredOrders = filteredOrders.filter(
      (order) => order.id && selectedVehicleOrderIds.includes(order.id)
    );
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
    enhancedOrders = enhancedOrders.filter(
      (order) => order.id === selectedOrder.id
    );

    // 2. Obtener los vehículos que atienden este pedido
    let servingVehicleIds: string[] = [];
    if (
      enhancedOrders[0]?.servingVehicles &&
      enhancedOrders[0].servingVehicles.length > 0
    ) {
      servingVehicleIds = enhancedOrders[0].servingVehicles
        .map((v) => v.id)
        .filter(Boolean) as string[];
    } else if (simulationState.currentVehiclePlans) {
      // Buscar manualmente en los planes de vehículos
      servingVehicleIds = simulationState.currentVehiclePlans
        .filter(
          (plan) =>
            plan.actions &&
            plan.actions.some((action) => action.orderId === selectedOrder.id)
        )
        .map((plan) => plan.vehicleId)
        .filter((id): id is string => typeof id === "string");
    }

    // 3. Filtrar vehículos: solo los que atienden el pedido, pero solo si hay alguno
    if (servingVehicleIds.length > 0) {
      filteredVehicles = enhancedVehicles.filter(
        (v) => v.id && servingVehicleIds.includes(v.id)
      );
    } else {
      // Si no hay vehículos asignados, no mostrar ningún vehículo
      filteredVehicles = [];
    }
  }

  // --- FILTRADO ESPECIAL AL SELECCIONAR UN ALMACÉN ---
  if (selectedDepot && selectedDepot.depot && selectedDepot.depot.position) {
    const depotPos = selectedDepot.depot.position;

    // Filtra vehículos cuya ACCIÓN ACTUAL (usando currentActionIndex) termina en el almacén seleccionado.
    const vehiclesToDepot = enhancedVehicles.filter((vehicle) => {
      const plan = vehicle.currentPlan;
      const currentActionIndex = plan?.currentActionIndex;

      // Valida que el plan y el índice de la acción actual existan y sean válidos.
      if (
        !plan?.actions ||
        typeof currentActionIndex !== "number" ||
        currentActionIndex < 0 ||
        currentActionIndex >= plan.actions.length
      ) {
        return false;
      }

      const currentAction = plan.actions[currentActionIndex];

      // Valida que la acción actual tenga una ruta (path) con al menos un punto.
      if (!currentAction?.path || currentAction.path.length === 0) {
        return false;
      }

      // Compara el destino de la acción actual con la posición del almacén.
      const lastPoint = currentAction.path[currentAction.path.length - 1];
      return (
        Math.abs((lastPoint.x ?? 0) - (depotPos.x ?? 0)) < 1 &&
        Math.abs((lastPoint.y ?? 0) - (depotPos.y ?? 0)) < 1
      );
    });

    filteredVehicles = vehiclesToDepot;
    // Ocultar todos los pedidos
    enhancedOrders = [];
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
      const isSelectedOrder = selectedOrder?.id === order.id;
      const isHighlightedOrder = highlightedOrderIds.includes(order.id || "");

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
                  text={`%: ${simulationState.mainDepot.glpCapacityM3 ? (((simulationState.mainDepot.currentGlpM3 ?? 0) / (simulationState.mainDepot.glpCapacityM3 ?? 1)) * 100).toFixed(1) : "0"}%`}
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
                  glpCapacityM3: depot.glpCapacityM3 || 0,
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
              {selectedDepot?.depot.id === depot.id &&
                !selectedDepot?.isMainDepot && (
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
                      text={`%: ${depot.glpCapacityM3 ? (((depot.currentGlpM3 ?? 0) / (depot.glpCapacityM3 ?? 1)) * 100).toFixed(1) : "0"}%`}
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
      const vehicleId = vehicle.id || "";
      const isSelected = selectedVehicleId === vehicleId;
      const isHighlighted = highlightedVehicleIds.includes(vehicleId);

      // Get vehicle position and rendering properties
      const { position, glpColor, direction } = prepareVehicleForRendering(
        vehicle,
        vehicle.currentPlan?.currentAction
      );

      const { x, y } = mapToScreenCoords(position.x ?? 0, position.y ?? 0);

      // Get style properties based on vehicle status and selection state
      const style = getVehicleRenderStyle(vehicle, isSelected, isHighlighted);

      // SCENARIO 1, 2, 3: Draw appropriate paths based on selection state
      if (isSelected || isHighlighted) {
        // Scenarios 2 & 3: Draw complete plan for selected/highlighted vehicles
        if (vehicle.currentPlan) {
          const paths = getVehiclePlanPaths(vehicle.currentPlan);

          // Draw completed paths (past actions) with faded style
          paths.completed.forEach((pathPoints, pathIdx) => {
            const points: number[] = [];
            pathPoints.forEach((point) => {
              const coord = mapToScreenCoords(point.x || 0, point.y || 0);
              points.push(coord.x, coord.y);
            });

            elements.push(
              <Line
                key={`vehicle-${vehicleId}-completed-path-${pathIdx}`}
                points={points}
                stroke="#6b7280"
                strokeWidth={(1.5 * zoom) / 15}
                opacity={0.5}
                dash={[2, 2]}
              />
            );
          });

          // Draw current path with normal style
          if (paths.current.length > 0) {
            const points: number[] = [];
            paths.current.forEach((point) => {
              const coord = mapToScreenCoords(point.x || 0, point.y || 0);
              points.push(coord.x, coord.y);
            });

            elements.push(
              <Line
                key={`vehicle-${vehicleId}-current-path`}
                points={points}
                stroke="#000000"
                strokeWidth={(2 * zoom) / 15}
              />
            );
          }

          // Draw future paths with highlighted style
          paths.future.forEach((pathPoints, pathIdx) => {
            const points: number[] = [];
            pathPoints.forEach((point) => {
              const coord = mapToScreenCoords(point.x || 0, point.y || 0);
              points.push(coord.x, coord.y);
            });

            elements.push(
              <Line
                key={`vehicle-${vehicleId}-future-path-${pathIdx}`}
                points={points}
                stroke="#3b82f6"
                strokeWidth={(2 * zoom) / 15}
                dash={[4, 2]}
              />
            );
          });
        }
      } else {
        // Scenario 1: Normal vehicle - just draw current action's remaining path
        if (vehicle.currentPlan?.currentAction?.path) {
          const currentAction = vehicle.currentPlan.currentAction;
          const remainingPath = calculateRemainingPathPoints(
            currentAction.path,
            currentAction.progress
          );

          if (remainingPath.length > 0) {
            const points: number[] = [];
            remainingPath.forEach((point) => {
              const coord = mapToScreenCoords(point.x || 0, point.y || 0);
              points.push(coord.x, coord.y);
            });

            elements.push(
              <Line
                key={`vehicle-${vehicleId}-path`}
                points={points}
                stroke="#000000"
                strokeWidth={(2 * zoom) / 15}
              />
            );
          }
        }
      }

      // Draw vehicle with proper styling
      elements.push(
        <Group
          key={`vehicle-${index}`}
          x={x}
          y={y}
          onMouseEnter={(e) => {
            const stage = e.target.getStage();
            const pointerPosition = stage?.getPointerPosition();
            handleElementHover(
              {
                type: "vehicle",
                x: position.x || 0,
                y: position.y || 0,
                radius: style.iconSize,
                data: vehicle,
                orientation: direction,
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
            // Select vehicle on click
            if (onVehicleSelect) {
              onVehicleSelect(vehicleId);
            }
          }}
          onTap={() => {
            // For touch devices
            if (onVehicleSelect) {
              onVehicleSelect(vehicleId);
            }
          }}
        >
          {/* Draw selection/highlight rectangle if needed */}
          {style.rect && (
            <Rect
              x={-style.rect.width / 2}
              y={-style.rect.height / 2}
              width={style.rect.width}
              height={style.rect.height}
              fill={style.rect.fill}
              stroke={style.rect.stroke}
              strokeWidth={style.rect.strokeWidth}
              cornerRadius={style.rect.cornerRadius}
              opacity={style.rect.opacity}
            />
          )}

          <MapIcon
            src={`/icons/colored/${glpColor}/truck-${direction}.svg`}
            x={0}
            y={0}
            size={style.iconSize * (zoom / 15)}
          />
        </Group>
      );
    });
  }

  return elements;
};
