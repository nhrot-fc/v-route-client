"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { FileText, Upload, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useMaintenance } from "@/hooks/use-maintenance"
import { MaintenanceDTO } from "@/lib/api-client"
import { useVehicles } from "@/hooks/use-vehicles"

export function MaintenanceUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()
  const { createMaintenance } = useMaintenance()
  const { vehicles, loading: vehiclesLoading } = useVehicles()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setUploadStatus("idle")
      setErrorMessage("")
    }
  }

  const parseCSV = async (csvText: string): Promise<MaintenanceDTO[]> => {
    const lines = csvText.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const result: MaintenanceDTO[] = []

    // Check required headers
    const requiredHeaders = ['vehicle_id', 'assigned_date']
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header))
    if (missingHeaders.length > 0) {
      throw new Error(`Columnas faltantes: ${missingHeaders.join(', ')}`)
    }

    // Validate vehicle IDs exist
    const vehicleIds = new Set(vehicles.map(v => v.id))

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      if (values.length !== headers.length) continue

      const row: Record<string, string> = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })

      // Validate vehicle exists
      if (!row.vehicle_id || !vehicleIds.has(row.vehicle_id)) {
        throw new Error(`El vehículo con ID ${row.vehicle_id} no existe en la línea ${i + 1}`)
      }

      // Validate assigned date
      if (!row.assigned_date || isNaN(Date.parse(row.assigned_date))) {
        throw new Error(`Fecha de asignación inválida en línea ${i + 1}`)
      }

      // Optional fields validation
      if (row.real_start && isNaN(Date.parse(row.real_start))) {
        throw new Error(`Fecha de inicio real inválida en línea ${i + 1}`)
      }
      
      if (row.real_end && isNaN(Date.parse(row.real_end))) {
        throw new Error(`Fecha de fin real inválida en línea ${i + 1}`)
      }
      
      if (row.real_start && row.real_end && new Date(row.real_start) >= new Date(row.real_end)) {
        throw new Error(`La fecha de fin debe ser posterior a la fecha de inicio en línea ${i + 1}`)
      }

      result.push({
        vehicleId: row.vehicle_id,
        assignedDate: new Date(row.assigned_date).toISOString(),
        realStart: row.real_start ? new Date(row.real_start).toISOString() : undefined,
        realEnd: row.real_end ? new Date(row.real_end).toISOString() : undefined,
        active: row.active ? row.active.toLowerCase() === 'true' : undefined,
        durationHours: row.duration_hours ? Number(row.duration_hours) : undefined
      })
    }

    return result
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

    setIsUploading(true)
    setUploadStatus("idle")
    setProgress(0)

    try {
      const fileContent = await file.text()
      const maintenances = await parseCSV(fileContent)
      
      // Create maintenances through API
      let processed = 0
      for (const maintenance of maintenances) {
        // We only need vehicleId and assignedDate for creating maintenance
        await createMaintenance({
          vehicleId: maintenance.vehicleId,
          assignedDate: maintenance.assignedDate
        })
        processed++
        setProgress(Math.round((processed / maintenances.length) * 100))
      }

      setUploadStatus("success")
      setFile(null)

      toast({
        title: "Carga completada",
        description: `Se han procesado ${maintenances.length} mantenimientos correctamente`,
      })

      // Reset file input
      const fileInput = document.getElementById('maintenance-file') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error) {
      setUploadStatus("error")
      const errorMsg = error instanceof Error ? error.message : "Error al procesar el archivo"
      setErrorMessage(errorMsg)
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Cargar Mantenimientos</CardTitle>
        <CardDescription>
          Sube un archivo CSV con los mantenimientos programados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="maintenance-file">Archivo de mantenimientos (CSV)</Label>
            <Input
              id="maintenance-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground">
              El archivo debe contener las columnas: vehicle_id, assigned_date
            </p>
          </div>
          
          {file && (
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              <span>{file.name}</span>
              <span className="text-muted-foreground">({Math.round(file.size / 1024)} KB)</span>
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
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Éxito</AlertTitle>
              <AlertDescription>
                Los mantenimientos se han cargado correctamente
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>Procesando...</>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Cargar archivo
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}