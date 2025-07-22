import type { SimulationStateDTO } from "@/lib/api-client";
import React from "react";

interface StatsIncidentsProps {
  simulationState: SimulationStateDTO | null;
  simulationId: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  searchQuery?: string;
}

export const StatsIncidents: React.FC<StatsIncidentsProps> = ({
  simulationId,
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
      occurrenceTime: "2024-06-01T10:15:00",
      resolved: false,
      immobilizationEndTime: "2024-06-01T12:30:00",
      availabilityTime: "2024-06-01T13:00:00",
      returnToDepotRequired: true,
    },
    {
      id: "2",
      vehicleId: "V-002",
      type: "Accidente",
      shift: "T2",
      occurrenceTime: "2024-06-01T11:45:00",
      resolved: true,
      immobilizationEndTime: "2024-06-01T13:10:00",
      availabilityTime: "2024-06-01T13:40:00",
      returnToDepotRequired: false,
    },
  ];

  // Filtro de búsqueda usando la prop searchQuery
  const texto = searchQuery.toLowerCase();
  const incidentesFiltrados = incidentesEjemplo.filter((incidente) => (
    incidente.vehicleId.toLowerCase().includes(texto) ||
    incidente.type.toLowerCase().includes(texto) ||
    incidente.shift.toLowerCase().includes(texto) ||
    incidente.occurrenceTime.toLowerCase().includes(texto) ||
    incidente.immobilizationEndTime.toLowerCase().includes(texto) ||
    incidente.availabilityTime.toLowerCase().includes(texto)
  ));

  return (
    <div className="p-4">
      <span className="text-lg font-bold text-red-600 mb-2 block">Incidentes activos</span>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-2 px-3 text-left">Vehículo</th>
            <th className="py-2 px-3 text-left">Tipo</th>
            <th className="py-2 px-3 text-left">Turno</th>
            <th className="py-2 px-3 text-left">Ocurrencia</th>
            <th className="py-2 px-3 text-left">Resolución</th>
            <th className="py-2 px-3 text-left">Disponibilidad</th>
          </tr>
        </thead>
        <tbody>
          {incidentesFiltrados.map((incidente, idx) => (
            <tr key={incidente.id || idx} className="border-t hover:bg-red-50">
              <td className="py-2 px-3">{incidente.vehicleId}</td>
              <td className="py-2 px-3">{incidente.type}</td>
              <td className="py-2 px-3">{incidente.shift}</td>
              <td className="py-2 px-3">{new Date(incidente.occurrenceTime).toLocaleDateString()} {new Date(incidente.occurrenceTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
              <td className="py-2 px-3">{new Date(incidente.immobilizationEndTime).toLocaleDateString()} {new Date(incidente.immobilizationEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
              <td className="py-2 px-3">{new Date(incidente.availabilityTime).toLocaleDateString()} {new Date(incidente.availabilityTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
