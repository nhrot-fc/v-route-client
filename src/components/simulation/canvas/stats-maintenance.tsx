import type { SimulationStateDTO } from "@/lib/api-client";
import React from "react";
import { WrenchIcon, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StatsMaintenanceProps {
  simulationState: SimulationStateDTO | null;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  searchQuery?: string;
}

// Define una interfaz para los mantenimientos programados a futuro
interface FutureMaintenance {
  vehicleId: string;
  scheduledDate: string;
}

// Función para obtener propiedades visuales según el estado del mantenimiento
const getMaintenanceStatusProps = (isActive: boolean) => {
  if (isActive) {
    return {
      label: "En curso",
      className: "bg-blue-100 text-blue-800 border-blue-200",
      icon: <WrenchIcon className="w-3 h-3 mr-1" />
    };
  } else {
    return {
      label: "Programado",
      className: "bg-slate-100 text-slate-800 border-slate-200",
      icon: <Calendar className="w-3 h-3 mr-1" />
    };
  }
};

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

  // Obtener mantenimientos activos/programados
  const scheduledMaintenances = simulationState?.scheduledMaintenances || [];

  // Obtener programación futura de maintenanceSchedule
  const maintenanceSchedule = simulationState?.maintenanceSchedule || {};
  const futureMaintenances: FutureMaintenance[] = Object.entries(maintenanceSchedule)
    .map(([vehicleId, date]) => ({
      vehicleId,
      scheduledDate: date
    }))
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  // Filtro de búsqueda para mantenimientos actuales
  const texto = searchQuery.toLowerCase();
  const mantenimientosFiltrados = scheduledMaintenances.filter(
    (mantenimiento) =>
      mantenimiento.vehicleId?.toLowerCase().includes(texto) ||
      mantenimiento.id?.toLowerCase().includes(texto) ||
      mantenimiento.assignedDate?.toLowerCase().includes(texto) ||
      mantenimiento.realStart?.toLowerCase().includes(texto) ||
      mantenimiento.realEnd?.toLowerCase().includes(texto)
  );

  // Filtro de búsqueda para mantenimientos futuros
  const futureMaintenancesFiltrados = futureMaintenances.filter(
    (mantenimiento) =>
      mantenimiento.vehicleId.toLowerCase().includes(texto) ||
      mantenimiento.scheduledDate.toLowerCase().includes(texto)
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

  if (sortedMaintenance.length === 0 && futureMaintenancesFiltrados.length === 0) {
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
    <div className="px-2 pb-3">
      {sortedMaintenance.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-gray-700 mb-2 mt-3 px-1">
            Mantenimientos actuales
          </h3>
          <div className="grid gap-3 mb-4">
            {sortedMaintenance.map((mantenimiento, idx) => {
              // Obtener propiedades visuales según el estado
              const statusProps = getMaintenanceStatusProps(mantenimiento.active || false);
              
              return (
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
                    <Badge 
                      variant="outline"
                      className={statusProps.className}
                    >
                      <div className="flex items-center">
                        {statusProps.icon}
                        {statusProps.label}
                      </div>
                    </Badge>
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
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Progreso</span>
                        <span className="font-medium text-blue-700">
                          {mantenimiento.realStart && mantenimiento.durationHours
                            ? calculateProgress(mantenimiento.realStart, mantenimiento.durationHours) + "%"
                            : "0%"}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
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
              );
            })}
          </div>
        </>
      )}

      {/* Sección de mantenimientos programados a futuro */}
      {futureMaintenancesFiltrados.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-gray-700 mb-2 px-1">
            Mantenimientos futuros planificados
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600">Vehículo</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600">Fecha Programada</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {futureMaintenancesFiltrados.map((mantenimiento, idx) => (
                  <tr key={`future-${idx}`} className="hover:bg-blue-50">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <WrenchIcon className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-medium">{mantenimiento.vehicleId}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>{formatDateTime(mantenimiento.scheduledDate)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <Badge 
                        variant="outline"
                        className="bg-gray-100 text-gray-800 border-gray-200"
                      >
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendiente
                        </div>
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
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