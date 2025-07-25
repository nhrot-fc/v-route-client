import { useState, useEffect, useCallback } from "react";
import { dashboardApi, type VehicleDTO, VehicleStatusEnum } from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";

export interface DashboardMetrics {
  pendingOrders: {
    count: number;
    changePercent: number;
  };
  completedOrders: {
    count: number;
    changePercent: number;
  };
  activeVehicles: {
    active: number;
    total: number;
    inMaintenance: number;
  };
  fuelConsumption: {
    total: number;
    changePercent: number;
  };
}

// Define a type for the dashboard overview response
interface DashboardOverview {
  pendingOrdersChangePercent?: number;
  completedOrdersCount?: number;
  completedOrdersChangePercent?: number;
  fuelConsumptionTotal?: number;
  fuelConsumptionChangePercent?: number;
}

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    pendingOrders: {
      count: 0,
      changePercent: 0,
    },
    completedOrders: {
      count: 0,
      changePercent: 0,
    },
    activeVehicles: {
      active: 0,
      total: 0,
      inMaintenance: 0,
    },
    fuelConsumption: {
      total: 0,
      changePercent: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDashboardMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const dashboardOverviewData: DashboardOverview = {};

      try {
        await dashboardApi.getDashboardOverview();
      } catch (overviewError) {
        console.error("Error fetching dashboard overview:", overviewError);
      }
      
      const [urgentOrdersResponse, vehicleStatusResponse] = await Promise.all([
        dashboardApi.getUrgentOrders(24),
        dashboardApi.getVehicleStatusBreakdown(),
      ]);

      const urgentOrders = Array.isArray(urgentOrdersResponse.data) 
        ? urgentOrdersResponse.data 
        : [];
        
      const vehicleStatus = Array.isArray(vehicleStatusResponse.data) 
        ? vehicleStatusResponse.data 
        : [];

      const inMaintenance = vehicleStatus.filter((v: VehicleDTO) => 
        v && typeof v === 'object' && 'status' in v && v.status === VehicleStatusEnum.Maintenance
      ).length;
      
      const active = vehicleStatus.filter((v: VehicleDTO) => 
        v && typeof v === 'object' && 'status' in v && 
        (v.status === VehicleStatusEnum.Available || v.status === VehicleStatusEnum.Driving)
      ).length;
      
      const dashboardMetrics: DashboardMetrics = {
        pendingOrders: {
          count: urgentOrders.length,
          changePercent: dashboardOverviewData.pendingOrdersChangePercent || 0,
        },
        completedOrders: {
          count: dashboardOverviewData.completedOrdersCount || 0,
          changePercent: dashboardOverviewData.completedOrdersChangePercent || 0,
        },
        activeVehicles: {
          active: active,
          total: vehicleStatus.length,
          inMaintenance: inMaintenance,
        },
        fuelConsumption: {
          total: dashboardOverviewData.fuelConsumptionTotal || 0,
          changePercent: dashboardOverviewData.fuelConsumptionChangePercent || 0,
        },
      };

      setMetrics(dashboardMetrics);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : "Error al cargar métricas del dashboard";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchDashboardMetrics();
  }, [fetchDashboardMetrics]);

  return { metrics, loading, error, refreshMetrics: fetchDashboardMetrics };
}
