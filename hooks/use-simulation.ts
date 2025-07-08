import { useState } from "react";
import {
  simulationApi,
  SimulationCreateDTO,
  SimulationDTOTypeEnum,
} from "@/lib/api-client";
import { AxiosError } from "axios";

export function useSimulation() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createSimulation = async (
    simulationData: {
      startDateTime?: string;
      endDateTime?: string;
      type?: SimulationDTOTypeEnum;
      taVehicles?: number;
      tbVehicles?: number;
      tcVehicles?: number;
      tdVehicles?: number;
    }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const simulationCreateDTO: SimulationCreateDTO = {
        startDateTime: simulationData.startDateTime,
        endDateTime: simulationData.endDateTime,
        type: simulationData.type,
        taVehicles: simulationData.taVehicles,
        tbVehicles: simulationData.tbVehicles,
        tcVehicles: simulationData.tcVehicles,
        tdVehicles: simulationData.tdVehicles
      };

      const response = await simulationApi.createSimulation(
        simulationCreateDTO
      );

      setIsLoading(false);
      return response;
    } catch (err) {
      setIsLoading(false);
      const axiosError = err as AxiosError;
      setError(axiosError.message || "Error al crear la simulación");
      return null;
    }
  };

  const startSimulation = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await simulationApi.startSimulation(id);
      setIsLoading(false);
      return response;
    } catch (err) {
      setIsLoading(false);
      const axiosError = err as AxiosError;
      setError(axiosError.message || "Error al iniciar la simulación");
      return null;
    }
  };

  const pauseSimulation = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await simulationApi.pauseSimulation(id);
      setIsLoading(false);
      return response;
    } catch (err) {
      setIsLoading(false);
      const axiosError = err as AxiosError;
      setError(axiosError.message || "Error al pausar la simulación");
      return null;
    }
  };

  const stopSimulation = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await simulationApi.stopSimulation(id);
      setIsLoading(false);
      return response;
    } catch (err) {
      setIsLoading(false);
      const axiosError = err as AxiosError;
      setError(axiosError.message || "Error al detener la simulación");
      return null;
    }
  };

  const getSimulationStatus = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await simulationApi.getSimulationStatus(id);
      setIsLoading(false);
      return response;
    } catch (err) {
      setIsLoading(false);
      const axiosError = err as AxiosError;
      setError(
        axiosError.message || "Error al obtener el estado de la simulación"
      );
      return null;
    }
  };

  const getSimulationState = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await simulationApi.getSimulationState(id);
      setIsLoading(false);
      return response;
    } catch (err) {
      setIsLoading(false);
      const axiosError = err as AxiosError;
      setError(
        axiosError.message ||
          "Error al obtener el estado detallado de la simulación"
      );
      return null;
    }
  };

  const getDailyOperations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await simulationApi.getDailyOperations();
      setIsLoading(false);
      return response;
    } catch (err) {
      setIsLoading(false);
      const axiosError = err as AxiosError;
      setError(
        axiosError.message || "Error al obtener las operaciones diarias"
      );
      return null;
    }
  };

  const getDailyOperationsState = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await simulationApi.getDailyOperationsState();
      setIsLoading(false);
      return response;
    } catch (err) {
      setIsLoading(false);
      const axiosError = err as AxiosError;
      setError(
        axiosError.message ||
          "Error al obtener el estado de las operaciones diarias"
      );
      return null;
    }
  };

  const listSimulations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await simulationApi.listSimulations();
      setIsLoading(false);
      return response;
    } catch (err) {
      setIsLoading(false);
      const axiosError = err as AxiosError;
      setError(
        axiosError.message || "Error al obtener la lista de simulaciones"
      );
      return null;
    }
  };

  return {
    isLoading,
    error,
    createSimulation,
    startSimulation,
    pauseSimulation,
    stopSimulation,
    getSimulationStatus,
    getSimulationState,
    getDailyOperations,
    getDailyOperationsState,
    listSimulations,
  };
}
