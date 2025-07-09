"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSimulation } from "@/hooks/use-simulation";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SimulationDataLoadProps {
  simulationId: string | null;
  isDisabled: boolean;
}

export function SimulationDataLoad({ simulationId, isDisabled }: SimulationDataLoadProps) {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [orderFile, setOrderFile] = useState<File | null>(null);
  const [blockageFile, setBlockageFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<"orders" | "blockages">("orders");
  const [success, setSuccess] = useState<string | null>(null);
  
  const { loadOrders, loadBlockages, isLoading, error } = useSimulation();

  // Generate array of years for select
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);
  
  // Handle file change
  const handleOrderFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setOrderFile(e.target.files[0]);
    }
  };
  
  const handleBlockageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBlockageFile(e.target.files[0]);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    
    if (!simulationId) {
      return;
    }
    console.log("Cargando archivo:", uploadType, orderFile, blockageFile);
    try {
      if (uploadType === "orders" && orderFile) {
        const response = await loadOrders(simulationId, year, month, orderFile);
        if (response) {
          setSuccess("Órdenes cargadas correctamente");
        }
      } else if (uploadType === "blockages" && blockageFile) {
        const response = await loadBlockages(simulationId, year, month, blockageFile);
        if (response) {
          setSuccess("Bloqueos cargados correctamente");
        }
      }
    } catch (err) {
      console.error("Error subiendo archivo:", err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cargar datos para simulación</CardTitle>
        <CardDescription>
          Cargue archivos de órdenes o bloqueos para un mes específico en la simulación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="uploadType">Tipo de archivo</Label>
            <Select 
              value={uploadType} 
              onValueChange={(value) => setUploadType(value as "orders" | "blockages")}
              disabled={isDisabled}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccione el tipo de archivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="orders">Órdenes</SelectItem>
                <SelectItem value="blockages">Bloqueos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year">Año</Label>
              <Select 
                value={year.toString()} 
                onValueChange={(value) => setYear(parseInt(value))}
                disabled={isDisabled}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccione el año" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="month">Mes</Label>
              <Select 
                value={month.toString()} 
                onValueChange={(value) => setMonth(parseInt(value))}
                disabled={isDisabled}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccione el mes" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {new Date(2000, m - 1, 1).toLocaleString('es', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {uploadType === "orders" ? (
            <div>
              <Label htmlFor="orderFile">Archivo de órdenes</Label>
              <Input
                id="orderFile"
                type="file"
                accept=".csv,.txt,.json"
                onChange={handleOrderFileChange}
                className="mt-1"
                disabled={isDisabled}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Formatos soportados: CSV, TXT, JSON
              </p>
            </div>
          ) : (
            <div>
              <Label htmlFor="blockageFile">Archivo de bloqueos</Label>
              <Input
                id="blockageFile"
                type="file"
                accept=".csv,.txt,.json"
                onChange={handleBlockageFileChange}
                className="mt-1"
                disabled={isDisabled}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Formatos soportados: CSV, TXT, JSON
              </p>
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert variant="default" className="bg-green-50 border-green-500 text-green-700">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={
              isDisabled || 
              isLoading || 
              !simulationId || 
              (uploadType === "orders" && !orderFile) || 
              (uploadType === "blockages" && !blockageFile)
            }
          >
            {isLoading ? "Cargando..." : "Cargar archivo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 