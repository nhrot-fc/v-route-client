"use client";

import { SimulationDTOStatusEnum } from "@/lib/api-client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/lib/websocket-context";
import { useSimulation } from "@/hooks/use-simulation";
import { Card } from "@/components/ui/card";
import { SimulationCanvas } from "./simulation-canvas";

export function SimulationMap() {
  const {
    isConnected,
    currentSimulationId,
    simulationState,
    simulationInfo,
    availableSimulations,
    error,
    subscribeToSimulation,
  } = useWebSocket();

  const {
    startSimulation,
    pauseSimulation,
    stopSimulation,
    isLoading,
  } = useSimulation();
  
  const handleSimulationChange = (simulationId: string) => {
    subscribeToSimulation(simulationId);
  };

  const handleStartSimulation = async () => {
    if (currentSimulationId) {
      await startSimulation(currentSimulationId);
    }
  };

  const handlePauseSimulation = async () => {
    if (currentSimulationId) {
      await pauseSimulation(currentSimulationId);
    }
  };

  const handleStopSimulation = async () => {
    if (currentSimulationId) {
      await stopSimulation(currentSimulationId);
    }
  };

  // Get available simulations as array
  const simulationsArray = Object.entries(availableSimulations || {}).map(([id, data]) => ({
    id,
    ...data
  }));

  return (
    <Card className="p-4">
      <div className="mb-4 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
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
                      {sim.type} - {new Date(sim.creationTime || "").toLocaleString()}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-simulations" disabled>No hay simulaciones disponibles</SelectItem>
                )}
              </SelectContent>
            </Select>
            <div className="text-sm">
              {isConnected ? (
                <span className="text-green-600">WebSocket conectado</span>
              ) : (
                <span className="text-red-600">WebSocket desconectado</span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleStartSimulation}
              disabled={!currentSimulationId || isLoading || (simulationInfo?.status === SimulationDTOStatusEnum.Running)}
            >
              Iniciar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePauseSimulation}
              disabled={!currentSimulationId || isLoading || (simulationInfo?.status !== SimulationDTOStatusEnum.Running)}
            >
              Pausar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleStopSimulation}
              disabled={!currentSimulationId || isLoading || (simulationInfo?.status === SimulationDTOStatusEnum.Finished)}
            >
              Detener
            </Button>
          </div>
        </div>
        
        {currentSimulationId && simulationInfo && (
          <div className="flex gap-4 text-sm">
            <div>
              <span className="font-semibold">Estado:</span> {simulationInfo.status}
            </div>
            <div>
              <span className="font-semibold">Tiempo actual:</span> {new Date(simulationInfo.simulatedCurrentTime || "").toLocaleString()}
            </div>
            {simulationState && (
              <>
                <div>
                  <span className="font-semibold">Pedidos pendientes:</span> {simulationState.pendingOrdersCount}
                </div>
                <div>
                  <span className="font-semibold">Pedidos entregados:</span> {simulationState.deliveredOrdersCount}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-slate-50 border rounded-md p-2 h-[700px] overflow-hidden">
        <SimulationCanvas simulationState={simulationState} />
      </div>
      
      {error && (
        <div className="mt-2 text-red-600 text-sm">
          Error: {error}
        </div>
      )}
    </Card>
  );
} 