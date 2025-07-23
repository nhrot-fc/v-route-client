import type { SimulationStateDTO } from "@/lib/api-client";
import React from "react";
import { WrenchIcon, Calendar, Clock } from "lucide-react";

interface StatsMaintenanceProps {
  simulationState: SimulationStateDTO | null;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  searchQuery?: string;
}

export const StatsMaintenance: React.FC<StatsMaintenanceProps> = ({
  simulationState,
  isCollapsed = false,
  onToggleCollapse,
  searchQuery = "",
}) => {
  if (isCollapsed) {
    return (
      <div
        className="absolute top-40 right-4 bg-white/90 p-2 rounded-lg shadow-md backdrop-blur-sm z-10 border border-gray-100 cursor-pointer"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-2">
          <WrenchIcon className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">Panel de Mantenimientos</span>
        </div>
      </div>
    );
  }

  const scheduledMaintenances = simulationState?.scheduledMaintenances || [];

  // Filtro de búsqueda usando la prop searchQuery
  const texto = searchQuery.toLowerCase();
  const mantenimientosFiltrados = scheduledMaintenances.filter(
    (mantenimiento) =>
      mantenimiento.vehicleId?.toLowerCase().includes(texto) ||
      mantenimiento.id?.toLowerCase().includes(texto) ||
      mantenimiento.assignedDate?.toLowerCase().includes(texto) ||
      mantenimiento.realStart?.toLowerCase().includes(texto) ||
      mantenimiento.realEnd?.toLowerCase().includes(texto)
  );

  // Formato de fecha y hora
  const formatDateTime = (dateTimeStr?: string) => {
    if (!dateTimeStr) return "N/A";
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };

  // Ordenar mantenimientos: activos primero, luego por fecha asignada
  const sortedMaintenance = [...mantenimientosFiltrados].sort((a, b) => {
    // Primero por estado (activo/inactivo)
    if (a.active && !b.active) return -1;
    if (!a.active && b.active) return 1;
    
    // Luego por fecha asignada (más reciente primero)
    if (a.assignedDate && b.assignedDate) {
      return new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime();
    }
    return 0;
  });

  if (sortedMaintenance.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-3">
          <WrenchIcon className="w-6 h-6 text-blue-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-1">No hay mantenimientos activos</h3>
        <p className="text-gray-500 text-sm">
          Cuando se programen mantenimientos, aparecerán en esta sección
        </p>
      </div>
    );
  }

  return (
    <div className="px-2">
      <div className="grid gap-3 py-3">
        {sortedMaintenance.map((mantenimiento, idx) => (
          <div 
            key={mantenimiento.id || idx} 
            className={`rounded-lg border p-3 ${
              mantenimiento.active 
                ? "bg-blue-50 border-blue-200" 
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <WrenchIcon className={`w-4 h-4 ${mantenimiento.active ? "text-blue-600" : "text-gray-500"}`} />
                <span className="font-medium">{mantenimiento.vehicleId}</span>
                <span className="text-xs text-gray-500">ID: {mantenimiento.id}</span>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  mantenimiento.active
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {mantenimiento.active ? "En curso" : "Programado"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm mt-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-500">Asignado:</span>
                <span className="text-xs">{formatDateTime(mantenimiento.assignedDate)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-500">Duración:</span>
                <span className="text-xs">{mantenimiento.durationHours} horas</span>
              </div>
            </div>

            <div className="border-t mt-2 pt-2 grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-gray-500 mb-1">Inicio real</div>
                <div className={`text-sm ${mantenimiento.realStart ? "font-medium" : "text-gray-400 italic"}`}>
                  {mantenimiento.realStart ? formatDateTime(mantenimiento.realStart) : "Pendiente"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Fin real</div>
                <div className={`text-sm ${mantenimiento.realEnd ? "font-medium" : "text-gray-400 italic"}`}>
                  {mantenimiento.realEnd ? formatDateTime(mantenimiento.realEnd) : "Pendiente"}
                </div>
              </div>
            </div>

            {mantenimiento.active && (
              <div className="mt-2 pt-2 border-t">
                <div className="text-xs text-gray-500 mb-1">Progreso</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  {/* Simular progreso basado en tiempo de inicio y duración */}
                  <div
                    className="h-1.5 rounded-full bg-blue-500"
                    style={{ 
                      width: mantenimiento.realStart && mantenimiento.durationHours
                        ? calculateProgress(mantenimiento.realStart, mantenimiento.durationHours) + "%"
                        : "0%" 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Función para calcular el progreso del mantenimiento
function calculateProgress(startTimeStr: string, durationHours: number): number {
  const startTime = new Date(startTimeStr).getTime();
  const currentTime = new Date().getTime();
  const totalDuration = durationHours * 60 * 60 * 1000; // en milisegundos
  
  const elapsed = currentTime - startTime;
  let progress = (elapsed / totalDuration) * 100;
  
  // Limitar entre 0 y 100
  progress = Math.min(100, Math.max(0, progress));
  
  return Math.round(progress);
} 