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
  Timer,
  ChevronDown,
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
const TimeDisplay = ({ 
  currentTime, 
  isMinimized, 
  onToggleMinimize 
}: { 
  currentTime: string | undefined;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}) => {
  if (!currentTime) return null;
  
  const timeDate = new Date(currentTime);
  const formattedDate = timeDate.toLocaleDateString();
  const formattedTime = timeDate.toLocaleTimeString();
  
  return (
    <div className={`absolute top-4 left-4 bg-white/90 rounded-lg shadow-md backdrop-blur-sm z-10 border border-gray-100 ${isMinimized ? 'w-auto' : 'w-64'}`}>
      {isMinimized ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleMinimize}
          className="p-2 h-auto"
          title="Mostrar tiempo de simulación"
        >
          <Clock className="w-4 h-4 text-blue-600" />
        </Button>
      ) : (
        <div className="p-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Tiempo de simulación</span>
              <span className="text-xs">{formattedDate}</span>
              <span className="text-lg font-bold text-blue-700">
                {formattedTime}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
              className="ml-2 p-1 h-auto"
              title="Minimizar"
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Execution time display component to show real-time execution duration
const ExecutionTimeDisplay = ({ 
  startTime, 
  isRunning,
  isMinimized,
  onToggleMinimize,
  isTimeDisplayMinimized
}: { 
  startTime: string | undefined;
  isRunning: boolean;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  isTimeDisplayMinimized: boolean;
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    if (!startTime || !isRunning) {
      setElapsedTime(0);
      return;
    }
    
    const startTimestamp = new Date(startTime).getTime();
    
    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = now.getTime() - startTimestamp;
      setElapsedTime(elapsed);
      setCurrentTime(now);
    }, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, [startTime, isRunning]);
  
  if (!startTime || !isRunning) return null;
  
  // Format elapsed time as dd:hh:mm:ss
  const formatElapsedTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    const remainingHours = hours % 24;
    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;
    
    return `${days.toString().padStart(2, '0')}:${remainingHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Format date and time
  const formatDateTime = (date: Date) => {
    return {
      date: date.toLocaleDateString('es-ES'),
      time: date.toLocaleTimeString('es-ES')
    };
  };
  
  const startDateTime = new Date(startTime);
  const startFormatted = formatDateTime(startDateTime);
  const currentFormatted = formatDateTime(currentTime);
  
  // Calculate position based on time display state
  const leftPosition = isTimeDisplayMinimized ? "left-12" : "left-72";
  
  return (
    <div className={`absolute top-4 ${leftPosition} bg-white/90 rounded-lg shadow-md backdrop-blur-sm z-10 border border-gray-100 ${isMinimized ? 'w-auto' : 'w-80'}`}>
      {isMinimized ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleMinimize}
          className="p-2 h-auto"
          title="Mostrar tiempo de ejecución"
        >
          <Timer className="w-4 h-4 text-green-600" />
        </Button>
      ) : (
        <div className="p-3">
          <div className="flex items-start gap-2">
            <Timer className="w-4 h-4 text-green-600 mt-1" />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium">Tiempo de ejecución</span>
              <span className="text-xs text-gray-600 mb-1">Tiempo real transcurrido</span>
              <span className="text-lg font-bold text-green-700 mb-2">
                {formatElapsedTime(elapsedTime)}
              </span>
              
              {/* Start time information */}
              <div className="text-xs text-gray-600 mb-1">
                <span className="font-medium">Inicio:</span> {startFormatted.date} {startFormatted.time}
              </div>
              
              {/* Current time information */}
              <div className="text-xs text-gray-600">
                <span className="font-medium">Actual:</span> {currentFormatted.date} {currentFormatted.time}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
              className="ml-2 p-1 h-auto"
              title="Minimizar"
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * SimulationCanvas component
 * Displays a Konva-based canvas for visualization of simulation data
 */
export function SimulationCanvas({
  simulationInfo,
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
    title: "",
    color: "#1e40af",
    details: [],
    position: "top-right"
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
  
  // Highlighted vehicles for selected order
  const [highlightedVehicleIds, setHighlightedVehicleIds] = useState<string[]>([]);
  
  // Highlighted orders for selected vehicle
  const [highlightedOrderIds, setHighlightedOrderIds] = useState<string[]>([]);
  
  // Panel collapsed state
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  
  // Time displays minimized state
  const [isTimeDisplayMinimized, setIsTimeDisplayMinimized] = useState(false);
  const [isExecutionTimeMinimized, setIsExecutionTimeMinimized] = useState(false);
  
  // Estado para minimizar la leyenda
  const [isLegendMinimized, setIsLegendMinimized] = useState(false);
  
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
  
  // Toggle time displays minimized state
  const toggleTimeDisplayMinimized = useCallback(() => {
    setIsTimeDisplayMinimized((prev) => !prev);
  }, []);
  
  const toggleExecutionTimeMinimized = useCallback(() => {
    setIsExecutionTimeMinimized((prev) => !prev);
  }, []);
  
  // Clear all selections
  const clearSelections = useCallback(() => {
    setSelectedVehicleId(null);
    setSelectedDepot(null);
    setSelectedOrder(null);
    setHighlightedVehicleIds([]); // Clear highlighted vehicles
    setHighlightedOrderIds([]); // Clear highlighted orders
    
    // Hide tooltips
    setTooltip({ show: false, x: 0, y: 0, content: "" });
    setEnhancedTooltip({
      show: false,
      title: "",
      color: "#1e40af",
      details: [],
      position: "top-right"
    });
  }, []);
  
  // Handle vehicle selection for route display
  const handleVehicleSelect = useCallback(
    (vehicleId: string | null) => {
      // Toggle selection: if clicking the same vehicle, deselect it
      if (selectedVehicleId === vehicleId) {
        clearSelections();
        return;
      }
      
      clearSelections();
      setSelectedVehicleId(vehicleId);
      
      // Set highlighted vehicle IDs when a vehicle is selected
      if (vehicleId) {
        setHighlightedVehicleIds([vehicleId]);
      } else {
        setHighlightedVehicleIds([]);
      }
      
      // Get orders in the selected vehicle's plan
      if (vehicleId && simulationState) {
        const vehiclePlan = simulationState.currentVehiclePlans?.find(
          plan => plan.vehicleId === vehicleId
        );
        
        if (vehiclePlan?.actions) {
          const orderIds = vehiclePlan.actions
            .filter(action => action.orderId)
            .map(action => action.orderId || '')
            .filter(id => id !== '');
          
          setHighlightedOrderIds(orderIds);
        }
      }
    },
    [clearSelections, simulationState, selectedVehicleId]
  );
  
  // Handle depot selection
  const handleDepotSelect = useCallback(
    (depot: DepotDTO | null, isMainDepot: boolean, index?: number) => {
      // Toggle selection: if clicking the same depot, deselect it
      if (selectedDepot?.depot.id === depot?.id && selectedDepot?.isMainDepot === isMainDepot) {
        clearSelections();
        return;
      }
      
      clearSelections();
      if (depot) {
        setSelectedDepot({ depot, isMainDepot, index: index } as {
          depot: DepotDTO;
          isMainDepot: boolean;
          index?: number;
        });
      }
    },
    [clearSelections, selectedDepot]
  );
  
  // Handle order selection
  const handleOrderSelect = useCallback(
    (order: (OrderDTO & { isOverdue?: boolean }) | null) => {
      // Toggle selection: if clicking the same order, deselect it
      if (selectedOrder?.id === order?.id) {
        clearSelections();
        return;
      }
      
      clearSelections();
      setSelectedOrder(order);
      
      // Get vehicles serving this order
      if (order && simulationState) {
        const vehicles = simulationState.vehicles || [];
        const vehiclePlans = simulationState.currentVehiclePlans || [];
        
        const servingVehicleIds = vehicles
          .filter(vehicle => {
            const vehiclePlan = vehiclePlans.find(plan => plan.vehicleId === vehicle.id);
            if (!vehiclePlan?.actions) return false;
            
            return vehiclePlan.actions.some(action => action.orderId === order.id);
          })
          .map(vehicle => vehicle.id || '')
          .filter(id => id !== '');
        
        setHighlightedVehicleIds(servingVehicleIds);
      } else {
        setHighlightedVehicleIds([]);
      }
    },
    [clearSelections, simulationState, selectedOrder]
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
    selectedOrder,
    selectedDepot,
    onVehicleSelect: handleVehicleSelect,
    onDepotSelect: handleDepotSelect,
    onOrderSelect: handleOrderSelect,
    highlightedVehicleIds: highlightedVehicleIds,
    highlightedOrderIds: highlightedOrderIds,
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
      <TimeDisplay 
        currentTime={simulationState?.currentTime}
        isMinimized={isTimeDisplayMinimized}
        onToggleMinimize={toggleTimeDisplayMinimized}
      />
      {/* Execution time display */}
      <ExecutionTimeDisplay 
        startTime={simulationInfo?.realStartTime} 
        isRunning={simulationInfo?.status === 'RUNNING'}
        isMinimized={isExecutionTimeMinimized}
        onToggleMinimize={toggleExecutionTimeMinimized}
        isTimeDisplayMinimized={isTimeDisplayMinimized}
      />
      
      {/* Unified information panel */}
      <StatsPanel
        simulationId={simulationInfo?.id ?? ""}
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
      {isLegendMinimized ? (
        <Button
          className="absolute bottom-4 left-4 z-10 h-10 w-10 rounded-full shadow"
          variant="outline"
          size="icon"
          onClick={() => setIsLegendMinimized(false)}
          title="Mostrar leyenda"
        >
          <Map className="w-5 h-5" />
        </Button>
      ) : (
        <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg shadow-md backdrop-blur-sm z-10 border border-gray-100">
          <div className="flex items-center mb-2 gap-1 text-sm font-medium">
            <Map className="w-4 h-4" />
            <span>Leyenda</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLegendMinimized(true)}
              className="ml-2 p-1 h-auto"
              title="Minimizar"
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
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
              <div className="w-4 h-4 border-2 border-[#9333ea] rounded-sm bg-[#9333ea]/20"></div>
              <span className="text-xs">Pedido siendo atendido</span>
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
            {highlightedVehicleIds.length > 0 && (
              <>
                <div className="flex items-center gap-2 col-span-2">
                  <div className="w-4 h-4 border-2 border-[#9333ea] border-dashed rounded-sm bg-[#9333ea]/20"></div>
                  <span className="text-xs">Vehículos del pedido</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <div className="w-4 h-1 bg-[#9333ea]"></div>
                  <span className="text-xs">Rutas del pedido</span>
                </div>
              </>
            )}
            {highlightedOrderIds.length > 0 && (
              <>
                <div className="flex items-center gap-2 col-span-2">
                  <div className="w-4 h-4 border-2 border-[#9333ea] border-dashed rounded-sm bg-[#9333ea]/20"></div>
                  <span className="text-xs">Pedidos del vehículo</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <div className="w-4 h-1 bg-[#9333ea]"></div>
                  <span className="text-xs">Rutas del vehículo</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Enhanced HTML tooltip - replacing both the legacy and enhanced Konva tooltips */}
      <InfoBox
        title={enhancedTooltip.title}
        details={enhancedTooltip.details}
        color={enhancedTooltip.color}
        show={enhancedTooltip.show && !selectedVehicle && !selectedDepot && !selectedOrder}
        position={enhancedTooltip.position || "top-right"}
      />
    </div>
  );
}
