import { useCallback, useEffect, useState, useMemo } from "react";
import { SimulationDTOStatusEnum, type SimulationDTO } from "@/lib/api-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/lib/websocket-context";
import { useSimulation } from "@/hooks/use-simulation";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { SimulationCanvas } from "./canvas/simulation-canvas";

export function SimulationMap() {
  const {
    isConnected,
    currentSimulationId,
    simulationState,
    simulationInfo,
    availableSimulations,
    error: wsError,
    subscribeToSimulation,
    unsubscribeFromSimulation,
  } = useWebSocket();

  const {
    listSimulations,
    startSimulation,
    pauseSimulation,
    stopSimulation,
    deleteSimulation,
    setSimulationSpeed,
    isLoading,
    error: apiError,
  } = useSimulation();

  const [fetchedSimulations, setFetchedSimulations] = useState<
    Record<string, SimulationDTO>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [speedFactor, setSpeedFactor] = useState<number>(1);

  const fetchSimulations = useCallback(async () => {
    if (!isConnected) return;

    try {
      const response = await listSimulations();
      if (response?.data && typeof response.data === "object") {
        setFetchedSimulations(response.data as Record<string, SimulationDTO>);
      }
    } catch (err) {
      console.error("Error fetching simulations:", err);
    }
  }, [isConnected, listSimulations]);

  useEffect(() => {
    void fetchSimulations();
  }, [fetchSimulations]);

  const combinedSimulations = useMemo(
    () => ({
      ...fetchedSimulations,
      ...availableSimulations,
    }),
    [fetchedSimulations, availableSimulations]
  );

  useEffect(() => {
    if (
      currentSimulationId &&
      Object.keys(combinedSimulations).length > 0 &&
      !combinedSimulations[currentSimulationId]
    ) {
      unsubscribeFromSimulation();
    }
  }, [combinedSimulations, currentSimulationId, unsubscribeFromSimulation]);

  useEffect(() => {
    setError(wsError || apiError);
  }, [wsError, apiError]);

  const handleSimulationChange = useCallback(
    (simulationId: string) => {
      if (simulationId === "") {
        unsubscribeFromSimulation();
      } else {
        subscribeToSimulation(simulationId);
      }
    },
    [subscribeToSimulation, unsubscribeFromSimulation]
  );

  const handleStartSimulation = useCallback(async () => {
    if (currentSimulationId) {
      try {
        await startSimulation(currentSimulationId);
        void fetchSimulations();
      } catch (error) {
        console.error("Failed to start simulation:", error);
      }
    }
  }, [currentSimulationId, startSimulation, fetchSimulations]);

  const handlePauseSimulation = useCallback(async () => {
    if (currentSimulationId) {
      try {
        await pauseSimulation(currentSimulationId);
        void fetchSimulations();
      } catch (error) {
        console.error("Failed to pause simulation:", error);
      }
    }
  }, [currentSimulationId, pauseSimulation, fetchSimulations]);

  const handleStopSimulation = useCallback(async () => {
    if (currentSimulationId) {
      try {
        await stopSimulation(currentSimulationId);
        void fetchSimulations();
      } catch (error) {
        console.error("Failed to stop simulation:", error);
      }
    }
  }, [currentSimulationId, stopSimulation, fetchSimulations]);

  const handleDeleteSimulation = useCallback(async () => {
    if (currentSimulationId) {
      const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta simulación?");
      if (!confirmDelete) return;

      try {
        await deleteSimulation(currentSimulationId);
        unsubscribeFromSimulation();
        void fetchSimulations();
      } catch (error) {
        console.error("Error al eliminar la simulación:", error);
      }
    }
  }, [currentSimulationId, deleteSimulation, fetchSimulations, unsubscribeFromSimulation]);

  const handleSpeedChange = useCallback(async (value: number[]) => {
    const factor = value[0];
    setSpeedFactor(factor);
    try {
      await setSimulationSpeed(factor);
    } catch (error) {
      console.error("Error al ajustar velocidad de simulación:", error);
    }
  }, [setSimulationSpeed]);

  const simulationsArray = useMemo(
    () =>
      Object.entries(combinedSimulations || {}).map(([id, data]) => ({
        id,
        ...data,
      })),
    [combinedSimulations]
  );

  const handleRefreshClick = useCallback(() => {
    void fetchSimulations();
  }, [fetchSimulations]);

  useEffect(() => {
    const hayVencidos = simulationState?.pendingOrders?.some(order => {
      if (!order.deadlineTime || !simulationState.currentTime) return false;
      return new Date(simulationState.currentTime) > new Date(order.deadlineTime);
    });
    if (hayVencidos) {
      const pauseBtn: HTMLElement | null = document.getElementById('pause-simulation-btn');
      if (pauseBtn) {
        console.log('Pedidos vencidos detectados. Click en Pausar.');
        pauseBtn.click();
      } else {
        // Buscar por el texto del botón
        const buttons = Array.from(document.getElementsByTagName('button'));
        const btnByText = buttons.find(btn => btn.textContent?.trim() === 'Pausar') || null;
        if (btnByText) {
          console.log('Pedidos vencidos detectados. Click en Pausar (por texto).');
          btnByText.click();
        } else {
          console.log('Pedidos vencidos detectados, pero NO se encontró el botón Pausar.');
        }
      }
    }
  }, [simulationState]);

  return (
    <Card className="p-4">
      <div className="mb-4 h-screen flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-2 items-center">
              <Select
                value={currentSimulationId || ""}
                onValueChange={handleSimulationChange}
                disabled={!isConnected}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Seleccionar simulación" />
                </SelectTrigger>
                <SelectContent>
                  {simulationsArray.length > 0 ? (
                    simulationsArray.map((sim) => (
                      <SelectItem key={sim.id} value={sim.id}>
                        {sim.type === "DAILY_OPERATIONS" ? (
                          <span className="flex items-center">
                            {sim.type}{" "}
                            <span className="ml-1 text-xs text-amber-600">
                              (automático)
                            </span>{" "}
                            -{" "}
                            {new Date(sim.creationTime || "").toLocaleString()}
                          </span>
                        ) : (
                          <span>
                            {sim.type} -{" "}
                            {new Date(sim.creationTime || "").toLocaleString()}
                          </span>
                        )}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-simulations" disabled>
                      No hay simulaciones disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefreshClick}
                disabled={isLoading}
                title="Actualizar lista de simulaciones"
              >
                {isLoading ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-spin lucide lucide-loader"
                  >
                    <line x1="12" y1="2" x2="12" y2="6" />
                    <line x1="12" y1="18" x2="12" y2="22" />
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                    <line x1="2" y1="12" x2="6" y2="12" />
                    <line x1="18" y1="12" x2="22" y2="12" />
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-refresh-cw"
                  >
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M3 21v-5h5" />
                  </svg>
                )}
              </Button>
            </div>
            <div className="text-sm flex gap-3">
              {isConnected ? (
                <span className="text-green-600">WebSocket conectado</span>
              ) : (
                <span className="text-red-600">WebSocket desconectado</span>
              )}
              <span>
                Simulaciones disponibles:{" "}
                <strong>{simulationsArray.length}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => void handleStartSimulation()}
                disabled={
                  !currentSimulationId ||
                  isLoading ||
                  simulationInfo?.status === SimulationDTOStatusEnum.Running ||
                  simulationInfo?.type === "DAILY_OPERATIONS"
                }
              >
                Iniciar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handlePauseSimulation()}
                disabled={
                  !currentSimulationId ||
                  isLoading ||
                  simulationInfo?.status !== SimulationDTOStatusEnum.Running ||
                  simulationInfo?.type === "DAILY_OPERATIONS"
                }
              >
                Pausar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => void handleStopSimulation()}
                disabled={
                  !currentSimulationId ||
                  isLoading ||
                  simulationInfo?.status === SimulationDTOStatusEnum.Finished ||
                  simulationInfo?.type === "DAILY_OPERATIONS"
                }
              >
                Detener
              </Button>
              {simulationInfo?.type !== "DAILY_OPERATIONS" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void handleDeleteSimulation()}
                  disabled={!currentSimulationId || isLoading}
                >
                  Eliminar
                </Button>
              )}
            </div>
            {currentSimulationId &&
              simulationInfo?.type === "DAILY_OPERATIONS" && (
                <div className="text-xs text-amber-600 mt-1">
                  Las operaciones diarias se controlan automáticamente por el
                  sistema
                </div>
              )}
          </div>
        </div>

        {currentSimulationId && simulationInfo && (
          <div className="flex flex-col space-y-2">
            <div className="flex gap-4 text-sm">
              <div>
                <span className="font-semibold">Estado:</span>{" "}
                {simulationInfo.status}
              </div>
              <div>
                <span className="font-semibold">Tipo:</span>{" "}
                {simulationInfo.type}
                {simulationInfo.type === "DAILY_OPERATIONS" && (
                  <span className="ml-1 text-amber-600 font-semibold">
                    (control automático)
                  </span>
                )}
              </div>
              <div>
                <span className="font-semibold">Tiempo actual:</span>{" "}
                {new Date(
                  simulationInfo.simulatedCurrentTime || ""
                ).toLocaleString()}
              </div>
              {simulationState && (
                <>
                  <div>
                    <span className="font-semibold">Pedidos pendientes:</span>{" "}
                    {simulationState.pendingOrdersCount}
                  </div>
                  <div>
                    <span className="font-semibold">Pedidos entregados:</span>{" "}
                    {simulationState.deliveredOrdersCount}
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <div className="text-sm font-semibold w-40">
                Velocidad de simulación:
              </div>
              <div className="w-40">
                <Slider
                  min={1}
                  max={8}
                  step={1}
                  value={[speedFactor]}
                  onValueChange={handleSpeedChange}
                  disabled={
                    !currentSimulationId ||
                    isLoading ||
                    simulationInfo?.status !== SimulationDTOStatusEnum.Running ||
                    simulationInfo?.type === "DAILY_OPERATIONS"
                  }
                />
              </div>
              <div className="text-sm font-medium">
                {speedFactor}x
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-50 h-full border rounded-md p-2 overflow-hidden mt-4">
          {currentSimulationId && simulationState ? (
            <SimulationCanvas
              simulationId={currentSimulationId}
              simulationState={simulationState}
              simulationInfo={simulationInfo}

            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <span className="text-gray-500">No hay simulación en curso</span>
            </div>
          )}
        </div>
      </div>

      {error && <div className="mt-2 text-red-600 text-sm">Error: {error}</div>}
    </Card>
  );
}
