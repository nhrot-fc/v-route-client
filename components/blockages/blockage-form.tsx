"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { DatePicker } from "@/components/ui/date-picker";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useBlockages } from "@/hooks/use-blockages";
import { BlockageDTO, Position } from "@/lib/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define point schema
const pointSchema = z.object({
  x: z.coerce.number().int().min(0, "Ingrese un número válido"),
  y: z.coerce.number().int().min(0, "Ingrese un número válido"),
});

// Define form schema
const formSchema = z
  .object({
    points: z.array(pointSchema).min(2, "Debe ingresar al menos 2 puntos"),
    startDate: z.date({
      required_error: "Seleccione una fecha de inicio",
    }),
    endDate: z
      .date({
        required_error: "Seleccione una fecha de fin",
      })
      .min(new Date(), "La fecha de fin debe ser posterior a la fecha actual"),
    startHour: z
      .string()
      .regex(/^([01]?[0-9]|2[0-3])$/, "Hora inválida (0-23)"),
    startMinute: z.string().regex(/^[0-5]?[0-9]$/, "Minuto inválido (0-59)"),
    endHour: z.string().regex(/^([01]?[0-9]|2[0-3])$/, "Hora inválida (0-23)"),
    endMinute: z.string().regex(/^[0-5]?[0-9]$/, "Minuto inválido (0-59)"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      start.setHours(parseInt(data.startHour), parseInt(data.startMinute));

      const end = new Date(data.endDate);
      end.setHours(parseInt(data.endHour), parseInt(data.endMinute));

      return end > start;
    },
    {
      message:
        "La fecha y hora de fin debe ser posterior a la fecha y hora de inicio",
      path: ["endDate"],
    },
  );

type FormValues = z.infer<typeof formSchema>;

export function BlockageForm() {
  const { toast } = useToast();
  const { createBlockage } = useBlockages();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      points: [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ],
      startHour: "08",
      startMinute: "00",
      endHour: "18",
      endMinute: "00",
    },
  });

  // Use fieldArray to handle the dynamic points array
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "points",
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Construct start and end times
      const startTime = new Date(data.startDate);
      startTime.setHours(
        parseInt(data.startHour),
        parseInt(data.startMinute),
        0,
        0,
      );

      const endTime = new Date(data.endDate);
      endTime.setHours(parseInt(data.endHour), parseInt(data.endMinute), 0, 0);

      // Create linePoints string from points array: "x1,y1,x2,y2,...,xn,yn"
      const blockageLines: Position[] = data.points.map((point) => ({
        x: point.x,
        y: point.y,
      }));

      // Create blockage object with linePoints format
      const blockageData: BlockageDTO = {
        blockageLines,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      };

      await createBlockage(blockageData);

      // Reset form
      form.reset({
        points: [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ],
        startDate: undefined,
        endDate: undefined,
        startHour: "08",
        startMinute: "00",
        endHour: "18",
        endMinute: "00",
      });

      toast({
        title: "Éxito",
        description: "Bloqueo creado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al crear bloqueo",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions to generate hour and minute options
  const hourOptions = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );
  const minuteOptions = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Crear Bloqueo</CardTitle>
        <CardDescription>
          Ingrese los puntos que conforman el bloqueo y el período de tiempo en
          que estará activo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 text-blue-700 p-3 rounded-lg mb-4 text-sm">
          <p>
            <strong>Nota:</strong> Los bloqueos se definen como líneas entre
            puntos. Debe ingresar al menos dos puntos para crear un bloqueo
            lineal.
          </p>
          <p className="mt-1">
            El formato es similar al de carga masiva: una serie de puntos (x,y)
            que definen el trazado del bloqueo.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Puntos del Bloqueo</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ x: 0, y: 0 })}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Punto
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-end gap-2 bg-muted/20 p-3 rounded-md"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium mb-2">
                        Punto {index + 1}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`points.${index}.x`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Coordenada X</FormLabel>
                              <FormControl>
                                <Input type="number" min={0} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`points.${index}.y`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Coordenada Y</FormLabel>
                              <FormControl>
                                <Input type="number" min={0} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    {fields.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar punto</span>
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {form.formState.errors.points?.message && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.points.message}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <h3 className="text-lg font-medium">Fecha y Hora de Inicio</h3>
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          setDate={field.onChange}
                          disabled={false}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startHour"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Hora" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {hourOptions.map((hour) => (
                              <SelectItem
                                key={`start-hour-${hour}`}
                                value={hour}
                              >
                                {hour}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startMinute"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minuto</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Minuto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {minuteOptions.map((minute) => (
                              <SelectItem
                                key={`start-min-${minute}`}
                                value={minute}
                              >
                                {minute}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <h3 className="text-lg font-medium">Fecha y Hora de Fin</h3>
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          setDate={field.onChange}
                          disabled={false}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="endHour"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Hora" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {hourOptions.map((hour) => (
                              <SelectItem key={`end-hour-${hour}`} value={hour}>
                                {hour}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endMinute"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minuto</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Minuto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {minuteOptions.map((minute) => (
                              <SelectItem
                                key={`end-min-${minute}`}
                                value={minute}
                              >
                                {minute}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando bloqueo...
                </>
              ) : (
                "Crear Bloqueo"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
