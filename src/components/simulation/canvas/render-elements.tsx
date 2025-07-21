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

  // Process vehicles first to get enhanced data with orientations and current orders
  const enhancedVehicles = (simulationState.vehicles || []).map((vehicle) =>
    enhanceVehicleWithPlan(
      vehicle,
      simulationState.currentVehiclePlans || [],
      simulationState.pendingOrders || []
    )
  );

  // Process orders with vehicle assignments
  const enhancedOrders = (simulationState.pendingOrders || []).map((order) =>
    enhanceOrderWithVehicles(
      order,
      enhancedVehicles,
      simulationState.currentTime || ""
    )
  );

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

  // Draw orders with colored indicators for volumes
  if (enhancedOrders && enhancedOrders.length > 0) {
    enhancedOrders.forEach((order, idx) => {
      // If an order is selected, only show that specific order
      if (selectedOrder && order.id !== selectedOrder.id) {
        return; // Skip this order if it's not the selected one
      }
      
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
      
      // Check if this order is in the selected vehicle's plan
      const isInSelectedVehiclePlan = selectedVehicleId && 
        enhancedVehicles.find(v => v.id === selectedVehicleId)?.currentPlan?.actions?.some(action => 
          action.type === 'SERVE' && action.orderId === order.id
        );

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
          {/* Add highlight if being served, if this is the selected order, if this order is highlighted, or if this order is in the selected vehicle's plan */}
          {(isBeingServed || isSelectedOrder || isHighlightedOrder || isInSelectedVehiclePlan) && (
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
              {/* Order ID with background - only show if selected or in selected vehicle's plan */}
              {(isSelectedOrder || isInSelectedVehiclePlan) && (
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

              {/* Show vehicle count if being served */}
              {isBeingServed && (
                <>
                  <Rect
                    x={-iconSize - 5}
                    y={-iconSize - 3}
                    width={20 * (zoom / 15)}
                    height={16 * (zoom / 15)}
                    fill="#4ade80"
                    cornerRadius={2}
                  />
                  <ColoredText
                    x={-iconSize - 5}
                    y={-iconSize - 3}
                    width={20 * (zoom / 15)}
                    text={`${order.servingVehicles?.length || 0}`}
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

    // Draw main depot - only if no order is selected
  if (simulationState.mainDepot && !selectedOrder) {
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
              width={120 * (zoom / 15)}
              height={16 * (zoom / 15)}
              fill="rgba(255, 255, 255, 0.8)"
              cornerRadius={3}
            />
            <ColoredText
              x={depotSize + 4 * (zoom / 15)}
              y={-8 * (zoom / 15)}
              text="Depósito Principal"
              fontSize={12 * (zoom / 15)}
              fontStyle="bold"
              color="#1e40af"
            />
              </>
            )}
          </>
        )}
      </Group>
    );
  }

    // Draw auxiliary depots - only if no order is selected
  if (simulationState.auxDepots && !selectedOrder) {
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
              {selectedDepot?.depot.id === depot.id && !selectedDepot?.isMainDepot && selectedDepot?.index === index + 1 && (
            <>
              <Rect
                x={depotSize}
                y={-8 * (zoom / 15)}
                width={100 * (zoom / 15)}
                height={16 * (zoom / 15)}
                fill="rgba(255, 255, 255, 0.8)"
                cornerRadius={3}
              />
              <ColoredText
                x={depotSize + 4 * (zoom / 15)}
                y={-8 * (zoom / 15)}
                text={`Depósito Aux. ${index + 1}`}
                fontSize={10 * (zoom / 15)}
                fontStyle="bold"
                color="#3b82f6"
              />
                </>
              )}
            </>
          )}
        </Group>
      );
    });
  }

  // Draw vehicle routes and vehicles using enhanced logic from types.ts
  if (enhancedVehicles) {
    enhancedVehicles.forEach((vehicle, index) => {
      if (!vehicle.currentPosition) return;
      
      // If an order is selected, only show vehicles that are serving that order
      if (selectedOrder) {
        const isServingSelectedOrder = vehicle.currentOrders?.some(order => order.id === selectedOrder.id) ||
          vehicle.currentPlan?.actions?.some(action => action.orderId === selectedOrder.id);
        
        if (!isServingSelectedOrder) {
          return; // Skip this vehicle if it's not serving the selected order
        }
      }
      
      const plan = vehicle.currentPlan;
      if (!plan || !plan.actions || plan.actions.length === 0) return;

      // 1. Agrupa las acciones en bloques (cada bloque termina en SERVE, RELOAD, REFUEL, o MAINTENANCE)
      const actionBlocks: (typeof plan.actions)[] = [];
      let tempBlock: typeof plan.actions = [];
      plan.actions.forEach((action) => {
        // Inicia un nuevo bloque en DRIVE si el anterior terminó en una acción de finalización
        if (action.type && action.type === "DRIVE" && tempBlock.length > 0) {
          actionBlocks.push([...tempBlock]);
          tempBlock = [];
        }
        tempBlock.push(action);
        // Termina el bloque en SERVE, RELOAD, REFUEL, o MAINTENANCE
        if (action.type && ["SERVE", "RELOAD", "REFUEL", "MAINTENANCE"].includes(action.type)) {
          actionBlocks.push([...tempBlock]);
          tempBlock = [];
        }
      });
      if (tempBlock.length > 0) actionBlocks.push([...tempBlock]);

      // 2. Busca el bloque cuyo path contiene la posición actual del camión
      let blockToDraw: typeof plan.actions | null = null;
      let currentActionIdx = -1;
      let indexFrom = 0;

      // Primero, intenta encontrar la posición exacta en algún path
      for (const block of actionBlocks) {
        for (let i = 0; i < block.length; i++) {
          const action = block[i];
          if (!action.path || action.path.length < 2) continue;
          // ¿La posición actual del camión está en este path?
          const idx = action.path.findIndex(
            (p) =>
              Math.abs((p.x ?? 0) - (vehicle.currentPosition?.x ?? 0)) < 0.01 &&
              Math.abs((p.y ?? 0) - (vehicle.currentPosition?.y ?? 0)) < 0.01
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

      // Si no se encontró la posición exacta, busca el bloque más cercano
      if (!blockToDraw) {
        let minDistance = Infinity;
        for (const block of actionBlocks) {
          for (let i = 0; i < block.length; i++) {
            const action = block[i];
            if (!action.path || action.path.length < 2) continue;
            
            // Encuentra el punto más cercano en este path
            for (let j = 0; j < action.path.length; j++) {
              const point = action.path[j];
              const distance = Math.sqrt(
                Math.pow((point.x ?? 0) - (vehicle.currentPosition?.x ?? 0), 2) +
                Math.pow((point.y ?? 0) - (vehicle.currentPosition?.y ?? 0), 2)
              );
              if (distance < minDistance) {
                minDistance = distance;
                blockToDraw = block;
                currentActionIdx = i;
                indexFrom = j;
              }
            }
          }
        }
      }

      if (!blockToDraw) {
        console.log(`No se encontró bloque para el vehículo ${vehicle.id} en posición ${vehicle.currentPosition?.x}, ${vehicle.currentPosition?.y}`);
        return; // No hay bloque que contenga la posición actual
      }

      // Definir si el vehículo está resaltado o seleccionado
      const isHighlightedVehicle = highlightedVehicleIds.includes(vehicle.id || '');
      const isSelectedVehicle = selectedVehicleId === vehicle.id;
      
      // Si hay un vehículo seleccionado, solo mostrar rutas de ese vehículo
      // Si hay un pedido seleccionado, mostrar rutas de vehículos que lo atienden
      if (selectedVehicleId && !isSelectedVehicle) {
        return; // No mostrar rutas de otros vehículos cuando hay uno seleccionado
      }
      
      // Si hay un pedido seleccionado, mostrar rutas completas de vehículos que lo atienden
      const shouldShowRoutes = !selectedVehicleId || isSelectedVehicle || 
        (selectedOrder && (isHighlightedVehicle || isSelectedVehicle));
      
      // Debug: mostrar información del bloque encontrado
      console.log(`Vehículo ${vehicle.id}: bloque encontrado con ${blockToDraw.length} acciones, acción actual: ${currentActionIdx}`);
      blockToDraw.forEach((action, idx) => {
        console.log(`  Acción ${idx}: ${action.type} - ${action.path?.length || 0} puntos`);
      });

      // 3. Imprime las rutas según si el vehículo está seleccionado, resaltado o normal
              if (isSelectedVehicle || (selectedOrder && isHighlightedVehicle)) {
          // Para vehículos seleccionados o que atienden un pedido seleccionado: mostrar TODAS las rutas desde la posición actual
          const vehicleType = isSelectedVehicle ? "seleccionado" : "que atiende pedido seleccionado";
          console.log(`Vehículo ${vehicleType} ${vehicle.id}: mostrando todas las rutas desde la posición actual hasta el pedido`);
          
          // Si hay un pedido seleccionado, asegurarse de mostrar la ruta completa hasta ese pedido
          const targetOrderId = selectedOrder?.id;
        
        // Primero, encontrar en qué bloque y acción está actualmente el vehículo
        let currentBlockIdx = -1;
        let currentActionIdx = -1;
        let indexFrom = 0;
        
        for (let blockIdx = 0; blockIdx < actionBlocks.length; blockIdx++) {
          const block = actionBlocks[blockIdx];
          for (let i = 0; i < block.length; i++) {
            const action = block[i];
            if (!action.path || action.path.length < 2) continue;
            const idx = action.path.findIndex(
              (p) =>
                Math.abs((p.x ?? 0) - (vehicle.currentPosition?.x ?? 0)) < 0.01 &&
                Math.abs((p.y ?? 0) - (vehicle.currentPosition?.y ?? 0)) < 0.01
            );
            if (idx !== -1) {
              currentBlockIdx = blockIdx;
              currentActionIdx = i;
              indexFrom = idx;
              break;
            }
          }
          if (currentBlockIdx !== -1) break;
        }
        
        // Si no se encontró la posición exacta, buscar el punto más cercano
        if (currentBlockIdx === -1) {
          let minDistance = Infinity;
          for (let blockIdx = 0; blockIdx < actionBlocks.length; blockIdx++) {
            const block = actionBlocks[blockIdx];
            for (let i = 0; i < block.length; i++) {
              const action = block[i];
              if (!action.path || action.path.length < 2) continue;
              for (let j = 0; j < action.path.length; j++) {
                const point = action.path[j];
                const distance = Math.sqrt(
                  Math.pow((point.x ?? 0) - (vehicle.currentPosition?.x ?? 0), 2) +
                  Math.pow((point.y ?? 0) - (vehicle.currentPosition?.y ?? 0), 2)
                );
                if (distance < minDistance) {
                  minDistance = distance;
                  currentBlockIdx = blockIdx;
                  currentActionIdx = i;
                  indexFrom = j;
                }
              }
            }
          }
        }
        
                  // Ahora renderizar solo desde la posición actual hacia adelante
          let foundTargetOrder = false;
          
          for (let blockIdx = currentBlockIdx; blockIdx < actionBlocks.length; blockIdx++) {
            const block = actionBlocks[blockIdx];
            
            block.forEach((action, actionIdx) => {
              if (!action.path || action.path.length < 2) return;
              
              // Si hay un pedido seleccionado y ya encontramos la acción que lo atiende, parar
              if (targetOrderId && foundTargetOrder && action.type === 'SERVE' && action.orderId === targetOrderId) {
                return;
              }
              
              let pathToDraw: typeof action.path = [];
              
              if (blockIdx === currentBlockIdx) {
                // Bloque actual: solo dibujar desde la posición actual
                if (actionIdx < currentActionIdx) {
                  return; // Ya completada, no dibujar
                } else if (actionIdx === currentActionIdx) {
                  // Acción actual: solo desde la posición actual
                  pathToDraw = action.path.slice(indexFrom);
                } else {
                  // Acciones futuras del bloque actual: dibujar todo
                  pathToDraw = action.path;
                }
              } else {
                // Bloques futuros: dibujar todo
                pathToDraw = action.path;
              }
              
              // Marcar si encontramos la acción que atiende al pedido seleccionado
              if (targetOrderId && action.type === 'SERVE' && action.orderId === targetOrderId) {
                foundTargetOrder = true;
              }
            
                          if (pathToDraw.length >= 2) {
                // Verificar si la posición actual del vehículo está en esta línea
                const vehiclePosition = vehicle.currentPosition;
                const isVehicleOnThisPath = pathToDraw.some(point => 
                  Math.abs((point.x ?? 0) - (vehiclePosition?.x ?? 0)) < 0.01 &&
                  Math.abs((point.y ?? 0) - (vehiclePosition?.y ?? 0)) < 0.01
                );
                
                // Solo dibujar la línea si el vehículo está en esta ruta
                if (isVehicleOnThisPath) {
                  const screenPoints: number[] = [];
                  pathToDraw.forEach((point) => {
                    const { x, y } = mapToScreenCoords(point.x || 0, point.y || 0);
                    screenPoints.push(x, y);
                  });

                  elements.push(
                    <Line
                      key={`route-${vehicle.id}-block-${blockIdx}-action-${actionIdx}`}
                      points={screenPoints}
                      stroke="#9333ea"
                      strokeWidth={4 * (zoom / 15)}
                      dash={[4 * (zoom / 15), 2 * (zoom / 15)]}
                      lineCap="round"
                      lineJoin="round"
                      opacity={1.0}
                      shadowColor="rgba(0,0,0,0.2)"
                      shadowBlur={6}
                      shadowOffset={{ x: 1, y: 1 }}
                      shadowOpacity={0.6}
                      onClick={() => {
                        alert(`Ruta del camión: ${vehicle.id}`);
                      }}
                      cursor="pointer"
                    />
                  );
                }
              }
          });
        }
      } else {
        // Para vehículos normales o resaltados: lógica original
      blockToDraw.forEach((action, actionIdx) => {
        if (!action.path || action.path.length < 2) return;

        let pathToDraw: typeof action.path = [];
          
          // Determina qué parte del path dibujar
        if (actionIdx < currentActionIdx) {
            // Acción ya completada, no dibujar
          return;
        } else if (actionIdx === currentActionIdx) {
            // Acción actual: dibujar desde la posición actual
          pathToDraw = action.path.slice(indexFrom);
        } else {
            // Acciones futuras: dibujar todo el path
          pathToDraw = action.path;
        }

          // Lógica de visualización para vehículos normales o resaltados
          let shouldDraw = false;
          if (isHighlightedVehicle) {
            // Vehículo resaltado: mostrar todas las rutas futuras del bloque actual
            shouldDraw = true;
          } else {
            // Vehículo normal: mostrar solo la ruta actual y la siguiente
            shouldDraw = actionIdx <= currentActionIdx + 1;
          }
          
          if (!shouldDraw) return;

        if (pathToDraw.length >= 2) {
          const screenPoints: number[] = [];
          pathToDraw.forEach((point) => {
            const { x, y } = mapToScreenCoords(point.x || 0, point.y || 0);
            screenPoints.push(x, y);
          });

            // Color según tipo de acción y estado del vehículo
            let lineColor: string;
            
            // Para vehículos seleccionados o resaltados, mostrar todas las rutas en morado
            if (isHighlightedVehicle) {
              lineColor = "#9333ea"; // Morado para todas las rutas del vehículo seleccionado/resaltado
            } else {
              // Color normal según tipo de acción
          const actionColorMap: Record<string, string> = {
            DRIVE: "#4f46e5",
            SERVE: "#16a34a",
            RELOAD: "#eab308",
            REFUEL: "#f97316",
            MAINTENANCE: "#64748b",
            WAIT: "#a3a3a3",
          };
              lineColor = action.type
            ? actionColorMap[action.type] || "#4f46e5"
            : "#4f46e5";
            }

          elements.push(
            <Line
              key={`route-${vehicle.id}-action-${actionIdx}`}
              points={screenPoints}
              stroke={lineColor}
                strokeWidth={isHighlightedVehicle ? 3 * (zoom / 15) : 2 * (zoom / 15)}
              dash={[4 * (zoom / 15), 2 * (zoom / 15)]}
              lineCap="round"
              lineJoin="round"
                opacity={isHighlightedVehicle ? 0.9 : 0.7}
              shadowColor="rgba(0,0,0,0.2)"
                shadowBlur={isHighlightedVehicle ? 5 : 3}
              shadowOffset={{ x: 1, y: 1 }}
                shadowOpacity={isHighlightedVehicle ? 0.5 : 0.3}
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

      // Para determinar la dirección, usar la misma lógica de búsqueda de posición actual
      let currentAction = null;
      let currentPath = null;
      let directionIndexFrom = 0;
      
      if (isSelectedVehicle) {
        // Para vehículos seleccionados, usar la misma lógica de búsqueda que ya implementamos
        // Buscar en qué bloque y acción está actualmente el vehículo
        for (let blockIdx = 0; blockIdx < actionBlocks.length; blockIdx++) {
          const block = actionBlocks[blockIdx];
          for (let i = 0; i < block.length; i++) {
            const action = block[i];
            if (!action.path || action.path.length < 2) continue;
            const idx = action.path.findIndex(
              (p) =>
                Math.abs((p.x ?? 0) - (vehicle.currentPosition?.x ?? 0)) < 0.01 &&
                Math.abs((p.y ?? 0) - (vehicle.currentPosition?.y ?? 0)) < 0.01
            );
            if (idx !== -1) {
              currentAction = action;
              currentPath = action.path;
              directionIndexFrom = idx;
              break;
            }
          }
          if (currentAction) break;
        }
        
        // Si no se encontró la posición exacta, buscar el punto más cercano
        if (!currentAction) {
          let minDistance = Infinity;
          for (let blockIdx = 0; blockIdx < actionBlocks.length; blockIdx++) {
            const block = actionBlocks[blockIdx];
            for (let i = 0; i < block.length; i++) {
              const action = block[i];
              if (!action.path || action.path.length < 2) continue;
              for (let j = 0; j < action.path.length; j++) {
                const point = action.path[j];
                const distance = Math.sqrt(
                  Math.pow((point.x ?? 0) - (vehicle.currentPosition?.x ?? 0), 2) +
                  Math.pow((point.y ?? 0) - (vehicle.currentPosition?.y ?? 0), 2)
                );
                if (distance < minDistance) {
                  minDistance = distance;
                  currentAction = action;
                  currentPath = action.path;
                  directionIndexFrom = j;
                }
              }
            }
          }
        }
      } else {
        // Para vehículos normales, usar el bloque encontrado
        currentAction = blockToDraw?.[currentActionIdx];
        currentPath = currentAction?.path;
        directionIndexFrom = indexFrom;
      }

      if (
        Array.isArray(currentPath) &&
        currentPath.length > directionIndexFrom + 1 &&
        currentPath[directionIndexFrom] &&
        currentPath[directionIndexFrom + 1]
      ) {
        const current = currentPath[directionIndexFrom];
        const next = currentPath[directionIndexFrom + 1];

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
