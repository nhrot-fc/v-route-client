"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SimulationDTOTypeEnum } from "@/lib/api-client";

export interface SimulationConfigData {
  startDateTime: string;
  endDateTime?: string;
  type: SimulationDTOTypeEnum;
  taVehicles: number;
  tbVehicles: number;
  tcVehicles: number;
  tdVehicles: number;
}

interface SimulationConfigProps {
  onCreateSimulation: (config: SimulationConfigData) => Promise<void>;
}

export function SimulationConfig({ onCreateSimulation }: SimulationConfigProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [simulationType, setSimulationType] = useState<SimulationDTOTypeEnum>(SimulationDTOTypeEnum.Weekly);
  const [taVehicles, setTaVehicles] = useState<number>(0);
  const [tbVehicles, setTbVehicles] = useState<number>(0);
  const [tcVehicles, setTcVehicles] = useState<number>(0);
  const [tdVehicles, setTdVehicles] = useState<number>(0);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate) {
      alert("Por favor selecciona una fecha de inicio");
      return;
    }
    
    if (taVehicles + tbVehicles + tcVehicles + tdVehicles === 0) {
      alert("Por favor selecciona al menos un vehículo");
      return;
    }
    
    const config: SimulationConfigData = {
      startDateTime: startDate,
      endDateTime: endDate,
      type: simulationType,
      taVehicles,
      tbVehicles,
      tcVehicles,
      tdVehicles
    };
    
    await onCreateSimulation(config);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Simulación</CardTitle>
        <CardDescription>Configure los parámetros para iniciar una nueva simulación</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="simulationType">Tipo de simulación</Label>
            <Select value={simulationType} onValueChange={(value) => setSimulationType(value as SimulationDTOTypeEnum)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccione el tipo de simulación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SimulationDTOTypeEnum.Weekly}>Semanal</SelectItem>
                <SelectItem value={SimulationDTOTypeEnum.Infinite}>Colapso</SelectItem>
                <SelectItem value={SimulationDTOTypeEnum.Custom}>Personalizada</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              Seleccione el tipo de simulación que desea ejecutar
            </p>
          </div>

          <div>
            <Label htmlFor="startDate">Fecha de inicio</Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Seleccione la fecha y hora de inicio de la simulación
            </p>
          </div>

          {simulationType === SimulationDTOTypeEnum.Custom && <div>
            <Label htmlFor="endDate">Fecha de fin</Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1"
            />
          </div>}
          
          <div className="space-y-4">
            <Label>Cantidad de vehículos por tipo</Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taVehicles">Vehículos tipo TA</Label>
                <Input
                  id="taVehicles"
                  type="number"
                  min="0"
                  value={taVehicles}
                  onChange={(e) => setTaVehicles(parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="tbVehicles">Vehículos tipo TB</Label>
                <Input
                  id="tbVehicles"
                  type="number"
                  min="0"
                  value={tbVehicles}
                  onChange={(e) => setTbVehicles(parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="tcVehicles">Vehículos tipo TC</Label>
                <Input
                  id="tcVehicles"
                  type="number"
                  min="0"
                  value={tcVehicles}
                  onChange={(e) => setTcVehicles(parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="tdVehicles">Vehículos tipo TD</Label>
                <Input
                  id="tdVehicles"
                  type="number"
                  min="0"
                  value={tdVehicles}
                  onChange={(e) => setTdVehicles(parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mt-1">
              Indique la cantidad de vehículos de cada tipo que participarán en la simulación
            </p>
          </div>
          
          <Button type="submit" className="w-full">
            Crear Simulación
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 