import {
  type SimulationStateDTO,
  type SimulationDTO,
  type VehicleDTO,
  type OrderDTO,
  type DepotDTO,
  type BlockageDTO,
  type ActionDTO,
  type VehiclePlanDTO,
} from "@/lib/api-client";

// Map constants
export const MAP_X_MIN = 0;
export const MAP_X_MAX = 70;
export const MAP_Y_MIN = 0;
export const MAP_Y_MAX = 50;

// Orientation types for vehicle display
export type VehicleOrientation = 'north' | 'south' | 'east' | 'west';

// Vehicle plan with associated orders
export interface EnhancedVehiclePlanDTO extends VehiclePlanDTO {
  associatedOrders?: OrderDTO[];
  currentAction?: ActionDTO | undefined;
  currentOrientation?: VehicleOrientation;
}

// Enhanced vehicle with current plan information
export interface EnhancedVehicleDTO extends VehicleDTO {
  currentPlan?: EnhancedVehiclePlanDTO;
  currentOrientation?: VehicleOrientation;
  currentOrders?: OrderDTO[];
}

// Enhanced order with vehicles serving it
export interface EnhancedOrderDTO extends OrderDTO {
  isOverdue?: boolean;
  servingVehicles?: EnhancedVehicleDTO[];
}

export interface SimulationCanvasProps {
  simulationId?: string;
  simulationState: SimulationStateDTO | null;
  simulationInfo?: SimulationDTO | null;
}

export interface TooltipInfo {
  show: boolean;
  x: number;
  y: number;
  content: string;
}

export interface EnhancedTooltipInfo {
  show: boolean;
  x: number;
  y: number;
  title: string;
  color: string;
  details: Array<{label: string; value: string; color?: string}>;
}

// Data formatting helpers
export interface FormattedValue {
  value: string;
  color: string;
  percentage?: number;
}

// Define types for map elements
export interface BaseMapElement {
  type: "depot" | "auxDepot" | "order" | "vehicle" | "blockage";
  x: number;
  y: number;
  radius: number;
}

export interface DepotMapElement extends BaseMapElement {
  type: "depot";
  data: DepotDTO;
}

export interface AuxDepotMapElement extends BaseMapElement {
  type: "auxDepot";
  data: DepotDTO;
}

export interface OrderMapElement extends BaseMapElement {
  type: "order";
  data: EnhancedOrderDTO;
}

export interface VehicleMapElement extends BaseMapElement {
  type: "vehicle";
  data: EnhancedVehicleDTO;
  orientation?: VehicleOrientation;
}

export interface BlockageMapElement extends BaseMapElement {
  type: "blockage";
  data: BlockageDTO;
}

export type MapElement =
  | DepotMapElement
  | AuxDepotMapElement
  | OrderMapElement
  | VehicleMapElement
  | BlockageMapElement;
  
// Route point for vehicle path visualization
export interface RoutePoint {
  x: number;
  y: number;
  timestamp?: string;
  actionType?: string;
}

// Vehicle route for visualization
export interface VehicleRoute {
  vehicleId: string;
  points: RoutePoint[];
  completed?: boolean;
  ordersServed?: string[];
  depotsVisited?: string[];
}




// SimulationStateDTO -> extract vehicles, orders, ... -> transform to EnhancedVehicleDTO, EnhancedOrderDTO, etc.
// To enhance the simulation state with additional information from the current VehiclePlanDTO and other DTOs

export interface EnhancedSimulationStateDTO {
  vehicles: EnhancedVehicleDTO[];
  orders: EnhancedOrderDTO[];
  depots: DepotDTO[];
  blockages: BlockageDTO[];
}

/**
 * Determines the vehicle orientation based on path segments in the current action
 * @param action Current action with path information
 * @returns The calculated orientation or 'west' as default
 */
