import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useMaintenance } from "@/hooks/use-maintenance";
import { useVehicles } from "@/hooks/use-vehicles";
import { DateUtils } from "@/lib/date-utils";

// Define form schema
const formSchema = z.object({
  vehicleId: z.string({
    required_error: "Selecciona un vehículo",
  }),
  assignedDate: z.date({
    required_error: "Selecciona una fecha de asignación",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function MaintenanceForm() {
  const { toast } = useToast();
  const { createMaintenance } = useMaintenance();
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assignedDate: new Date(),
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Apply DateUtils to handle timezone correctly for backend submission
      const assignedDate = DateUtils.removeTimezone(data.assignedDate);
      
      // Format dates for API
      const maintenanceData = {
        vehicleId: data.vehicleId,
        assignedDate: assignedDate.toISOString(),
      };

      await createMaintenance(maintenanceData);

      // Reset form
      form.reset({
        vehicleId: "",
        assignedDate: new Date(),
      });

      toast({
        title: "Éxito",
        description: "Mantenimiento creado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al crear el mantenimiento",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (vehiclesLoading) {
    return <div className="flex justify-center p-4">Cargando vehículos...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Programar Mantenimiento</CardTitle>
        <CardDescription>
          Crea un nuevo mantenimiento para un vehículo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={() => void form.handleSubmit(onSubmit)()}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehículo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un vehículo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id || ""}>
                            {vehicle.type} - {vehicle.id}
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
                name="assignedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Asignación</FormLabel>
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
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando mantenimiento...
                </>
              ) : (
                "Programar Mantenimiento"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
