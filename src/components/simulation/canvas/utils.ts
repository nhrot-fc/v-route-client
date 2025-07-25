import { type VehicleDTO, type OrderDTO, type Position, type VehiclePlanDTO, type ActionDTO, VehicleDTOStatusEnum } from "@/lib/api-client";
import type { EnhancedVehicleDTO, EnhancedOrderDTO, VehicleOrientation } from "./types";

/**
 * Creates a function that converts map coordinates to screen coordinates
 * based on zoom level and pan position
 */
export const createMapToScreenCoords = (
  zoom: number,
  panX: number,
  panY: number
) => {
  return (x: number, y: number) => {
    return {
      x: x * zoom + panX,
      y: y * zoom + panY,
    };
  };
};

/**
 * Formats a percentage value with color coding
 */
export const formatPercentageValue = (current: number, max: number) => {
  const percentage = (current / max) * 100;

  let color;
  if (percentage <= 20) color = "#ef4444";
  else if (percentage <= 40) color = "#f97316";
  else if (percentage <= 60) color = "#eab308";
  else if (percentage <= 80) color = "#10b981";
  else color = "#3b82f6";

  return {
    value: percentage,
    color,
    text: `${current.toFixed(1)}/${max.toFixed(1)}`,
    formattedPercentage: `${Math.round(percentage)}%`,
  };
};

/**
 * Calculates the distance between two points
 */
export const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

/**
 * Formats a date string to a readable format
 */
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

/**
 * Get color based on GLP percentage
 */
export const getGlpColorLevel = (current: number, capacity: number): string => {
  const percentage = (current / capacity) * 100;
  if (percentage <= 0) return "red";
  if (percentage <= 25) return "orange";
  if (percentage <= 50) return "yellow";
  if (percentage <= 75) return "green";
  return "blue";
};

/**
 * Get order size category
 */
export const getOrderSizeCategory = (volume: number): "small" | "medium" | "large" => {
  if (volume <= 5) return "small";
  if (volume <= 15) return "medium";
  return "large";
};

/**
 * Calculate vehicle orientation based on current position and next point
 * Returns one of: 'north', 'south', 'east', 'west'
 */
export const calculateVehicleOrientation = (
  currentX: number,
  currentY: number,
  nextX: number,
  nextY: number
): VehicleOrientation => {
  if (currentX === nextX && currentY === nextY) return 'east';

  const deltaX = nextX - currentX;
  const deltaY = nextY - currentY;

  return Math.abs(deltaX) > Math.abs(deltaY)
    ? (deltaX > 0 ? 'east' : 'west')
    : (deltaY > 0 ? 'south' : 'north');
};

/**
 * Enhance vehicle data with orientation and current orders
 */
export const enhanceVehicleWithPlan = (
  vehicle: VehicleDTO,
  vehiclePlans: VehiclePlanDTO[],
  pendingOrders: OrderDTO[]
): EnhancedVehicleDTO => {
  if (!vehicle || !vehiclePlans || !pendingOrders) {
    return {
      ...vehicle,
      currentOrientation: 'east' as VehicleOrientation,
      currentOrders: []
    };
  }

  const vehiclePlan = vehiclePlans.find(plan => plan.vehicleId === vehicle.id);
  if (!vehiclePlan) {
    return {
      ...vehicle,
      currentOrientation: 'east' as VehicleOrientation,
      currentOrders: []
    };
  }

  const currentOrders: OrderDTO[] = [];
  let currentAction: ActionDTO | undefined = undefined;
  let nextPoint: Position | null = null;

  // Usar currentActionIndex para identificar la acción actual
  if (vehiclePlan.currentActionIndex !== undefined && 
      vehiclePlan.currentActionIndex >= 0 && 
      vehiclePlan.actions && 
      vehiclePlan.currentActionIndex < vehiclePlan.actions.length) {
    
    currentAction = vehiclePlan.actions[vehiclePlan.currentActionIndex];
    
    // Obtener el punto siguiente basado en el progreso de la acción actual
    if (currentAction?.path && currentAction.path.length > 0) {
      const pathIndex =
        currentAction.progress !== undefined
          ? Math.floor((currentAction.path.length - 1) * (currentAction.progress))
          : 0;

      const nextPathIndex = Math.min(pathIndex + 1, currentAction.path.length - 1);
      nextPoint = currentAction.path[nextPathIndex];
    }
  }
  
  // Recopilar todas las órdenes asociadas a las acciones del plan
  for (const action of vehiclePlan.actions || []) {
    if (action.orderId) {
      const order = pendingOrders.find(o => o.id === action.orderId);
      if (order && !currentOrders.some(o => o.id === order.id)) {
        currentOrders.push(order);
      }
    }
  }

  let orientation: VehicleOrientation = 'east';
  if (nextPoint && vehicle.currentPosition) {
    orientation = calculateVehicleOrientation(
      vehicle.currentPosition.x || 0,
      vehicle.currentPosition.y || 0,
      nextPoint.x || 0,
      nextPoint.y || 0
    );
  }

  return {
    ...vehicle,
    currentPlan: {
      ...vehiclePlan,
      currentAction,
      associatedOrders: currentOrders
    },
    currentOrientation: orientation,
    currentOrders
  };
};

