"use client";

import React, { useEffect, useRef, useState } from "react";

// Import API client and types
import { useSimulation } from "@/hooks/use-simulation";

// Import custom types
import {
  MapElement,
  EnvironmentData,
  VehicleData,
  SlideVehicleInfo,
  BlockedRoad,
} from "./simulation-map-types";

interface SimulationMapProps {
  onTimeUpdate?: (time: string, isRunning: boolean) => void;
}

export function SimulationMap({ onTimeUpdate }: SimulationMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [simulationTime, setSimulationTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [simulationRunning, setSimulationRunning] = useState<boolean>(false);
  const [breakdownReason, setBreakdownReason] = useState("");
  const [repairHours, setRepairHours] = useState(2);
  const [environmentData, setEnvironmentData] = useState<EnvironmentData | null>(null);
  const [mapElements, setMapElements] = useState<MapElement[]>([]);
  const [blockedRoads, setBlockedRoads] = useState<BlockedRoad[]>([]);
  const [sliderVehicles, setSlideVehicles] = useState<SlideVehicleInfo[]>([]);
  const [selectedElement, setSelectedElement] = useState<MapElement | null>(null);
  const [breakdownDialogOpen, setBreakdownDialogOpen] = useState(false);
  const [breakdownError, setBreakdownError] = useState<string | null>(null);
  const [isBreakdownLoading, setIsBreakdownLoading] = useState(false);
  const [isRepairLoading, setIsRepairLoading] = useState(false);
  const [repairError, setRepairError] = useState<string | null>(null);
  const [operationSuccess, setOperationSuccess] = useState<string | null>(null);
  const [hoveredElement, setHoveredElement] = useState<MapElement | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Use the simulation hook
  const simulation = useSimulation();

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setCanvasSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Listen for fullscreen changes
    const handleFsChange = () => {
      // Removed setIsFullscreen since we're not using it
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Fetch environment data
  useEffect(() => {
    const fetchEnvironmentData = async () => {
      try {
        setIsLoading(true);
        setDataError(null);

        // Obtain data from the API
        const apiData = await simulation.getEnvironment();

        // Convert API data to our internal EnvironmentData format
        const environmentData: EnvironmentData = {
          timestamp: new Date().toISOString(),
          simulationTime: apiData.currentTime || "",
          currentTime: apiData.currentTime,
          running: apiData.running,
          vehicles:
            apiData.vehicles?.map((v) => ({
              id: v.id || "",
              type: v.type || "",
              status: v.status || "",
              position: v.currentPosition || { x: 0, y: 0 },
              fuel: {
                current: v.currentFuelGal || 0,
                capacity: v.fuelCapacityGal || 100,
                percentage:
                  v.currentFuelGal && v.fuelCapacityGal
                    ? (v.currentFuelGal / v.fuelCapacityGal) * 100
                    : 0,
              },
              glp: {
                current: v.currentGlpM3 || 0,
                capacity: v.glpCapacityM3 || 100,
                percentage:
                  v.currentGlpM3 && v.glpCapacityM3
                    ? (v.currentGlpM3 / v.glpCapacityM3) * 100
                    : 0,
              },
            })) || [],
          orders: apiData.orders || [],
          blockages:
            apiData.activeBlockages?.map((b) => ({
              id: b.id?.toString() || "",
              startTime: b.startTime || "",
              endTime: b.endTime || "",
              positions: b.lines || [],
            })) || [],
          depots: [
            // Main depot
            ...(apiData.mainDepot
              ? [
                  {
                    id: apiData.mainDepot.id || "main",
                    position: apiData.mainDepot.position || { x: 0, y: 0 },
                    isMain: true,
                    canRefuel: apiData.mainDepot.canRefuel || false,
                    glp: {
                      current: apiData.mainDepot.currentGlpM3 || 0,
                      capacity: apiData.mainDepot.glpCapacityM3 || 0,
                    },
                  },
                ]
              : []),
            // Auxiliary depots
            ...(apiData.auxDepots?.map((d) => ({
              id: d.id || "",
              position: d.position || { x: 0, y: 0 },
              isMain: false,
              canRefuel: d.canRefuel || false,
              glp: {
                current: d.currentGlpM3 || 0,
                capacity: d.glpCapacityM3 || 0,
              },
            })) || []),
          ],
        };

        setEnvironmentData(environmentData);
        setSimulationTime(environmentData.simulationTime || "");
        setSimulationRunning(environmentData.running || false);

        // Notify parent component about time update if callback exists
        if (onTimeUpdate) {
          onTimeUpdate(
            environmentData.simulationTime || "",
            environmentData.running || false
          );
        }

        // Log vehicles for debugging
        if (environmentData.vehicles?.length > 0) {
          console.log(
            `📊 Recibidos ${environmentData.vehicles.length} vehículos del API`
          );
        } else {
          console.warn("⚠️ No se recibieron vehículos del API");
        }

        // Transform data to map elements and slide elements
        transformDataToMapElements(environmentData);
        transformDataToSlideElements(environmentData);
        setIsLoading(false);
      } catch (error) {
        console.error("❌ Error fetch de datos:", error);
        setDataError("Error al cargar datos del entorno");
        setIsLoading(false);
      }
    };

    console.log("🔄 Iniciando fetch de datos de entorno...");
    // Initial fetch
    fetchEnvironmentData();

    // Set up interval for fetching data every second
    const intervalId = setInterval(fetchEnvironmentData, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [onTimeUpdate, simulation]);

  // Transform API data to map elements
  const transformDataToMapElements = (data: EnvironmentData) => {
    const elements: MapElement[] = [];
    // Clear blocked roads for fresh data
    setBlockedRoads([]);

    // Add vehicles to map elements
    data.vehicles.forEach((vehicle) => {
      elements.push({
        id: vehicle.id,
        type: "vehicle",
        x: vehicle.position.x || 0,
        y: vehicle.position.y || 0,
        label: `${vehicle.id} (${vehicle.type})`,
        status: vehicle.status,
        direction: determineDirection(vehicle),
      });
    });

    // Add depots to map elements
    data.depots.forEach((depot) => {
      elements.push({
        id: depot.id,
        type: depot.isMain ? "mainWarehouse" : "warehouse",
        x: depot.position.x || 0,
        y: depot.position.y || 0,
        label: depot.isMain ? "Depósito Principal" : `Depósito ${depot.id}`,
        details: `GLP: ${depot.glp.current}/${depot.glp.capacity} m³`,
      });
    });

    // Add orders to map elements
    data.orders.forEach((order) => {
      if (order.position) {
        elements.push({
          id: order.id || "",
          type: "customer",
          x: order.position.x || 0,
          y: order.position.y || 0,
          label: `Pedido ${order.id}`,
          details: `GLP: ${order.glpRequestM3} m³, Entrega: ${order.dueTime}`,
        });
      }
    });

    // Add blockages to map elements
    data.blockages.forEach((blockage) => {
      if (blockage.positions && blockage.positions.length > 0) {
        // For each blockage, create a blocked road element
        blockage.positions.forEach((position, index) => {
          if (index < blockage.positions.length - 1) {
            const nextPosition = blockage.positions[index + 1];

            // Create a unique ID for this segment
            const segmentId = `block-${blockage.id}-${index}`;

            // Add to blocked roads
            setBlockedRoads((prev: BlockedRoad[]) => [
              ...prev,
              {
                id: segmentId,
                from: { x: position.x || 0, y: position.y || 0 },
                to: { x: nextPosition.x || 0, y: nextPosition.y || 0 },
                label: `Bloqueo ${blockage.id}`,
                details: `Desde: ${blockage.startTime}, Hasta: ${blockage.endTime}`,
              },
            ]);

            // Add to map elements
            elements.push({
              id: segmentId,
              type: "blockedRoad",
              x: ((position.x || 0) + (nextPosition.x || 0)) / 2,
              y: ((position.y || 0) + (nextPosition.y || 0)) / 2,
              label: `Bloqueo ${blockage.id}`,
              details: `Desde: ${blockage.startTime}, Hasta: ${blockage.endTime}`,
            });
          }
        });
      }
    });

    setMapElements(elements);
  };

  // Transform API data to slide elements
  const transformDataToSlideElements = (data: EnvironmentData) => {
    const vehicles: SlideVehicleInfo[] = data.vehicles.map((vehicle) => {
      // Color por tipo de vehículo
      let color = "#10b981"; // Verde por defecto
      if (vehicle.type === "TA") color = "#ef4444";
      else if (vehicle.type === "TB") color = "#3b82f6";
      else if (vehicle.type === "TC") color = "#f59e0b";
      else if (vehicle.type === "TD") color = "#8b5cf6";

      // Estado legible
      let statusLabel = "En ruta";
      if (vehicle.status !== "AVAILABLE") statusLabel = "Averiado";

      // Buscar los pedidos que está atendiendo este vehículo
      // Como no tenemos assignedVehicleId, podemos usar la posición del vehículo y del pedido
      // para determinar si un vehículo está cerca de un pedido (como aproximación)
      const assignedOrders = data.orders.filter((order) => {
        // Si el vehículo tiene una ruta actual y el último punto de la ruta está cerca del pedido
        if (vehicle.currentPath && vehicle.currentPath.path.length > 0) {
          const lastPathPoint =
            vehicle.currentPath.path[vehicle.currentPath.path.length - 1];

          if (lastPathPoint && order.position) {
            const distance = Math.sqrt(
              Math.pow((lastPathPoint.x || 0) - (order.position.x || 0), 2) +
                Math.pow((lastPathPoint.y || 0) - (order.position.y || 0), 2)
            );
            // Si la distancia es menor a 2 unidades, consideramos que el pedido está asignado al vehículo
            return distance < 2;
          }
        }
        return false;
      });

      return {
        id: vehicle.id || "",
        type: vehicle.type || "",
        status: vehicle.status || "",
        fuel: vehicle.fuel,
        glp: vehicle.glp,
        position: vehicle.position || { x: 0, y: 0 },
        label: `${vehicle.id || ""} (${vehicle.type || ""})`,
        statusLabel,
        color,
        assignedOrders,
      };
    });

    setSlideVehicles(vehicles);
  };

  // Determine vehicle direction based on its current path or status
  const determineDirection = (
    vehicle: VehicleData
  ): "north" | "south" | "east" | "west" => {
    // Default direction
    let direction: "north" | "south" | "east" | "west" = "east";

    // If vehicle has a current path with at least 2 points, determine direction from last two points
    if (
      vehicle.currentPath &&
      vehicle.currentPath.path &&
      vehicle.currentPath.path.length >= 2
    ) {
      const pathLength = vehicle.currentPath.path.length;
      const lastPoint = vehicle.currentPath.path[pathLength - 1];
      const secondLastPoint = vehicle.currentPath.path[pathLength - 2];

      if (lastPoint && secondLastPoint) {
        const dx = (lastPoint.x || 0) - (secondLastPoint.x || 0);
        const dy = (lastPoint.y || 0) - (secondLastPoint.y || 0);

        // Determine predominant direction
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal movement is predominant
          direction = dx > 0 ? "east" : "west";
        } else {
          // Vertical movement is predominant
          direction = dy > 0 ? "south" : "north";
        }
      }
    }

    return direction;
  };

  // Handle vehicle breakdown
  const handleBreakdownVehicle = async () => {
    if (!selectedElement || selectedElement.type !== "vehicle") return;

    setBreakdownDialogOpen(true);
    setBreakdownReason("");
    setRepairHours(2);
    setBreakdownError(null);
  };

  // Submit vehicle breakdown
  const submitBreakdownVehicle = async () => {
    if (!selectedElement || selectedElement.type !== "vehicle") return;

    try {
      setIsBreakdownLoading(true);
      setBreakdownError(null);

      const response = await simulation.simulateVehicleBreakdown({
        vehicleId: selectedElement.id,
        reason: breakdownReason || "Mechanical failure",
        estimatedRepairHours: repairHours,
      });

      // Close dialog
      setBreakdownDialogOpen(false);

      // Show success message
      setOperationSuccess(
        `Vehículo ${selectedElement.id} averiado: ${response.incidentType}, reparación estimada: ${response.estimatedRepairTime}`
      );

      // Auto-dismiss success message after 5 seconds
      setTimeout(() => {
        setOperationSuccess(null);
      }, 5000);

      // Force a refresh of the data
      const apiData = await simulation.getEnvironment();

      // Convert API data to our internal EnvironmentData format
      const environmentData: EnvironmentData = {
        timestamp: new Date().toISOString(),
        simulationTime: apiData.currentTime || "",
        currentTime: apiData.currentTime,
        running: apiData.running,
        vehicles:
          apiData.vehicles?.map((v) => ({
            id: v.id || "",
            type: v.type || "",
            status: v.status || "",
            position: v.currentPosition || { x: 0, y: 0 },
            fuel: {
              current: v.currentFuelGal || 0,
              capacity: v.fuelCapacityGal || 100,
              percentage:
                v.currentFuelGal && v.fuelCapacityGal
                  ? (v.currentFuelGal / v.fuelCapacityGal) * 100
                  : 0,
            },
            glp: {
              current: v.currentGlpM3 || 0,
              capacity: v.glpCapacityM3 || 100,
              percentage:
                v.currentGlpM3 && v.glpCapacityM3
                  ? (v.currentGlpM3 / v.glpCapacityM3) * 100
                  : 0,
            },
          })) || [],
        orders: apiData.orders || [],
        blockages:
          apiData.activeBlockages?.map((b) => ({
            id: b.id?.toString() || "",
            startTime: b.startTime || "",
            endTime: b.endTime || "",
            positions: b.lines || [],
          })) || [],
        depots: [],
      };

      transformDataToMapElements(environmentData);
      transformDataToSlideElements(environmentData);
    } catch (error) {
      console.error("Error al averiar vehículo:", error);
      setBreakdownError(
        error instanceof Error
          ? error.message
          : "Error desconocido al averiar vehículo"
      );
    } finally {
      setIsBreakdownLoading(false);
    }
  };

  // Handle vehicle repair
  const handleRepairVehicle = async () => {
    if (!selectedElement || selectedElement.type !== "vehicle") return;

    try {
      setIsRepairLoading(true);
      setRepairError(null);

      const response = await simulation.repairVehicle({
        vehicleId: selectedElement.id,
      });

      // Show success message
      setOperationSuccess(
        `Vehículo ${selectedElement.id} reparado. Estado: ${response.vehicleStatus}`
      );

      // Auto-dismiss success message after 5 seconds
      setTimeout(() => {
        setOperationSuccess(null);
      }, 5000);

      // Force a refresh of the data
      const apiData = await simulation.getEnvironment();

      // Convert API data to our internal EnvironmentData format
      const environmentData: EnvironmentData = {
        timestamp: new Date().toISOString(),
        simulationTime: apiData.currentTime || "",
        currentTime: apiData.currentTime,
        running: apiData.running,
        vehicles:
          apiData.vehicles?.map((v) => ({
            id: v.id || "",
            type: v.type || "",
            status: v.status || "",
            position: v.currentPosition || { x: 0, y: 0 },
            fuel: {
              current: v.currentFuelGal || 0,
              capacity: v.fuelCapacityGal || 100,
              percentage:
                v.currentFuelGal && v.fuelCapacityGal
                  ? (v.currentFuelGal / v.fuelCapacityGal) * 100
                  : 0,
            },
            glp: {
              current: v.currentGlpM3 || 0,
              capacity: v.glpCapacityM3 || 100,
              percentage:
                v.currentGlpM3 && v.glpCapacityM3
                  ? (v.currentGlpM3 / v.glpCapacityM3) * 100
                  : 0,
            },
          })) || [],
        orders: apiData.orders || [],
        blockages:
          apiData.activeBlockages?.map((b) => ({
            id: b.id?.toString() || "",
            startTime: b.startTime || "",
            endTime: b.endTime || "",
            positions: b.lines || [],
          })) || [],
        depots: [],
      };

      transformDataToMapElements(environmentData);
      transformDataToSlideElements(environmentData);
    } catch (error) {
      console.error("Error al reparar vehículo:", error);
      setRepairError(
        error instanceof Error
          ? error.message
          : "Error desconocido al reparar vehículo"
      );

      // Auto-dismiss error message after 5 seconds
      setTimeout(() => {
        setRepairError(null);
      }, 5000);
    } finally {
      setIsRepairLoading(false);
    }
  };

  // Draw the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set background
    ctx.fillStyle = "#f8fafc"; // Light gray background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;

    // Draw grid lines
    const gridSize = 20;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Calculate the visible area
    const visibleWidth = canvas.width / scale;
    const visibleHeight = canvas.height / scale;
    
    // Convert simulation coordinates to canvas coordinates
    const toCanvasX = (x: number) => (x - offset.x) * scale + canvas.width / 2;
    const toCanvasY = (y: number) => (y - offset.y) * scale + canvas.height / 2;

    // Draw blocked roads
    ctx.strokeStyle = "#ef4444"; // Red for blocked roads
    ctx.lineWidth = 3;
    
    blockedRoads.forEach(road => {
      ctx.beginPath();
      ctx.moveTo(toCanvasX(road.from.x), toCanvasY(road.from.y));
      ctx.lineTo(toCanvasX(road.to.x), toCanvasY(road.to.y));
      ctx.stroke();
      
      // Draw blockage marker
      ctx.fillStyle = "#ef4444";
      const midX = (road.from.x + road.to.x) / 2;
      const midY = (road.from.y + road.to.y) / 2;
      ctx.beginPath();
      ctx.arc(toCanvasX(midX), toCanvasY(midY), 5, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // Draw map elements
    mapElements.forEach(element => {
      const x = toCanvasX(element.x);
      const y = toCanvasY(element.y);
      
      // Skip if outside visible area with some margin
      if (x < -50 || x > canvas.width + 50 || y < -50 || y > canvas.height + 50) {
        return;
      }
      
      const isHovered = hoveredElement?.id === element.id;
      const isSelected = selectedElement?.id === element.id;
      
      ctx.save();
      
      // Draw element based on type
      switch (element.type) {
        case "vehicle":
          // Base color by vehicle status
          let color = "#10b981"; // Available - green
          if (element.status === "MAINTENANCE") color = "#f59e0b"; // Amber
          else if (element.status === "INCIDENT") color = "#ef4444"; // Red
          
          ctx.fillStyle = color;
          ctx.strokeStyle = isSelected ? "#000" : "#64748b";
          ctx.lineWidth = isSelected ? 2 : 1;
          
          // Draw vehicle icon based on direction
          ctx.beginPath();
          
          if (element.direction === "north") {
            ctx.moveTo(x, y - 10);
            ctx.lineTo(x + 7, y + 5);
            ctx.lineTo(x - 7, y + 5);
          } else if (element.direction === "south") {
            ctx.moveTo(x, y + 10);
            ctx.lineTo(x + 7, y - 5);
            ctx.lineTo(x - 7, y - 5);
          } else if (element.direction === "east") {
            ctx.moveTo(x + 10, y);
            ctx.lineTo(x - 5, y - 7);
            ctx.lineTo(x - 5, y + 7);
          } else { // west
            ctx.moveTo(x - 10, y);
            ctx.lineTo(x + 5, y - 7);
            ctx.lineTo(x + 5, y + 7);
          }
          
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
          
        case "mainWarehouse":
          ctx.fillStyle = "#1d4ed8"; // Blue
          ctx.strokeStyle = isSelected ? "#000" : "#1e40af";
          ctx.lineWidth = isSelected ? 2 : 1;
          ctx.fillRect(x - 12, y - 12, 24, 24);
          ctx.strokeRect(x - 12, y - 12, 24, 24);
          break;
          
        case "warehouse":
          ctx.fillStyle = "#3b82f6"; // Light blue
          ctx.strokeStyle = isSelected ? "#000" : "#1d4ed8";
          ctx.lineWidth = isSelected ? 2 : 1;
          ctx.fillRect(x - 8, y - 8, 16, 16);
          ctx.strokeRect(x - 8, y - 8, 16, 16);
          break;
          
        case "customer":
          ctx.fillStyle = "#a3e635"; // Lime
          ctx.strokeStyle = isSelected ? "#000" : "#4d7c0f";
          ctx.lineWidth = isSelected ? 2 : 1;
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
          break;
          
        case "blockedRoad":
          // Already drawn as lines, skip
          break;
      }
      
      // Draw label if hovered or selected
      if (isHovered || isSelected) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        
        const label = element.label;
        const details = element.details || "";
        
        ctx.font = "12px Arial";
        const labelWidth = ctx.measureText(label).width;
        const detailsWidth = details ? ctx.measureText(details).width : 0;
        const boxWidth = Math.max(labelWidth, detailsWidth) + 16;
        
        // Draw tooltip background
        ctx.beginPath();
        ctx.roundRect(
          x - boxWidth / 2, 
          y - 40, 
          boxWidth, 
          details ? 40 : 24, 
          4
        );
        ctx.fill();
        ctx.stroke();
        
        // Draw text
        ctx.fillStyle = "#fff";
        ctx.fillText(label, x - labelWidth / 2, y - 26);
        
        if (details) {
          ctx.font = "10px Arial";
          ctx.fillText(details, x - detailsWidth / 2, y - 12);
        }
      }
      
      ctx.restore();
    });
    
    // Draw simulation time in the corner
    if (simulationTime) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.font = "14px Arial";
      ctx.fillText(`Tiempo: ${simulationTime}`, 10, 20);
    }
    
  }, [mapElements, blockedRoads, hoveredElement, selectedElement, simulationTime, scale, offset]);
  
  // Handle mouse move for hover detection
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    // Convert to simulation coordinates
    const simX = (x - canvas.width / 2) / scale + offset.x;
    const simY = (y - canvas.height / 2) / scale + offset.y;
    
    // Check if mouse is over any element
    let hovered: MapElement | null = null;
    
    for (const element of mapElements) {
      const distance = Math.sqrt(
        Math.pow(simX - element.x, 2) + Math.pow(simY - element.y, 2)
      );
      
      // Different hit areas based on element type
      let hitRadius = 10;
      if (element.type === "mainWarehouse") hitRadius = 15;
      else if (element.type === "warehouse") hitRadius = 10;
      else if (element.type === "customer") hitRadius = 8;
      else if (element.type === "vehicle") hitRadius = 10;
      
      if (distance <= hitRadius / scale) {
        hovered = element;
        break;
      }
    }
    
    setHoveredElement(hovered);
  };
  
  // Handle click to select elements
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // If hovering over an element, select it
    setSelectedElement(hoveredElement);
  };
  
  // Handle wheel for zooming
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    // Zoom factor
    const zoomIntensity = 0.1;
    const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;
    
    // Update scale with limits
    setScale(prev => {
      const newScale = Math.max(0.5, Math.min(5, prev + delta));
      return newScale;
    });
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2">Cargando datos de simulación...</p>
          </div>
        </div>
      )}

      {dataError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
          <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{dataError}</p>
            <button 
              className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded"
              onClick={() => setDataError(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      
      {/* Hover info */}
      {selectedElement && (
        <div className="absolute top-2 right-2 p-3 bg-white rounded-lg shadow-md border border-gray-200 max-w-xs z-30">
          <h3 className="font-medium">{selectedElement.label}</h3>
          {selectedElement.details && <p className="text-sm text-gray-600 mt-1">{selectedElement.details}</p>}
          {selectedElement.type === "vehicle" && (
            <div className="mt-2 flex gap-2">
              <button 
                onClick={handleBreakdownVehicle}
                disabled={selectedElement.status === "INCIDENT"}
                className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded disabled:opacity-50"
              >
                Averiar
              </button>
              <button
                onClick={handleRepairVehicle}
                disabled={selectedElement.status !== "INCIDENT"}
                className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded disabled:opacity-50"
              >
                Reparar
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Success or error messages */}
      {operationSuccess && (
        <div className="absolute top-2 left-2 p-3 bg-green-50 border border-green-200 rounded-lg max-w-xs text-sm text-green-800 z-30">
          {operationSuccess}
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-2 left-2 p-2 bg-white rounded-lg shadow-md border border-gray-200 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 bg-green-500"></div>
          <span>Vehículo disponible</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 bg-amber-500"></div>
          <span>Vehículo en mantenimiento</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 bg-red-500"></div>
          <span>Vehículo averiado</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 bg-blue-700"></div>
          <span>Depósito principal</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 bg-blue-500"></div>
          <span>Depósito secundario</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-lime-400"></div>
          <span>Cliente/Pedido</span>
        </div>
      </div>

      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onWheel={handleWheel}
      />
    </div>
  );
}
