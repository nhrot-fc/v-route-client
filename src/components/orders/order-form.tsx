import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useOrders } from "@/hooks/use-orders";
import { type OrderDTO } from "@/lib/api-client";
import { DateUtils } from "@/lib/date-utils";

interface OrderFormProps {
  onOrderAdded?: () => void;
}

export default function OrderForm({ onOrderAdded }: OrderFormProps) {
  const { toast } = useToast();
  const { createOrder } = useOrders();
  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(0);
  const [volumen, setVolumen] = useState<number>(0);
  const [clienteId, setClienteId] = useState<string>("");
  const [plazoHoras, setPlazoHoras] = useState<number>(24);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (x < 0 || x > 70) {
      toast({
        title: "Coordenada X inválida",
        description: "El valor de X debe estar entre 0 y 70.",
        variant: "destructive",
      });
      return;
    }

    if (y < 0 || y > 50) {
      toast({
        title: "Coordenada Y inválida",
        description: "El valor de Y debe estar entre 0 y 50.",
        variant: "destructive",
      });
      return;
    }

    if (!clienteId) {
      toast({
        title: "ID de cliente requerido",
        description: "Debes ingresar un identificador de cliente (ej: c-123).",
        variant: "destructive",
      });
      return;
    }

    // Para el formato c-XXX del ID de cliente
    if (!/^c-\d+$/.test(clienteId)) {
      toast({
        title: "Formato de ID de cliente inválido",
        description:
          "El ID del cliente debe tener el formato c-XXX donde XXX son números.",
        variant: "destructive",
      });
      return;
    }

    // Create "local" dates using DateUtils for backend submission
    const now = DateUtils.createLocalDate();
    const due = new Date(now);
    due.setHours(due.getHours() + plazoHoras);
    const dueFixed = DateUtils.removeTimezone(due);

    const idFecha = now.toISOString().split("T")[0].replace(/-/g, "");
    const orderId = `${clienteId}-${idFecha}`;

    const orderData: OrderDTO = {
      id: orderId,
      position: { x, y },
      arrivalTime: now.toISOString(),
      deadlineTime: dueFixed.toISOString(),
      glpRequestM3: volumen,
      remainingGlpM3: volumen,
      delivered: false,
    };

    try {
      await createOrder(orderData);

      toast({
        title: "Pedido creado",
        description: "El pedido fue registrado correctamente.",
      });

      // Reset form fields
      setX(0);
      setY(0);
      setVolumen(0);
      setClienteId("");
      setPlazoHoras(24);

      // Call the callback function if it's provided
      if (onOrderAdded) {
        onOrderAdded();
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error al crear el pedido",
        description:
          (error as Error).message ||
          "Ocurrió un problema al registrar el pedido.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={(e: React.FormEvent) => void handleSubmit(e)} className="space-y-4">
      <div>
        <Label htmlFor="clienteId">ID de Cliente (formato c-XXX)</Label>
        <Input
          type="text"
          id="clienteId"
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          placeholder="c-123"
          required
        />
      </div>
      <div>
        <Label htmlFor="x">Coordenada X (máx 70)</Label>
        <Input
          type="number"
          id="x"
          value={x}
          onChange={(e) => setX(Number(e.target.value))}
          max={70}
          min={0}
          required
        />
      </div>
      <div>
        <Label htmlFor="y">Coordenada Y (máx 50)</Label>
        <Input
          type="number"
          id="y"
          value={y}
          onChange={(e) => setY(Number(e.target.value))}
          max={50}
          min={0}
          required
        />
      </div>
      <div>
        <Label htmlFor="volumen">Volumen de GLP (m³)</Label>
        <Input
          type="number"
          id="volumen"
          value={volumen}
          onChange={(e) => setVolumen(Number(e.target.value))}
          min={0.1}
          step={0.1}
          required
        />
      </div>
      <div>
        <Label htmlFor="plazoHoras">Plazo de entrega (horas)</Label>
        <Input
          type="number"
          id="plazoHoras"
          value={plazoHoras}
          onChange={(e) => setPlazoHoras(Number(e.target.value))}
          min={1}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          La fecha límite será {plazoHoras} horas después de la fecha actual.
        </p>
      </div>
      <Button type="submit">Registrar Pedido</Button>
    </form>
  );
}
