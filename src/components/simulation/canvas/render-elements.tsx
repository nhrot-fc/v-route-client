  import React from "react";
  import { Group, Line, Rect } from "react-konva";
  import type { SimulationStateDTO, DepotDTO } from "@/lib/api-client";
  import type { 
    TooltipInfo, 
    EnhancedTooltipInfo, 
    RoutePoint, 
    EnhancedOrderDTO
  } from "./types";
  import { MapIcon } from "./map-icon";
  import { ColoredText } from "./colored-text";
  import { ProgressBar } from "./progress-bar";
  import { 
    getGlpColorLevel, 
    getOrderSizeCategory, 
    enhanceVehicleWithPlan, 
    enhanceOrderWithVehicles 
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
    onVehicleSelect?: (vehicleId: string | null) => void;
    onDepotSelect?: (depot: DepotDTO | null, isMainDepot: boolean, index?: number) => void;
    onOrderSelect?: (order: EnhancedOrderDTO | null) => void;
  }

  /**
   * Generate mock route points for a vehicle
   * This is a placeholder until actual route data is available from the API
   */
  const generateMockRoutePoints = (
    vehicleId: string,
    currentX: number,
    currentY: number
  ): RoutePoint[] => {
    // Simple algorithm to generate some points based on vehicle ID
    const vehicleNum = parseInt(vehicleId.replace(/\D/g, "") || "1");
    const points: RoutePoint[] = [];
    
    // Add current position
    points.push({ x: currentX, y: currentY });
    
    // Generate some points in a pattern based on vehicle ID
    const direction = vehicleNum % 4;
    const steps = 3 + (vehicleNum % 3);
    
    let lastX = currentX;
    let lastY = currentY;
    
    for (let i = 0; i < steps; i++) {
      // Calculate next point based on direction
      switch (direction) {
        case 0: // North
          lastY += 2 + (i * 0.5);
          break;
        case 1: // East
          lastX += 2 + (i * 0.5);
          break;
        case 2: // South
          lastY -= 2 + (i * 0.5);
          break;
        case 3: // West
          lastX -= 2 + (i * 0.5);
          break;
      }
      
      // Add point if within map bounds
      if (
        lastX >= 0 && lastX <= 70 &&
        lastY >= 0 && lastY <= 50
      ) {
        points.push({ x: lastX, y: lastY });
      }
    }
    
    return points;
  };

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
    onVehicleSelect,
    onDepotSelect,
    onOrderSelect,
  }: RenderElementsProps) => {
    if (!simulationState) return null;
    
    const elements: React.ReactNode[] = [];
    
    // Process vehicles first to get enhanced data with orientations and current orders
    const enhancedVehicles = (simulationState.vehicles || []).map(vehicle => 
      enhanceVehicleWithPlan(
        vehicle, 
        simulationState.currentVehiclePlans || [], 
        simulationState.pendingOrders || []
      )
    );
    
    // Process orders with vehicle assignments
    const enhancedOrders = (simulationState.pendingOrders || []).map(order => 
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
                onMouseLeave={() => handleElementHover(null, null, setTooltip, setEnhancedTooltip)}
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
        const isOverdue = order.isOverdue || false;
        const iconColor = order.delivered
          ? "green"
          : isOverdue
            ? "red"
            : "blue";
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
        if (volume <= 3) volumeColor = "#10b981"; // green - small
        else if (volume <= 10) volumeColor = "#eab308"; // yellow - medium
        else volumeColor = "#f97316"; // orange - large
        
        // Highlight orders if they are being served by vehicles
        const isBeingServed = order.servingVehicles && order.servingVehicles.length > 0;
        
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
            onMouseLeave={() => handleElementHover(null, null, setTooltip, setEnhancedTooltip)}
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
            {/* Add highlight if being served */}
            {isBeingServed && (
              <Rect
                x={-iconSize - 3}
                y={-iconSize - 3}
                width={iconSize * 2 + 6}
                height={iconSize * 2 + 6}
                fill="transparent"
                stroke="#4ade80"
                strokeWidth={2}
                cornerRadius={4}
              />
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
                {/* Order ID with background */}
                <Rect
                  x={iconSize}
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
          onMouseLeave={() => handleElementHover(null, null, setTooltip, setEnhancedTooltip)}
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
            onMouseLeave={() => handleElementHover(null, null, setTooltip, setEnhancedTooltip)}
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
          </Group>
        );
      });
    }
    
    // Draw vehicle routes if a vehicle is selected
    // Draw vehicle routes for all vehicles
