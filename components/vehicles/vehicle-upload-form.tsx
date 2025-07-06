"use client"

import { useState,useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { FileText, Upload, CheckCircle,Download  } from "lucide-react"
import { useVehicles } from "@/hooks/use-vehicles"
import { Vehicle, VehicleTypeEnum, VehicleStatusEnum } from "@/lib/api-client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
interface VehicleUploadFormProps {
  /** 
   * Callback que cierra el diálogo principal de importación. 
   * Debe venir del padre como: `onClose={() => setImportOpen(false)}` 
   */
  onClose: () => void
}

export function VehicleUploadForm({ onClose }: VehicleUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [successOpen, setSuccessOpen] = useState(false)
  const [processedCount, setProcessedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  const { toast } = useToast()
  const { createVehicle } = useVehicles()
  const downloadTemplate = useCallback(() => {
    // Define tus cabeceras en el mismo orden que parseCSV
    const headers = [
      "id",
      "type",
      "currentPosition.x",
      "currentPosition.y"
    ]
    const csv = headers.join(",") + "\n"
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "plantilla_vehiculos.csv"
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
    }
  }

  const parseCSV = (csvText: string): Vehicle[] => {
    const lines = csvText.split("\n").filter(line => line.trim())
    const vehicles: Vehicle[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim())
      if (values.length >= 4) {
        vehicles.push({
          id: values[0],
          type: values[1] as VehicleTypeEnum,
          currentPosition: {
            x: parseFloat(values[2]),
            y: parseFloat(values[3]),
          },
          status: VehicleStatusEnum.Available,
        })
      }
    }
    return vehicles
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo para cargar",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      const csvText = await file.text()
      const vehicles = parseCSV(csvText)
      if (vehicles.length === 0) {
        throw new Error("No se encontraron vehículos válidos en el archivo")
      }

      let processed = 0
      for (const vehicle of vehicles) {
        try {
          await createVehicle(vehicle)
          processed++
          setProgress((processed / vehicles.length) * 100)
        } catch (err) {
          console.error(`Error creando vehículo ${vehicle.id}:`, err)
        }
      }

      // Guardamos para el pop-up y lo abrimos
      setProcessedCount(processed)
      setTotalCount(vehicles.length)
      setSuccessOpen(true)

      // Reset
      setFile(null)
      setProgress(0)

      toast({
        title: "Carga completada",
        description: `Se procesaron ${processed} de ${vehicles.length} vehículos correctamente`,
      })
    } catch (err) {
      toast({
        title: "Error en la carga",
        description: err instanceof Error ? err.message : "Error procesando el archivo",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
<div className="grid w-full max-w-md gap-1.5">
  <Label htmlFor="file">Archivo de vehículos (CSV)</Label>
  <div className="flex flex-wrap items-center gap-2">
    {/* Input ocupa la mitad, los botones se reparten el resto */}
    <Input
      id="file"
      type="file"
      accept=".csv"
      onChange={handleFileChange}
      disabled={uploading}
      className="flex-1 min-w-[160px] sm:min-w-0 sm:basis-1/2"
    />

    <Button
      type="button"
      variant="outline"
      onClick={downloadTemplate}
      className="flex-shrink sm:flex-1 sm:basis-1/4 whitespace-nowrap"
    >
      <Download className="mr-2 h-4 w-4" />
      Descargar plantilla
    </Button>

    <Button
      type="submit"
      disabled={!file || uploading}
      className="flex-shrink sm:flex-1 sm:basis-1/4 whitespace-nowrap"
    >
      <Upload className="mr-2 h-4 w-4" />
      Cargar
    </Button>
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
              <span>{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}
      </form>

       {/* Mini-pop-up de éxito */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Importación Exitosa</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-6">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="text-center">
              Se importaron <strong>{processedCount}</strong> de{" "}
              <strong>{totalCount}</strong> vehículos.
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setSuccessOpen(false)  // cierra mini-pop-up
                onClose()              // cierra diálogo principal
              }}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}