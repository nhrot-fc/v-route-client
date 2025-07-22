import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import {
  FileText,
  Upload,
  AlertCircle,
  CheckCircle2,
  CalendarIcon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMaintenance } from "@/hooks/use-maintenance";
import { type MaintenanceDTO } from "@/lib/api-client";
import { useVehicles } from "@/hooks/use-vehicles";
import { DateUtils } from "@/lib/date-utils";

export function MaintenanceUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const { toast } = useToast();
  const { createMaintenance } = useMaintenance();
  const { vehicles } = useVehicles();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setUploadStatus("idle");
      setErrorMessage("");
    }
  };

  const parseFile = (fileContent: string): MaintenanceDTO[] => {
    const lines = fileContent
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#"));
    const result: MaintenanceDTO[] = [];

    // Validate vehicle IDs exist
    const vehicleIds = new Set(vehicles.map((v) => v.id));

    for (let i = 0; i < lines.length; i++) {
      try {
        const line = lines[i].trim();

        // Skip comments and empty lines
        if (!line || line.startsWith("#")) {
          continue;
        }

        // Parse the line - expect format like: vehicleId:assignedDate
        const parts = line.split(":");
        if (parts.length < 2) {
          throw new Error(
            `Formato inválido en línea ${i + 1}. Esperado: vehicleId:assignedDate`,
          );
        }

        const vehicleId = parts[0].trim();
        const assignedDateStr = parts[1].trim();

        // Validate vehicle exists
        if (!vehicleId || !vehicleIds.has(vehicleId)) {
          throw new Error(
            `El vehículo con ID ${vehicleId} no existe en la línea ${i + 1}`,
          );
        }

        // Parse assigned date with year and month context
        // Format expected: DDdHHhMMm (day, hour, minute)
        const assignedDate = parseDate(assignedDateStr, year, month);

        result.push({
          vehicleId: vehicleId,
          assignedDate: assignedDate.toISOString(),
          active: false,
        });
      } catch (error) {
        throw new Error(
          `Error en línea ${i + 1}: ${error instanceof Error ? error.message : "Formato inválido"}`,
        );
      }
    }

    return result;
  };

  // Helper to parse date in the format DDdHHhMMm with year and month context
  const parseDate = (dateStr: string, year: number, month: number): Date => {
    // Expected format: 01d00h24m (day 1, 00 hours, 24 minutes)
    const dayMatch = dateStr.match(/(\d+)d/);
    const hourMatch = dateStr.match(/(\d+)h/);
    const minuteMatch = dateStr.match(/(\d+)m/);

    if (!dayMatch) {
      throw new Error(`Formato de día inválido, se esperaba 'XXd'`);
    }

    const day = parseInt(dayMatch[1], 10);
    const hour = hourMatch ? parseInt(hourMatch[1], 10) : 0;
    const minute = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;

    // Crear fecha base usando UTC
    const timestamp = Date.UTC(year, month - 1, day, hour, minute);
    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
      throw new Error("Fecha inválida");
    }

    // Aplicar DateUtils para manejar la zona horaria correctamente para el backend
    return DateUtils.removeTimezone(date);
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

    setIsUploading(true);
    setUploadStatus("idle");
    setProgress(0);

    try {
      const fileContent = await file.text();
      const maintenances = parseFile(fileContent);

      // Create maintenances through API
      let processed = 0;
      for (const maintenance of maintenances) {
        await createMaintenance(maintenance);
        processed++;
        setProgress(Math.round((processed / maintenances.length) * 100));
      }

      setUploadStatus("success");
      setFile(null);

      toast({
        title: "Carga completada",
        description: `Se han procesado ${maintenances.length} mantenimientos correctamente`,
      });

      // Reset file input
      const fileInput = document.getElementById(
        "maintenance-file",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      setUploadStatus("error");
      const errorMsg =
        error instanceof Error ? error.message : "Error al procesar el archivo";
      setErrorMessage(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Cargar Mantenimientos</CardTitle>
        <CardDescription>
          Sube un archivo de texto con los mantenimientos programados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year">Año</Label>
              <Input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={2000}
                max={2100}
              />
            </div>
            <div>
              <Label htmlFor="month">Mes</Label>
              <Input
                id="month"
                type="number"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                min={1}
                max={12}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="maintenance-file">Archivo de mantenimientos</Label>
            <Input
              id="maintenance-file"
              type="file"
              accept="*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground">
              Formato esperado: vehicleId:01d00h24m (donde 01d es el día, 00h es
              la hora y 24m son los minutos)
            </p>
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

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Procesando mantenimientos...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {uploadStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {uploadStatus === "success" && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle>Éxito</AlertTitle>
              <AlertDescription>
                Mantenimientos cargados correctamente
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md text-sm">
            <h4 className="font-bold flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              Formato de ejemplo:
            </h4>
            <pre className="mt-1 bg-amber-100 p-2 rounded">
              T001:01d00h24m
              <br />
              T002:01d02h00m
              <br />
              T003:01d12h15m
            </pre>
            <p className="mt-2 text-xs">
              Donde T001 es el ID del vehículo y 01d00h24m indica el día 1 a las
              00:24 horas.
              <br />
              El año y mes se especifican en los campos superiores.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={(e: React.FormEvent) => void handleSubmit(e)}
          disabled={isUploading || !file}
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">◌</span>
              Procesando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Cargar Mantenimientos
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
