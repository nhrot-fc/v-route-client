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

  for (const action of vehiclePlan.actions || []) {
    if (action.path && action.path.length > 0) {
      currentAction = action;

      const pathIndex =
        action.progress !== undefined
          ? Math.floor((action.path.length - 1) * (action.progress / 100))
          : 0;

      const nextPathIndex = Math.min(pathIndex + 1, action.path.length - 1);
      nextPoint = action.path[nextPathIndex];

      if (action.orderId) {
        const order = pendingOrders.find(o => o.id === action.orderId);
        if (order) currentOrders.push(order);
      }

      break;
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
