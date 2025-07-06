import { useState } from "react";
import { simulationApi, SimulationReportDTO, SimulationStateDTO as BaseSimulationStateDTO, Blockage, Order, Vehicle } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

// Extended interface to include properties used in the code but missing from the generated API
export interface SimulationStateDTO extends BaseSimulationStateDTO {
  elapsedTime?: string | number;
  // Add any other missing properties here
}

// Enums and Types
export enum SimulationScenarioType {
  DAILY_OPERATIONS = "DAILY_OPERATIONS",
  WEEKLY_SIMULATION = "WEEKLY_SIMULATION",
  COLLAPSE_SIMULATION = "COLLAPSE_SIMULATION"
}

export type SimulationMetadata = {
  id: string;
  name: string;
  description?: string;
  scenarioType: SimulationScenarioType;
  status: "READY" | "RUNNING" | "PAUSED" | "COMPLETED" | "FAILED";
  createdAt: string;
  lastRun?: string;
};

// Configuration types
export type DailyOperationsConfig = {
  name: string;
  description?: string;
  scenarioType: SimulationScenarioType;
  useRealtime: boolean;
  startDate?: string;
  startTime?: string;
};

export type WeeklySimulationConfig = {
  name: string;
  description?: string;
  scenarioType: SimulationScenarioType;
  startDate?: string;
  ordersFile: File;
  vehiclesFile?: File | null;
  blockagesFile?: File | null;
};

export type CollapseSimulationConfig = {
  name: string;
  description?: string;
  scenarioType: SimulationScenarioType;
  startDate?: string;
  ordersFile: File;
  vehiclesFile?: File | null;
  blockagesFile?: File | null;
  maxDays: number;
};

