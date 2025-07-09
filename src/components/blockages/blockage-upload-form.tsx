import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle2,
  Upload,
  Loader2,
  Download,
  CalendarIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBlockages } from "@/hooks/use-blockages";
import { type BlockageDTO, type Position } from "@/lib/api-client";

export function BlockageUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const { createBulkBlockages } = useBlockages();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setUploadStatus("idle");
      setErrorMessage("");
    }
  };

  // Helper function to parse date string in format ##d##h##m to Date
  const parseDateString = (
    dateStr: string,
    refYear: number,
    refMonth: number
  ): string => {
    const match = dateStr.match(/^(\d{2})d(\d{2})h(\d{2})m$/);
    if (!match) return new Date().toISOString();

    const [, days, hours, minutes] = match;

    // Usar el año y mes de referencia proporcionados con UTC para evitar ajustes de zona horaria
    const timestamp = Date.UTC(
      refYear,
      refMonth - 1,
      parseInt(days),
      parseInt(hours),
      parseInt(minutes),
      0
    );
    const utcDate = new Date(timestamp);
    return utcDate.toISOString();
  };

  // Parse blockage line to create blockage objects
  const parseBlockageLine = (
    line: string,
    refYear: number,
    refMonth: number
  ): BlockageDTO => {
    // Format: ##d##h##m-##d##h##m:x1,y1,x2,y2,...,xn,yn
    const [timeRange, coordinates] = line.split(":");
    const [startTimeStr, endTimeStr] = timeRange.split("-");

    // Parse the coordinates
    const startTime = parseDateString(startTimeStr, refYear, refMonth);
    const endTime = parseDateString(endTimeStr, refYear, refMonth);

    const blockageLines: Position[] = [];
    const coordinatesArray = coordinates.split(",").map(Number);
    for (let i = 0; i < coordinatesArray.length; i += 2) {
      blockageLines.push({
        x: coordinatesArray[i],
        y: coordinatesArray[i + 1],
      });
    }

    return {
      startTime,
      endTime,
      blockageLines,
    };
  };

  const handleDownloadTemplate = () => {
    // Crear contenido de la plantilla según el formato requerido
    const templateContent = [
      "# PLANTILLA PARA CARGA MASIVA DE BLOQUEOS",
      "#",
      "# INSTRUCCIONES:",
      "# Agregue sus bloqueos debajo de esta sección siguiendo el formato:",
      "# DDdHHhMMm-DDdHHhMMm:x1,y1,x2,y2,...,xn,yn",
      "#",
      "# Donde:",
      "# - DDdHHhMMm = Día, hora y minuto de inicio/fin (ej: 01d08h30m)",
      "# - x1,y1,x2,y2,... = Coordenadas de los puntos que forman el bloqueo",
      "#",
      "# Ejemplo de formato correcto:",
      "# 01d00h31m-01d21h35m:15,10,30,10,30,18",
      "# 01d01h13m-01d20h38m:08,03,08,23,20,23",
      "# 01d02h40m-01d22h32m:57,30,57,45",
      "#",
      "# AGREGAR BLOQUEOS AQUI:",
      "",
    ].join("\n");

    // Crear y descargar el archivo
    const blob = new Blob([templateContent], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "plantilla_bloqueos.txt");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("idle");
    setErrorMessage("");

    try {
      // Read file content
      const fileContent = await file.text();
      const lines = fileContent.trim().split("\n");

      // Parse each line and collect all blockages
      const blockages = lines
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#")) // Filter out empty lines and comments
        .map((line) => parseBlockageLine(line, year, month));

      if (blockages.length === 0) {
        throw new Error("No se encontraron bloqueos válidos en el archivo");
      }

      // Create blockages in bulk
      await createBulkBlockages(blockages);

      // Reset file input and show success
      setFile(null);
      setUploadStatus("success");

      // Reset the file input element
      const fileInput = document.getElementById(
        "blockage-file"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Error uploading blockages:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Error al procesar el archivo"
      );
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Carga Masiva de Bloqueos</CardTitle>
        <CardDescription>
          Suba un archivo en formato de texto para importar múltiples bloqueos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="blockage-file">Archivo de Bloqueos</Label>
          <div className="flex gap-2">
            <Input
              id="blockage-file"
              type="file"
              accept=".csv,.txt,text/plain"
              onChange={handleFileChange}
              disabled={isUploading}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleDownloadTemplate}
              disabled={isUploading}
              title="Descargar plantilla"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Cada línea debe seguir el formato:
            <br />
            <code className="text-xs">##d##h##m-##d##h##m:x1,y1,x2,y2,...</code>
            <br />
            <span className="text-xs">
              Ejemplo: 01d00h31m-01d21h35m:15,10,30,10,30,18
            </span>
          </p>
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
              disabled={isUploading}
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
              disabled={isUploading}
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

        {uploadStatus === "success" && (
          <Alert
            variant="default"
            className="bg-green-50 border-green-200 text-green-800"
          >
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Éxito</AlertTitle>
            <AlertDescription>Bloqueos cargados correctamente</AlertDescription>
          </Alert>
        )}

        {uploadStatus === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {errorMessage || "Ha ocurrido un error al procesar el archivo"}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => {
            void handleUpload();
          }}
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Cargar Bloqueos
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
