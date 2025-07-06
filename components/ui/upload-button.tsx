"use client"

import * as React from "react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Upload, Check, AlertCircle } from "lucide-react"

export interface UploadButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  accept?: string
  multiple?: boolean
  onFilesSelected?: (files: FileList | null) => void
  isLoading?: boolean
  isSuccess?: boolean
  isError?: boolean
  errorMessage?: string
  successMessage?: string
}

export const UploadButton = React.forwardRef<HTMLButtonElement, UploadButtonProps>(
  ({ 
    className, 
    variant = "outline", 
    size = "default", 
    children, 
    accept, 
    multiple = false, 
    onFilesSelected,
    isLoading = false,
    isSuccess = false,
    isError = false,
    errorMessage,
    successMessage,
    ...props 
  }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [fileName, setFileName] = useState<string>("")
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      fileInputRef.current?.click()
    }
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      
      if (files && files.length > 0) {
        setFileName(multiple ? `${files.length} archivos seleccionados` : files[0].name)
        if (onFilesSelected) {
          onFilesSelected(files)
        }
      }
    }
    
    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            className={cn(className)}
            variant={variant}
            size={size}
            onClick={handleClick}
            disabled={isLoading}
            ref={ref}
            {...props}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Cargando...</span>
              </div>
            ) : (
              <>
                {isSuccess ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {children}
              </>
            )}
          </Button>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
          />
        </div>
        
        {fileName && (
          <div className="text-sm text-muted-foreground truncate max-w-full">
            {fileName}
          </div>
        )}
        
        {isSuccess && successMessage && (
          <div className="flex items-center gap-1 text-sm text-green-600">
            <Check className="h-4 w-4" />
            <span>{successMessage}</span>
          </div>
        )}
        
        {isError && (
          <div className="flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMessage || "Error al cargar el archivo"}</span>
          </div>
        )}
      </div>
    )
  }
)

UploadButton.displayName = "UploadButton" 