"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SimulationMap } from "@/components/simulation/simulation-map"
import { SimulationResults } from "@/components/simulation/simulation-results"
import { SimulationConfig } from "@/components/simulation/simulation-config"
import { SimulationController } from "@/components/simulation/simulation-controller"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { SimulationScenarioType } from "@/lib/simulation-api"
import { Calendar, Clock, BarChart4, AlertOctagon } from "lucide-react"

export default function SimulacionPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentTime, setCurrentTime] = useState("00:00:00")
  const [activeTab, setActiveTab] = useState("mapa")
  const [apiStatus, setApiStatus] = useState<"loading" | "connected" | "error">("loading")
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenarioType>(SimulationScenarioType.DAILY_OPERATIONS)
  const [currentSimulationId, setCurrentSimulationId] = useState<string | null>(null)
  
  const handleTimeUpdate = (time: string, running: boolean) => {
    setCurrentTime(time)
    setIsRunning(running)
    setApiStatus("connected")
  }

  const handleSimulationChange = (running: boolean) => {
    setIsRunning(running)
  }

  const handleApiError = () => {
    setApiStatus("error")
  }
  
  const handleSimulationCreated = (simulationId: string) => {
    setCurrentSimulationId(simulationId)
    // Cambiar a la pestaña de mapa después de crear una simulación
    setActiveTab("mapa")
  }

  const getScenarioIcon = () => {
    switch (selectedScenario) {
      case SimulationScenarioType.DAILY_OPERATIONS:
        return <Clock className="h-5 w-5" />
      case SimulationScenarioType.WEEKLY_SIMULATION:
        return <Calendar className="h-5 w-5" />
      case SimulationScenarioType.COLLAPSE_SIMULATION:
        return <AlertOctagon className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  const getScenarioLabel = () => {
    switch (selectedScenario) {
      case SimulationScenarioType.DAILY_OPERATIONS:
        return "Operaciones diarias"
      case SimulationScenarioType.WEEKLY_SIMULATION:
        return "Simulación semanal"
      case SimulationScenarioType.COLLAPSE_SIMULATION:
        return "Simulación hasta el colapso"
      default:
        return "Desconocido"
    }
  }

  const getScenarioBadgeColor = () => {
    switch (selectedScenario) {
      case SimulationScenarioType.DAILY_OPERATIONS:
        return "bg-blue-100 text-blue-800"
      case SimulationScenarioType.WEEKLY_SIMULATION:
        return "bg-green-100 text-green-800"
      case SimulationScenarioType.COLLAPSE_SIMULATION:
        return "bg-amber-100 text-amber-800"
      default:
        return ""
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">
          Visualizador de Simulaciones
        </h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="mapa">Mapa</TabsTrigger>
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
          <TabsTrigger value="resultados">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="mapa" className="space-y-4">
          <div className="flex flex-col space-y-4">
            <Card>
              <CardHeader className="py-3 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getScenarioIcon()}
                      <span>Controles de Simulación</span>
                    </CardTitle>
                    {selectedScenario && (
                      <Badge 
                        variant="outline" 
                        className={`ml-2 px-2 py-0 text-xs ${getScenarioBadgeColor()}`}
                      >
                        {getScenarioLabel()}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={apiStatus === "connected" ? "default" : "outline"} 
                      className={apiStatus === "connected" 
                        ? "bg-green-100 text-green-800" 
                        : apiStatus === "error" 
                          ? "bg-red-100 text-red-800" 
                          : ""}
                    >
                      {apiStatus === "connected" 
                        ? "Conectado" 
                        : apiStatus === "error" 
                          ? "Error" 
                          : "Conectando..."}
                    </Badge>
                    
                    {isRunning && (
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        Simulación activa
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="flex flex-col">
                  <div className="p-4 bg-slate-50 border-b">
                    <div className="w-full">
                      <SimulationController 
                        onSimulationChange={handleSimulationChange}
                        layout="horizontal" 
                      />
                    </div>
                  </div>

                  <div className="h-[calc(100vh-300px)] min-h-[500px]">
                    <SimulationMap onTimeUpdate={handleTimeUpdate} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="configuracion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Escenarios</CardTitle>
              <CardDescription>Personaliza los parámetros para cada modo de visualización</CardDescription>
            </CardHeader>
            <CardContent>
              <SimulationConfig onConfigSaved={handleSimulationCreated} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resultados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas y Métricas</CardTitle>
              <CardDescription>Análisis del desempeño operativo y logístico</CardDescription>
            </CardHeader>
            <CardContent>
              <SimulationResults />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
