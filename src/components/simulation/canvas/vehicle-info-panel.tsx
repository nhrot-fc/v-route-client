import React from "react";
import type { VehicleDTO } from "@/lib/api-client";
import { formatPercentageValue } from "./utils";

interface VehicleInfoPanelProps {
  vehicle: VehicleDTO | null;
  onClose: () => void;
}

/**
 * Component to display detailed vehicle information in a side panel
 */
export const VehicleInfoPanel: React.FC<VehicleInfoPanelProps> = ({ vehicle, onClose }) => {
  if (!vehicle) return null;
  
  // Format GLP and fuel levels
  const glpFormatted = formatPercentageValue(
    vehicle.currentGlpM3 || 0,
    vehicle.glpCapacityM3 || 1
  );
  
  const fuelFormatted = formatPercentageValue(
    vehicle.currentFuelGal || 0,
    vehicle.fuelCapacityGal || 25
  );
  
  // Get status color
  const getStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "text-green-600";
      case "maintenance":
        return "text-amber-500";
      case "breakdown":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };
  
  return (
    <div className="absolute top-4 right-4 w-64 bg-white/95 rounded-lg shadow-lg border border-gray-200 p-4 z-20">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-blue-800">Detalles del Vehículo</h3>
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
          <div className="font-medium">{vehicle.id || "N/A"}</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Tipo</div>
          <div className="font-medium">{vehicle.type || "N/A"}</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Estado</div>
          <div className={`font-medium ${getStatusColor(vehicle.status)}`}>
            {vehicle.status || "Desconocido"}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">GLP</div>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
              <div 
                className="h-2.5 rounded-full" 
                style={{
                  width: `${(vehicle.currentGlpM3 || 0) / (vehicle.glpCapacityM3 || 1) * 100}%`,
                  backgroundColor: glpFormatted.color
                }}
              ></div>
            </div>
            <span className="text-sm font-medium" style={{ color: glpFormatted.color }}>
              {Math.round((vehicle.currentGlpM3 || 0) / (vehicle.glpCapacityM3 || 1) * 100)}%
            </span>
          </div>
          <div className="text-xs mt-1">
            {vehicle.currentGlpM3?.toFixed(1) || 0}/{vehicle.glpCapacityM3?.toFixed(1) || 0} m³
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Combustible</div>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
              <div 
                className="h-2.5 rounded-full" 
                style={{
                  width: `${(vehicle.currentFuelGal || 0) / (vehicle.fuelCapacityGal || 25) * 100}%`,
                  backgroundColor: fuelFormatted.color
                }}
              ></div>
            </div>
            <span className="text-sm font-medium" style={{ color: fuelFormatted.color }}>
              {Math.round((vehicle.currentFuelGal || 0) / (vehicle.fuelCapacityGal || 25) * 100)}%
            </span>
          </div>
          <div className="text-xs mt-1">
            {vehicle.currentFuelGal?.toFixed(1) || 0}/{vehicle.fuelCapacityGal?.toFixed(1) || 0} gal
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Posición</div>
          <div className="text-xs">
            X: {vehicle.currentPosition?.x?.toFixed(2) || "N/A"}, 
            Y: {vehicle.currentPosition?.y?.toFixed(2) || "N/A"}
          </div>
        </div>
        
        <div className="pt-2">
          <button
            className="w-full py-1 px-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            onClick={() => {
              // This would be implemented to show the vehicle's route in a real app
              console.log("Ver ruta completa");
            }}
          >
            Ver ruta completa
          </button>
        </div>
      </div>
    </div>
  );
}; 