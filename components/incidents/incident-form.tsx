"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import { useVehicles } from "@/hooks/use-vehicles";
import { useIncidents } from "@/hooks/use-incidents";
import {
  IncidentCreateDTO,
  IncidentDTO,
  IncidentTypeEnum,
  IncidentCreateDTOShiftEnum,
  IncidentCreateDTOTypeEnum,
} from "@/lib/api-client";

// Define form schema
const formSchema = z.object({
  vehicleId: z.string({
    required_error: "Por favor seleccione un vehículo",
  }),
  type: z.string({
    required_error: "Por favor seleccione un tipo de incidente",
  }),
  shift: z.string({
    required_error: "Por favor seleccione un turno",
  }),
  occurrenceTime: z.date({
    required_error: "Por favor seleccione la fecha y hora del incidente",
  }),
  locationX: z.coerce
    .number()
    .min(-100, {
      message: "La coordenada X debe ser mayor a -100",
    })
    .max(100, {
      message: "La coordenada X debe ser menor a 100",
    }),
  locationY: z.coerce
    .number()
    .min(-100, {
      message: "La coordenada Y debe ser mayor a -100",
    })
    .max(100, {
      message: "La coordenada Y debe ser menor a 100",
    }),
  description: z.string().optional(),
  resolved: z.boolean().default(false),
});

type IncidentFormValues = z.infer<typeof formSchema>;

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { vehicles, loading: loadingVehicles } = useVehicles();
  const { createIncident } = useIncidents();

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleId: incident?.vehicleId || "",
      type: incident?.type || "",
      shift: incident?.shift || "",
      occurrenceTime: incident?.occurrenceTime
        ? new Date(incident.occurrenceTime)
        : new Date(),
      locationX: incident?.location?.x || 0,
      locationY: incident?.location?.y || 0,
    },
  });

  async function onSubmit(values: IncidentFormValues) {
    try {
      setIsSubmitting(true);

      // Convertir la fecha a formato ISO string usando UTC para evitar problemas con zona horaria
      // toISOString() ya convierte a UTC por defecto
      const incidentData: IncidentCreateDTO = {
        vehicleId: values.vehicleId,
        type: values.type as IncidentCreateDTOTypeEnum,
        shift: values.shift as IncidentCreateDTOShiftEnum,
        occurrenceTime: values.occurrenceTime.toISOString(),
        location: {
          x: values.locationX,
          y: values.locationY,
        },
      };

      await createIncident(incidentData);

      form.reset();
      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      console.error("Error al crear incidente:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="vehicleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehículo</FormLabel>
                <Select
                  disabled={isSubmitting || loadingVehicles}
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un vehículo" />
                    </SelectTrigger>
                  </FormControl>
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de incidente</FormLabel>
                <Select
                  disabled={isSubmitting}
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                  </FormControl>
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shift"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Turno</FormLabel>
                <Select
                  disabled={isSubmitting}
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione turno" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="T1">Turno 1</SelectItem>
                    <SelectItem value="T2">Turno 2</SelectItem>
                    <SelectItem value="T3">Turno 3</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="occurrenceTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha y hora</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Seleccione fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="locationX"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación X</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Coordenada X"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locationY"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación Y</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Coordenada Y"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
    </Form>
  );
}
