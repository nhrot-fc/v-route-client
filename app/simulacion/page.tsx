"use client";

import { useState, useEffect } from "react";
import { useSimulation } from "@/hooks/use-simulation";
import { useWebSocket } from "@/lib/websocket-context";
import { SimulationConfig, SimulationConfigData } from "@/components/simulation/simulation-config";
import { SimulationMap } from "@/components/simulation/simulation-map";
import { SimulationReport } from "@/components/simulation/simulation-report";
import { SimulationStats } from "@/components/simulation/simulation-stats";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SimulacionPage() {
  const [activeTab, setActiveTab] = useState("map");
  const { isConnected, currentSimulationId, simulationState, simulationInfo, subscribeToSimulation } = useWebSocket();
  const { toast } = useToast();
  const { createSimulation } = useSimulation();
  
  // When the page loads and websocket is connected but no simulation is selected,
  // switch to the config tab
  useEffect(() => {
    if (isConnected && !currentSimulationId) {
      setActiveTab("config");
    } else if (isConnected && currentSimulationId) {
      setActiveTab("map");
    }
  }, [isConnected, currentSimulationId]);

  const handleCreateSimulation = async (config: SimulationConfigData) => {
    try {
      const response = await createSimulation({
        startDateTime: config.startDateTime,
        endDateTime: config.endDateTime,
        type: config.type,
        taVehicles: config.taVehicles,
        tbVehicles: config.tbVehicles,
        tcVehicles: config.tcVehicles,
        tdVehicles: config.tdVehicles,
      });

      if (response && response.data && response.data.id) {
        const simId = response.data.id as string;
        
        toast({
          title: "Simulación creada",
          description: `ID: ${simId}`,
        });
        
        // Subscribe to the simulation
        subscribeToSimulation(simId);
        
        // Switch to map tab
        setActiveTab("map");
      }
    } catch (error) {
      console.error("Error creating simulation:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la simulación",
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Simulación"
        description="Configurar y ejecutar simulaciones de distribución de GLP"
      />
      <Separator className="my-4" />

      {simulationState && simulationInfo && (
        <div className="mb-6">
          <SimulationStats
            simulationState={simulationState}
            currentTime={new Date(simulationInfo.simulatedCurrentTime || "").toLocaleString()}
          />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="config">Configuración</TabsTrigger>
          <TabsTrigger value="map">Mapa</TabsTrigger>
          <TabsTrigger value="report">Reporte</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de simulación</CardTitle>
              <CardDescription>Configura una nueva simulación del sistema de distribución</CardDescription>
            </CardHeader>
            <CardContent>
              <SimulationConfig onCreateSimulation={handleCreateSimulation} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map">
          <SimulationMap />
        </TabsContent>

        <TabsContent value="report">
          <SimulationReport />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