/**
 * Enhance orders with vehicles serving them
 */
export const enhanceOrderWithVehicles = (
  order: OrderDTO,
  enhancedVehicles: EnhancedVehicleDTO[],
  currentTime: string
): EnhancedOrderDTO => {
  if (!order) {
    return {
      ...order as OrderDTO,
      isOverdue: false,
      servingVehicles: []
    };
  }

  const servingVehicles = enhancedVehicles.filter(vehicle =>
    vehicle.currentOrders?.some(o => o.id === order.id)
  );

  const isOverdue = order.deadlineTime
    ? new Date(order.deadlineTime) < new Date(currentTime || "")
    : false;

  return {
    ...order,
    servingVehicles,
    isOverdue
  };
};

/**
 * Gets the appropriate vehicle direction based on movement vector
 * Returns one of: 'north', 'south', 'east', 'west'
 */
export const getVehicleDirection = (
  current: Position | undefined,
  next: Position | undefined
): "north" | "south" | "east" | "west" => {
  if (!current || !next) return "east"; // Default direction
  
  const dx = (next.x ?? 0) - (current.x ?? 0);
  const dy = (next.y ?? 0) - (current.y ?? 0);
  
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "east" : "west";
  } else {
    return dy > 0 ? "south" : "north";
  }
};

/**
 * Prepares vehicle data for simple rendering
 * Returns all the necessary data to render a vehicle on the map
 */
export const prepareVehicleForRendering = (
  vehicle: VehicleDTO,
  currentAction?: ActionDTO | null
) => {
  // Get vehicle position
  const position = vehicle.currentPosition || { x: 0, y: 0 };
  
  // Get GLP color based on current level - simplified to just red at 0%
  const currentGlp = vehicle.currentGlpM3 || 0;
  const capacity = vehicle.glpCapacityM3 || 1;
  
  // Color is red when GLP is 0, otherwise use the normal level gradient
  const glpColor = currentGlp <= 0 ? "red" : getGlpColorLevel(currentGlp, capacity);
  
  // Get vehicle direction
  let direction: "north" | "south" | "east" | "west" = "east"; // Default direction
  
  if (currentAction?.path && currentAction.path.length >= 2 && 
      currentAction.progress !== undefined && vehicle.currentPosition) {
    
    // Calculate current position in path based on progress
    const pathIndex = Math.floor(
      (currentAction.path.length - 1) * (currentAction.progress)
    );
    
    // If we have at least one more point ahead in the path, use it to calculate direction
    if (pathIndex < currentAction.path.length - 1) {
      const current = currentAction.path[pathIndex];
      const next = currentAction.path[pathIndex + 1];
      
      if (current && next) {
        direction = getVehicleDirection(current, next);
      }
    }
  }
  
  return {
    position,
    glpColor,
    direction,
    id: vehicle.id,
    status: vehicle.status
  };
};


export const mapVehicleStatusToColor = (status: VehicleDTOStatusEnum) => {
  switch (status) {
    case VehicleDTOStatusEnum.Available:
      return "#16a34a";
    case VehicleDTOStatusEnum.Maintenance:
      return "#f97316";
    case VehicleDTOStatusEnum.Driving:
      return "#1d4ed8";
    case VehicleDTOStatusEnum.Reloading:
      return "#eab308";
    case VehicleDTOStatusEnum.Refueling:
      return "#10b981";
    case VehicleDTOStatusEnum.Serving:
      return "#3b82f6";
    case VehicleDTOStatusEnum.Incident:
      return "#ef4444";
    case VehicleDTOStatusEnum.Idle:
      return "#6b7280";
    default:
      return "#6b7280";
  }
};

