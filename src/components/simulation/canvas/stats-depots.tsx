import React from "react";
import type { SimulationStateDTO, DepotDTO } from "@/lib/api-client";

interface StatsDepotsProps {
  simulationState: SimulationStateDTO;
  searchQuery: string;
  selectedDepot: {
    depot: DepotDTO;
    isMainDepot: boolean;
    index?: number;
  } | null;
  onDepotSelect?: (
    depot: DepotDTO | null,
    isMainDepot: boolean,
    index?: number
  ) => void;
}

/**
 * Componente para mostrar información sobre los almacenes (depósitos)
 */
export const StatsDepots: React.FC<StatsDepotsProps> = ({
  simulationState,
  searchQuery,
  selectedDepot,
  onDepotSelect,
}) => {
  // Get all depots
  const depots = [
    ...(simulationState.mainDepot
      ? [{ depot: simulationState.mainDepot, isMain: true, index: 0 }]
      : []),
    ...(simulationState.auxDepots
      ? simulationState.auxDepots.map((depot, index) => ({
          depot,
          isMain: false,
          index: index + 1,
        }))
      : []),
  ];

  // Filter based on search query
  const filteredDepots = searchQuery
    ? depots.filter(
        (depot) =>
          depot.depot.id
            ?.toString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (depot.isMain ? "principal" : "auxiliar").includes(
            searchQuery.toLowerCase()
          ) ||
          (
            depot.depot.position?.x?.toString() +
            "," +
            depot.depot.position?.y?.toString()
          ).includes(searchQuery)
      )
    : depots;

  return (
    <div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-2 px-3 text-left">ID</th>
            <th className="py-2 px-3 text-left">Tipo</th>
            <th className="py-2 px-3 text-left">Nivel GLP</th>
            <th className="py-2 px-3 text-left">Ubicación</th>
          </tr>
        </thead>
        <tbody>
          {filteredDepots.map((depot) => {
            // Calculate capacity and stock values
            const capacity = depot.depot.glpCapacityM3 ?? 0;
            let currentStock = depot.depot.currentGlpM3 ?? 0;
            if (depot.depot.id === "MAIN") {
              currentStock = capacity;
            }
            const stockPercentage =
              capacity > 0 ? (currentStock / capacity) * 100 : 0;

            // Get color based on stock level
            const getStockColor = (percentage: number) => {
              if (percentage <= 20) return "#ef4444"; // red
              if (percentage <= 40) return "#f97316"; // orange
              if (percentage <= 60) return "#eab308"; // yellow
              if (percentage <= 80) return "#10b981"; // green
              return "#3b82f6"; // blue
            };

            const stockColor = getStockColor(stockPercentage);

            return (
              <tr
                key={`${depot.isMain ? "main" : "aux"}-${depot.depot.id}`}
                className={`border-t hover:bg-blue-50 cursor-pointer ${
                  selectedDepot?.depot.id === depot.depot.id ? "bg-blue-50" : ""
                }`}
                onClick={() =>
                  onDepotSelect &&
                  onDepotSelect(
                    depot.depot,
                    depot.isMain,
                    depot.isMain ? undefined : depot.index
                  )
                }
              >
                <td className="py-2 px-3">{depot.depot.id}</td>
                <td className="py-2 px-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs text-white ${
                      depot.isMain ? "bg-blue-700" : "bg-blue-500"
                    }`}
                  >
                    {depot.isMain ? "Principal" : `Auxiliar ${depot.index}`}
                  </span>
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${stockPercentage}%`,
                          backgroundColor: stockColor,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs" style={{ color: stockColor }}>
                      {Math.round(stockPercentage)}%
                    </span>
                  </div>
                </td>
                <td className="py-2 px-3">
                  ({depot.depot.position?.x?.toFixed(0) || 0},{" "}
                  {depot.depot.position?.y?.toFixed(0) || 0})
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}; 