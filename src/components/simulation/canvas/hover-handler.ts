import React from "react";
import type { MapElement, TooltipInfo, EnhancedTooltipInfo } from "./types";
import { formatPercentageValue } from "./utils";

/**
 * Handle element hover with enhanced details
 * Creates tooltips with detailed information based on the element type
 */
export const handleElementHover = (
  element: MapElement | null,
  pointerPosition: { x: number; y: number } | null,
  setTooltip: React.Dispatch<React.SetStateAction<TooltipInfo>>,
  setEnhancedTooltip: React.Dispatch<React.SetStateAction<EnhancedTooltipInfo>>
) => {
  if (!element || !pointerPosition) {
    setTooltip({ show: false, x: 0, y: 0, content: "" });
    setEnhancedTooltip({
      show: false, 
      x: 0, 
      y: 0, 
      title: "", 
      color: "#1e40af", 
      details: []
    });
    return;
  }

  // Set basic tooltip (for backward compatibility)
  let content = "";

  // Set enhanced tooltip properties
  let title = "";
  let color = "#1e40af"; // Default blue
  const details: Array<{label: string; value: string; color?: string}> = [];

  switch (element.type) {
    case "depot": {
      title = "Depósito Principal";
      content = `Depósito Principal`;
      color = "#1e40af"; // dark blue

      details.push(
        { label: "Tipo", value: "Principal", color: "#1e40af" },
        { label: "Posición", value: `X:${element.x.toFixed(1)}, Y:${element.y.toFixed(1)}` }
      );
      break;
    }
    case "auxDepot": {
      const depot = element.data;
      title = depot.id ?? "N/A";
      content = `Depósito Aux. ${depot.id ?? "N/A"}\nCapacidad: ${depot.glpCapacityM3 || 160}m³`;
      color = "#3b82f6"; // blue

      const capacityM3 = depot.glpCapacityM3 || 160;
      details.push(
        { label: "Tipo", value: `Auxiliar ${depot.id ?? "N/A"}`, color: "#3b82f6" },
        { label: "Capacidad", value: `${capacityM3} m³`, color: "#10b981" },
        { label: "Posición", value: `X:${element.x.toFixed(1)}, Y:${element.y.toFixed(1)}` }
      );
      break;
    }
    case "order": {
      const order = element.data;
      const isOverdue = order.isOverdue;
      const delivered = order.delivered || false;
      const status = delivered
        ? "Entregado"
        : isOverdue
          ? "Vencido"
          : "Pendiente";
          
      const statusColor = delivered 
        ? "#16a34a" // green
        : isOverdue 
          ? "#dc2626" // red
          : "#1d4ed8"; // blue
      
      title = `Pedido: ${order.id || "N/A"}`;
      color = statusColor;
      content = `Pedido: ${order.id || "N/A"}\nVolumen: ${order.glpRequestM3 || 0}m³\nEstado: ${status}\nLlegada: ${new Date(order.arrivalTime || "").toLocaleString()}\nPlazo: ${new Date(order.deadlineTime || "").toLocaleString()}`;

      // Format volume as colored value
      const volume = order.glpRequestM3 || 0;
      let volumeColor = "#3b82f6"; // Default blue
      
      if (volume <= 3) volumeColor = "#10b981"; // green - small
      else if (volume <= 10) volumeColor = "#eab308"; // yellow - medium
      else volumeColor = "#f97316"; // orange - large
      
      details.push(
        { label: "Pedido ID", value: order.id || "N/A" },
        { label: "Volumen", value: `${volume.toFixed(1)} m³`, color: volumeColor },
        { label: "Estado", value: status, color: statusColor },
        { label: "Llegada", value: new Date(order.arrivalTime || "").toLocaleTimeString() },
        { label: "Plazo", value: new Date(order.deadlineTime || "").toLocaleTimeString() },
        { label: "Posición", value: `X:${element.x.toFixed(1)}, Y:${element.y.toFixed(1)}` }
      );
      break;
    }
    case "vehicle": {
      const vehicle = element.data;
      const currentGlp = vehicle.currentGlpM3 || 0;
      const maxGlp = vehicle.glpCapacityM3 || 1;
      const currentFuel = vehicle.currentFuelGal || 0;
      const maxFuel = vehicle.fuelCapacityGal || 25;

      const glpPercentage = (currentGlp / maxGlp) * 100;
      const fuelPercentage = (currentFuel / maxFuel) * 100;
      
      // Format GLP value
      const glpFormatted = formatPercentageValue(currentGlp, maxGlp);
      const fuelFormatted = formatPercentageValue(currentFuel, maxFuel);
      
      title = `Vehículo: ${vehicle.id || "N/A"}`;
      color = "#10b981"; // Default green for vehicle
      
      if (fuelPercentage <= 20) color = "#dc2626"; // Critical fuel level
      else if (glpPercentage <= 20) color = "#f97316"; // Critical GLP level
      
      content = `Vehículo: ${vehicle.id || "N/A"}\nTipo: ${vehicle.type || "N/A"}\nGLP: ${currentGlp.toFixed(2)}/${maxGlp}m³ (${glpPercentage.toFixed(0)}%)\nCombustible: ${currentFuel.toFixed(2)}/${maxFuel}gal (${fuelPercentage.toFixed(0)}%)\nEstado: ${vehicle.status || "Desconocido"}`;

      details.push(
        { label: "Vehículo ID", value: vehicle.id || "N/A" },
        { label: "Tipo", value: vehicle.type || "N/A" },
        { label: "GLP", value: glpFormatted.value.toString(), color: glpFormatted.color },
        { label: "Combustible", value: fuelFormatted.value.toString(), color: fuelFormatted.color },
        { label: "Estado", value: vehicle.status || "Desconocido" },
        { label: "Posición", value: `X:${element.x.toFixed(1)}, Y:${element.y.toFixed(1)}` }
      );
      break;
    }
    case "blockage": {
      const blockage = element.data;
      title = "Bloqueo";
      color = "#dc2626"; // red
      content = `Bloqueo\nInicio: ${new Date(blockage.startTime || "").toLocaleString()}\nFin: ${new Date(blockage.endTime || "").toLocaleString()}`;

      details.push(
        { label: "Inicio", value: new Date(blockage.startTime || "").toLocaleString() },
        { label: "Fin", value: new Date(blockage.endTime || "").toLocaleString() }
      );
      break;
    }
  }

  setTooltip({
    show: true,
    x: pointerPosition.x + 10,
    y: pointerPosition.y + 10,
    content,
  });
  
  setEnhancedTooltip({
    show: true,
    x: pointerPosition.x + 15,
    y: pointerPosition.y + 15,
    title,
    color,
    details
  });
}; 