"use client";

import { useRef, useEffect } from "react";
import { SimulationStateDTO, SimulationDTOStatusEnum } from "@/lib/api-client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSimulationWebSocket } from "@/hooks/use-simulation-websocket";
import { useSimulation } from "@/hooks/use-simulation";
import { Card } from "@/components/ui/card";

interface SimulationMapProps {
  defaultSimulationId?: string;
}

export function SimulationMap({ defaultSimulationId }: SimulationMapProps) {
  const mapCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    isConnected,
    currentSimulationId,
    simulationState,
    simulationInfo,
    availableSimulations,
    error,
    subscribeToSimulation,
  } = useSimulationWebSocket();

  const {
    startSimulation,
    pauseSimulation,
    stopSimulation,
    isLoading,
  } = useSimulation();

  // Subscribe to default simulation when component mounts and websocket is ready
  useEffect(() => {
    if (isConnected && defaultSimulationId) {
      subscribeToSimulation(defaultSimulationId);
    }
  }, [isConnected, defaultSimulationId, subscribeToSimulation]);
  
  useEffect(() => {
    if (simulationState) {
      drawSimulation(simulationState);
    }
  }, [simulationState]);
  
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
  
  const drawSimulation = (state: SimulationStateDTO) => {
    const canvas = mapCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid (10x10)
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= canvas.width; i += canvas.width / 10) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    
    for (let i = 0; i <= canvas.height; i += canvas.height / 10) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }
    
    // Scale coordinates to canvas size
    const scaleX = (x: number) => (x / 100) * canvas.width;
    const scaleY = (y: number) => (y / 100) * canvas.height;
    
    // Draw main depot
    if (state.mainDepot) {
      ctx.fillStyle = "#1d4ed8";
      const x = scaleX(state.mainDepot.position?.x || 0);
      const y = scaleY(state.mainDepot.position?.y || 0);
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, 2 * Math.PI);
      ctx.fill();
      
      // Label
      ctx.fillStyle = "#000";
      ctx.font = "12px Arial";
      ctx.fillText("Depósito Principal", x + 15, y);
    }
    
    // Draw auxiliary depots
    if (state.auxDepots) {
      state.auxDepots.forEach((depot, index) => {
        ctx.fillStyle = "#7e22ce";
        const x = scaleX(depot.position?.x || 0);
        const y = scaleY(depot.position?.y || 0);
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Label
        ctx.fillStyle = "#000";
        ctx.font = "10px Arial";
        ctx.fillText(`Depósito Aux. ${index + 1}`, x + 12, y);
      });
    }
    
    // Draw orders
    if (state.pendingOrders) {
      state.pendingOrders.forEach(order => {
        const color = order.delivered ? "#16a34a" : "#dc2626";
        ctx.fillStyle = color;
        const x = scaleX(order.position?.x || 0);
        const y = scaleY(order.position?.y || 0);
        ctx.fillRect(x - 5, y - 5, 10, 10);
      });
    }
    
    // Draw vehicles
    if (state.vehicles) {
      state.vehicles.forEach(vehicle => {
        ctx.fillStyle = "#f59e0b";
        const x = scaleX(vehicle.currentPosition?.x || 0);
        const y = scaleY(vehicle.currentPosition?.y || 0);
        ctx.beginPath();
        ctx.moveTo(x, y - 8);
        ctx.lineTo(x + 8, y + 8);
        ctx.lineTo(x - 8, y + 8);
        ctx.closePath();
        ctx.fill();
        
        // Label with status
        ctx.fillStyle = "#000";
        ctx.font = "9px Arial";
        ctx.fillText(`${vehicle.id} (${vehicle.status})`, x + 10, y);
      });
    }
    
    // Draw blockages
    if (state.activeBlockages) {
      state.activeBlockages.forEach(blockage => {
        if (blockage.lines && blockage.lines.length > 1) {
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 3;
          ctx.beginPath();
          const firstPoint = blockage.lines[0];
          ctx.moveTo(scaleX(firstPoint.x || 0), scaleY(firstPoint.y || 0));
          
          for (let i = 1; i < blockage.lines.length; i++) {
            const point = blockage.lines[i];
            ctx.lineTo(scaleX(point.x || 0), scaleY(point.y || 0));
          }
          
          ctx.stroke();
        }
      });
    }
  };

  // Get available simulations as array
  const simulationsArray = Object.entries(availableSimulations).map(([id, data]) => ({
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
              disabled={!isConnected || simulationsArray.length === 0}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Seleccionar simulación" />
              </SelectTrigger>
              <SelectContent>
                {simulationsArray.map((sim) => (
                  <SelectItem key={sim.id} value={sim.id}>
                    {sim.type} - {new Date(sim.creationTime || "").toLocaleString()}
                  </SelectItem>
                ))}
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
              disabled={!currentSimulationId || isLoading || simulationInfo?.status === SimulationDTOStatusEnum.Running}
            >
              Iniciar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePauseSimulation}
              disabled={!currentSimulationId || isLoading || simulationInfo?.status !== SimulationDTOStatusEnum.Running}
            >
              Pausar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleStopSimulation}
              disabled={!currentSimulationId || isLoading || simulationInfo?.status === SimulationDTOStatusEnum.Finished}
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
      
      <div className="bg-slate-50 border rounded-md p-2 h-[500px] overflow-hidden">
        <canvas 
          ref={mapCanvasRef} 
          width={600} 
          height={500}
          className="w-full h-full"
        />
      </div>
      
      {error && (
        <div className="mt-2 text-red-600 text-sm">
          Error: {error}
        </div>
      )}
    </Card>
  );
} 