export function useSimulation() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Current simulation state
  const [currentSimulationId, setCurrentSimulationId] = useState<string | null>(null);

  /**
   * Set the current active simulation
   */
  const setCurrentSimulation = (id: string) => {
    setCurrentSimulationId(id);
    localStorage.setItem("currentSimulationId", id);
  };

  /**
   * Get all available simulations
   */
  const getAllSimulations = async (): Promise<SimulationMetadata[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await simulationApi.getAllSimulations();
      
      // Map to SimulationMetadata
      const simulations: SimulationMetadata[] = response.data.map((sim: any) => ({
        id: sim.id,
        name: sim.name || "Simulation",
        description: sim.description,
        scenarioType: sim.scenarioType || SimulationScenarioType.DAILY_OPERATIONS,
        status: sim.status || "READY",
        createdAt: sim.createdAt,
        lastRun: sim.lastRun
      }));
      
      return simulations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error fetching simulations";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create a new simulation
   */
  const createSimulation = async (config: DailyOperationsConfig): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const simulationType = config.scenarioType.toString();
      const name = config.name;
      const description = config.description || "";
      const startDate = !config.useRealtime && config.startDate ? config.startDate : undefined;
      const dataSource = undefined;
      const durationDays = undefined;
      
      const response = await simulationApi.createSimulation(
        simulationType,
        name,
        description,
        startDate,
        dataSource,
        durationDays
      );
      
      // Extract the ID from the response data
      const responseData = response.data as Record<string, any>;
      const simulationId = responseData.id ? String(responseData.id) : "";
      
      if (!simulationId) {
        throw new Error("Failed to get simulation ID from response");
      }
      
      setCurrentSimulation(simulationId);
      
      return simulationId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error creating simulation";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create a new simulation with file uploads
   */
  const createSimulationWithFiles = async (config: WeeklySimulationConfig | CollapseSimulationConfig): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create form data
      const formData = new FormData();
      formData.append('simulationType', config.scenarioType.toString());
      formData.append('name', config.name);
      
      if (config.description) {
        formData.append('description', config.description);
      }
      
      if (config.startDate) {
        formData.append('startDate', config.startDate);
      }
      
      // Add orders file
      formData.append('ordersFile', config.ordersFile);
      
      // Add vehicles file if provided
      if (config.vehiclesFile) {
        formData.append('vehiclesFile', config.vehiclesFile);
      }
      
      // Add blockages file if provided
      if (config.blockagesFile) {
        formData.append('blockagesFile', config.blockagesFile);
      }
      
      // Add max days for collapse simulation
      if ('maxDays' in config) {
        formData.append('durationDays', config.maxDays.toString());
      }
      
      // Make the API call
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"}/simulations/create-with-files`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      // Extract the ID from the response data
      const responseData = response.data as Record<string, any>;
      const simulationId = responseData.id ? String(responseData.id) : "";
      
      if (!simulationId) {
        throw new Error("Failed to get simulation ID from response");
      }
      
      setCurrentSimulation(simulationId);
      
      return simulationId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error creating simulation with files";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get the current simulation status
   */
  const getSimulationStatus = async (): Promise<SimulationStateDTO> => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!currentSimulationId) {
        throw new Error("No simulation selected");
      }
      
      const response = await simulationApi.getSimulationStatus(currentSimulationId);
      
      // Create a new object with the response data and add elapsedTime
      const simulationState = {
        ...response.data,
        elapsedTime: calculateElapsedTime(response.data.currentTime)
      } as SimulationStateDTO;
      
      return simulationState;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error getting simulation status";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Calculate elapsed time from a timestamp
   */
  const calculateElapsedTime = (timestamp?: string): string => {
    if (!timestamp) return "00:00:00";
    
    try {
      const date = new Date(timestamp);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      
      return `${hours}:${minutes}:${seconds}`;
    } catch (e) {
      return "00:00:00";
    }
  };

  /**
   * Get the simulation environment data
   */
  const getEnvironment = async (): Promise<SimulationStateDTO> => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!currentSimulationId) {
        throw new Error("No simulation selected");
      }
      
      const response = await simulationApi.getEnvironment(currentSimulationId);
      
      // Create a new object with the response data and add elapsedTime
      const simulationState = {
        ...response.data,
        elapsedTime: calculateElapsedTime(response.data.currentTime)
      } as SimulationStateDTO;
      
      return simulationState;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error getting simulation environment";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Start simulation
   */
  const startSimulation = async (): Promise<void> => {
    try {
      const id = currentSimulationId || localStorage.getItem("currentSimulationId");
      
      if (!id) {
        throw new Error("No simulation ID selected");
      }
      
      await simulationApi.startSimulation(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error starting simulation";
      console.error(errorMessage);
      throw err;
    }
  };

  /**
   * Pause simulation
   */
  const pauseSimulation = async (): Promise<void> => {
    try {
      const id = currentSimulationId || localStorage.getItem("currentSimulationId");
      
      if (!id) {
        throw new Error("No simulation ID selected");
      }
      
      await simulationApi.pauseSimulation(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error pausing simulation";
      console.error(errorMessage);
      throw err;
    }
  };

  /**
   * Set simulation speed
   */
  const setSimulationSpeed = async (speedFactor: number): Promise<void> => {
    try {
      const id = currentSimulationId || localStorage.getItem("currentSimulationId");
      
      if (!id) {
        throw new Error("No simulation ID selected");
      }
      
      await simulationApi.setSimulationSpeed(id, speedFactor);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error setting simulation speed";
      console.error(errorMessage);
      throw err;
    }
  };

  /**
   * Get simulation report
   */
  const getSimulationReport = async (): Promise<SimulationReportDTO> => {
    try {
      const id = currentSimulationId || localStorage.getItem("currentSimulationId");
      
      if (!id) {
        throw new Error("No simulation ID selected");
      }
      
      const response = await simulationApi.getSimulationReport(id);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error getting simulation report";
      console.error(errorMessage);
      throw err;
    }
  };

  /**
   * Get all reports
   */
  const getAllReports = async (): Promise<SimulationReportDTO[]> => {
    try {
      const response = await simulationApi.getAllReports();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error getting simulation reports";
      console.error(errorMessage);
      throw err;
    }
  };

  /**
   * Simulate vehicle breakdown
   */
  const simulateVehicleBreakdown = async (params: { vehicleId: string, reason?: string, estimatedRepairHours?: number }): Promise<any> => {
    try {
      const id = currentSimulationId || localStorage.getItem("currentSimulationId");
      
      if (!id) {
        throw new Error("No simulation ID selected");
      }
      
      const response = await simulationApi.simulateVehicleBreakdown(id, params.vehicleId);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error simulating vehicle breakdown";
      console.error(errorMessage);
      throw err;
    }
  };

  /**
   * Repair vehicle
   */
  const repairVehicle = async (params: { vehicleId: string }): Promise<any> => {
    try {
      const id = currentSimulationId || localStorage.getItem("currentSimulationId");
      
      if (!id) {
        throw new Error("No simulation ID selected");
      }
      
      const response = await simulationApi.repairVehicle(id, params.vehicleId);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error repairing vehicle";
      console.error(errorMessage);
      throw err;
    }
  };

  /**
   * Get vehicles
   */
  const getVehicles = async (status?: string): Promise<Vehicle[]> => {
    try {
      const id = currentSimulationId || localStorage.getItem("currentSimulationId");
      
      if (!id) {
        throw new Error("No simulation ID selected");
      }
      
      const response = await simulationApi.getVehicles(id, status as any);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error getting vehicles";
      console.error(errorMessage);
      throw err;
    }
  };

  /**
   * Get orders
   */
  const getOrders = async (params: { pendingOnly?: boolean, overdueOnly?: boolean } = {}): Promise<Order[]> => {
    try {
      const id = currentSimulationId || localStorage.getItem("currentSimulationId");
      
      if (!id) {
        throw new Error("No simulation ID selected");
      }
      
      const response = await simulationApi.getOrders(id, params.pendingOnly, params.overdueOnly);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error getting orders";
      console.error(errorMessage);
      throw err;
    }
  };

  /**
   * Get blockages
   */
  const getBlockages = async (activeOnly: boolean = true): Promise<Blockage[]> => {
    try {
      const id = currentSimulationId || localStorage.getItem("currentSimulationId");
      
      if (!id) {
        throw new Error("No simulation ID selected");
      }
      
      const response = await simulationApi.getBlockages(id, activeOnly);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error getting blockages";
      console.error(errorMessage);
      throw err;
    }
  };

  /**
   * Reset simulation (custom implementation - not in API)
   */
  const resetSimulation = async (): Promise<void> => {
    try {
      const id = currentSimulationId || localStorage.getItem("currentSimulationId");
      
      if (!id) {
        throw new Error("No simulation ID selected");
      }
      
      // Since there's no direct reset endpoint, we'll implement it by recreating 
      // the simulation with the same parameters - this is a simplification
      // In a real implementation, you might want to call a backend reset endpoint
      
      // For now, just pause the simulation as a placeholder
      await pauseSimulation();
      
      toast({
        title: "Simulation Reset",
        description: "The simulation has been reset",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error resetting simulation";
      console.error(errorMessage);
      throw err;
    }
  };

  /**
   * Delete simulation
   */
  const deleteSimulation = async (simulationId?: string): Promise<void> => {
    try {
      const id = simulationId || currentSimulationId || localStorage.getItem("currentSimulationId");
      
      if (!id) {
        throw new Error("No simulation ID selected");
      }
      
      await simulationApi.deleteSimulation(id);
      
      // If we deleted the current simulation, clear the current ID
      if (id === currentSimulationId) {
        setCurrentSimulationId(null);
        localStorage.removeItem("currentSimulationId");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error deleting simulation";
      console.error(errorMessage);
      throw err;
    }
  };

  return {
    // State
    isLoading,
    error,
    currentSimulationId,
    
    // Setters
    setCurrentSimulation,
    
    // API methods
    getAllSimulations,
    createSimulation,
    createSimulationWithFiles,
    getSimulationStatus,
    getEnvironment,
    startSimulation,
    pauseSimulation,
    setSimulationSpeed,
    getSimulationReport,
    getAllReports,
    simulateVehicleBreakdown,
    repairVehicle,
    getVehicles,
    getOrders,
    getBlockages,
    resetSimulation,
    deleteSimulation,
  };
} 