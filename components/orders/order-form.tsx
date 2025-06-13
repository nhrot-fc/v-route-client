"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface OrderFormProps {
  onOrderAdded?: () => void;
}

export default function OrderForm({ onOrderAdded }: OrderFormProps) {
  const { toast } = useToast();
  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(0);
  const [volumen, setVolumen] = useState<number>(0);
  const [fechaLimite, setFechaLimite] = useState<string>("");

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

    if (!fechaLimite) {
      toast({
        title: "Fecha límite requerida",
        description: "Debes ingresar una fecha y hora válidas.",
        variant: "destructive",
      });
      return;
    }

    const due = new Date(fechaLimite);
    const now = new Date();

    if (isNaN(due.getTime())) {
      toast({
        title: "Fecha límite inválida",
        description: "Por favor, ingresa una fecha válida.",
        variant: "destructive",
      });
      return;
    }

    const data = {
      id: "", // El backend debería generar el ID
      position: { x, y },
      arriveDate: now.toISOString(),
      dueDate: due.toISOString(),
      deliveryDate: due.toISOString(), // Esto podría ser diferente o nulo inicialmente
      status: "PENDING",
      remainingVolume: volumen,
      glpRequest: volumen,
      remainingGLP: volumen,
    };

    try {
      const response = await fetch(
        "http://ec2-54-208-138-5.compute-1.amazonaws.com:8082/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al crear el pedido");
      }

      toast({
        title: "Pedido creado",
        description: "El pedido fue registrado correctamente.",
      });

      // Reset form fields
      setX(0);
      setY(0);
      setVolumen(0);
      setFechaLimite("");

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
    <form onSubmit={handleSubmit} className="space-y-4">
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
          min={0.1} // Assuming volume must be positive
          step={0.1}
          required
        />
      </div>
      <div>
        <Label htmlFor="fechaLimite">Fecha límite</Label>
        <Input
          type="datetime-local"
          id="fechaLimite"
          value={fechaLimite}
          onChange={(e) => setFechaLimite(e.target.value)}
          required
        />
      </div>
      <Button type="submit">Registrar Pedido</Button>
    </form>
  );
}
