import {
  type SimulationStateDTO,
  type VehicleDTO,
  type OrderDTO,
  type DepotDTO,
} from "@/lib/api-client";

// Map constants
export const MAP_X_MIN = 0;
export const MAP_X_MAX = 70;
export const MAP_Y_MIN = 0;
export const MAP_Y_MAX = 50;

export interface SimulationCanvasProps {
  simulationState: SimulationStateDTO | null;
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
  data: DepotDTO & { indexNumber?: number; capacityM3?: number };
}

export interface OrderMapElement extends BaseMapElement {
  type: "order";
  data: OrderDTO & { isOverdue?: boolean };
}

export interface VehicleMapElement extends BaseMapElement {
  type: "vehicle";
  data: VehicleDTO;
}

export interface BlockageMapElement extends BaseMapElement {
  type: "blockage";
  data: {
    startTime?: string;
    endTime?: string;
    lines?: Array<{ x?: number; y?: number }>;
  };
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
}

// Vehicle route for visualization
export interface VehicleRoute {
  vehicleId: string;
  points: RoutePoint[];
  completed?: boolean;
} 