// Dibujar rutas de todos los vehículos
if (enhancedVehicles) {
  enhancedVehicles.forEach((vehicle) => {
    if (!vehicle.currentPosition) return;

    const currentAction = vehicle.currentPlan?.currentAction;
    let routePoints: RoutePoint[] = [];

    console.log("vehicle", vehicle.id, "currentAction", currentAction);

    

    if (currentAction && currentAction.path && currentAction.path.length > 0) {
      console.log(`Vehículo ${vehicle.id} path:`, currentAction.path);

      const isSamePosition = (a: {x: number, y: number}, b: {x: number, y: number}) =>
        Math.abs(a.x - b.x) < 0.01 && Math.abs(a.y - b.y) < 0.01;

      const indexFrom = currentAction.path.findIndex((p) =>
        isSamePosition(
          { x: p.x ?? 0, y: p.y ?? 0 },
          {
            x: vehicle.currentPosition?.x ?? 0,
            y: vehicle.currentPosition?.y ?? 0,
          }
        )
      );

      const remainingPath = currentAction.path.slice(indexFrom >= 0 ? indexFrom : 0);

      routePoints = remainingPath.map((point, idx, arr) => ({
        x: point.x || 0,
        y: point.y || 0,
        actionType: idx === 0 ? 'start' :
                    idx === arr.length - 1 ? 'end' :
                    'path'
      }));
    }

    if (routePoints.length >= 2) {
      const screenPoints: number[] = [];
      routePoints.forEach(point => {
        const { x, y } = mapToScreenCoords(point.x, point.y);
        screenPoints.push(x, y);
      });

      elements.push(
        <Line
          key={`route-${vehicle.id}`}
          points={screenPoints}
          stroke="#4f46e5"
          strokeWidth={2 * (zoom / 15)}
          dash={[4 * (zoom / 15), 2 * (zoom / 15)]}
          lineCap="round"
          lineJoin="round"
          opacity={0.7}
          shadowColor="rgba(0,0,0,0.2)"
          shadowBlur={3}
          shadowOffset={{ x: 1, y: 1 }}
          shadowOpacity={0.3}
        />
      );

      routePoints.forEach((point, idx) => {
        if (idx === 0) return;

        const { x, y } = mapToScreenCoords(point.x, point.y);
        const pointColor = point.actionType === 'end' ? '#f43f5e' :
                           point.actionType === 'start' ? '#10b981' :
                           '#4f46e5';

        elements.push(
          <Group key={`route-point-${vehicle.id}-${idx}`} x={x} y={y}>
            <Rect
              x={-3 * (zoom / 15)}
              y={-3 * (zoom / 15)}
              width={6 * (zoom / 15)}
              height={6 * (zoom / 15)}
              fill={pointColor}
              cornerRadius={1}
            />
          </Group>
        );
      });
    }
  });
}


    
    // Draw vehicles
    if (enhancedVehicles) {
      enhancedVehicles.forEach((vehicle, index) => {
        const x = vehicle.currentPosition?.x || 0;
        const y = vehicle.currentPosition?.y || 0;
        const { x: screenX, y: screenY } = mapToScreenCoords(x, y);
        const vehicleSize = 20 * (zoom / 15);
        
        // Get vehicle orientation from enhanced data
        const direction = vehicle.currentOrientation || "east";
        
        // Use color based on GLP level
        const glpColor = getGlpColorLevel(
          vehicle.currentGlpM3 || 0,
          vehicle.glpCapacityM3 || 1
        );
        
        // Check if this vehicle is selected
        const isSelected = selectedVehicleId === vehicle.id;
        
        // Check if this vehicle has active orders
        const hasActiveOrders = vehicle.currentOrders && vehicle.currentOrders.length > 0;
        
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
            onMouseLeave={() => handleElementHover(null, null, setTooltip, setEnhancedTooltip)}
            onClick={() => {
              // Toggle selection
              if (onVehicleSelect) {
                onVehicleSelect(isSelected ? null : vehicle.id || null);
              }
            }}
            onTap={() => {
              // For touch devices
              if (onVehicleSelect) {
                onVehicleSelect(isSelected ? null : vehicle.id || null);
              }
            }}
          >
            {/* Selection indicator */}
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
            
            {/* Vehicle icon with proper orientation */}
            <MapIcon
              src={`/icons/colored/${glpColor}/truck-${direction}.svg`}
              x={0}
              y={0}
              size={vehicleSize}
            />
            
            {/* Only show if not being hovered */}
            {!tooltip.show && (
              <>
                {/* Vehicle ID with background */}
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
                
                {/* GLP indicator with background */}
                <ProgressBar
                  x={-vehicleSize / 2}
                  y={vehicleSize + 3 * (zoom / 15)}
                  width={vehicleSize}
                  height={4 * (zoom / 15)}
                  value={(vehicle.currentGlpM3 || 0) / (vehicle.glpCapacityM3 || 1)}
                  color={glpColor === "red" ? "#dc2626" : "#10b981"}
                  background="rgba(0, 0, 0, 0.2)"
                  strokeWidth={0.5}
                />
                
                {/* Order count indicator if carrying orders */}
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