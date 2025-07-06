import { useState, useEffect } from 'react'
import { dashboardApi, ordersApi, vehiclesApi, VehicleStatusEnum, Vehicle } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'

// Define an interface for legacy fields
interface VehicleWithLegacyFields extends Vehicle {
  currentGLP?: number; // Legacy field
  currentFuel?: number; // Legacy field
}

export function useDashboardOverview() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await dashboardApi.getDashboardOverview()
        setData(response.data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos del dashboard'
        setError(errorMessage)
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  return { data, loading, error }
}

export function useSystemHealth() {
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSystemHealth = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await dashboardApi.getSystemHealth()
        setHealth(response.data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar estado del sistema'
        setError(errorMessage)
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSystemHealth()
  }, [toast])

  return { health, loading, error }
}

export function useVehicleStatusSummary() {
  const [summary, setSummary] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchVehicleStatusSummary = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await dashboardApi.getVehicleStatusBreakdown()
        setSummary(response.data as Record<string, number>)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar resumen de vehículos'
        setError(errorMessage)
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchVehicleStatusSummary()
  }, [toast])

  return { summary, loading, error }
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

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    pendingOrders: { count: 0, changePercent: 0 },
    completedOrders: { count: 0, changePercent: 0 },
    activeVehicles: { active: 0, total: 0, inMaintenance: 0 },
    fuelConsumption: { total: 0, changePercent: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        
        // Fetch data needed for the metrics in parallel
        const [pendingResponse, completedResponse, vehicleResponse] = await Promise.all([
          ordersApi.list2(true), // pendingOnly = true for pending orders
          ordersApi.list2(false), // pendingOnly = false for completed orders
          vehiclesApi.list() // Get all vehicles
        ]);
        
        // Calculate pending orders metrics
        const pendingOrders = Array.isArray(pendingResponse.data) ? pendingResponse.data.length : 0;
        // In a real app, you would compare with historical data
        // Simulating a change percentage for visualization
        const pendingChangePercent = Math.round((Math.random() > 0.5 ? -1 : 1) * Math.random() * 15);
        
        // Calculate completed orders metrics
        const completedOrders = Array.isArray(completedResponse.data) ? completedResponse.data.length : 0;
        // Simulating a change percentage for visualization
        const completedChangePercent = Math.round((Math.random() > 0.5 ? -1 : 1) * Math.random() * 15);
        
        // Calculate vehicle metrics
        let totalVehicles = 0;
        let activeVehicles = 0;
        let inMaintenance = 0;
        let totalFuel = 0;
        
        if (Array.isArray(vehicleResponse.data)) {
          const vehicles = vehicleResponse.data as VehicleWithLegacyFields[];
          totalVehicles = vehicles.length;
          
          vehicles.forEach(vehicle => {
            // Check active vehicles (Available or Driving status)
            if (vehicle.status === VehicleStatusEnum.Available || vehicle.status === VehicleStatusEnum.Driving) {
              activeVehicles++;
            }
            
            // Check maintenance vehicles
            if (vehicle.status === VehicleStatusEnum.Maintenance) {
              inMaintenance++;
            }
            
            // Get fuel consumption - first check legacy field, fall back to new field name
            const currentFuel = vehicle.currentFuel !== undefined ? 
              vehicle.currentFuel : 
              vehicle.currentFuelGal;
              
            if (currentFuel !== undefined) {
              totalFuel += currentFuel;
            }
          });
        }
        
        // Simulating a change percentage for fuel consumption
        const fuelChangePercent = Math.round((Math.random() > 0.5 ? -1 : 1) * Math.random() * 10);
        
        // Update metrics state
        setMetrics({
          pendingOrders: {
            count: pendingOrders,
            changePercent: pendingChangePercent
          },
          completedOrders: {
            count: completedOrders,
            changePercent: completedChangePercent
          },
          activeVehicles: {
            active: activeVehicles,
            total: totalVehicles,
            inMaintenance: inMaintenance
          },
          fuelConsumption: {
            total: Math.round(totalFuel),
            changePercent: fuelChangePercent
          }
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar métricas del dashboard';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [toast]);

  return { metrics, loading, error };
}
