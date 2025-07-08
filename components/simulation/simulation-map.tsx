"use client";

import { useRef, useEffect } from "react";
import { SimulationStateDTO } from "@/lib/api-client";

interface SimulationMapProps {
  simulationState: SimulationStateDTO | undefined;
}

export function SimulationMap({ simulationState }: SimulationMapProps) {
  const mapCanvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (simulationState) {
      drawSimulation(simulationState);
    }
  }, [simulationState]);
  
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

  return (
    <div className="bg-slate-50 border rounded-md p-2 h-[500px] overflow-hidden">
      <canvas 
        ref={mapCanvasRef} 
        width={600} 
        height={500}
        className="w-full h-full"
      />
    </div>
  );
} 