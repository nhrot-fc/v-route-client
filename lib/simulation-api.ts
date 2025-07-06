import { 
  SimulationApi as GeneratedSimulationApi, 
  Position as ApiPosition, 
  Vehicle as ApiVehicle,
  Order as ApiOrder,
  Blockage as ApiBlockage,
  Depot as ApiDepot,
  IncidentCreateDTO,
  VehicleTypeEnum,
  VehicleStatusEnum
} from '@/src/shared/api/generated/api';
import { Configuration } from '@/src/shared/api/generated/configuration';
import axios from 'axios';

// Define base URL for API
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Create API client instance
const apiConfig = new Configuration({
  basePath: BASE_URL
});
const simulationApiClient = new GeneratedSimulationApi(apiConfig);

// Default simulation ID - will be set when a simulation is created or fetched
let currentSimulationId = 'default';

// Tipos de escenarios de simulación
export enum SimulationScenarioType {
  DAILY_OPERATIONS = "DAILY_OPERATIONS",
  WEEKLY_SIMULATION = "WEEKLY_SIMULATION",
  COLLAPSE_SIMULATION = "COLLAPSE_SIMULATION"
}

// API types
export interface Position {
  x: number;
  y: number;
}

export interface Depot {
  id: string;
  position: Position;
  isMain: boolean;
  canRefuel: boolean;
  glp: {
    current: number;
    capacity: number;
  };
}

export interface Vehicle {
  id: string;
  type: string;
  status: string;
  position: Position;
  fuel: {
    current: number;
    capacity: number;
    percentage: number;
  };
  glp: {
    current: number;
    capacity: number;
    percentage: number;
  };
  currentPath?: {
    actionType: string;
    startTime: string;
    endTime: string;
    path: Position[];
  };
}

export interface Order {
  id: string;
  position: Position;
  glp?: {
    requested: number;
    remaining: number;
  };
  isOverdue: boolean;
}

export interface Blockage {
  id: string;
  startTime: string;
  endTime: string;
  positions: Position[];
}

export interface SimulationStatus {
  running: boolean;
  currentTime: string;
  elapsedTime?: string;
  vehicles?: Vehicle[];
  orders?: Order[];
  blockages?: Blockage[];
  depots?: Depot[];
}

export interface SimulationMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  status: string;
  scenarioType: SimulationScenarioType;
  startDate?: string;
  endDate?: string;
}

export interface DailyOperationsConfig {
  name: string;
  description?: string;
  scenarioType: SimulationScenarioType.DAILY_OPERATIONS;
  useRealtime: boolean;
  startDate?: string;
  startTime?: string;
}

export interface WeeklySimulationConfig {
  name: string;
  description?: string;
  scenarioType: SimulationScenarioType.WEEKLY_SIMULATION;
  startDate: string;
  ordersFile: File;
  vehiclesFile?: File | null;
  blockagesFile?: File | null;
}

export interface CollapseSimulationConfig {
  name: string;
  description?: string;
  scenarioType: SimulationScenarioType.COLLAPSE_SIMULATION;
  startDate: string;
  maxDays?: number;
  ordersFile: File;
  vehiclesFile?: File | null;
  blockagesFile?: File | null;
}

// Type union for all simulation configs
export type SimulationConfig = DailyOperationsConfig | WeeklySimulationConfig | CollapseSimulationConfig;

// Converters between API types and our internal types
const convertApiPosition = (position: ApiPosition): Position => ({
  x: position.x || 0,
  y: position.y || 0
});

const convertApiVehicle = (apiVehicle: ApiVehicle): Vehicle => {
  // Calcular porcentajes
  const fuelCapacity = apiVehicle.fuelCapacityGal || 1;
  const fuelCurrent = apiVehicle.currentFuelGal || 0;
  const fuelPercentage = (fuelCurrent / fuelCapacity) * 100;
  
  const glpCapacity = apiVehicle.glpCapacityM3 || 1;
  const glpCurrent = apiVehicle.currentGlpM3 || 0;
  const glpPercentage = (glpCurrent / glpCapacity) * 100;
  
  return {
    id: apiVehicle.id || '',
    type: apiVehicle.type?.toString() || 'UNKNOWN',
    status: apiVehicle.status?.toString() || 'UNKNOWN',
    position: apiVehicle.currentPosition ? convertApiPosition(apiVehicle.currentPosition) : { x: 0, y: 0 },
    fuel: {
      current: fuelCurrent,
      capacity: fuelCapacity,
      percentage: fuelPercentage
    },
    glp: {
      current: glpCurrent,
      capacity: glpCapacity,
      percentage: glpPercentage
    }
  };
};

