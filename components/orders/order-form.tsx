"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export default function OrderForm() {
  const { toast } = useToast()
  const [x, setX] = useState<number>(0)
  const [y, setY] = useState<number>(0)
  const [volumen, setVolumen] = useState<number>(0)
  const [fechaLimite, setFechaLimite] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (x < 0 || x > 70) {
      toast({
        title: "Coordenada X inválida",
        description: "El valor de X debe estar entre 0 y 70.",
        variant: "destructive",
      })
      return
    }

    if (y < 0 || y > 50) {
      toast({
        title: "Coordenada Y inválida",
        description: "El valor de Y debe estar entre 0 y 50.",
        variant: "destructive",
      })
      return
    }

    if (!fechaLimite) {
      toast({
        title: "Fecha límite requerida",
        description: "Debes ingresar una fecha y hora válidas.",
        variant: "destructive",
      })
      return
    }

    const due = new Date(fechaLimite)
    const now = new Date()

    if (isNaN(due.getTime())) {
      toast({
        title: "Fecha límite inválida",
        description: "Por favor, ingresa una fecha válida.",
        variant: "destructive",
      })
      return
    }

    const data = {
      id: "",
      position: { x, y },
      arriveDate: now.toISOString(),
      dueDate: due.toISOString(),
      deliveryDate: due.toISOString(),
      status: "PENDING",
      remainingVolume: volumen,
      glpRequest: volumen,
      remainingGLP: volumen
    }

    try {
      const response = await fetch("http://localhost:8080/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error("Error al crear el pedido")

      toast({
        title: "Pedido creado",
        description: "El pedido fue registrado correctamente.",
      })

      setX(0)
      setY(0)
      setVolumen(0)
      setFechaLimite("")
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error al crear el pedido",
        description: "Ocurrió un problema al registrar el pedido.",
        variant: "destructive",
      })
    }
  }

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
        />
      </div>
      <div>
        <Label htmlFor="volumen">Volumen de GLP (m³)</Label>
        <Input
          type="number"
          id="volumen"
          value={volumen}
          onChange={(e) => setVolumen(Number(e.target.value))}
        />
      </div>
      <div>
        <Label htmlFor="fechaLimite">Fecha límite</Label>
        <Input
          type="datetime-local"
          id="fechaLimite"
          value={fechaLimite}
          onChange={(e) => setFechaLimite(e.target.value)}
        />
      </div>
      <Button type="submit">Registrar Pedido</Button>
    </form>
  )
}
