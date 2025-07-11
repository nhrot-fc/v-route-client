import React from "react";
import { Group, Line, Rect } from "react-konva";
import type { SimulationStateDTO, DepotDTO, OrderDTO } from "@/lib/api-client";
import type { TooltipInfo, EnhancedTooltipInfo, RoutePoint } from "./types";
import { MapIcon } from "./map-icon";
import { ColoredText } from "./colored-text";
import { ProgressBar } from "./progress-bar";
import { getGlpColorLevel, getOrderSizeCategory } from "./utils";
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
  onOrderSelect?: (order: (OrderDTO & { isOverdue?: boolean }) | null) => void;
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
  if (simulationState.pendingOrders) {
    simulationState.pendingOrders.forEach((order, idx) => {
      const isOverdue = order.deadlineTime
        ? new Date(order.deadlineTime) <
          new Date(simulationState.currentTime || "")
        : false;
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
                data: { ...order, isOverdue },
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
              onOrderSelect({ ...order, isOverdue });
            }
          }}
          onTap={() => {
            // For touch devices
            if (onOrderSelect) {
              onOrderSelect({ ...order, isOverdue });
            }
          }}
        >
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
                  indexNumber: index + 1,
                  capacityM3: 160,
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
  if (selectedVehicleId && simulationState.vehicles) {
    const selectedVehicle = simulationState.vehicles.find(v => v.id === selectedVehicleId);
    
    if (selectedVehicle && selectedVehicle.currentPosition) {
      // Generate mock route points for the selected vehicle
      // In a real implementation, this would come from the API
      const routePoints = generateMockRoutePoints(
        selectedVehicleId,
        selectedVehicle.currentPosition.x || 0,
        selectedVehicle.currentPosition.y || 0
      );
      
      // Convert route points to screen coordinates
      const screenPoints: number[] = [];
      routePoints.forEach(point => {
        const { x, y } = mapToScreenCoords(point.x, point.y);
        screenPoints.push(x, y);
      });
      
      // Draw the route line
      if (screenPoints.length >= 4) {
        elements.push(
          <Line
            key={`route-${selectedVehicleId}`}
            points={screenPoints}
            stroke="#4f46e5" // Indigo color for route
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
        
        // Draw route points
        routePoints.forEach((point, idx) => {
          if (idx === 0) return; // Skip the first point (current position)
          
          const { x, y } = mapToScreenCoords(point.x, point.y);
          elements.push(
            <Group key={`route-point-${selectedVehicleId}-${idx}`} x={x} y={y}>
              <Rect
                x={-3 * (zoom / 15)}
                y={-3 * (zoom / 15)}
                width={6 * (zoom / 15)}
                height={6 * (zoom / 15)}
                fill="#4f46e5"
                cornerRadius={1}
              />
            </Group>
          );
        });
      }
    }
  }
  
  // Draw vehicles
  if (simulationState.vehicles) {
    simulationState.vehicles.forEach((vehicle, index) => {
      const x = vehicle.currentPosition?.x || 0;
      const y = vehicle.currentPosition?.y || 0;
      const { x: screenX, y: screenY } = mapToScreenCoords(x, y);
      const vehicleSize = 20 * (zoom / 15);
      
      // Determine truck direction
      let direction = "east"; // Default
      const vehicleId = parseInt(
        (vehicle.id || "").replace(/\D/g, "") || "0"
      );
      
      if (vehicleId % 4 === 0) direction = "north";
      else if (vehicleId % 4 === 1) direction = "east";
      else if (vehicleId % 4 === 2) direction = "south";
      else direction = "west";
      
      // Use color based on GLP level
      const glpColor = getGlpColorLevel(
        vehicle.currentGlpM3 || 0,
        vehicle.glpCapacityM3 || 1
      );
      
      // Check if this vehicle is selected
      const isSelected = selectedVehicleId === vehicle.id;
      
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
              x={-vehicleSize/1.5}
              y={-vehicleSize/1.5}
              width={vehicleSize * 1.3}
              height={vehicleSize * 1.3}
              fill="rgba(79, 70, 229, 0.2)"
              stroke="#4f46e5"
              strokeWidth={2}
              cornerRadius={vehicleSize / 4}
            />
          )}
          
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
                width={70 * (zoom / 15)}
                height={16 * (zoom / 15)}
                fill="rgba(255, 255, 255, 0.7)"
                cornerRadius={3}
              />
              <ColoredText
                x={vehicleSize + 4 * (zoom / 15)}
                y={-6 * (zoom / 15)}
                text={`${vehicle.id || "N/A"}`}
                fontSize={9 * (zoom / 15)}
                fontStyle="bold"
                color="#000000"
              />
              
              {/* Vehicle type indicator with colored background */}
              {(() => {
                // Get color based on vehicle type
                let typeColor = "#10b981"; // Default green
                if (vehicle.type === "TA")
                  typeColor = "#ef4444"; // Red
                else if (vehicle.type === "TB")
                  typeColor = "#3b82f6"; // Blue
                else if (vehicle.type === "TC")
                  typeColor = "#f59e0b"; // Amber
                else if (vehicle.type === "TD") typeColor = "#8b5cf6"; // Purple
                
                const vehicleText = vehicle.id || "N/A";
                const textWidth = vehicleText.length * 6 * (zoom / 15);
                const typeX = vehicleSize + textWidth + 8 * (zoom / 15);
                
                return (
                  <>
                    <Rect
                      x={typeX}
                      y={-7 * (zoom / 15)}
                      width={16 * (zoom / 15)}
                      height={14 * (zoom / 15)}
                      fill={typeColor}
                      cornerRadius={3}
                    />
                    <ColoredText
                      x={typeX}
                      y={-6 * (zoom / 15)}
                      width={16 * (zoom / 15)}
                      text={vehicle.type || ""}
                      fontSize={8 * (zoom / 15)}
                      fontStyle="bold"
                      color="#ffffff"
                      align="center"
                    />
                  </>
                );
              })()}
              
              {/* GLP bar with color */}
              {(() => {
                const barWidth = 20 * (zoom / 15);
                const barHeight = 3 * (zoom / 15);
                const barSpacing = 5 * (zoom / 15);
                const glpPercentage =
                  (vehicle.currentGlpM3 || 0) / (vehicle.glpCapacityM3 || 1);
                
                const barColor = glpColor === "red"
                  ? "#ef4444"
                  : glpColor === "orange"
                    ? "#f97316"
                    : glpColor === "yellow"
                      ? "#eab308"
                      : glpColor === "green"
                        ? "#10b981"
                        : "#3b82f6";
                
                return (
                  <ProgressBar
                    x={-barWidth / 2}
                    y={vehicleSize + barSpacing}
                    width={barWidth}
                    height={barHeight}
                    percentage={glpPercentage}
                    color={barColor}
                  />
                );
              })()}
              
              {/* Fuel bar with color */}
              {(() => {
                const barWidth = 20 * (zoom / 15);
                const barHeight = 3 * (zoom / 15);
                const barSpacing = 5 * (zoom / 15);
                const fuelPercentage =
                  (vehicle.currentFuelGal || 0) /
                  (vehicle.fuelCapacityGal || 25);
                
                const barColor = fuelPercentage <= 0.2
                  ? "#ef4444"
                  : fuelPercentage <= 0.4
                    ? "#f97316"
                    : fuelPercentage <= 0.6
                      ? "#eab308"
                      : "#10b981";
                
                return (
                  <ProgressBar
                    x={-barWidth / 2}
                    y={vehicleSize + barSpacing + barHeight + 1}
                    width={barWidth}
                    height={barHeight}
                    percentage={fuelPercentage}
                    color={barColor}
                  />
                );
              })()}
            </>
          )}
        </Group>
      );
    });
  }
  
  return elements;
}; 