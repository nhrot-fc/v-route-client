import type { SimulationStateDTO } from "@/lib/api-client";
import React from "react";

interface StatsIncidentsProps {
  simulationState: SimulationStateDTO | null;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  searchQuery?: string;
}

export const StatsIncidents: React.FC<StatsIncidentsProps> = ({
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
  const currentIncidents = simulationState?.activeIncidents || [];

  // Filtro de búsqueda usando la prop searchQuery
  const texto = searchQuery.toLowerCase();
  const incidentesFiltrados = currentIncidents.filter(
    (incidente) =>
      incidente.vehicleId?.toLowerCase().includes(texto) ||
      incidente.type?.toLowerCase().includes(texto) ||
      incidente.shift?.toLowerCase().includes(texto) ||
      incidente.occurrenceTime?.toLowerCase().includes(texto) ||
      incidente.immobilizationEndTime?.toLowerCase().includes(texto) ||
      incidente.availabilityTime?.toLowerCase().includes(texto)
  );

  return (
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
            <td className="py-2 px-3">
              {incidente.occurrenceTime || "N/A"}
            </td>
            <td className="py-2 px-3">
              {incidente.immobilizationEndTime || "N/A"}
            </td>
            <td className="py-2 px-3">
              {incidente.availabilityTime || "N/A"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
