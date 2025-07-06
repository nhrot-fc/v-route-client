import { Position, Order } from "@/lib/api-client";

export type MapElement = {
  id: string
  type: "vehicle" | "warehouse" | "customer" | "mainWarehouse" | "package" | "blockedRoad"
  x: number
  y: number
  label: string
  status?: string
  direction?: "north" | "south" | "east" | "west"
  details?: string
}

export type ResourceLevel = {
  current: number
  capacity: number
  percentage: number
}

export type VehicleData = {
  id: string
  type: string
  status: string
  position: Position
  fuel: ResourceLevel
  glp: ResourceLevel
  currentPath?: {
    actionType: string
    startTime: string
    endTime: string
    path: Position[]
  }
}

export type BlockageData = {
  id: string
  startTime: string
  endTime: string
  positions: Position[]
}

export type DepotData = {
  id: string
  position: Position
  isMain: boolean
  canRefuel: boolean
  glp: {
    current: number
    capacity: number
  }
}

export type EnvironmentData = {
  timestamp: string
  simulationTime: string
  currentTime?: string
  running?: boolean
  vehicles: VehicleData[]
  orders: Order[]
  blockages: BlockageData[]
  depots: DepotData[]
}

export type Route = {
  id: string
  from: string
  to: string
  color: string
  waypoints?: { x: number, y: number }[]
}

export type BlockedRoad = {
  id: string
  from: { x: number, y: number }
  to: { x: number, y: number }
  label: string
  details: string
}

export type SlideVehicleInfo = {
  id: string;
  type: string;
  status: string;
  fuel: ResourceLevel;
  glp: ResourceLevel;
  position: Position;
  label: string;
  statusLabel: string;
  color: string;
  assignedOrders: Order[];
}; 