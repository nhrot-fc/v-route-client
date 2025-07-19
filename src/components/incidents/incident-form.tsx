import React, { useState } from "react";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useVehicles } from "@/hooks/use-vehicles";
import { useIncidents } from "@/hooks/use-incidents";
import {
  type IncidentCreateDTO,
  type IncidentDTO,
  IncidentTypeEnum,
  IncidentCreateDTOTypeEnum,
} from "@/lib/api-client";

export interface IncidentFormProps {
  incident?: IncidentDTO | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function IncidentForm({
  incident,
  onSaved,
  onCancel,
}: IncidentFormProps) {
  const { toast } = useToast();
  const { vehicles, loading: loadingVehicles } = useVehicles();
  const { createIncident } = useIncidents();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [vehicleId, setVehicleId] = useState<string>(incident?.vehicleId || "");
  const [type, setType] = useState<string>(incident?.type || "");
  const [shift, setShift] = useState<string>(incident?.shift || "");
  const [occurrenceTime, setOccurrenceTime] = useState<Date>(
    incident?.occurrenceTime ? new Date(incident.occurrenceTime) : new Date()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!vehicleId) {
      toast({
        title: "Error de validación",
        description: "Por favor seleccione un vehículo",
        variant: "destructive",
      });
      return;
    }

    if (!type) {
      toast({
        title: "Error de validación",
        description: "Por favor seleccione un tipo de incidente",
        variant: "destructive",
      });
      return;
    }

    if (!shift) {
      toast({
        title: "Error de validación",
        description: "Por favor seleccione un turno",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const incidentData: IncidentCreateDTO = {
        vehicleId,
        type: type as IncidentCreateDTOTypeEnum,
        occurrenceTime: occurrenceTime.toISOString(),
      };

      await createIncident(incidentData);

      // Reset form
      setVehicleId("");
      setType("");
      setShift("");
      setOccurrenceTime(new Date());

      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      console.error("Error al crear incidente:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al crear el incidente",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e: React.FormEvent) => void handleSubmit(e)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vehicleId">Vehículo</Label>
          <Select
            disabled={isSubmitting || loadingVehicles}
            value={vehicleId}
            onValueChange={setVehicleId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un vehículo" />
            </SelectTrigger>
            <SelectContent>
              {loadingVehicles ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Cargando vehículos...</span>
                </div>
              ) : (
                vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id!}>
                    {vehicle.id} - {vehicle.type}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="type">Tipo de incidente</Label>
          <Select
            disabled={isSubmitting}
            value={type}
            onValueChange={setType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={IncidentTypeEnum.Ti1}>
                Mecánico (TI1)
              </SelectItem>
              <SelectItem value={IncidentTypeEnum.Ti2}>
                Tráfico (TI2)
              </SelectItem>
              <SelectItem value={IncidentTypeEnum.Ti3}>
                Clima (TI3)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="shift">Turno</Label>
          <Select
            disabled={isSubmitting}
            value={shift}
            onValueChange={setShift}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione turno" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="T1">Turno 1</SelectItem>
              <SelectItem value="T2">Turno 2</SelectItem>
              <SelectItem value="T3">Turno 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="occurrenceTime">Fecha y hora</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full pl-3 text-left font-normal",
                  !occurrenceTime && "text-muted-foreground"
                )}
                disabled={isSubmitting}
              >
                {occurrenceTime ? (
                  format(occurrenceTime, "PPP", { locale: es })
                ) : (
                  <span>Seleccione fecha</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={occurrenceTime}
                onSelect={(date) => {
                  if (date instanceof Date) {
                    setOccurrenceTime(date);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {incident ? "Actualizar" : "Registrar"} incidente
        </Button>
      </div>
    </form>
  );
}
