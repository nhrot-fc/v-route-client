import React from "react";
import { DepotDTOTypeEnum, type DepotDTO } from "@/lib/api-client";

interface DepotInfoPanelProps {
  depot: DepotDTO | null;
  isMainDepot?: boolean;
  depotIndex?: number | undefined;
  onClose: () => void;
}

/**
 * Component to display detailed depot information in a side panel
 */
export const DepotInfoPanel: React.FC<DepotInfoPanelProps> = ({ 
  depot, 
  isMainDepot = false, 
  depotIndex,
  onClose 
}) => {
  if (!depot) return null;
  
  // Mock capacity and stock values (these would come from the API in a real implementation)
  const capacity = depot.glpCapacityM3 ?? 0;
  const currentStock = (depot.type === DepotDTOTypeEnum.Main ? depot.glpCapacityM3 : depot.currentGlpM3) ?? 0;
  const stockPercentage = (currentStock / capacity) * 100;
  
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
    <div className="absolute top-4 right-4 w-64 bg-white/95 rounded-lg shadow-lg border border-gray-200 p-4 z-20">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-blue-800">
          {isMainDepot ? "Depósito Principal" : `Depósito Auxiliar ${depotIndex || ""}`}
        </h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="text-sm text-gray-500">ID</div>
          <div className="font-medium">{depot.id || "N/A"}</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Tipo</div>
          <div className="font-medium">{isMainDepot ? "Principal" : "Auxiliar"}</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Nivel de GLP</div>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
              <div 
                className="h-2.5 rounded-full" 
                style={{
                  width: `${stockPercentage}%`,
                  backgroundColor: stockColor
                }}
              ></div>
            </div>
            <span className="text-sm font-medium" style={{ color: stockColor }}>
              {Math.round(stockPercentage)}%
            </span>
          </div>
          <div className="text-xs mt-1">
            {currentStock.toFixed(1)}/{capacity.toFixed(1)} m³
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Posición</div>
          <div className="text-xs">
            X: {depot.position?.x?.toFixed(2) || "N/A"}, 
            Y: {depot.position?.y?.toFixed(2) || "N/A"}
          </div>
        </div>
        
        <div className="pt-2 flex gap-2">
          <button
            className="flex-1 py-1 px-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            onClick={() => {
              // This would be implemented to show the depot's inventory in a real app
              console.log("Ver inventario");
            }}
          >
            Inventario
          </button>
          <button
            className="flex-1 py-1 px-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            onClick={() => {
              // This would be implemented to show vehicles assigned to this depot
              console.log("Ver vehículos");
            }}
          >
            Vehículos
          </button>
        </div>
      </div>
    </div>
  );
}; 