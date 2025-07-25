import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  type SimulationStateDTO,
  type VehicleDTO,
  type IncidentCreateDTO,
  VehicleDTOStatusEnum,
} from "@/lib/api-client";
import { IncidentCreateDTOTypeEnum } from "@/lib/api-client";
import { useSimulation } from "@/hooks/use-simulation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPercentageValue } from "./utils";
import { Badge } from "@/components/ui/badge";

// Función para formatear el estado del vehículo con estilos visuales
const getStatusBadgeProps = (status: VehicleDTOStatusEnum | undefined) => {
  const statusBadge = status || VehicleDTOStatusEnum.Available;

  switch (statusBadge) {
    case VehicleDTOStatusEnum.Available:
      return {
        label: "Activo",
        variant: "green" as const,
        className: "bg-emerald-100 text-emerald-800 border-emerald-200",
      };
    case VehicleDTOStatusEnum.Driving:
      return {
        label: "En ruta",
        variant: "blue" as const,
        className: "bg-blue-100 text-blue-800 border-blue-200",
      };
    case VehicleDTOStatusEnum.Refueling:
      return {
        label: "Repostando",
        variant: "purple" as const,
        className: "bg-purple-100 text-purple-800 border-purple-200",
      };
    case VehicleDTOStatusEnum.Reloading:
      return {
        label: "Cargando",
        variant: "cyan" as const,
        className: "bg-cyan-100 text-cyan-800 border-cyan-200",
      };
    case VehicleDTOStatusEnum.Serving:
      return {
        label: "Atendiendo",
        variant: "teal" as const,
        className: "bg-teal-100 text-teal-800 border-teal-200",
      };
    case VehicleDTOStatusEnum.Maintenance:
      return {
        label: "Mantenimiento",
        variant: "amber" as const,
        className: "bg-amber-100 text-amber-800 border-amber-200",
      };
    case VehicleDTOStatusEnum.Incident:
      return {
        label: "Avería",
        variant: "red" as const,
        className: "bg-red-100 text-red-800 border-red-200",
      };
    case VehicleDTOStatusEnum.Idle:
      return {
        label: "Inactivo",
        variant: "gray" as const, 
        className: "bg-gray-100 text-gray-800 border-gray-200",
      };
    default:
      return {
        label: status || "Desconocido",
        variant: "gray" as const,
        className: "bg-gray-100 text-gray-800 border-gray-200",
      };
  }
};

interface StatsVehiclesProps {
  simulationState: SimulationStateDTO;
  simulationId?: string;
  searchQuery: string;
  selectedVehicleId: string | null;
  onVehicleSelect?: (vehicleId: string | null) => void;
}

/**
 * Componente para mostrar información sobre los vehículos
 */
