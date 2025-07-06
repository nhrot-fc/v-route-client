"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pause, Play, RotateCcw, Clock, Plus, BarChart4, Calendar } from "lucide-react"
import { useSimulation, SimulationMetadata, SimulationScenarioType } from "@/hooks/use-simulation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { SimulationConfig } from "@/components/simulation/simulation-config"

interface SimulationControllerProps {
  onSimulationChange?: (isRunning: boolean) => void;
  layout?: "vertical" | "horizontal";
}

export function SimulationController({ onSimulationChange, layout = "vertical" }: SimulationControllerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [currentTime, setCurrentTime] = useState("00:00:00")
  const [speed, setSpeed] = useState(1)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [simulations, setSimulations] = useState<SimulationMetadata[]>([])
  const [currentSimulationId, setCurrentSimulationId] = useState<string>("")
  const [currentSimulation, setCurrentSimulation] = useState<SimulationMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Use the simulation hook
  const simulation = useSimulation();

  // Cargar simulaciones disponibles
  const loadSimulations = async () => {
    try {
      setIsLoading(true);
      const simulationsList = await simulation.getAllSimulations();
      setSimulations(simulationsList);
      
      // Si hay simulaciones y no hay una seleccionada, seleccionar la primera
      if (simulationsList.length > 0 && !currentSimulationId) {
        const firstSim = simulationsList[0];
        setCurrentSimulationId(firstSim.id);
        simulation.setCurrentSimulation(firstSim.id);
        
        // Cargar el estado inicial de la simulación
        const status = await simulation.getSimulationStatus();
        
        setIsRunning(status.running || false);
        setCurrentTime(status.currentTime || "00:00:00");
        
        // Calcular tiempo transcurrido
        if (status.elapsedTime) {
          const elapsedSeconds = parseInt(status.elapsedTime.toString());
          setElapsedSeconds(elapsedSeconds);
        }
        
        if (onSimulationChange) {
          onSimulationChange(status.running || false);
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error cargando simulaciones:", error);
      setError("No se pudieron cargar las simulaciones. Intente de nuevo.");
      setIsLoading(false);
    }
  };
  
  // Cargar datos iniciales
  useEffect(() => {
    loadSimulations();
    
    return () => {
      // Limpiar el timer al desmontar
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [loadSimulations]);

  // Formatear segundos a formato hh:mm:ss
  const formatElapsedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  // Obtener estado de la simulación periódicamente
  useEffect(() => {
    const fetchSimulationStatus = async () => {
      if (!currentSimulationId) return;
      
      try {
        const status = await simulation.getSimulationStatus();
        
        setIsRunning(status.running || false);
        setCurrentTime(status.currentTime || "00:00:00");
        
        // Calcular tiempo transcurrido
        if (status.elapsedTime) {
          const elapsedSeconds = parseInt(status.elapsedTime.toString());
          setElapsedSeconds(elapsedSeconds);
        }
        
        if (onSimulationChange) {
          onSimulationChange(status.running || false);
        }
      } catch (error) {
        console.error("Error obteniendo estado de simulación:", error);
      }
    };
    
    // Ejecutar inmediatamente y luego cada segundo
    fetchSimulationStatus();
    const intervalId = setInterval(fetchSimulationStatus, 1000);
    
    return () => clearInterval(intervalId);
  }, [currentSimulationId, onSimulationChange, simulation]);

  // Alternar entre iniciar y pausar la simulación
  const toggleSimulation = async () => {
    if (!currentSimulationId) {
      setError("No hay una simulación seleccionada");
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (isRunning) {
        await simulation.pauseSimulation();
      } else {
        await simulation.startSimulation();
      }
      
      setIsRunning(!isRunning);
      
      if (onSimulationChange) {
        onSimulationChange(!isRunning);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error al cambiar el estado de la simulación:", error);
      setError("No se pudo cambiar el estado de la simulación");
      setIsLoading(false);
    }
  };

  // Reiniciar la simulación actual
  const resetSimulation = async () => {
    try {
      setIsLoading(true);
      
      // Pausar primero si está corriendo
      if (isRunning) {
        await simulation.pauseSimulation();
      }
      
      // Reiniciar la simulación
      await simulation.resetSimulation();
      
      // Reiniciar contadores
      setElapsedSeconds(0);
      setCurrentTime("00:00:00");
      
      if (onSimulationChange) {
        onSimulationChange(false);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error al reiniciar la simulación:", error);
      setError("No se pudo reiniciar la simulación");
      setIsLoading(false);
    }
  };

  // Cambiar la velocidad de la simulación
  const changeSpeed = async (newSpeed: number) => {
    try {
      await simulation.setSimulationSpeed(newSpeed);
      setSpeed(newSpeed);
      setIsLoading(false);
    } catch (error) {
      console.error("Error al cambiar la velocidad:", error);
      setIsLoading(false);
    }
  };

  // Crear una nueva simulación
  const handleCreateNewSimulation = async () => {
    setConfigDialogOpen(true);
  };
  
  // Manejar cuando se guarda una configuración de simulación
  const handleConfigSaved = async (simulationId: string) => {
    setConfigDialogOpen(false);
    await loadSimulations();
    await handleSelectSimulation(simulationId);
  };

  // Formatear el tipo de escenario para mostrarlo
  const formatScenarioType = (type: SimulationScenarioType): string => {
    switch (type) {
      case SimulationScenarioType.DAILY_OPERATIONS:
        return "Operaciones diarias";
      case SimulationScenarioType.WEEKLY_SIMULATION:
        return "Simulación semanal";
      case SimulationScenarioType.COLLAPSE_SIMULATION:
        return "Simulación colapso";
      default:
        return "Desconocido";
    }
  };
  
  // Seleccionar una simulación
  const handleSelectSimulation = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Encontrar la simulación seleccionada
      const selectedSimulation = simulations.find(sim => sim.id === id);
      if (!selectedSimulation) {
        throw new Error(`No se encontró la simulación con ID ${id}`);
      }
      
      // Establecer la simulación actual
      setCurrentSimulationId(id);
      setCurrentSimulation(selectedSimulation);
      simulation.setCurrentSimulation(id);
      
      // Reiniciar contadores
      setElapsedSeconds(0);
      setCurrentTime("00:00:00");
      
      // Cargar el estado inicial de la simulación
      const status = await simulation.getSimulationStatus();
      
      setIsRunning(status.running || false);
      setCurrentTime(status.currentTime || "00:00:00");
      
      // Calcular tiempo transcurrido
      if (status.elapsedTime) {
        const elapsedSeconds = parseInt(status.elapsedTime.toString());
        setElapsedSeconds(elapsedSeconds);
      }
      
      if (onSimulationChange) {
        onSimulationChange(status.running || false);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error seleccionando simulación:", error);
      setError("No se pudo seleccionar la simulación");
      setIsLoading(false);
    }
  };
  
  // Obtener el color del badge según el tipo de escenario
  const getScenarioBadgeColor = (type: SimulationScenarioType): string => {
    switch (type) {
      case SimulationScenarioType.DAILY_OPERATIONS:
        return "bg-blue-100 text-blue-800";
      case SimulationScenarioType.WEEKLY_SIMULATION:
        return "bg-green-100 text-green-800";
      case SimulationScenarioType.COLLAPSE_SIMULATION:
        return "bg-amber-100 text-amber-800";
      default:
        return "";
    }
  };
  
  // Obtener el ícono según el tipo de escenario
  const getScenarioIcon = (type: SimulationScenarioType) => {
    switch (type) {
      case SimulationScenarioType.DAILY_OPERATIONS:
        return <Clock className="h-4 w-4" />;
      case SimulationScenarioType.WEEKLY_SIMULATION:
        return <Calendar className="h-4 w-4" />;
      case SimulationScenarioType.COLLAPSE_SIMULATION:
        return <BarChart4 className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (layout === "horizontal") {
    return (
      <div className="flex flex-col md:flex-row gap-4 w-full items-center">
        <div className="flex gap-2 items-center">
          <Select value={currentSimulationId} onValueChange={handleSelectSimulation} disabled={isLoading}>
            <SelectTrigger className="min-w-[220px]">
              <SelectValue placeholder="Seleccionar simulación" />
            </SelectTrigger>
            <SelectContent>
              {simulations.map(sim => (
                <SelectItem key={sim.id} value={sim.id}>
                  <div className="flex items-center gap-2">
                    {getScenarioIcon(sim.scenarioType)}
                    <span>{sim.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleCreateNewSimulation}>
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Crear Nueva Simulación</DialogTitle>
                <DialogDescription>
                  Configure los parámetros para la nueva simulación
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 max-h-[70vh] overflow-y-auto">
                <SimulationConfig onConfigSaved={handleConfigSaved} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {currentSimulation && (
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline"
              className={getScenarioBadgeColor(currentSimulation.scenarioType)}
            >
              {formatScenarioType(currentSimulation.scenarioType)}
            </Badge>
            
            <Badge 
              variant={isRunning ? "default" : "outline"} 
              className={isRunning ? "bg-green-100 text-green-800" : ""}
            >
              {isRunning ? "En ejecución" : "Detenido"}
            </Badge>
          </div>
        )}
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-16"
                  onClick={() => changeSpeed(1)}
                  disabled={isLoading || !currentSimulationId}
                >
                  1x
                </Button>
              </TooltipTrigger>
              <TooltipContent>Velocidad normal</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-16"
                  onClick={() => changeSpeed(2)}
                  disabled={isLoading || !currentSimulationId}
                >
                  2x
                </Button>
              </TooltipTrigger>
              <TooltipContent>Velocidad doble</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-16"
                  onClick={() => changeSpeed(4)}
                  disabled={isLoading || !currentSimulationId}
                >
                  4x
                </Button>
              </TooltipTrigger>
              <TooltipContent>Velocidad cuádruple</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-muted px-3 py-1 rounded-md min-w-[100px] text-center">
            <span className="text-sm font-medium">{currentTime}</span>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isRunning ? "secondary" : "default"}
                  size="sm"
                  onClick={toggleSimulation}
                  disabled={isLoading || !currentSimulationId}
                >
                  {isRunning ? (
                    <>
                      <Pause className="mr-1 h-4 w-4" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="mr-1 h-4 w-4" />
                      Iniciar
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isRunning ? "Pausar simulación" : "Iniciar simulación"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetSimulation}
                  disabled={isLoading || !currentSimulationId}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reiniciar simulación</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Simulación</label>
          <Button variant="ghost" size="sm" onClick={handleCreateNewSimulation}>
            <Plus className="mr-1 h-3 w-3" />
            Nueva
          </Button>
        </div>
        
        <Select value={currentSimulationId} onValueChange={handleSelectSimulation} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar simulación" />
          </SelectTrigger>
          <SelectContent>
            {simulations.map(sim => (
              <SelectItem key={sim.id} value={sim.id}>
                <div className="flex items-center gap-2">
                  {getScenarioIcon(sim.scenarioType)}
                  <span>{sim.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {currentSimulation && (
          <div className="mt-2 flex justify-between items-center text-sm">
            <Badge 
              variant="outline"
              className={getScenarioBadgeColor(currentSimulation.scenarioType)}
            >
              {formatScenarioType(currentSimulation.scenarioType)}
            </Badge>
            
            <Badge 
              variant={isRunning ? "default" : "outline"} 
              className={isRunning ? "bg-green-100 text-green-800" : ""}
            >
              {isRunning ? "En ejecución" : "Detenido"}
            </Badge>
          </div>
        )}
        
        <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Simulación</DialogTitle>
              <DialogDescription>
                Configure los parámetros para la nueva simulación
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[70vh] overflow-y-auto">
              <SimulationConfig onConfigSaved={handleConfigSaved} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-4 bg-muted rounded-md text-center">
        <div className="text-sm text-muted-foreground mb-1">Tiempo de Simulación</div>
        <div className="text-3xl font-bold">{currentTime}</div>
        <div className="text-xs text-muted-foreground mt-1">
          Transcurrido: {formatElapsedTime(elapsedSeconds)}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Velocidad de Simulación</label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={speed === 1 ? "default" : "outline"}
            className="w-full"
            onClick={() => changeSpeed(1)}
            disabled={isLoading || !currentSimulationId}
          >
            1x
          </Button>
          <Button
            variant={speed === 2 ? "default" : "outline"}
            className="w-full"
            onClick={() => changeSpeed(2)}
            disabled={isLoading || !currentSimulationId}
          >
            2x
          </Button>
          <Button
            variant={speed === 4 ? "default" : "outline"}
            className="w-full"
            onClick={() => changeSpeed(4)}
            disabled={isLoading || !currentSimulationId}
          >
            4x
          </Button>
        </div>
      </div>

      <div className="flex justify-between gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={resetSimulation}
          disabled={isLoading || !currentSimulationId}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <Button
          variant={isRunning ? "secondary" : "default"}
          className="flex-1"
          onClick={toggleSimulation}
          disabled={isLoading || !currentSimulationId}
        >
          {isRunning ? (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Pausar
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Iniciar
            </>
          )}
        </Button>
      </div>
      
      {error && (
        <div className="p-3 text-sm bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
    </div>
  )
}
