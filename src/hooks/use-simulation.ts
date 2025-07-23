import { useState, useCallback } from "react";
import { axiosInstance } from "@/lib/api-client";
import {
  simulationApi,
  type SimulationCreateDTO,
  SimulationDTOTypeEnum,
  type IncidentCreateDTO,
} from "@/lib/api-client";
import { AxiosError } from "axios";

export function useSimulation() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createSimulation = useCallback(
    async (simulationData: {
      startDateTime?: string;
      endDateTime?: string;
      type?: SimulationDTOTypeEnum;
      taVehicles?: number;
      tbVehicles?: number;
      tcVehicles?: number;
      tdVehicles?: number;
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        const simulationCreateDTO: SimulationCreateDTO = {
          startDateTime: simulationData.startDateTime || "",
          endDateTime: simulationData.endDateTime || "",
          type: simulationData.type || SimulationDTOTypeEnum.Weekly,
          taVehicles: simulationData.taVehicles || 0,
          tbVehicles: simulationData.tbVehicles || 0,
          tcVehicles: simulationData.tcVehicles || 0,
          tdVehicles: simulationData.tdVehicles || 0,
        };

        const response =
          await simulationApi.createSimulation(simulationCreateDTO);
        setIsLoading(false);
        return response;
      } catch (err) {
        setIsLoading(false);
        const axiosError = err as AxiosError;
        setError(axiosError.message || "Error al crear la simulación");
        return null;
      }
    },
    []
  );

  const startSimulation = useCallback(async (id: string) => {
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
  }, []);

  const pauseSimulation = useCallback(async (id: string) => {
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
  }, []);

  const stopSimulation = useCallback(async (id: string) => {
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
  }, []);

  const listSimulations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await simulationApi.listSimulations();
      setIsLoading(false);
      return response;
    } catch (err) {
      setIsLoading(false);
      const axiosError = err as AxiosError;
      setError(axiosError.message || "Error al listar simulaciones");
      return null;
    }
  }, []);

  const loadOrders = useCallback(
    async (id: string, year: number, month: number, file: File) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await simulationApi.loadOrders(id, year, month, file, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          data: file,
        });
        setIsLoading(false);
        return response;
      } catch (err) {
        setIsLoading(false);
        const axiosError = err as AxiosError;
        setError(
          axiosError.message || "Error al cargar pedidos para la simulación"
        );
        return null;
      }
    },
    []
  );

  const loadBlockages = useCallback(
    async (id: string, year: number, month: number, file: File) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await simulationApi.loadBlockages(
          id,
          year,
          month,
          file,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            data: file,
          }
        );
        setIsLoading(false);
        return response;
      } catch (err) {
        setIsLoading(false);
        const axiosError = err as AxiosError;
        setError(
          axiosError.message || "Error al cargar bloqueos para la simulación"
        );
        return null;
      }
    },
    []
  );

  const createVehicleBreakdown = useCallback(
    async (
      simulationId: string,
      vehicleId: string,
      data: IncidentCreateDTO
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await simulationApi.createVehicleBreakdown(
          simulationId,
          vehicleId,
          data
        );
        setIsLoading(false);
        return response;
      } catch (err) {
        setIsLoading(false);
        const axiosError = err as AxiosError;
        setError(axiosError.message || "Error al reportar avería del vehículo");
        return null;
      }
    },
    []
  );

  const deleteSimulation = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.delete(`/api/simulation/${id}`);
      setIsLoading(false);
      return response;
    } catch (err) {
      setIsLoading(false);
      const axiosError = err as AxiosError;
      setError(axiosError.message || "Error al eliminar la simulación");
      return null;
    }
  }, []);

  return {
    isLoading,
    error,
    createSimulation,
    startSimulation,
    pauseSimulation,
    stopSimulation,
    listSimulations,
    loadOrders,
    loadBlockages,
    createVehicleBreakdown,
    deleteSimulation,
  };
}