export const determineVehicleOrientation = (action?: ActionDTO): VehicleOrientation => {
  if (!action?.path || action.path.length < 2) {
    return 'west'; // Default orientation
  }

  // Get the last two positions to determine direction of movement
  const lastPosition = action.path[action.path.length - 1];
  const previousPosition = action.path[action.path.length - 2];

  // Calculate the difference in x and y coordinates
  // Check if coordinates are defined, default to 0 if not
  const dx = (lastPosition?.x ?? 0) - (previousPosition?.x ?? 0);
  const dy = (lastPosition?.y ?? 0) - (previousPosition?.y ?? 0);

  // Determine orientation based on the largest directional change
  if (Math.abs(dx) > Math.abs(dy)) {
    // Movement is primarily horizontal
    return dx > 0 ? 'east' : 'west';
  } else {
    // Movement is primarily vertical
    return dy > 0 ? 'south' : 'north';
  }
};

/**
 * Transforms SimulationStateDTO into EnhancedSimulationStateDTO with additional derived information
 * @param state The original simulation state from the websocket
 * @returns Enhanced simulation state with additional information
 */
export const simulationStateToEnhanced = (
  state: SimulationStateDTO
): EnhancedSimulationStateDTO => {
  if (!state) {
    return {
      vehicles: [],
      orders: [],
      depots: [],
      blockages: [],
    };
  }

  // Process vehicle plans and enhance with additional information
  const currentPlans: VehiclePlanDTO[] = state.currentVehiclePlans || [];
  const enhancedPlans = currentPlans.map(plan => {
    // Find the current action based on the currentActionIndex
    const currentActionIndex = plan.currentActionIndex || 0;
    const currentAction = plan.actions && plan.actions.length > currentActionIndex 
      ? plan.actions[currentActionIndex]
      : undefined;
    
    // Find orders associated with this plan
    const associatedOrderIds = plan.actions?.filter(a => a.orderId)
      .map(a => a.orderId) || [];
    const associatedOrders = state.pendingOrders?.filter(
      order => associatedOrderIds.includes(order.id || '')
    );
    
    return {
      ...plan,
      currentAction,
      currentOrientation: determineVehicleOrientation(currentAction),
      associatedOrders,
    } as EnhancedVehiclePlanDTO;
  });

  // Process vehicles and enhance with plan information
  const enhancedVehicles: EnhancedVehicleDTO[] = [];
  
  // First handle vehicles with plans
  state.vehicles?.forEach(vehicle => {
    const currentPlan = enhancedPlans.find(plan => plan.vehicleId === vehicle.id);
    if (currentPlan) {
      enhancedVehicles.push({
        ...vehicle,
        currentPlan,
        currentOrientation: currentPlan.currentOrientation || 'west',
        currentOrders: currentPlan.associatedOrders || [],
      });
    } else {
      // Include vehicles without plans
      enhancedVehicles.push({
        ...vehicle,
        currentOrientation: 'west', // Default orientation
      });
    }
  });

  // Process orders and enhance with serving vehicles information
  const enhancedOrders: EnhancedOrderDTO[] = [];
  
  state.pendingOrders?.forEach(order => {
    // Find vehicles serving this order
    const servingVehicles = enhancedVehicles.filter(
      vehicle => vehicle.currentOrders?.some(o => o.id === order.id)
    );
    
    // Check if the order is overdue
    const currentTimeMs = state.currentTime ? new Date(state.currentTime).getTime() : Date.now();
    const deadlineTimeMs = order.deadlineTime ? new Date(order.deadlineTime).getTime() : Infinity;
    const isOverdue = currentTimeMs > deadlineTimeMs;

    enhancedOrders.push({
      ...order,
      servingVehicles,
      isOverdue,
    });
  });

  // Process depots (main depot and auxiliary depots)
  const depots: DepotDTO[] = [];
  if (state.mainDepot) {
    depots.push(state.mainDepot);
  }
  if (state.auxDepots) {
    depots.push(...state.auxDepots);
  }

  return {
    vehicles: enhancedVehicles,
    orders: enhancedOrders,
    depots,
    blockages: state.activeBlockages || [],
  };
}
