"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MaintenanceUploadForm } from "@/components/maintenance/maintenance-upload-form"
import { MaintenanceForm } from "@/components/maintenance/maintenance-form"
import { MaintenanceTable } from "@/components/maintenance/maintenance-table"
import { PageContainer } from "@/components/ui/page-container"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Wrench, FileUp, Plus, ClipboardList } from "lucide-react"

export default function MantenimientosPage() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <PageContainer>
      <PageHeader 
        title="Gestión de Mantenimientos" 
        description="Administre los mantenimientos programados y repare los vehículos para mantener la flota operativa"
      />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Wrench className="h-5 w-5 text-blue-600" />
            <CardTitle>Mantenimientos de Flota</CardTitle>
          </div>
          <CardDescription>
            Gestione el ciclo de vida del mantenimiento preventivo y correctivo de los vehículos
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="list" className="flex items-center">
                <ClipboardList className="h-4 w-4 mr-2" />
                <span>Listado</span>
              </TabsTrigger>
              
              <TabsTrigger value="create" className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                <span>Crear Mantenimiento</span>
              </TabsTrigger>
              
              <TabsTrigger value="upload" className="flex items-center">
                <FileUp className="h-4 w-4 mr-2" />
                <span>Cargar Archivo</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4 animate-fade-in">
              <div className="rounded-md border">
                <MaintenanceTable />
              </div>
            </TabsContent>
            
            <TabsContent value="create" className="animate-fade-in">
              <div className="max-w-2xl mx-auto">
                <MaintenanceForm />
              </div>
            </TabsContent>
            
            <TabsContent value="upload" className="animate-fade-in">
              <div className="max-w-2xl mx-auto">
                <MaintenanceUploadForm />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageContainer>
  )
} 