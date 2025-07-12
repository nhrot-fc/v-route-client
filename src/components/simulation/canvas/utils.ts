import type { VehicleDTO, OrderDTO, Position, VehiclePlanDTO, ActionDTO } from "@/lib/api-client";
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

  // Get color based on percentage level
  let color;
  if (percentage <= 20) {
    color = "#ef4444"; // red
  } else if (percentage <= 40) {
    color = "#f97316"; // orange
  } else if (percentage <= 60) {
    color = "#eab308"; // yellow
  } else if (percentage <= 80) {
    color = "#10b981"; // green
  } else {
    color = "#3b82f6"; // blue
  }

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
  if (percentage <= 20) return "red";
  if (percentage <= 40) return "orange";
  if (percentage <= 60) return "yellow";
  if (percentage <= 80) return "green";
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
  // If points are identical, maintain previous orientation
  if (currentX === nextX && currentY === nextY) {
    return 'east'; // Default orientation
  }
  
  const deltaX = nextX - currentX;
  const deltaY = nextY - currentY;
  
  // Determine primary direction (horizontal or vertical)
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Movement is primarily horizontal
    return deltaX > 0 ? 'east' : 'west';
  } else {
    // Movement is primarily vertical
    return deltaY > 0 ? 'south' : 'north';
  }
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
  
  // Find this vehicle's plan
  const vehiclePlan = vehiclePlans.find(plan => plan.vehicleId === vehicle.id);
  if (!vehiclePlan) {
    return {
      ...vehicle,
      currentOrientation: 'east' as VehicleOrientation,
      currentOrders: []
    };
  }
  
  // Enhance the plan with associated orders
  const currentOrders: OrderDTO[] = [];
  let currentAction: ActionDTO | undefined = undefined;
  let nextPoint: Position | null = null;
  
  // Find the current action (assuming actions are sorted by time)
  for (const action of vehiclePlan.actions || []) {
    // Check if this is a move action with path and in progress
    if (typeof action.type === 'string' && action.type.toUpperCase() === 'MOVE' && action.path && action.path.length > 0) {
      if (action.progress !== undefined && action.progress < 100) {
        currentAction = action;
        
        // Find the next point in the path based on progress
        const pathIndex = Math.floor((action.path.length - 1) * (action.progress / 100));
        const nextPathIndex = Math.min(pathIndex + 1, action.path.length - 1);
        nextPoint = action.path[nextPathIndex];
        
        // If this action is serving an order, add it to currentOrders
        if (action.orderId) {
          const order = pendingOrders.find(o => o.id === action.orderId);
          if (order) {
            currentOrders.push(order);
          }
        }
        
        break;
      }
    }
  }
  
  // Calculate orientation based on current position and next point
  let orientation: VehicleOrientation = 'east'; // Default orientation
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
  
  // Find vehicles serving this order
  const servingVehicles = enhancedVehicles.filter(vehicle => 
    vehicle.currentOrders?.some(o => o.id === order.id)
  );
  
  // Calculate if the order is overdue
  const isOverdue = order.deadlineTime ? new Date(order.deadlineTime) < new Date(currentTime || "") : false;
  
  return {
    ...order,
    servingVehicles,
    isOverdue
  };
}; 