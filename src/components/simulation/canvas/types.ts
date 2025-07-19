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