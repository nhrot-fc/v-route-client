"use client";

import type React from "react";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Upload, Download, CalendarIcon } from "lucide-react";
import { useOrders } from "@/hooks/use-orders";
import { type OrderDTO } from "@/lib/api-client";

interface OrderUploadFormProps {
  onOrdersUploaded?: () => void;
}

export function OrderUploadForm({ onOrdersUploaded }: OrderUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const { toast } = useToast();
  const { createBulkOrders } = useOrders();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = useCallback(() => {
    // Crear contenido de la plantilla CSV según el patrón requerido exactamente
    const csvContent = [
      "# PLANTILLA PARA CARGA MASIVA DE PEDIDOS",
      "#",
      "# INSTRUCCIONES:",
      "# Agregue sus pedidos debajo de esta sección siguiendo el formato:",
      "# DDdHHhMMm:Px,Py,c-CC,Qm3,PPh",
      "#",
      "# Donde:",
      "# - DDdHHhMMm = Dia, hora y minuto de llegada (ej: 01d11h25m)",
      "# - Px = Coordenada X del cliente (0-70)",
      "# - Py = Coordenada Y del cliente (0-50)",
      "# - c-CC = Codigo del cliente (ej: c-123)",
      "# - Qm3 = Volumen solicitado en metros cubicos (ej: 3m3)",
      "# - PPh = Plazo de entrega en horas (ej: 12h)",
      "#",
      "# Ejemplo de formato correcto:",
      "# 01d00h24m:16,13,c-198,3m3,4h",
      "# 01d00h48m:5,18,c-12,9m3,17h",
      "# 01d01h12m:63,13,c-83,2m3,9h",
      "#",
      "# AGREGAR PEDIDOS AQUI:",
      "",
    ].join("\n");

    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "plantilla_pedidos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const parseCsv = (csvContent: string, refYear: number, refMonth: number) => {
    const lines = csvContent.split("\n");
    const orders: OrderDTO[] = [];

    for (const line of lines) {
      // Skip comments and empty lines
      if (line.trim().startsWith("#") || line.trim().length === 0) {
        continue;
      }

      // Nueva estructura: DDdHHhMMm:Px,Py,c-CC,Qm3,PPh
      const parts = line.split(":");
      if (parts.length !== 2) {
        continue; // Skip invalid lines
      }

      const timeStr = parts[0].trim();
      const dataParts = parts[1].split(",");

      if (dataParts.length < 5) {
        continue; // Skip invalid lines
      }

      const [posX, posY, clientId, glpRequestStr, deadlineStr] = dataParts;

      try {
        // Parse arrival time from format DDdHHhMMm
        const dayMatch = timeStr.match(/(\d+)d/);
        const hourMatch = timeStr.match(/(\d+)h/);
        const minuteMatch = timeStr.match(/(\d+)m/);

        const days = dayMatch ? parseInt(dayMatch[1]) : 0;
        const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
        const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;

        // Crear la fecha de llegada usando UTC para evitar el ajuste por zona horaria
        // Date.UTC devuelve un timestamp que luego convertimos a objeto Date
        const arrivalTimestamp = Date.UTC(
          refYear,
          refMonth - 1, // Mes en JavaScript es 0-indexed (0-11)
          days,
          hours,
          minutes,
          0,
        );
        const arrivalDate = new Date(arrivalTimestamp);

        // Parse GLP request (remove m3 suffix)
        const glpRequestM3 = parseFloat(glpRequestStr.replace("m3", ""));

        // Parse deadline hours (remove h suffix)
        const deadlineHours = parseInt(deadlineStr.replace("h", ""));

        // Calcular la fecha límite sumando las horas de plazo, también en UTC
        const deadlineTimestamp =
          arrivalTimestamp + deadlineHours * 60 * 60 * 1000;
        const deadlineDate = new Date(deadlineTimestamp);

        // Crear un ID que refleje correctamente el cliente y la fecha/hora de llegada
        // Extraemos los componentes de fecha directamente de la fecha UTC
        const stringId = `${clientId}-${arrivalDate.getUTCFullYear()}-${
          arrivalDate.getUTCMonth() + 1
        }-${arrivalDate.getUTCDate()}T${arrivalDate.getUTCHours()}:${arrivalDate.getUTCMinutes()}`;

        // Create order DTO
        const order: OrderDTO = {
          id: stringId,
          position: {
            x: parseFloat(posX),
            y: parseFloat(posY),
          },
          arrivalTime: arrivalDate.toISOString(),
          deadlineTime: deadlineDate.toISOString(),
          glpRequestM3,
          remainingGlpM3: glpRequestM3, // Initially, remaining = requested
          delivered: false,
        };

        orders.push(order);
      } catch (err) {
        console.error("Error parsing line:", line, err);
        continue;
      }
    }

    return orders;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo para cargar",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      // Simula progreso visual hasta el 90%
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 15;
        if (currentProgress >= 90) clearInterval(interval);
        setProgress(Math.min(currentProgress, 90));
      }, 200);

      // Leer el contenido del archivo
      const fileContent = await file.text();

      // Parsear el archivo como texto plano
      const orders = parseCsv(fileContent, year, month);

      if (orders.length === 0) {
        throw new Error("No se encontraron pedidos válidos en el archivo");
      }

      // Usar createBulkOrders de useOrders hook para crear los pedidos
      await createBulkOrders(orders);

      clearInterval(interval);
      setProgress(100);

      toast({
        title: "Carga completada",
        description: `Se han procesado ${orders.length} pedidos correctamente`,
      });

      // Reset form
      setFile(null);

      // Call the callback function if provided to refresh the orders table
      if (onOrdersUploaded) {
        onOrdersUploaded();
      }
    } catch (err) {
      toast({
        title: "Error durante la carga",
        description: err instanceof Error ? err.message : "Ocurrió un error",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="file">Archivo de pedidos</Label>
        <div className="flex items-center gap-2">
          <Input
            id="file"
            type="file"
            accept=".csv,.txt,text/plain"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <Button type="submit" disabled={!file || uploading}>
            <Upload className="mr-2 h-4 w-4" />
            Cargar
          </Button>
        </div>
        <Button
          type="button"
          variant="link"
          className="justify-start px-0 text-xs text-blue-500"
          onClick={handleDownloadTemplate}
        >
          <Download className="mr-1 h-3 w-3" />
          Descargar plantilla
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Año de referencia</Label>
          <Input
            id="year"
            type="number"
            min="2023"
            max="2100"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            disabled={uploading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="month">Mes de referencia</Label>
          <Input
            id="month"
            type="number"
            min="1"
            max="12"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            disabled={uploading}
          />
        </div>
      </div>

      <div className="bg-muted/50 rounded-md p-2 text-xs text-muted-foreground">
        <div className="flex items-start gap-2">
          <CalendarIcon className="h-4 w-4 mt-0.5" />
          <div>
            <p className="font-medium">Nota sobre fechas</p>
            <p>
              El archivo sólo contiene días, horas y minutos. El año y mes
              seleccionados se usarán como referencia.
            </p>
          </div>
        </div>
      </div>

      {file && (
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4" />
          <span>{file.name}</span>
          <span className="text-muted-foreground">
            ({Math.round(file.size / 1024)} KB)
          </span>
        </div>
      )}

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Procesando archivo...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}
    </form>
  );
}
