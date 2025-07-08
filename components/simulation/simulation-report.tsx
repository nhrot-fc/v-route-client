"use client";

import { SimulationDTO } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface SimulationReportProps {
  report: SimulationDTO | undefined;
  formatDate: (dateStr?: string) => string;
}

export function SimulationReport({ report, formatDate }: SimulationReportProps) {
  if (!report) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="w-10 h-10 mx-auto text-gray-400" />
        <h3 className="mt-4 text-lg font-medium">No hay reporte disponible</h3>
        <p className="mt-2 text-gray-500">Finaliza una simulación para generar un reporte</p>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Información General</h3>
          <table className="w-full">
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-medium">ID de la simulación</td>
                <td className="py-2">{report.id}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Tipo de simulación</td>
                <td className="py-2">{report.type}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Estado</td>
                <td className="py-2">{report.status}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Fecha de inicio</td>
                <td className="py-2">{formatDate(report.startTime)}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Fecha de finalización</td>
                <td className="py-2">{formatDate(report.endTime)}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Tiempo actual</td>
                <td className="py-2">{formatDate(report.currentTime)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded">
          <p>Nota: La información detallada de estadísticas no está disponible en esta versión de la API.</p>
        </div>
      </div>
    </Card>
  );
} 