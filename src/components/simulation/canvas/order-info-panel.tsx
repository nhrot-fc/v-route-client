import React from "react";
import type { OrderDTO } from "@/lib/api-client";

interface OrderInfoPanelProps {
  order: OrderDTO & { isOverdue?: boolean } | null;
  onClose: () => void;
}

/**
 * Component to display detailed order information in a side panel
 */
export const OrderInfoPanel: React.FC<OrderInfoPanelProps> = ({ 
  order, 
  onClose 
}) => {
  if (!order) return null;
  
  // Get status color and text
  const getStatusInfo = () => {
    if (order.delivered) {
      return {
        text: "Entregado",
        color: "#16a34a" // green
      };
    }
    
    if (order.isOverdue) {
      return {
        text: "Vencido",
        color: "#dc2626" // red
      };
    }
    
    return {
      text: "Pendiente",
      color: "#1d4ed8" // blue
    };
  };
  
  const statusInfo = getStatusInfo();
  
  // Get volume color
  const getVolumeColor = (volume: number) => {
    if (volume <= 3) return "#10b981"; // green - small
    if (volume <= 10) return "#eab308"; // yellow - medium
    return "#f97316"; // orange - large
  };
  
  const volumeColor = getVolumeColor(order.glpRequestM3 || 0);
  
  return (
    <div className="absolute top-4 right-4 w-64 bg-white/95 rounded-lg shadow-lg border border-gray-200 p-4 z-20">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-blue-800">Detalles del Pedido</h3>
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
          <div className="font-medium">{order.id || "N/A"}</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Estado</div>
          <div className="font-medium" style={{ color: statusInfo.color }}>
            {statusInfo.text}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Volumen GLP</div>
          <div className="font-medium flex items-center gap-2">
            <span style={{ color: volumeColor }}>
              {order.glpRequestM3?.toFixed(1) || 0} m³
            </span>
            <span className="text-xs text-gray-500">
              ({order.glpRequestM3 && order.glpRequestM3 <= 3 
                ? "Pequeño" 
                : order.glpRequestM3 && order.glpRequestM3 <= 10 
                  ? "Mediano" 
                  : "Grande"})
            </span>
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Llegada</div>
          <div className="font-medium">
            {order.arrivalTime 
              ? new Date(order.arrivalTime).toLocaleString() 
              : "N/A"}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Plazo de entrega</div>
          <div className="font-medium" style={{ 
            color: order.isOverdue ? "#dc2626" : "inherit" 
          }}>
            {order.deadlineTime 
              ? new Date(order.deadlineTime).toLocaleString() 
              : "N/A"}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Posición</div>
          <div className="text-xs">
            X: {order.position?.x?.toFixed(2) || "N/A"}, 
            Y: {order.position?.y?.toFixed(2) || "N/A"}
          </div>
        </div>
        
        <div className="pt-2 flex gap-2">
          <button
            className="flex-1 py-1 px-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            onClick={() => {
              // This would be implemented to show the order's details in a real app
              console.log("Ver detalles completos");
            }}
          >
            Ver detalles
          </button>
          <button
            className="flex-1 py-1 px-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            onClick={() => {
              // This would be implemented to show the assigned vehicle
              console.log("Ver vehículo asignado");
            }}
          >
            Ver vehículo
          </button>
        </div>
      </div>
    </div>
  );
}; 