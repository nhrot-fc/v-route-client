"use client";

import { useRef, useEffect, useState } from "react";
import { SimulationStateDTO, VehicleDTO, OrderDTO, DepotDTO } from "@/lib/api-client";
import { Maximize, Minimize, Plus, Minus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimulationCanvasProps {
  simulationState: SimulationStateDTO | null;
}

interface TooltipInfo {
  show: boolean;
  x: number;
  y: number;
  content: string;
}

// Define types for map elements
interface BaseMapElement {
  type: 'depot' | 'auxDepot' | 'order' | 'vehicle' | 'blockage';
  x: number;
  y: number;
  radius: number;
}

interface DepotMapElement extends BaseMapElement {
  type: 'depot';
  data: DepotDTO;
}

interface AuxDepotMapElement extends BaseMapElement {
  type: 'auxDepot';
  data: DepotDTO & { indexNumber?: number; capacityM3?: number };
}

interface OrderMapElement extends BaseMapElement {
  type: 'order';
  data: OrderDTO & { isOverdue?: boolean };
}

interface VehicleMapElement extends BaseMapElement {
  type: 'vehicle';
  data: VehicleDTO;
}

interface BlockageMapElement extends BaseMapElement {
  type: 'blockage';
  data: {
    startTime?: string;
    endTime?: string;
    lines?: Array<{ x?: number; y?: number }>;
  };
}

type MapElement = 
  | DepotMapElement 
  | AuxDepotMapElement 
  | OrderMapElement 
  | VehicleMapElement 
  | BlockageMapElement;

export function SimulationCanvas({ simulationState }: SimulationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  const [isImagesLoaded, setIsImagesLoaded] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipInfo>({ show: false, x: 0, y: 0, content: "" });
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  
  // Elements on the map for hover detection
  const [mapElements, setMapElements] = useState<MapElement[]>([]);

  // Zoom and pan state
  const [zoom, setZoom] = useState(15);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load all the icons when the component mounts
  useEffect(() => {
    const colorFolders = ['red', 'orange', 'yellow', 'green', 'blue'];
    const iconTypes = [
      'main-warehouse', 
      'warehouse', 
      'customer', 
      'truck-north', 
      'truck-south', 
      'truck-east', 
      'truck-west'
    ];
    
    const imageUrls: Record<string, string> = {
      blockedRoad: "/icons/blocked-road.svg",
    };
    
    // Generate paths for all colored icons
    colorFolders.forEach(color => {
      iconTypes.forEach(type => {
        imageUrls[`${type}_${color}`] = `/icons/colored/${color}/${type}.svg`;
      });
    });

    const loadedImages: Record<string, HTMLImageElement> = {};
    let loadedCount = 0;

    Object.entries(imageUrls).forEach(([key, url]) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === Object.keys(imageUrls).length) {
          setIsImagesLoaded(true);
        }
      };
      loadedImages[key] = img;
    });

    setImages(loadedImages);
  }, []);

  // Handle fullscreen mode
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  // Handle mouse movement for hover effects
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });
    
    // If dragging, update pan
    if (isDragging) {
      setPan(prev => ({
        x: prev.x + (x - dragStart.x),
        y: prev.y + (y - dragStart.y),
      }));
      setDragStart({ x, y });
      return;
    }
    
    // Check if mouse is over any element
    const hoveredElement = mapElements.find(element => {
      const dx = (element.x * zoom + pan.x) - x;
      const dy = ((50 - element.y) * zoom + pan.y) - y;
      return Math.sqrt(dx * dx + dy * dy) <= element.radius;
    });
    
    if (hoveredElement) {
      let content = '';
      
      switch (hoveredElement.type) {
        case 'depot':
          content = `Depósito Principal`;
          break;
        case 'auxDepot': {
          const depot = hoveredElement.data;
          content = `Depósito Aux. ${depot.indexNumber || ''}\nCapacidad: ${depot.capacityM3 || 160}m³`;
          break;
        }
        case 'order': {
          const order = hoveredElement.data;
          const isOverdue = order.isOverdue;
          const delivered = order.delivered || false;
          const status = delivered ? 'Entregado' : isOverdue ? 'Vencido' : 'Pendiente';
          content = `Pedido: ${order.id || 'N/A'}\nVolumen: ${order.glpRequestM3 || 0}m³\nEstado: ${status}\nLlegada: ${new Date(order.arrivalTime || '').toLocaleString()}\nPlazo: ${new Date(order.deadlineTime || '').toLocaleString()}`;
          break;
        }
        case 'vehicle': {
          const vehicle = hoveredElement.data;
          const currentGlp = vehicle.currentGlpM3 || 0;
          const maxGlp = vehicle.glpCapacityM3 || 1;
          const currentFuel = vehicle.currentFuelGal || 0;
          const maxFuel = vehicle.fuelCapacityGal || 25;
          
          const glpPercentage = (currentGlp / maxGlp) * 100;
          const fuelPercentage = (currentFuel / maxFuel) * 100;
          
          content = `Vehículo: ${vehicle.id || 'N/A'}\nTipo: ${vehicle.type || 'N/A'}\nGLP: ${currentGlp.toFixed(2)}/${maxGlp}m³ (${glpPercentage.toFixed(0)}%)\nCombustible: ${currentFuel.toFixed(2)}/${maxFuel}gal (${fuelPercentage.toFixed(0)}%)\nEstado: ${vehicle.status || 'Desconocido'}`;
          break;
        }
        case 'blockage': {
          const blockage = hoveredElement.data;
          content = `Bloqueo\nInicio: ${new Date(blockage.startTime || '').toLocaleString()}\nFin: ${new Date(blockage.endTime || '').toLocaleString()}`;
          break;
        }
      }
      
      setTooltip({
        show: true,
        x: x + 10,
        y: y + 10,
        content
      });
    } else {
      setTooltip({ show: false, x: 0, y: 0, content: "" });
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Start dragging
    setIsDragging(true);
    setDragStart({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, content: "" });
    setIsDragging(false);
  };

  // Handle zoom operations
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 3, 30));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 3, 5));
  };

  const resetView = () => {
    setPan({ x: 0, y: 0 });
    setZoom(15);
  };

  // Draw the simulation when the state changes or images are loaded
  useEffect(() => {
    if (simulationState && isImagesLoaded) {
      drawSimulation(simulationState);
    }
  }, [simulationState, isImagesLoaded, mousePosition, zoom, pan]);

  // Get color based on GLP percentage
  const getGlpColorLevel = (current: number, capacity: number): string => {
    const percentage = (current / capacity) * 100;
    if (percentage <= 20) return 'red';
    if (percentage <= 40) return 'orange';
    if (percentage <= 60) return 'yellow';
    if (percentage <= 80) return 'green';
    return 'blue';
  };

  // Get order size category (small, medium, large)
  const getOrderSizeCategory = (volume: number): 'small' | 'medium' | 'large' => {
    if (volume <= 5) return 'small';
    if (volume <= 15) return 'medium';
    return 'large';
  };
  
  const drawSimulation = (state: SimulationStateDTO) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas and map elements
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const elements: MapElement[] = [];
    
    // Draw grid (10x10) with zoom and pan
    drawGrid(ctx, canvas.width, canvas.height);
    
    // Scale coordinates to canvas size with zoom and pan
    const scaleX = (x: number) => (x * zoom + pan.x);
    const scaleY = (y: number) => ((50 - y) * zoom + pan.y); // Invert Y to have 0 at bottom
    
    // Draw blockages first so they appear behind other elements
    if (state.activeBlockages) {
      state.activeBlockages.forEach(blockage => {
        if (blockage.lines && blockage.lines.length > 1) {
          // Draw blockage with enhanced visual style
          ctx.lineWidth = 3 * (zoom / 15);
          
          // Create gradient for blockage line
          const firstPoint = blockage.lines[0];
          const lastPoint = blockage.lines[blockage.lines.length - 1];
          const gradient = ctx.createLinearGradient(
            scaleX(firstPoint.x || 0), 
            scaleY(firstPoint.y || 0), 
            scaleX(lastPoint.x || 0), 
            scaleY(lastPoint.y || 0)
          );
          gradient.addColorStop(0, "#ef4444");
          gradient.addColorStop(0.5, "#fca5a5");
          gradient.addColorStop(1, "#ef4444");
          
          ctx.strokeStyle = gradient;
          ctx.beginPath();
          
          const firstPt = blockage.lines[0];
          ctx.moveTo(scaleX(firstPt.x || 0), scaleY(firstPt.y || 0));
          
          for (let i = 1; i < blockage.lines.length; i++) {
            const point = blockage.lines[i];
            ctx.lineTo(scaleX(point.x || 0), scaleY(point.y || 0));
          }
          
          // Use dashed line for blockage
          ctx.setLineDash([8 * (zoom / 15), 4 * (zoom / 15)]);
          ctx.stroke();
          ctx.setLineDash([]);
          
          // Draw blocked road icons at each segment
          for (let i = 0; i < blockage.lines.length - 1; i++) {
            const point1 = blockage.lines[i];
            const point2 = blockage.lines[i + 1];
            const midX = ((point1.x || 0) + (point2.x || 0)) / 2;
            const midY = ((point1.y || 0) + (point2.y || 0)) / 2;
            const x = scaleX(midX);
            const y = scaleY(midY);
            
            // Add shadow effect to icons
            ctx.shadowColor = "rgba(0,0,0,0.3)";
            ctx.shadowBlur = 5 * (zoom / 15);
            ctx.shadowOffsetX = 2 * (zoom / 15);
            ctx.shadowOffsetY = 2 * (zoom / 15);
            
            const iconSize = 15 * (zoom / 15);
            drawIcon(ctx, images.blockedRoad, x, y, iconSize);
            
            // Reset shadow
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            // Add blockage to elements for hover
            elements.push({
              type: 'blockage',
              x: midX,
              y: midY,
              radius: 15,
              data: blockage
            });
          }
        }
      });
    }
    
    // Draw orders
    if (state.pendingOrders) {
      state.pendingOrders.forEach(order => {
        const isOverdue = order.deadlineTime ? new Date(order.deadlineTime) < new Date(state.currentTime || '') : false;
        const iconColor = order.delivered ? 'green' : isOverdue ? 'red' : 'blue';
        const iconKey = `customer_${iconColor}`;
        const x = order.position?.x || 0;
        const y = order.position?.y || 0;
        
        // Determine order size for icon sizing
        const orderSize = getOrderSizeCategory(order.glpRequestM3 || 0);
        const sizeMap = { small: 12, medium: 16, large: 20 };
        const iconSize = sizeMap[orderSize] * (zoom / 15);
        
        // Add shadow effect to order icons
        ctx.shadowColor = "rgba(0,0,0,0.2)";
        ctx.shadowBlur = 4 * (zoom / 15);
        ctx.shadowOffsetX = 1 * (zoom / 15);
        ctx.shadowOffsetY = 2 * (zoom / 15);
        
        drawIcon(ctx, images[iconKey], scaleX(x), scaleY(y), iconSize);
        
        // Reset shadow
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Only show text labels when not hovering for cleaner view
        if (!tooltip.show) {
          // Draw order details with enhanced styling
          ctx.fillStyle = order.delivered ? "#16a34a" : isOverdue ? "#dc2626" : "#1d4ed8";
          ctx.font = `${10 * (zoom / 15)}px Arial`;
          
          // Add background to text for better readability
          const orderText = `${order.id || 'N/A'}`;
          const textWidth = ctx.measureText(orderText).width;
          ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
          ctx.fillRect(
            scaleX(x) + iconSize, 
            scaleY(y) - 8 * (zoom / 15), 
            textWidth + 4 * (zoom / 15), 
            16 * (zoom / 15)
          );
          
          // Now draw text
          ctx.fillStyle = order.delivered ? "#16a34a" : isOverdue ? "#dc2626" : "#1d4ed8";
          ctx.fillText(orderText, scaleX(x) + iconSize + 2 * (zoom / 15), scaleY(y));
          
          // Add GLP request indicator
          const glpText = `${order.glpRequestM3 || 0}m³`;
          const glpTextWidth = ctx.measureText(glpText).width;
          
          // Background for GLP text
          ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
          ctx.fillRect(
            scaleX(x) - glpTextWidth / 2, 
            scaleY(y) + iconSize + 2 * (zoom / 15), 
            glpTextWidth + 4 * (zoom / 15), 
            16 * (zoom / 15)
          );
          
          // GLP text
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";
          ctx.fillText(
            glpText, 
            scaleX(x), 
            scaleY(y) + iconSize + 12 * (zoom / 15)
          );
          ctx.textAlign = "left"; // Reset text align
        }
        
        // Add order to elements for hover
        elements.push({
          type: 'order',
          x: x,
          y: y,
          radius: iconSize + 5,
          data: { ...order, isOverdue }
        });
      });
    }
    
    // Draw main depot
    if (state.mainDepot) {
      const x = state.mainDepot.position?.x || 0;
      const y = state.mainDepot.position?.y || 0;
      
      // Add shadow effect to main depot icon
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 6 * (zoom / 15);
      ctx.shadowOffsetX = 2 * (zoom / 15);
      ctx.shadowOffsetY = 3 * (zoom / 15);
      
      const depotSize = 25 * (zoom / 15);
      drawIcon(ctx, images.main_warehouse_blue, scaleX(x), scaleY(y), depotSize);
      
      // Reset shadow
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Only show text labels when not hovering
      if (!tooltip.show) {
        // Label with enhanced styling
        const depotText = "Depósito Principal";
        const textWidth = ctx.measureText(depotText).width;
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(
          scaleX(x) + depotSize, 
          scaleY(y) - 8 * (zoom / 15), 
          textWidth + 8 * (zoom / 15), 
          16 * (zoom / 15)
        );
        
        ctx.fillStyle = "#1e40af"; // Darker blue for depot labels
        ctx.font = `bold ${12 * (zoom / 15)}px Arial`;
        ctx.fillText(depotText, scaleX(x) + depotSize + 4 * (zoom / 15), scaleY(y));
      }
      
      // Add depot to elements for hover
      elements.push({
        type: 'depot',
        x: x,
        y: y,
        radius: depotSize,
        data: state.mainDepot
      });
    }
    
    // Draw auxiliary depots
    if (state.auxDepots) {
      state.auxDepots.forEach((depot, index) => {
        const x = depot.position?.x || 0;
        const y = depot.position?.y || 0;
        
        // Add shadow effect to depot icon
        ctx.shadowColor = "rgba(0,0,0,0.25)";
        ctx.shadowBlur = 5 * (zoom / 15);
        ctx.shadowOffsetX = 2 * (zoom / 15);
        ctx.shadowOffsetY = 2 * (zoom / 15);
        
        const depotSize = 20 * (zoom / 15);
        drawIcon(ctx, images.warehouse_blue, scaleX(x), scaleY(y), depotSize);
        
        // Reset shadow
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Only show text labels when not hovering
        if (!tooltip.show) {
          // Label with enhanced styling
          const depotText = `Depósito Aux. ${index + 1}`;
          const textWidth = ctx.measureText(depotText).width;
          
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.fillRect(
            scaleX(x) + depotSize, 
            scaleY(y) - 8 * (zoom / 15), 
            textWidth + 8 * (zoom / 15), 
            16 * (zoom / 15)
          );
          
          ctx.fillStyle = "#3b82f6"; // Blue for aux depot labels
          ctx.font = `bold ${10 * (zoom / 15)}px Arial`;
          ctx.fillText(depotText, scaleX(x) + depotSize + 4 * (zoom / 15), scaleY(y));
        }
        
        // Add aux depot to elements for hover
        elements.push({
          type: 'auxDepot',
          x: x,
          y: y,
          radius: depotSize,
          data: { 
            ...depot, 
            id: depot.id?.toString() || 'aux-depot-' + (index + 1), 
            capacityM3: 160 
          }
        });
      });
    }
    
    // Draw vehicles
    if (state.vehicles) {
      state.vehicles.forEach(vehicle => {
        const x = vehicle.currentPosition?.x || 0;
        const y = vehicle.currentPosition?.y || 0;
        
        // Determine truck direction based on vehicle ID
        let direction = 'east'; // Default
        const vehicleId = parseInt((vehicle.id || "").replace(/\D/g, '') || "0");
        
        if (vehicleId % 4 === 0) direction = 'north';
        else if (vehicleId % 4 === 1) direction = 'east';
        else if (vehicleId % 4 === 2) direction = 'south';
        else direction = 'west';
        
        // Use color based on GLP level
        const glpColor = getGlpColorLevel(vehicle.currentGlpM3 || 0, vehicle.glpCapacityM3 || 1);
        const iconKey = `truck-${direction}_${glpColor}`;
        
        // Add shadow effect to vehicle icon
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 5 * (zoom / 15);
        ctx.shadowOffsetX = 2 * (zoom / 15);
        ctx.shadowOffsetY = 2 * (zoom / 15);
        
        const vehicleSize = 20 * (zoom / 15);
        drawIcon(ctx, images[iconKey], scaleX(x), scaleY(y), vehicleSize);
        
        // Reset shadow
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Only show text labels when not hovering
        if (!tooltip.show) {
          // Enhanced label with background
          const vehicleText = `${vehicle.id || 'N/A'}`;
          const textWidth = ctx.measureText(vehicleText).width;
          
          // Get color based on vehicle type
          let typeColor = "#10b981"; // Default green
          if (vehicle.type === "TA") typeColor = "#ef4444";      // Red
          else if (vehicle.type === "TB") typeColor = "#3b82f6"; // Blue
          else if (vehicle.type === "TC") typeColor = "#f59e0b"; // Amber
          else if (vehicle.type === "TD") typeColor = "#8b5cf6"; // Purple
          
          ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
          ctx.fillRect(
            scaleX(x) + vehicleSize, 
            scaleY(y) - 8 * (zoom / 15), 
            textWidth + 8 * (zoom / 15) + 20 * (zoom / 15), // Extra space for type indicator
            16 * (zoom / 15)
          );
          
          // Vehicle ID
          ctx.fillStyle = "#000000";
          ctx.font = `bold ${9 * (zoom / 15)}px Arial`;
          ctx.fillText(vehicleText, scaleX(x) + vehicleSize + 4 * (zoom / 15), scaleY(y));
          
          // Vehicle type indicator
          const typeText = vehicle.type || "";
          ctx.fillStyle = "white";
          ctx.font = `bold ${8 * (zoom / 15)}px Arial`;
          
          // Draw vehicle type indicator
          const typeX = scaleX(x) + vehicleSize + textWidth + 8 * (zoom / 15);
          const typeY = scaleY(y);
          const typeWidth = 16 * (zoom / 15);
          const typeHeight = 14 * (zoom / 15);
          
          ctx.fillStyle = typeColor;
          ctx.beginPath();
          ctx.roundRect(typeX, typeY - typeHeight/2, typeWidth, typeHeight, 3);
          ctx.fill();
          
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";
          ctx.fillText(typeText, typeX + typeWidth/2, typeY + 1);
          ctx.textAlign = "left"; // Reset text align
          
          // Add fuel and GLP indicators below vehicle
          const barWidth = 20 * (zoom / 15);
          const barHeight = 3 * (zoom / 15);
          const barSpacing = 5 * (zoom / 15);
          
          // GLP bar
          const glpPercentage = (vehicle.currentGlpM3 || 0) / (vehicle.glpCapacityM3 || 1);
          ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
          ctx.fillRect(scaleX(x) - barWidth/2, scaleY(y) + vehicleSize + barSpacing, barWidth, barHeight);
          
          ctx.fillStyle = glpColor === 'red' ? "#ef4444" : 
                          glpColor === 'orange' ? "#f97316" :
                          glpColor === 'yellow' ? "#eab308" :
                          glpColor === 'green' ? "#10b981" : "#3b82f6";
          ctx.fillRect(scaleX(x) - barWidth/2, scaleY(y) + vehicleSize + barSpacing, barWidth * glpPercentage, barHeight);
          
          // Fuel bar
          const fuelPercentage = (vehicle.currentFuelGal || 0) / (vehicle.fuelCapacityGal || 1);
          const fuelColor = fuelPercentage <= 0.2 ? "#ef4444" : 
                           fuelPercentage <= 0.4 ? "#f97316" :
                           fuelPercentage <= 0.6 ? "#eab308" : "#10b981";
          
          ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
          ctx.fillRect(scaleX(x) - barWidth/2, scaleY(y) + vehicleSize + barSpacing + barHeight + 1, barWidth, barHeight);
          
          ctx.fillStyle = fuelColor;
          ctx.fillRect(scaleX(x) - barWidth/2, scaleY(y) + vehicleSize + barSpacing + barHeight + 1, barWidth * fuelPercentage, barHeight);
        }
        
        // Add vehicle to elements for hover
        elements.push({
          type: 'vehicle',
          x: x,
          y: y,
          radius: vehicleSize,
          data: vehicle
        });
      });
    }
    
    // Update map elements for hover detection
    setMapElements(elements);
  };
  
  // Helper function to draw grid with zoom and pan
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = "#e5e7eb"; // Light gray
    ctx.lineWidth = 0.5;
    
    // Draw vertical lines (representing X coordinates)
    for (let i = 0; i <= 70; i += 1) {
      const x = i * zoom + pan.x;
      if (x < 0 || x > width) continue; // Skip if outside canvas
      
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      
      // Add coordinate labels every 5 units
      if (i % 5 === 0) {
        ctx.fillStyle = "#6b7280"; // Medium gray
        ctx.font = `${10 * (zoom / 15)}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(`${i}`, x, 15);
      }
    }
    
    // Draw horizontal lines (representing Y coordinates)
    for (let i = 0; i <= 50; i += 1) {
      const y = i * zoom + pan.y;
      if (y < 0 || y > height) continue; // Skip if outside canvas
      
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      
      // Add coordinate labels every 5 units
      if (i % 5 === 0) {
        ctx.fillStyle = "#6b7280"; // Medium gray
        ctx.font = `${10 * (zoom / 15)}px Arial`;
        ctx.textAlign = "left";
        ctx.fillText(`${50 - i}`, 5, y); // Invert Y to match our coordinate system
      }
    }
  };
  
  // Helper function to draw an icon centered at (x,y) with given size
  const drawIcon = (
    ctx: CanvasRenderingContext2D, 
    icon: HTMLImageElement, 
    x: number, 
    y: number, 
    size: number
  ) => {
    if (!icon) return;
    const halfSize = size / 2;
    ctx.drawImage(icon, x - halfSize, y - halfSize, size, size);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-white">
      <canvas 
        ref={canvasRef} 
        width={1920} 
        height={1080}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      />
      
      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-white/90 p-2 rounded-md shadow-sm backdrop-blur-sm z-10">
        <Button variant="outline" size="icon" onClick={handleZoomIn} title="Acercar">
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleZoomOut} title="Alejar">
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={resetView}
          title="Restablecer vista"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Fullscreen toggle */}
      <button
        className="absolute top-4 right-4 z-10 w-10 h-10 bg-white border border-gray-300 rounded-full shadow flex items-center justify-center hover:bg-blue-50 transition"
        onClick={handleToggleFullscreen}
        title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
      >
        {isFullscreen
          ? <Minimize className="w-5 h-5 text-blue-500" />
          : <Maximize className="w-5 h-5 text-blue-500" />}
      </button>
      
      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-white/80 p-2 rounded-md shadow-sm backdrop-blur-sm z-10">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#1e40af] rounded-sm"></div>
            <span className="text-xs">Almacén Principal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#3b82f6] rounded-sm"></div>
            <span className="text-xs">Almacén Secundario</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#10b981] rounded-full"></div>
            <span className="text-xs">Vehículo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#f59e0b] rounded-sm"></div>
            <span className="text-xs">Cliente/Pedido</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <div className="w-4 h-1 bg-[#ef4444]"></div>
            <span className="text-xs">Carretera Bloqueada</span>
          </div>
        </div>
      </div>
      
      {tooltip.show && (
        <div 
          className="absolute bg-white p-2 rounded shadow-md text-xs z-20 pointer-events-none"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            maxWidth: '200px',
            border: '1px solid #e5e7eb',
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)'
          }}
        >
          {tooltip.content.split('\n').map((line, i) => (
            <div key={i} className={i === 0 ? "font-bold" : ""}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
} 