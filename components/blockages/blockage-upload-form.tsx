"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Upload, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useBlockages } from "@/hooks/use-blockages"
import { Blockage } from "@/lib/api-client"

export function BlockageUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const { createBlockage } = useBlockages()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      
      // Validate file name format (aaaamm.bloqueadas)
      const fileNameRegex = /^\d{6}\.bloqueadas$/
      if (!fileNameRegex.test(selectedFile.name)) {
        setErrorMessage("El nombre del archivo debe tener el formato aaaamm.bloqueadas (ejemplo: 202501.bloqueadas)")
        setUploadStatus("error")
        setFile(null)
        return
      }
      
      setFile(selectedFile)
      setUploadStatus("idle")
      setErrorMessage("")
    }
  }

  // Helper function to parse date string in format ##d##h##m to ISO date
  const parseDateString = (dateStr: string, baseDate: Date = new Date()): string => {
    const match = dateStr.match(/^(\d{2})d(\d{2})h(\d{2})m$/)
    if (!match) return new Date().toISOString()
    
    const [_unused, days, hours, minutes] = match
    
    const result = new Date(baseDate)
    result.setDate(result.getDate() + parseInt(days))
    result.setHours(parseInt(hours))
    result.setMinutes(parseInt(minutes))
    result.setSeconds(0)
    
    return result.toISOString()
  }

  // Parse blockage line to create blockage objects
  const parseBlockageLine = (line: string): Blockage => {
    // Format: ##d##h##m-##d##h##m:x1,y1,x2,y2
    const [timeRange, coordinates] = line.split(':')
    const [startTimeStr, endTimeStr] = timeRange.split('-')
    
    const coords = coordinates.split(',').map(Number)
    const linePoints = `${coords[0]},${coords[1]}-${coords[2]},${coords[3]}`
    
    // Parse the file name to get year and month for the base date
    // The file name format is aaaamm.bloqueadas (e.g., 202501.bloqueadas)
    const fileName = file?.name || ''
    const yearMonth = fileName.match(/^(\d{4})(\d{2})/)
    
    let baseDate = new Date()
    if (yearMonth) {
      const [_unused, year, month] = yearMonth
      baseDate = new Date(parseInt(year), parseInt(month) - 1, 1) // Month is 0-indexed
    }
    
    const startTime = parseDateString(startTimeStr, baseDate)
    const endTime = parseDateString(endTimeStr, baseDate)
    
    return {
      linePoints,
      startTime,
      endTime
    }
  }

  const handleUpload = async () => {
    if (!file) return
    
    setIsUploading(true)
    setUploadStatus("idle")
    setErrorMessage("")
    
    try {
      // Read file content
      const fileContent = await file.text()
      const lines = fileContent.trim().split('\n')
      
      // Parse each line and create blockages
      for (const line of lines) {
        if (line.trim()) {
          const blockage = parseBlockageLine(line.trim())
          await createBlockage(blockage)
        }
      }
      
      // Reset file input and show success
      setFile(null)
      setUploadStatus("success")
      
      // Reset the file input element
      const fileInput = document.getElementById('blockage-file') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
    } catch (error) {
      console.error("Error uploading blockages:", error)
      setErrorMessage(error instanceof Error ? error.message : "Error al procesar el archivo")
      setUploadStatus("error")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Carga Masiva de Bloqueos</CardTitle>
        <CardDescription>
          Suba un archivo con formato aaaamm.bloqueadas para importar múltiples bloqueos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="blockage-file">Archivo de Bloqueos</Label>
          <Input 
            id="blockage-file" 
            type="file" 
            accept=".bloqueadas"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <p className="text-sm text-muted-foreground mt-1">
            El archivo debe tener el formato aaaamm.bloqueadas y cada línea debe seguir el formato:
            <br />
            <code className="text-xs">##d##h##m-##d##h##m:x1,y1,x2,y2</code>
          </p>
        </div>
        
        {uploadStatus === "success" && (
          <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Éxito</AlertTitle>
            <AlertDescription>
              Bloqueos cargados correctamente
            </AlertDescription>
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
          onClick={handleUpload} 
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
  )
} 