"use client";

import React from "react";
import { PageLayout } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, Construction, Settings, MapPin, BarChart, Route } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SimulacionPage() {
  return (
    <PageLayout
      title="Simulación de Rutas"
      description="Visualice y evalúe diferentes escenarios de distribución con el simulador en tiempo real"
      actions={[
        { 
          icon: <BarChart className="h-4 w-4" />, 
          label: "Ver Reportes", 
          variant: "outline" 
        }
      ]}
    >
      <Card className="border-dashed border-2 bg-white">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <Construction className="h-16 w-16 text-amber-500" />
          </div>
          <CardTitle className="text-2xl">Módulo en Desarrollo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-muted-foreground">
            <p className="mb-4">
              El módulo de simulación se encuentra actualmente en desarrollo. Estamos trabajando para implementar nuevas funcionalidades
              y mejorar la experiencia de usuario.
            </p>
            <p className="flex items-center justify-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <span>Próximamente disponible</span>
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4 border-none bg-muted/50">
              <div className="flex items-start space-x-4">
                <Route className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-medium">Visualización de Rutas</h3>
                  <p className="text-sm text-muted-foreground">
                    Seguimiento en tiempo real de vehículos y análisis de rutas óptimas
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border-none bg-muted/50">
              <div className="flex items-start space-x-4">
                <Clock className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-medium">Optimización de Tiempos</h3>
                  <p className="text-sm text-muted-foreground">
                    Reducción de tiempos de entrega mediante rutas más eficientes
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border-none bg-muted/50">
              <div className="flex items-start space-x-4">
                <MapPin className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-medium">Mapeo Inteligente</h3>
                  <p className="text-sm text-muted-foreground">
                    Integraciones con mapas en tiempo real y condiciones de tráfico
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex justify-center pt-4">
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Ir al Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
