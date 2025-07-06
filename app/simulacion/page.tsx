"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, Construction, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SimulacionPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Simulación
        </h2>
      </div>

      <Card className="border-dashed border-2">
        <CardHeader className="text-center">
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

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4 border-none bg-muted/50">
              <div className="flex items-start space-x-4">
                <Clock className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-medium">Funcionalidades Esperadas</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualización de rutas, monitoreo en tiempo real, y análisis predictivo
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4 border-none bg-muted/50">
              <div className="flex items-start space-x-4">
                <Settings className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-medium">Configuraciones Avanzadas</h3>
                  <p className="text-sm text-muted-foreground">
                    Creación de escenarios personalizados y comparación de resultados
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex justify-center pt-4">
            <Button variant="outline">Volver al Inicio</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
