"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useSimulation } from "@/hooks/use-simulation";
import { SimulationStateDTO, SimulationDTO, SimulationDTOTypeEnum } from "@/lib/api-client";
import { AlertCircle } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

import {
  SimulationConfig,
  SimulationConfigData,
  SimulationMap,
  SimulationControls,
  SimulationStats,
  SimulationReport
} from "@/components/simulation";

export default function SimulacionPage() {
  const [activeTab, setActiveTab] = useState<string>("config");
  const [simulationId, setSimulationId] = useState<string>("");
  const [simulationState, setSimulationState] = useState<SimulationStateDTO | undefined>(undefined);
  const [speedFactor, setSpeedFactor] = useState<number>(1.0);
  const [report, setReport] = useState<SimulationDTO | undefined>(undefined);
  const [currentTime, setCurrentTime] = useState<string>("");
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const {
    createSimulation,
    startSimulation,
    pauseSimulation,
    stopSimulation,
    getSimulationStatus,
    getSimulationState,
    error
  } = useSimulation();

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (simulationId && activeTab === "simulation") {
      fetchSimulationState(simulationId);
      
      // Set up polling for simulation state
      if (!pollingIntervalRef.current) {
        pollingIntervalRef.current = setInterval(() => {
          fetchSimulationState(simulationId);
        }, 2000);
      }
    } else {
      // Clear interval if not on simulation tab
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, [simulationId, activeTab]);

  const handleCreateSimulation = async (config: SimulationConfigData) => {
    // Crear simulación con el nuevo formato de API
    const simulationData = {
      startDateTime: config.startDate,
      vehicleIds: config.vehicleIds || [],
      mainDepotId: config.mainDepotId || "",
      auxDepotIds: config.auxDepotIds || []
    };

    const result = await createSimulation(simulationData, SimulationDTOTypeEnum.Custom);
    
    if (result && result.data) {
      const id = result.data.id as unknown as string;
      setSimulationId(id);
      setActiveTab("simulation");
      fetchSimulationState(id);
    }
  };

  const fetchSimulationState = async (id: string) => {
    const stateResponse = await getSimulationState(id);
    if (stateResponse && stateResponse.data) {
      setSimulationState(stateResponse.data);
      if (stateResponse.data.currentTime) {
        setCurrentTime(formatDate(stateResponse.data.currentTime));
      }
    }
  };

  const handleStartSimulation = async () => {
    if (!simulationId) return;
    
    const response = await startSimulation(simulationId);
    if (response) {
      fetchSimulationState(simulationId);
    }
  };

  const handlePauseSimulation = async () => {
    if (!simulationId) return;
    
    const response = await pauseSimulation(simulationId);
    if (response) {
      fetchSimulationState(simulationId);
    }
  };

  const handleStopSimulation = async () => {
    if (!simulationId) return;
    
    const response = await stopSimulation(simulationId);
    if (response) {
      fetchSimulationState(simulationId);
      fetchSimulationReport();
      setActiveTab("report");
    }
  };

  const handleRefresh = async () => {
    if (simulationId) {
      fetchSimulationState(simulationId);
    }
  };

  const handleSpeedChange = async (value: number[]) => {
    if (!simulationId || value.length === 0) return;
    
    const newSpeed = value[0];
    setSpeedFactor(newSpeed);
    
    // Esta funcionalidad ya no está disponible en la API
    console.log("La función setSimulationSpeed no está disponible en la API actualizada");
  };

  const fetchSimulationReport = async () => {
    if (!simulationId) return;
    
    const statusResponse = await getSimulationStatus(simulationId);
    if (statusResponse && statusResponse.data) {
      setReport(statusResponse.data);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Fetch report when switching to report tab
    if (value === "report" && simulationId) {
      fetchSimulationReport();
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    
    try {
      const date = new Date(dateStr);
      return format(date, "PPpp", { locale: es });
    } catch {
      return dateStr;
    }
  };

  return (
    <PageContainer>
      <PageHeader title="Simulación" />
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">Configuración</TabsTrigger>
          <TabsTrigger value="simulation" disabled={!simulationId}>Simulación</TabsTrigger>
          <TabsTrigger value="report" disabled={!simulationId}>Reporte</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config" className="mt-4">
          <SimulationConfig onCreateSimulation={handleCreateSimulation} />
        </TabsContent>
        
        <TabsContent value="simulation" className="mt-4 space-y-4">
          {simulationState ? (
            <>
              <SimulationStats 
                simulationState={simulationState} 
                currentTime={currentTime} 
              />
              
              <Card className="p-4">
                <SimulationControls
                  isRunning={simulationState.status === "RUNNING"}
                  speedFactor={speedFactor}
                  onStart={handleStartSimulation}
                  onPause={handlePauseSimulation}
                  onStop={handleStopSimulation}
                  onRefresh={handleRefresh}
                  onSpeedChange={handleSpeedChange}
                />
                
                <div className="mt-4">
                  <SimulationMap simulationState={simulationState} />
                </div>
              </Card>
            </>
          ) : (
            <div className="text-center py-10">
              <AlertCircle className="w-10 h-10 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No hay datos de simulación</h3>
              <p className="mt-2 text-gray-500">Crea una simulación para comenzar</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="report" className="mt-4">
          <SimulationReport report={report} formatDate={formatDate} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
