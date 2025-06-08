"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SimulationMap } from "@/components/simulation/simulation-map"
import { SimulationResults } from "@/components/simulation/simulation-results"
import { SimulationConfig } from "@/components/simulation/simulation-config"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { RotateCcw, Play, FastForward, Pause, Clock, Timer, Calendar } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

export default function SimulacionPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState([1])
  const [currentTime, setCurrentTime] = useState("08:00")
  const [scenario, setScenario] = useState("tiempo-real")
  const [elapsedTime, setElapsedTime] = useState("0h 00min")
  
  // Fecha actual para operaciones en tiempo real
  const currentDate = new Date()
  const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`
  const currentRealTime = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`
  
  const toggleSimulation = () => {
    setIsRunning(!isRunning)
  }

  const resetSimulation = () => {
    setIsRunning(false)
    setCurrentTime("08:00")
    setElapsedTime("0h 00min")
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Visualizador</h2>
      </div>

      <Tabs defaultValue="mapa" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mapa">Mapa</TabsTrigger>
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
          <TabsTrigger value="resultados">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="mapa" className="space-y-4">
          <Card className="mb-4">
            <CardHeader className="py-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-col">
                  <div className="flex items-center">
                    <CardTitle>Controles del Visualizador</CardTitle>
                    {scenario !== "tiempo-real" ? (
                      <Badge variant="secondary" className="ml-4 px-3 py-1 bg-blue-100 text-blue-800">
                        Modo simulación
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="ml-4 px-3 py-1">
                        Tiempo real
                      </Badge>
                    )}
                  </div>
                  
                  <CardDescription className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {scenario === "tiempo-real" ? (
                      <>Operaciones del día: {formattedDate}</>
                    ) : scenario === "simulacion-semanal" ? (
                      <>Periodo: 7 días | Fecha inicial: {formattedDate}</>
                    ) : (
                      <>Periodo: Simulación continua | Fecha inicial: {formattedDate}</>
                    )}
                  </CardDescription>
                </div>
                
                <div className="flex lg:items-center gap-4 flex-col lg:flex-row">
                  <div className="flex items-center gap-4">
                    <Select value={scenario} onValueChange={(value) => setScenario(value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Seleccionar modo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tiempo-real">Tiempo real</SelectItem>
                        <SelectItem value="simulacion-semanal">Simulación semanal</SelectItem>
                        <SelectItem value="simulacion-continua">Simulación continua</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {scenario !== "tiempo-real" && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Velocidad:</span>
                        <Slider 
                          value={speed} 
                          min={1} 
                          max={10} 
                          step={1} 
                          onValueChange={setSpeed} 
                          className="w-24" 
                        />
                        <span className="text-sm">{speed[0]}x</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center border rounded-md px-3 py-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        {scenario === "tiempo-real" ? (
                          <><Clock className="h-3 w-3 mr-1" /> Hora actual</>
                        ) : (
                          <><Timer className="h-3 w-3 mr-1" /> Tiempo simulado</>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-center">
                        {scenario === "tiempo-real" ? currentRealTime : currentTime}
                      </div>
                      {scenario !== "tiempo-real" && (
                        <div className="text-xs text-muted-foreground">
                          Tiempo transcurrido: {elapsedTime}
                        </div>
                      )}
                    </div>
                    
                    {scenario !== "tiempo-real" && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={resetSimulation} title="Reiniciar simulación">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button onClick={toggleSimulation}>
                          {isRunning ? (
                            <Pause className="mr-2 h-4 w-4" />
                          ) : (
                            <Play className="mr-2 h-4 w-4" />
                          )}
                          {isRunning ? "Pausar" : "Iniciar"}
                        </Button>
                        <Button variant="outline" size="icon" title="Avance rápido">
                          <FastForward className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="h-[calc(100vh-280px)] min-h-[600px]">
                <SimulationMap />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Escenarios</CardTitle>
              <CardDescription>Personaliza los parámetros para cada modo de visualización</CardDescription>
            </CardHeader>
            <CardContent>
              <SimulationConfig />
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
