import type { SimulationStateDTO } from "@/lib/api-client";
import React from "react";

interface StatsIncidentsProps {
  simulationState: SimulationStateDTO | null;
  simulationId?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const StatsIncidents: React.FC<StatsIncidentsProps> = ({
  simulationId,
  simulationState,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  if (isCollapsed) {
    return (
      <div
        className="absolute top-40 right-4 bg-white/90 p-2 rounded-lg shadow-md backdrop-blur-sm z-10 border border-gray-100 cursor-pointer"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Panel de Incidentes</span>
        </div>
      </div>
    );
  }

  // Hardcodeo de incidentes de ejemplo
  const incidentesEjemplo = [
    {
      id: "1",
      vehicleId: "V-001",
      type: "Avería",
      shift: "T1",
      occurrenceTime: "2024-06-01T10:00:00Z",
      resolved: false,
      immobilizationEndTime: "2024-06-01T12:00:00Z",
      availabilityTime: "2024-06-01T13:00:00Z",
      returnToDepotRequired: true,
    },
    {
      id: "2",
      vehicleId: "V-002",
      type: "Accidente",
      shift: "T2",
      occurrenceTime: "2024-06-01T11:00:00Z",
      resolved: true,
      immobilizationEndTime: "2024-06-01T12:30:00Z",
      availabilityTime: "2024-06-01T13:30:00Z",
      returnToDepotRequired: false,
    },
  ];

  return (
    <div className="absolute top-40 right-4 bg-white/95 rounded-lg shadow-lg border border-gray-200 z-20 w-[24rem] max-h-[400px] flex flex-col">
      <div className="flex justify-between items-center p-3 border-b">
        <h3 className="font-bold text-red-800">Panel de Incidentes</h3>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="text-gray-500 hover:text-gray-700"
          >
            X
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <span className="text-lg font-bold text-red-600 mb-2 block">Incidentes activos</span>
        {true ? (
          <ol className="list-decimal ml-5 space-y-2">
            {incidentesEjemplo.map((incidente, idx) => {
              // Preparo los campos a mostrar
              const campos = [
                `Vehículo: ${incidente.vehicleId}`,
                `Tipo: ${incidente.type}`,
                `Turno: ${incidente.shift}`,
                // Si quieres más campos, agrégalos aquí
              ];
              // Si hay menos de 3 campos, relleno con ""
              while (campos.length < 3) campos.push("");
              return (
                <li key={incidente.id || idx} className="bg-red-50 p-2 rounded mb-4">
                  <div className="grid grid-cols-3 gap-2">
                    {campos.map((campo, i) => (
                      <div key={i}>{campo}</div>
                    ))}
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <span className="text-gray-500">No hay incidentes activos.</span>
        )}
      </div>
    </div>
  );
};