export const StatsVehicles: React.FC<StatsVehiclesProps> = ({
  simulationState,
  simulationId,
  searchQuery,
  selectedVehicleId,
  onVehicleSelect,
}) => {
  const vehicles = simulationState.vehicles || [];
  const { createVehicleBreakdown, isLoading: isBreakdownLoading } =
    useSimulation();

  // State for breakdown dialog
  const [isBreakdownDialogOpen, setIsBreakdownDialogOpen] = useState(false);
  const [selectedVehicleForBreakdown, setSelectedVehicleForBreakdown] =
    useState<VehicleDTO | null>(null);

  // State for breakdown form
  const [breakdownType, setBreakdownType] = useState<IncidentCreateDTOTypeEnum>(
    IncidentCreateDTOTypeEnum.Ti1
  );
  const [breakdownError, setBreakdownError] = useState<string | null>(null);

  // Filter based on search query
  const filteredVehicles = searchQuery
    ? vehicles.filter(
        (vehicle) =>
          vehicle.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.type?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : vehicles;

  const handleOpenBreakdownDialog = (vehicle: VehicleDTO) => {
    setSelectedVehicleForBreakdown(vehicle);
    setIsBreakdownDialogOpen(true);
    setBreakdownError(null); // Reset error on open
  };

  const handleBreakdownSubmit = async () => {
    if (!selectedVehicleForBreakdown || !simulationId) {
      setBreakdownError(
        "No se ha seleccionado un vehículo o simulación válida."
      );
      return;
    }

    const occurrenceTime = new Date(simulationState.currentTime || Date.now());

    const breakdownData: IncidentCreateDTO = {
      type: breakdownType,
      occurrenceTime: occurrenceTime.toISOString(),
    };

    const result = await createVehicleBreakdown(
      simulationId,
      selectedVehicleForBreakdown.id!,
      breakdownData
    );

    if (result) {
      setIsBreakdownDialogOpen(false);
      // Optionally, trigger a refresh or show a success toast
    } else {
      setBreakdownError("No se pudo reportar la avería. Intente de nuevo.");
    }
  };

  return (
    <div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-2 px-3 text-left">ID</th>
            <th className="py-2 px-3 text-left">Tipo</th>
            <th className="py-2 px-3 text-left">Estado</th>
            <th className="py-2 px-3 text-left">GLP</th>
            <th className="py-2 px-3 text-left">Combustible</th>
            <th className="py-2 px-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredVehicles.map((vehicle) => {
            const glpPercentage =
              ((vehicle.currentGlpM3 || 0) / (vehicle.glpCapacityM3 || 1)) *
              100;
            const fuelPercentage =
              ((vehicle.currentFuelGal || 0) /
                (vehicle.fuelCapacityGal || 25)) *
              100;

            const glpFormatted = formatPercentageValue(
              vehicle.currentGlpM3 || 0,
              vehicle.glpCapacityM3 || 1
            );

            const fuelFormatted = formatPercentageValue(
              vehicle.currentFuelGal || 0,
              vehicle.fuelCapacityGal || 25
            );

            // Obtener propiedades para el badge de estado
            const statusBadge = getStatusBadgeProps(vehicle.status);

            return (
              <tr
                key={vehicle.id}
                className={`border-t hover:bg-blue-50 ${
                  selectedVehicleId === vehicle.id ? "bg-blue-50" : ""
                }`}
              >
                <td
                  className="py-2 px-3 cursor-pointer"
                  onClick={() =>
                    onVehicleSelect && onVehicleSelect(vehicle.id || null)
                  }
                >
                  {vehicle.id}
                </td>
                <td
                  className="py-2 px-3 cursor-pointer"
                  onClick={() =>
                    onVehicleSelect && onVehicleSelect(vehicle.id || null)
                  }
                >
                  <span
                    className={`px-2 py-1 rounded-full text-xs text-white ${
                      vehicle.type === "TA"
                        ? "bg-red-500"
                        : vehicle.type === "TB"
                        ? "bg-blue-500"
                        : vehicle.type === "TC"
                        ? "bg-amber-500"
                        : "bg-purple-500"
                    }`}
                  >
                    {vehicle.type}
                  </span>
                </td>
                <td
                  className="py-2 px-3 cursor-pointer"
                  onClick={() =>
                    onVehicleSelect && onVehicleSelect(vehicle.id || null)
                  }
                >
                  <Badge 
                    variant="outline"
                    className={statusBadge.className}
                  >
                    {statusBadge.label}
                  </Badge>
                </td>
                <td
                  className="py-2 px-3 cursor-pointer"
                  onClick={() =>
                    onVehicleSelect && onVehicleSelect(vehicle.id || null)
                  }
                >
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${glpPercentage}%`,
                          backgroundColor: glpFormatted.color,
                        }}
                      ></div>
                    </div>
                    <span
                      className="text-xs"
                      style={{ color: glpFormatted.color }}
                    >
                      {Math.round(glpPercentage)}%
                    </span>
                  </div>
                </td>
                <td
                  className="py-2 px-3 cursor-pointer"
                  onClick={() =>
                    onVehicleSelect && onVehicleSelect(vehicle.id || null)
                  }
                >
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${fuelPercentage}%`,
                          backgroundColor: fuelFormatted.color,
                        }}
                      ></div>
                    </div>
                    <span
                      className="text-xs"
                      style={{ color: fuelFormatted.color }}
                    >
                      {Math.round(fuelPercentage)}%
                    </span>
                  </div>
                </td>
                <td className="py-2 px-3">
                  <button
                    onClick={() => handleOpenBreakdownDialog(vehicle)}
                    className="p-1 text-red-500 hover:bg-red-100 rounded-full"
                    title="Reportar avería"
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Breakdown Dialog */}
      <Dialog
        open={isBreakdownDialogOpen}
        onOpenChange={setIsBreakdownDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Reportar Avería para {selectedVehicleForBreakdown?.id}
            </DialogTitle>
            <DialogDescription>
              Complete los detalles del incidente para inmovilizar el vehículo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="breakdown-type" className="text-right">
                Tipo
              </Label>
              <Select
                value={breakdownType}
                onValueChange={(value) =>
                  setBreakdownType(value as IncidentCreateDTOTypeEnum)
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={IncidentCreateDTOTypeEnum.Ti1}>
                    T1
                  </SelectItem>
                  <SelectItem value={IncidentCreateDTOTypeEnum.Ti2}>
                    T2
                  </SelectItem>
                  <SelectItem value={IncidentCreateDTOTypeEnum.Ti3}>
                    T3
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {breakdownError && (
              <p className="text-red-500 text-sm col-span-4 text-center">
                {breakdownError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBreakdownDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => void handleBreakdownSubmit()}
              disabled={isBreakdownLoading}
            >
              {isBreakdownLoading ? "Reportando..." : "Reportar Avería"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 