const convertApiOrder = (apiOrder: ApiOrder): Order => ({
  id: apiOrder.id || '',
  position: apiOrder.position ? convertApiPosition(apiOrder.position) : { x: 0, y: 0 },
  glp: {
    requested: apiOrder.glpRequestM3 || 0,
    remaining: apiOrder.remainingGlpM3 || 0
  },
  isOverdue: apiOrder.dueTime ? new Date(apiOrder.dueTime) < new Date() : false
});

const convertApiBlockage = (apiBlockage: ApiBlockage): Blockage => ({
  id: apiBlockage.id?.toString() || '',
  startTime: apiBlockage.startTime || '',
  endTime: apiBlockage.endTime || '',
  positions: apiBlockage.lines?.map(convertApiPosition) || []
});

const convertApiDepot = (apiDepot: ApiDepot): Depot => ({
  id: apiDepot.id || '',
  position: apiDepot.position ? convertApiPosition(apiDepot.position) : { x: 0, y: 0 },
  isMain: false, // Esto debería venir de la API, pero no está en el tipo actual
  canRefuel: apiDepot.canRefuel || false,
  glp: {
    current: apiDepot.currentGlpM3 || 0,
    capacity: apiDepot.glpCapacityM3 || 0
  }
});

// API Functions
const simulationApi = {
  // Establecer la simulación actual
  setCurrentSimulation: (simulationId: string) => {
    currentSimulationId = simulationId;
  },

  // Obtener la simulación actual
  getCurrentSimulationId: () => {
    return currentSimulationId;
  },

  // Crear una nueva simulación
  createSimulation: async (config: SimulationConfig): Promise<string> => {
    try {
      // Crear la simulación básica
      const response = await simulationApiClient.createSimulation(
        config.name,
        config.description || '',
        config.scenarioType === SimulationScenarioType.DAILY_OPERATIONS && (config as DailyOperationsConfig).useRealtime
          ? undefined 
          : config.startDate
      );
      
      // Extraer el ID de la respuesta
      const responseData = response.data as any;
      const simulationId = responseData?.id;
      
      if (simulationId) {
        currentSimulationId = simulationId;
        return simulationId;
      }
      
      throw new Error('No se recibió ID de simulación');
    } catch (error) {
      console.error('Error creando simulación:', error);
      throw error;
    }
  },
  
  // Crear simulación con archivos
  createSimulationWithFiles: async (config: WeeklySimulationConfig | CollapseSimulationConfig): Promise<string> => {
    try {
      // Primero crear la simulación básica
      const simId = await simulationApi.createSimulation(config);
      
      // Luego cargar los archivos usando axios directamente ya que la API generada no tiene estos métodos
      if (config.ordersFile) {
        const formData = new FormData();
        formData.append('file', config.ordersFile);
        await axios.post(`${BASE_URL}/api/simulations/${simId}/orders/upload`, formData);
      }
      
      if (config.vehiclesFile) {
        const formData = new FormData();
        formData.append('file', config.vehiclesFile);
        await axios.post(`${BASE_URL}/api/simulations/${simId}/vehicles/upload`, formData);
      }
      
      if (config.blockagesFile) {
        const formData = new FormData();
        formData.append('file', config.blockagesFile);
        await axios.post(`${BASE_URL}/api/simulations/${simId}/blockages/upload`, formData);
      }
      
      return simId;
    } catch (error) {
      console.error('Error creando simulación con archivos:', error);
      throw error;
    }
  },

  // Obtener todas las simulaciones disponibles
  getAllSimulations: async (): Promise<SimulationMetadata[]> => {
    try {
      const response = await simulationApiClient.getAllSimulations();
      const simulations = response.data as any[];
      
      return simulations.map(sim => ({
        id: sim.id || '',
        name: sim.name || '',
        description: sim.description || '',
        createdAt: sim.createdAt || '',
        status: sim.status || '',
        scenarioType: (sim.scenarioType as SimulationScenarioType) || SimulationScenarioType.DAILY_OPERATIONS,
        startDate: sim.startDate,
        endDate: sim.endDate
      }));
    } catch (error) {
      console.error('Error obteniendo simulaciones:', error);
      return [];
    }
  },

  // Obtener el estado actual de la simulación
  getSimulationStatus: async (): Promise<SimulationStatus> => {
    try {
      const response = await simulationApiClient.getSimulationStatus(currentSimulationId);
      const status = response.data as any;
      
      return {
        running: status.running || false,
        currentTime: status.currentTime || '00:00:00',
        elapsedTime: status.elapsedTime,
        vehicles: status.vehicles?.map((v: any) => convertApiVehicle(v as ApiVehicle)),
        orders: status.orders?.map((o: any) => convertApiOrder(o as ApiOrder)),
        blockages: status.blockages?.map((b: any) => convertApiBlockage(b as ApiBlockage)),
        depots: status.depots?.map((d: any) => convertApiDepot(d as ApiDepot))
      };
    } catch (error) {
      console.error('Error obteniendo estado de simulación:', error);
      return {
        running: false,
        currentTime: '00:00:00'
      };
    }
  },

  // Iniciar la simulación
  startSimulation: async (): Promise<void> => {
    try {
      await simulationApiClient.startSimulation(currentSimulationId);
    } catch (error) {
      console.error('Error iniciando simulación:', error);
      throw error;
    }
  },

  // Pausar la simulación
  pauseSimulation: async (): Promise<void> => {
    try {
      await simulationApiClient.pauseSimulation(currentSimulationId);
    } catch (error) {
      console.error('Error pausando simulación:', error);
      throw error;
    }
  },

  // Reiniciar la simulación
  resetSimulation: async (): Promise<void> => {
    try {
      // La API generada no tiene este método, usar axios directamente
      await axios.post(`${BASE_URL}/api/simulations/${currentSimulationId}/reset`);
    } catch (error) {
      console.error('Error reiniciando simulación:', error);
      throw error;
    }
  },

  // Cambiar velocidad de la simulación
  setSimulationSpeed: async (speed: number): Promise<void> => {
    try {
      await simulationApiClient.setSimulationSpeed(currentSimulationId, speed);
    } catch (error) {
      console.error('Error cambiando velocidad de simulación:', error);
      throw error;
    }
  },

  // Obtener datos del entorno de simulación
  getEnvironment: async (): Promise<any> => {
    try {
      const response = await simulationApiClient.getEnvironment(currentSimulationId);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo entorno de simulación:', error);
      throw error;
    }
  },

  // Registrar un incidente en la simulación (avería de vehículo)
  breakdownVehicle: async ({ vehicleId, reason, estimatedRepairHours }: { vehicleId: string, reason: string, estimatedRepairHours: number }): Promise<any> => {
    try {
      const response = await simulationApiClient.simulateVehicleBreakdown(currentSimulationId, vehicleId);
      return response.data;
    } catch (error) {
      console.error('Error reportando avería de vehículo:', error);
      throw error;
    }
  },

  // Reparar un vehículo
  repairVehicle: async ({ vehicleId }: { vehicleId: string }): Promise<any> => {
    try {
      const response = await simulationApiClient.repairVehicle(currentSimulationId, vehicleId);
      return response.data;
    } catch (error) {
      console.error('Error reparando vehículo:', error);
      throw error;
    }
  },

  // Obtener vehículos de la simulación
  getVehicles: async (): Promise<Vehicle[]> => {
    try {
      const response = await simulationApiClient.getVehicles(currentSimulationId);
      return response.data.map((v: ApiVehicle) => convertApiVehicle(v));
    } catch (error) {
      console.error('Error obteniendo vehículos:', error);
      return [];
    }
  },

  // Obtener órdenes de la simulación
  getOrders: async (): Promise<Order[]> => {
    try {
      const response = await simulationApiClient.getOrders(currentSimulationId);
      return response.data.map((o: ApiOrder) => convertApiOrder(o));
    } catch (error) {
      console.error('Error obteniendo órdenes:', error);
      return [];
    }
  },

  // Obtener bloqueos de la simulación
  getBlockages: async (): Promise<Blockage[]> => {
    try {
      const response = await simulationApiClient.getBlockages(currentSimulationId);
      return response.data.map((b: ApiBlockage) => convertApiBlockage(b));
    } catch (error) {
      console.error('Error obteniendo bloqueos:', error);
      return [];
    }
  },

  // Obtener depósitos de la simulación
  getDepots: async (): Promise<Depot[]> => {
    try {
      // La API generada no tiene este método, usar axios directamente
      const response = await axios.get(`${BASE_URL}/api/simulations/${currentSimulationId}/depots`);
      return response.data.map((d: ApiDepot) => convertApiDepot(d));
    } catch (error) {
      console.error('Error obteniendo depósitos:', error);
      return [];
    }
  }
};

export default simulationApi;
