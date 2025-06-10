"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { FileText, Upload } from "lucide-react"

export function OrderUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
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

    const formData = new FormData()
    formData.append("file", file)

    try {
      setUploading(true)
      setProgress(0)

      // Simula progreso visual hasta el 90%
      let currentProgress = 0
      const interval = setInterval(() => {
        currentProgress += 15
        if (currentProgress >= 90) clearInterval(interval)
        setProgress(Math.min(currentProgress, 90))
      }, 200)

      const response = await fetch("http://localhost:8080/api/orders/import-csv", {
        method: "POST",
        body: formData,
      })

      clearInterval(interval)
      setProgress(100)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Error desconocido")
      }

      toast({
        title: "Carga completada",
        description: `Se ha procesado el archivo ${file.name} correctamente`,
      })

      setFile(null)
    } catch (err) {
      toast({
        title: "Error durante la carga",
        description: err instanceof Error ? err.message : "Ocurrió un error",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="file">Archivo de pedidos (CSV)</Label>
        <div className="flex items-center gap-2">
          <Input id="file" type="file" accept=".csv" onChange={handleFileChange} disabled={uploading} />
          <Button type="submit" disabled={!file || uploading}>
            <Upload className="mr-2 h-4 w-4" />
            Cargar
          </Button>
        </div>
        <a
          href="/plantilla-ejemplo.csv"
          download
          className="text-xs text-blue-500 underline mt-1"
        >
          Descargar plantilla CSV
        </a>
      </div>

      {file && (
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4" />
          <span>{file.name}</span>
          <span className="text-muted-foreground">({Math.round(file.size / 1024)} KB)</span>
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
  )
}
