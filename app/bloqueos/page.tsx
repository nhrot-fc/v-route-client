"use client";

import { BlockageUploadForm } from "@/components/blockages/blockage-upload-form"
import { BlockageForm } from "@/components/blockages/blockage-form"
import { BlockagesTable } from "@/components/blockages/blockages-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageContainer } from "@/components/ui/page-container"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertTriangle, FileUp, Plus, List } from "lucide-react"
import { useState } from "react"

export default function BlockagesPage() {
  const [activeTab, setActiveTab] = useState("list")

  return (
    <PageContainer>
      <PageHeader 
        title="Gestión de Bloqueos" 
        description="Administre los bloqueos programados en las calles y configure restricciones de rutas"
      />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            <CardTitle>Control de Bloqueos</CardTitle>
          </div>
          <CardDescription>
            Visualice, cree y gestione los bloqueos de vías que afectan la distribución
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
                <List className="h-4 w-4 mr-2" />
                <span>Lista de Bloqueos</span>
              </TabsTrigger>
              
              <TabsTrigger value="create" className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                <span>Crear Bloqueo</span>
              </TabsTrigger>
              
              <TabsTrigger value="upload" className="flex items-center">
                <FileUp className="h-4 w-4 mr-2" />
                <span>Cargar Archivo</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="space-y-4 animate-fade-in">
              <div className="rounded-md border">
                <BlockagesTable />
              </div>
            </TabsContent>
            
            <TabsContent value="create" className="animate-fade-in">
              <div className="max-w-2xl mx-auto">
                <BlockageForm />
              </div>
            </TabsContent>
            
            <TabsContent value="upload" className="animate-fade-in">
              <div className="max-w-2xl mx-auto">
                <BlockageUploadForm />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageContainer>
  )
} 