/**
 * Calculates remaining path points based on action progress
 * @param path Full action path
 * @param progress Progress percentage (0-1)
 * @returns Array of remaining path points
 */
export const calculateRemainingPathPoints = (
  path: Position[] | undefined,
  progress: number | undefined
): Position[] => {
  if (!path || path.length < 2 || progress === undefined) {
    return [];
  }

  // Calculate the index in the path based on progress
  const progressIndex = Math.floor((path.length - 1) * (progress ));
  // Return the remaining path from the current position onward
  return path.slice(Math.max(0, progressIndex));
};

/**
 * Gets style properties for a vehicle based on its status
 * @param vehicle Vehicle data
 * @param isSelected Whether the vehicle is selected
 * @param isHighlighted Whether the vehicle is highlighted
 * @returns Style properties for rendering
 */
export const getVehicleRenderStyle = (
  vehicle: VehicleDTO,
  isSelected: boolean = false,
  isHighlighted: boolean = false
) => {
  // Get status color
  const statusColor = mapVehicleStatusToColor(vehicle.status as VehicleDTOStatusEnum);
  
  // Calculate icon size based on selection/highlight state
  const iconSize = isSelected || isHighlighted ? 22 : 20;
  
  // Calculate rectangle style for selected/highlighted vehicles
  const rect = isSelected || isHighlighted ? {
    width: iconSize * 1.5,
    height: iconSize * 1.5,
    fill: "transparent",
    stroke: statusColor,
    strokeWidth: 2,
    cornerRadius: 4,
    opacity: 0.8
  } : null;
  
  return {
    iconSize,
    statusColor,
    rect
  };
};

/**
 * Get all paths for a vehicle plan
 * @param vehiclePlan The vehicle's plan
 * @returns Object containing paths categorized as completed, current and future
 */
export const getVehiclePlanPaths = (
  vehiclePlan?: VehiclePlanDTO | null
) => {
  if (!vehiclePlan?.actions || vehiclePlan.currentActionIndex === undefined) {
    return {
      completed: [],
      current: [],
      future: []
    };
  }
  
  const currentIndex = vehiclePlan.currentActionIndex;
  const currentAction = vehiclePlan.actions[currentIndex];
  
  // Completed paths (previous actions)
  const completedPaths = vehiclePlan.actions
    .slice(0, currentIndex)
    .filter(action => action.path && action.path.length > 0)
    .map(action => action.path as Position[]);
  
  // Current action path
  const currentPath = currentAction?.path || [];
  
  // Calculate remaining path based on progress
  let currentRemainingPath: Position[] = [];
  if (currentPath.length > 0 && currentAction?.progress !== undefined) {
    // Find the exact point in the path based on progress
    const progressIndex = Math.floor((currentPath.length - 1) * (currentAction.progress));
    currentRemainingPath = currentPath.slice(Math.max(0, progressIndex));
  }
  
  // Future paths (next actions) - collect all paths from future actions
  let futurePaths: Position[][] = [];
  const futureActions = vehiclePlan.actions.slice(currentIndex + 1);
  
  if (futureActions.length > 0) {
    futurePaths = futureActions
      .filter(action => action.path && action.path.length > 0)
      .map(action => action.path as Position[]);
  }
  
  return {
    completed: completedPaths,
    current: currentRemainingPath,
    future: futurePaths
  };
};

/**
 * Collects all order and depot IDs from a vehicle's plan
 * for highlighting related elements
 */
export const getRelatedElementsFromPlan = (
  vehiclePlan?: VehiclePlanDTO | null
) => {
  if (!vehiclePlan?.actions) {
    return { orderIds: [], depotIds: [] };
  }
  
  const orderIds = vehiclePlan.actions
    .filter(action => action.orderId)
    .map(action => action.orderId as string)
    .filter(Boolean);
  
  const depotIds = vehiclePlan.actions
    .filter(action => action.depotId)
    .map(action => action.depotId as string)
    .filter(Boolean);
  
  return { orderIds, depotIds };
};