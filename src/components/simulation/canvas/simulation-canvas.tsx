import { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import {
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Map,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DepotDTO, OrderDTO } from "@/lib/api-client";

// Import modularized components
import {
  Grid,
  InfoBox,
  renderElements,
  createMapToScreenCoords,
  StatsPanel
} from "./";
import type {
  SimulationCanvasProps,
  TooltipInfo,
  EnhancedTooltipInfo,
} from "./types";

// Time display component to show current simulation time
const TimeDisplay = ({ currentTime }: { currentTime: string | undefined }) => {
  if (!currentTime) return null;
  
  const timeDate = new Date(currentTime);
  const formattedDate = timeDate.toLocaleDateString();
  const formattedTime = timeDate.toLocaleTimeString();
  
  return (
    <div className="absolute top-4 left-4 bg-white/90 p-3 rounded-lg shadow-md backdrop-blur-sm z-10 border border-gray-100">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-blue-600" />
        <div className="flex flex-col">
          <span className="text-sm font-medium">Tiempo de simulación</span>
          <span className="text-xs">{formattedDate}</span>
          <span className="text-lg font-bold text-blue-700">
            {formattedTime}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * SimulationCanvas component
 * Displays a Konva-based canvas for visualization of simulation data
 */
export function SimulationCanvas({
  simulationId,
  simulationState,
}: SimulationCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const [tooltip, setTooltip] = useState<TooltipInfo>({
    show: false,
    x: 0,
    y: 0,
    content: "",
  });

  // Enhanced tooltip state for new InfoBox component
  const [enhancedTooltip, setEnhancedTooltip] = useState<EnhancedTooltipInfo>({
    show: false,
    x: 0,
    y: 0,
    title: "",
    color: "#1e40af",
    details: [],
  });

  // Zoom and pan state
  const [zoom, setZoom] = useState(15);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Selected vehicle for route display
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null
  );
  
  // Selected depot for info display
  const [selectedDepot, setSelectedDepot] = useState<{
    depot: DepotDTO;
    isMainDepot: boolean;
    index?: number;
  } | null>(null);
  
  // Selected order for info display
  const [selectedOrder, setSelectedOrder] = useState<
    (OrderDTO & { isOverdue?: boolean }) | null
  >(null);
  
  // Panel collapsed state
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  
  // Get the selected vehicle details
  const selectedVehicle =
    selectedVehicleId && simulationState?.vehicles
      ? simulationState.vehicles.find((v) => v.id === selectedVehicleId) || null
      : null;

  // Handle container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // Handle fullscreen mode
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      void containerRef.current.requestFullscreen();
    } else if (document.exitFullscreen) {
      void document.exitFullscreen();
    }
  };

  // Handle zoom operations
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 3, 30));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 3, 5));
  };

  const resetView = () => {
    setPan({ x: 0, y: 0 });
    setZoom(15);
  };

  // Handle drag operations
  const handleDragStart = useCallback(() => {
    // Nothing needed as Konva handles dragging internally
  }, []);

  const handleDragMove = useCallback((e: KonvaEventObject<DragEvent>) => {
    const stage = e.target.getStage();
    if (stage) {
      setPan({ x: stage.x(), y: stage.y() });
    }
  }, []);

  // Convert map coordinates to screen coordinates
  const mapToScreenCoords = useCallback(
    (x: number, y: number) => {
      return createMapToScreenCoords(zoom, pan.x, pan.y)(x, y);
    },
    [zoom, pan.x, pan.y]
  );
  
  // Toggle panel collapsed state
  const togglePanelCollapsed = useCallback(() => {
    setIsPanelCollapsed((prev) => !prev);
  }, []);
  
  // Clear all selections
  const clearSelections = useCallback(() => {
    setSelectedVehicleId(null);
    setSelectedDepot(null);
    setSelectedOrder(null);
    
    // Hide tooltips
    setTooltip({ show: false, x: 0, y: 0, content: "" });
    setEnhancedTooltip({
      show: false,
      x: 0,
      y: 0,
      title: "",
      color: "#1e40af",
      details: [],
    });
  }, []);
  
  // Handle vehicle selection for route display
  const handleVehicleSelect = useCallback(
    (vehicleId: string | null) => {
      clearSelections();
      setSelectedVehicleId(vehicleId);
    },
    [clearSelections]
  );
  
  // Handle depot selection
  const handleDepotSelect = useCallback(
    (depot: DepotDTO | null, isMainDepot: boolean, index?: number) => {
      clearSelections();
      if (depot) {
        setSelectedDepot({ depot, isMainDepot, index: index } as {
          depot: DepotDTO;
          isMainDepot: boolean;
          index?: number;
        });
      }
    },
    [clearSelections]
  );
  
  // Handle order selection
  const handleOrderSelect = useCallback(
    (order: (OrderDTO & { isOverdue?: boolean }) | null) => {
      clearSelections();
      setSelectedOrder(order);
    },
    [clearSelections]
  );
  
  // Create map elements using the extracted function
  const elements = renderElements({
    simulationState,
    zoom,
    tooltip,
    mapToScreenCoords,
    setTooltip,
    setEnhancedTooltip,
    selectedVehicleId,
    onVehicleSelect: handleVehicleSelect,
    onDepotSelect: handleDepotSelect,
    onOrderSelect: handleOrderSelect,
  });

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-white"
    >
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        draggable={true}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        style={{ cursor: "grab" }}
        scaleX={1}
        scaleY={1}
        x={pan.x}
        y={pan.y}
        pixelRatio={2} // For high DPI displays
      >
        <Layer>
          <Grid
            width={dimensions.width}
            height={dimensions.height}
            cellSize={zoom}
            offsetX={pan.x}
            offsetY={pan.y}
          />
          {elements}
        </Layer>
      </Stage>

      {/* Time display */}
      <TimeDisplay currentTime={simulationState?.currentTime} />

      {/* Unified information panel */}
      <StatsPanel
        simulationId={simulationId ?? ""}
        simulationState={simulationState}
        isCollapsed={isPanelCollapsed}
        onToggleCollapse={togglePanelCollapsed}
        selectedVehicleId={selectedVehicleId}
        onVehicleSelect={handleVehicleSelect}
        selectedDepot={selectedDepot}
        onDepotSelect={handleDepotSelect}
        selectedOrder={selectedOrder}
        onOrderSelect={handleOrderSelect}
      />

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-white/90 p-3 rounded-lg shadow-md backdrop-blur-sm z-10 border border-gray-100">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          title="Acercar"
          className="hover:bg-blue-50"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          title="Alejar"
          className="hover:bg-blue-50"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={resetView}
          title="Restablecer vista"
          className="hover:bg-blue-50"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Fullscreen toggle */}
      <Button
        className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full shadow"
        variant="outline"
        size="icon"
        onClick={handleToggleFullscreen}
        title={
          isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"
        }
      >
        {isFullscreen ? (
          <Minimize className="w-5 h-5" />
        ) : (
          <Maximize className="w-5 h-5" />
        )}
      </Button>

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg shadow-md backdrop-blur-sm z-10 border border-gray-100">
        <div className="flex items-center mb-2 gap-1 text-sm font-medium">
          <Map className="w-4 h-4" />
          <span>Leyenda</span>
        </div>
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
          {selectedVehicleId && (
            <div className="flex items-center gap-2 col-span-2">
              <div className="w-4 h-1 bg-[#4f46e5]"></div>
              <span className="text-xs">Ruta de vehículo</span>
            </div>
          )}
        </div>
      </div>

      {/* Legacy tooltip for backward compatibility */}
      {tooltip.show &&
        !selectedVehicle &&
        !selectedDepot &&
        !selectedOrder && (
          <div
            className="absolute bg-white p-3 rounded-lg shadow-lg text-xs z-20 pointer-events-none border border-gray-200"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              maxWidth: "220px",
              backdropFilter: "blur(8px)",
              backgroundColor: "rgba(255, 255, 255, 0.97)",
            }}
          >
            {tooltip.content.split("\n").map((line, i) => (
              <div key={i} className={i === 0 ? "font-bold text-blue-700" : ""}>
                {line}
              </div>
            ))}
          </div>
        )}

      {/* Enhanced tooltip */}
      {enhancedTooltip.show &&
        !selectedVehicle &&
        !selectedDepot &&
        !selectedOrder && (
          <InfoBox
            title={enhancedTooltip.title}
            details={enhancedTooltip.details}
            color={enhancedTooltip.color}
            x={enhancedTooltip.x}
            y={enhancedTooltip.y}
          />
        )}
    </div>
  );
}
