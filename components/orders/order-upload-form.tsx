"use client";

import type React from "react";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Upload, Download } from "lucide-react";
import { ordersApi } from "@/lib/api-client";

interface OrderUploadFormProps {
  onOrdersUploaded?: () => void;
}

export function OrderUploadForm({ onOrdersUploaded }: OrderUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

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
      "# Agregue sus pedidos debajo de esta seccion siguiendo el formato:",
      "# DDdHHhMMm,Px,Py,c-CC,Qm3,PPh",
      "#",
      "# Donde:",
      "# - DDdHHhMMm = Dia, hora y minuto de llegada (ej: 01d11h25m)",
      "# - Px = Coordenada X del cliente (0-70)",
      "# - Py = Coordenada Y del cliente (0-50)",
      "# - c-CC = Codigo del cliente (ej: c-123)",
      "# - Qm3 = Volumen solicitado en metros cubicos (ej: 25)",
      "# - PPh = Plazo de entrega en horas (ej: 12)",
      "#",
      "# Ejemplo de formato correcto:",
      "# 01d11h25m,69,49,c-999,25,12",
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

    const formData = new FormData();
    formData.append("file", file);

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

      // Usar axios del API client para hacer la solicitud
      const response = await ordersApi.importCsv(formData);

      clearInterval(interval);
      setProgress(100);

      // Parse the response to get information about the processed orders
      const result = response.data;

      toast({
        title: "Carga completada",
        description: `Se han procesado ${
          result.processedOrders || "varios"
        } pedidos correctamente`,
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
        <Label htmlFor="file">Archivo de pedidos (CSV)</Label>
        <div className="flex items-center gap-2">
          <Input
            id="file"
            type="file"
            accept=".csv"
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
          Descargar plantilla CSV
        </Button>
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
