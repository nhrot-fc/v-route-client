"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Vehicle, VehicleStatusEnum, VehicleTypeEnum } from "@/lib/api-client";
import { useVehicles } from "@/hooks/use-vehicles";
import {
  Truck,
  Check,
  Wrench,
  AlertTriangle,
  MapPin,
  GaugeCircle,
  Fuel,
} from "lucide-react";

export function VehicleStatusList() {
  const { vehicles, loading, error } = useVehicles();
  const [statusCounts, setStatusCounts] = useState({
    total: 0,
    available: 0,
    driving: 0,
    maintenance: 0,
    incident: 0,
  });
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    if (!loading && !error && vehicles.length > 0) {
      const counts = vehicles.reduce(
        (acc, vehicle) => {
          acc.total++;
          switch (vehicle.status) {
            case VehicleStatusEnum.Available:
              acc.available++;
              break;
            case VehicleStatusEnum.Driving:
              acc.driving++;
              break;
            case VehicleStatusEnum.Maintenance:
              acc.maintenance++;
              break;
            case VehicleStatusEnum.Incident:
              acc.incident++;
              break;
          }
          return acc;
        },
        { total: 0, available: 0, driving: 0, maintenance: 0, incident: 0 },
      );
      setStatusCounts(counts);

      // Set the first vehicle as selected by default
      if (!selectedVehicle && vehicles.length > 0) {
        setSelectedVehicle(vehicles[0]);
      }
    }
  }, [vehicles, loading, error, selectedVehicle]);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case VehicleStatusEnum.Available:
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
          >
            <Check className="h-3 w-3 mr-1" />
            Disponible
          </Badge>
        );
      case VehicleStatusEnum.Driving:
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200"
          >
            <Truck className="h-3 w-3 mr-1" />
            En Ruta
          </Badge>
        );
      case VehicleStatusEnum.Maintenance:
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200"
          >
            <Wrench className="h-3 w-3 mr-1" />
            Mantenimiento
          </Badge>
        );
      case VehicleStatusEnum.Incident:
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Averiado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Desconocido
          </Badge>
        );
    }
  };

  const getVehicleTypeName = (type?: string) => {
    switch (type) {
      case VehicleTypeEnum.Ta:
        return "Cisterna Pequeña";
      case VehicleTypeEnum.Tb:
        return "Cisterna Mediana";
      case VehicleTypeEnum.Tc:
        return "Cisterna Grande";
      case VehicleTypeEnum.Td:
        return "Cisterna Extra Grande";
      default:
        return type || "Desconocido";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estado de Flota</CardTitle>
        </CardHeader>
        <CardContent>Cargando vehículos...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estado de Flota</CardTitle>
        </CardHeader>
        <CardContent className="text-red-500">Error: {error}</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de Flota</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <div className="flex flex-col items-center justify-center border rounded-lg p-2">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-2xl font-bold">{statusCounts.total}</span>
          </div>
          <div className="flex flex-col items-center justify-center border rounded-lg p-2 bg-green-50">
            <span className="text-sm text-green-600">Disponibles</span>
            <span className="text-2xl font-bold text-green-700">
              {statusCounts.available}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center border rounded-lg p-2 bg-blue-50">
            <span className="text-sm text-blue-600">En Ruta</span>
            <span className="text-2xl font-bold text-blue-700">
              {statusCounts.driving}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center border rounded-lg p-2 bg-red-50">
            <span className="text-sm text-red-600">En Problemas</span>
            <span className="text-2xl font-bold text-red-700">
              {statusCounts.incident + statusCounts.maintenance}
            </span>
          </div>
        </div>

        {selectedVehicle && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">
              Vehículo {selectedVehicle.id}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <div className="bg-muted p-2 rounded-full">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium">
                    {getVehicleTypeName(selectedVehicle.type)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="bg-muted p-2 rounded-full">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ubicación</p>
                  <p className="font-medium">
                    {selectedVehicle.currentPosition
                      ? `(${selectedVehicle.currentPosition.x}, ${selectedVehicle.currentPosition.y})`
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="bg-muted p-2 rounded-full">
                  <GaugeCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">GLP</p>
                  <p className="font-medium">
                    {selectedVehicle.currentGlpM3?.toFixed(2) || "0"} /{" "}
                    {selectedVehicle.glpCapacityM3?.toFixed(2) || "0"} m³
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="bg-muted p-2 rounded-full">
                  <Fuel className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Combustible</p>
                  <p className="font-medium">
                    {selectedVehicle.currentFuelGal?.toFixed(2) || "0"} /{" "}
                    {selectedVehicle.fuelCapacityGal?.toFixed(2) || "0"} gal
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              {getStatusBadge(selectedVehicle.status)}
            </div>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Flota Completa</h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className={`flex items-center justify-between p-2 border rounded-md cursor-pointer hover:bg-accent hover:bg-opacity-50 transition-colors ${
                  selectedVehicle?.id === vehicle.id ? "bg-accent" : ""
                }`}
                onClick={() => setSelectedVehicle(vehicle)}
              >
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span>{vehicle.id}</span>
                </div>
                {getStatusBadge(vehicle.status)}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
