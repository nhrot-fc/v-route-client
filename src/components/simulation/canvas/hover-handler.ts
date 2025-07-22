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
      title: "",
      color: "#1e40af",
      details: [],
      position: "top-right",
    });
    return;
  }

  // Set basic tooltip (for backward compatibility)
  let content = "";

  // Set enhanced tooltip properties
  let title = "";
  let color = "#1e40af"; // Default blue
  const details: Array<{ label: string; value: string; color?: string }> = [];

  switch (element.type) {
    case "depot": {
      title = "Depósito Principal";
      content = `Depósito Principal`;
      color = "#1e40af"; // dark blue

      details.push(
        { label: "Tipo", value: "Principal", color: "#1e40af" },
        {
          label: "Posición",
          value: `X:${element.x.toFixed(1)}, Y:${element.y.toFixed(1)}`,
        }
      );
      break;
    }
    case "auxDepot": {
      const depot = element.data;
      title = depot.id ?? "Depósito Auxiliar";
      content = `Depósito Aux. ${depot.id ?? "N/A"}\nCapacidad: ${depot.glpCapacityM3 || 0}m³`;
      color = "#3b82f6"; // blue

      const capacityM3 = depot.glpCapacityM3 || 0;
      const currentGlp =
        depot.currentGlpM3 !== undefined ? depot.currentGlpM3 : 0;

      details.push(
        { label: "ID", value: depot.id ?? "N/A", color: "#3b82f6" },
        { label: "Tipo", value: "Auxiliar", color: "#3b82f6" },
        { label: "Capacidad", value: `${capacityM3} m³`, color: "#10b981" },
        {
          label: "GLP Actual",
          value: `${currentGlp.toFixed(1)} m³`,
          color: "#10b981",
        },
        {
          label: "% Lleno",
          value: `${((currentGlp / capacityM3) * 100).toFixed(1)}%`,
        },
        {
          label: "Posición",
          value: `X:${element.x.toFixed(1)}, Y:${element.y.toFixed(1)}`,
        }
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

      if (volume <= 3)
        volumeColor = "#10b981"; // green - small
      else if (volume <= 10)
        volumeColor = "#eab308"; // yellow - medium
      else volumeColor = "#f97316"; // orange - large

      // Format remaining volume
      const remainingVolume =
        order.remainingGlpM3 !== undefined ? order.remainingGlpM3 : volume;
      const percentRemaining =
        volume > 0 ? ((remainingVolume / volume) * 100).toFixed(1) : "100";

      details.push(
        { label: "Pedido ID", value: order.id || "N/A" },
        {
          label: "Volumen",
          value: `${volume.toFixed(1)} m³`,
          color: volumeColor,
        },
        {
          label: "Restante",
          value: `${remainingVolume.toFixed(1)}/${volume.toFixed(1)} m³ (${percentRemaining}%)`,
        },
        { label: "Estado", value: status, color: statusColor },
        {
          label: "Llegada",
          value: new Date(order.arrivalTime || "").toLocaleString(),
        },
        {
          label: "Plazo",
          value: new Date(order.deadlineTime || "").toLocaleString(),
        },
        {
          label: "Posición",
          value: `X:${element.x.toFixed(1)}, Y:${element.y.toFixed(1)}`,
        }
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

      if (fuelPercentage <= 20)
        color = "#dc2626"; // Critical fuel level
      else if (glpPercentage <= 20) color = "#f97316"; // Critical GLP level

      content = `Vehículo: ${vehicle.id || "N/A"}\nTipo: ${vehicle.type || "N/A"}\nGLP: ${currentGlp.toFixed(2)}/${maxGlp}m³ (${glpPercentage.toFixed(0)}%)\nCombustible: ${currentFuel.toFixed(2)}/${maxFuel}gal (${fuelPercentage.toFixed(0)}%)\nEstado: ${vehicle.status || "Desconocido"}`;

      details.push(
        { label: "Vehículo ID", value: vehicle.id || "N/A" },
        { label: "Tipo", value: vehicle.type || "N/A" },
        {
          label: "GLP",
          value: `${currentGlp.toFixed(2)}/${maxGlp.toFixed(1)} m³ (${glpPercentage.toFixed(0)}%)`,
          color: glpFormatted.color,
        },
        {
          label: "Combustible",
          value: `${currentFuel.toFixed(2)}/${maxFuel.toFixed(1)} gal (${fuelPercentage.toFixed(0)}%)`,
          color: fuelFormatted.color,
        },
        { label: "Estado", value: vehicle.status || "Desconocido" },
        {
          label: "Posición",
          value: `X:${element.x.toFixed(1)}, Y:${element.y.toFixed(1)}`,
        }
      );

      // Add speed info if available (as a custom property)
      if ("speed" in vehicle && typeof vehicle.speed === "number") {
        details.push({
          label: "Velocidad",
          value: `${vehicle.speed.toFixed(1)} km/h`,
        });
      }
      break;
    }
    case "blockage": {
      const blockage = element.data;
      title = "Bloqueo";
      color = "#dc2626"; // red
      content = `Bloqueo\nInicio: ${new Date(blockage.startTime || "").toLocaleString()}\nFin: ${new Date(blockage.endTime || "").toLocaleString()}`;

      details.push(
        {
          label: "Inicio",
          value: new Date(blockage.startTime || "").toLocaleString(),
        },
        {
          label: "Fin",
          value: new Date(blockage.endTime || "").toLocaleString(),
        },
        {
          label: "Duración",
          value: getDuration(blockage.startTime, blockage.endTime),
        }
      );

      // Add ID if available (as a custom property)
      if ("id" in blockage && typeof blockage.id === "string") {
        details.unshift({ label: "ID", value: blockage.id });
      }
      break;
    }
  }

  // Keep x/y for backward compatibility but they're not used anymore
  setTooltip({
    show: true,
    x: 0,
    y: 0,
    content,
  });

  setEnhancedTooltip({
    show: true,
    title,
    color,
    details,
    position: "top-right",
  });
};

/**
 * Calculate duration between two dates as a formatted string
 */
function getDuration(startTime?: string, endTime?: string): string {
  if (!startTime || !endTime) return "N/A";

  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end.getTime() - start.getTime();

  if (durationMs < 0) return "Inválido";

  // Convert to hours and minutes
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
}
