import { useState, useEffect, useCallback } from "react";
import { dashboardApi, type VehicleDTO } from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";

export function useVehicleStatusSummary() {
  const [summary, setSummary] = useState<VehicleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchVehicleStatusSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardApi.getVehicleStatusBreakdown();

      // Map to include legacy fields if needed
      const vehicles = Array.isArray(response.data)
        ? response.data
        : [response.data].filter(Boolean);
      const mappedVehicles = vehicles.map((vehicle: VehicleDTO) => ({
        ...vehicle,
        currentGLP: vehicle.currentGlpM3, // Map new field to legacy field
        currentFuel: vehicle.currentFuelGal, // Map new field to legacy field
      }));

      setSummary(mappedVehicles);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error al cargar estado de vehículos";
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
    fetchVehicleStatusSummary();
  }, [fetchVehicleStatusSummary]);

  return { summary, loading, error, refetch: fetchVehicleStatusSummary };
}

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
  // Initialize with default values instead of null
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

      // Make API calls to compose our metrics
      const dashboardOverviewData: DashboardOverview = {};

      try {
        // Since getDashboardOverview returns void, we'll handle it separately
        await dashboardApi.getDashboardOverview();
        // In a real implementation, the API would return data instead of void
        // We're using default empty object for now
      } catch (overviewError) {
        console.error("Error fetching dashboard overview:", overviewError);
      }
      
      // Get urgent orders and vehicle status data
      const [urgentOrdersResponse, vehicleStatusResponse] = await Promise.all([
        dashboardApi.getUrgentOrders(24), // Orders due in next 24 hours
        dashboardApi.getVehicleStatusBreakdown(),
      ]);

      // Process the responses to create the metrics object
      const urgentOrders = Array.isArray(urgentOrdersResponse.data) 
        ? urgentOrdersResponse.data 
        : [];
        
      const vehicleStatus = Array.isArray(vehicleStatusResponse.data) 
        ? vehicleStatusResponse.data 
        : [];

      // Count vehicles with maintenance status
      const inMaintenance = vehicleStatus.filter(v => v.status === 'MAINTENANCE').length;
      const active = vehicleStatus.filter(v => v.status === 'ACTIVE' || v.status === 'SERVING').length;
      
      // Build metrics object from API responses
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
      const errorMessage =
        err instanceof Error
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
    fetchDashboardMetrics();
  }, [fetchDashboardMetrics]);

  // Rename refetch to refreshMetrics
  return { metrics, loading, error, refreshMetrics: fetchDashboardMetrics };
}
