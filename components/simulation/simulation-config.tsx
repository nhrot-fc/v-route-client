"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVehicles } from "@/hooks/use-vehicles";
import { Checkbox } from "@/components/ui/checkbox";

export interface SimulationConfigData {
  startDate: string;
  vehicleIds: string[];
  mainDepotId: string;
  auxDepotIds: string[];
}

interface SimulationConfigProps {
  onCreateSimulation: (config: SimulationConfigData) => Promise<void>;
}

export function SimulationConfig({ onCreateSimulation }: SimulationConfigProps) {
  const { vehicles } = useVehicles();
  const [startDate, setStartDate] = useState<string>("");
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [mainDepot, setMainDepot] = useState<string>("");
  const [auxDepots, setAuxDepots] = useState<string[]>([]);
  
  // Lista temporal de depósitos (esto debería venir de una API real)
  const depots = [
    { id: "main-depot-1", name: "Depósito Principal 1" },
    { id: "aux-depot-1", name: "Depósito Auxiliar 1" },
    { id: "aux-depot-2", name: "Depósito Auxiliar 2" },
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate) {
      alert("Por favor selecciona una fecha de inicio");
      return;
    }
    
    if (!mainDepot) {
      alert("Por favor selecciona un depósito principal");
      return;
    }
    
    if (selectedVehicles.length === 0) {
      alert("Por favor selecciona al menos un vehículo");
      return;
    }
    
    const config: SimulationConfigData = {
      startDate,
      vehicleIds: selectedVehicles,
      mainDepotId: mainDepot,
      auxDepotIds: auxDepots
    };
    
    await onCreateSimulation(config);
  };
  
  const toggleVehicleSelection = (vehicleId: string) => {
    setSelectedVehicles(prev => 
      prev.includes(vehicleId)
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };
  
  const toggleAuxDepot = (depotId: string) => {
    setAuxDepots(prev =>
      prev.includes(depotId)
        ? prev.filter(id => id !== depotId)
        : [...prev, depotId]
    );
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
          
          <div>
            <Label>Depósito Principal</Label>
            <Select value={mainDepot} onValueChange={setMainDepot}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccione el depósito principal" />
              </SelectTrigger>
              <SelectContent>
                {depots.map((depot) => (
                  <SelectItem key={depot.id} value={depot.id}>
                    {depot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Depósitos Auxiliares</Label>
            <div className="grid gap-2 mt-2">
              {depots.filter(d => d.id !== mainDepot).map((depot) => (
                <div key={depot.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`aux-${depot.id}`}
                    checked={auxDepots.includes(depot.id)}
                    onCheckedChange={() => toggleAuxDepot(depot.id)}
                  />
                  <label
                    htmlFor={`aux-${depot.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {depot.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <Label>Vehículos</Label>
            <div className="border rounded-md p-3 mt-2 h-48 overflow-y-auto">
              <div className="grid gap-2">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`vehicle-${vehicle.id}`}
                      checked={selectedVehicles.includes(vehicle.id || "")}
                      onCheckedChange={() => toggleVehicleSelection(vehicle.id || "")}
                    />
                    <label
                      htmlFor={`vehicle-${vehicle.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {vehicle.id} - {vehicle.type} ({vehicle.currentGlpM3}/{vehicle.glpCapacityM3} m³)
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Seleccione los vehículos que participarán en la simulación
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