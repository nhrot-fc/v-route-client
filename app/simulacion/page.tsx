"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { PageContainer } from "@/components/ui/page-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSimulation } from "@/hooks/use-simulation";
import { SimulationConfig, SimulationMap, SimulationDataLoad } from "@/components/simulation";
import { SimulationDTOTypeEnum } from "@/lib/api-client";
import { useWebSocket } from "@/lib/websocket-context";

export default function SimulationPage() {
  const { createSimulation } = useSimulation();
  const [activeTab, setActiveTab] = useState("visualizar");
  const { currentSimulationId, simulationInfo } = useWebSocket();

  const handleCreateSimulation = async (simulationData: {
    startDateTime: string;
    endDateTime?: string;
    type: SimulationDTOTypeEnum;
    taVehicles: number;
    tbVehicles: number;
    tcVehicles: number;
    tdVehicles: number;
  }) => {
    try {
      await createSimulation(simulationData);
      setActiveTab("visualizar"); // Switch to visualization tab after creating
    } catch (error) {
      console.error("Error creating simulation:", error);
    }
  };

  // Check if the current simulation is of type DAILY_OPERATIONS
  const isSimulationDaily = simulationInfo?.type === 'DAILY_OPERATIONS';

  return (
    <PageContainer>
      <PageHeader 
        title="Simulación" 
        description="Cree y visualice simulaciones de rutas de entrega" 
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="visualizar">Visualizar</TabsTrigger>
          <TabsTrigger value="crear">Crear Simulación</TabsTrigger>
          <TabsTrigger 
            value="cargar" 
            disabled={!currentSimulationId || isSimulationDaily}
          >
            Cargar Datos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="visualizar" className="space-y-4">
          <SimulationMap />
        </TabsContent>
        
        <TabsContent value="crear" className="space-y-4">
          <SimulationConfig onCreateSimulation={handleCreateSimulation} />
        </TabsContent>
        
        <TabsContent value="cargar" className="space-y-4">
          <SimulationDataLoad 
            simulationId={currentSimulationId}
            isDisabled={!currentSimulationId || isSimulationDaily}
          />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
