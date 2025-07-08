"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  CheckCircle2,
  Clock,
  Fuel,
  BarChart2,
  Truck,
  RefreshCw,
  Loader2,
  Home,
  Package,
} from "lucide-react";
import { DeliveryStatusChart } from "@/components/dashboard/delivery-status-chart";
import { FuelConsumptionChart } from "@/components/dashboard/fuel-consumption-chart";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { VehicleStatusList } from "@/components/dashboard/vehicle-status-list";
import { useDashboardMetrics } from "@/hooks/use-dashboard";
import { PageLayout } from "@/components/ui/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Divider } from "@/components/ui/divider";
import { IconCard } from "@/components/ui/icon-card";
import { StatusBadge } from "@/components/ui/status-badge";

export default function DashboardPage() {
  // Use the hook with the updated property name
  const { metrics, loading, refreshMetrics } = useDashboardMetrics();
  const [currentTime, setCurrentTime] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setCurrentTime(new Date().toLocaleString("es-ES"));
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshMetrics();
    setCurrentTime(new Date().toLocaleString("es-ES"));
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <PageLayout
      title="Dashboard" 
      description="Visualización de métricas operativas y gestión logística"
      actions={[
        { 
          icon: isRefreshing ? <Loader2 className="animate-spin" /> : <RefreshCw />, 
          label: "Actualizar datos", 
          variant: "outline", 
          onClick: handleRefresh 
        }
      ]}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center">
            <Home className="h-5 w-5 mr-2 text-primary" />
            Resumen Operativo
          </h2>
          <Badge variant="ghost" className="text-xs">
            Última actualización: {currentTime}
          </Badge>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <IconCard
            icon={<Clock className="h-5 w-5" />}
            title="Pedidos Pendientes"
            value={loading ? "..." : metrics.pendingOrders.count.toString()}
            trend={
              !loading && metrics.pendingOrders.changePercent !== 0
                ? {
                    value: metrics.pendingOrders.changePercent,
                    isPositive: metrics.pendingOrders.changePercent < 0,
                    label: metrics.pendingOrders.changePercent < 0 ? "menos que ayer" : "más que ayer"
                  }
                : undefined
            }
            colorScheme="blue"
          />

          <IconCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            title="Entregas Completadas"
            value={loading ? "..." : metrics.completedOrders.count.toString()}
            trend={
              !loading && metrics.completedOrders.changePercent !== 0
                ? {
                    value: metrics.completedOrders.changePercent,
                    isPositive: metrics.completedOrders.changePercent > 0,
                    label: metrics.completedOrders.changePercent > 0 ? "más que ayer" : "menos que ayer"
                  }
                : undefined
            }
            colorScheme="green"
          />

          <IconCard
            icon={<Truck className="h-5 w-5" />}
            title="Vehículos Activos"
            value={loading ? "..." : `${metrics.activeVehicles.active}/${metrics.activeVehicles.total}`}
            subtitle={metrics.activeVehicles.inMaintenance > 0 
              ? `${metrics.activeVehicles.inMaintenance} en mantenimiento`
              : "Todos operativos"
            }
            footer={
              metrics.activeVehicles.inMaintenance > 0 ? (
                <StatusBadge status="warning" text="Mantenimiento requerido" size="sm" />
              ) : (
                <StatusBadge status="success" text="Flota operativa" size="sm" />
              )
            }
            colorScheme="primary"
          />

          <IconCard
            icon={<Fuel className="h-5 w-5" />}
            title="Consumo de Combustible"
            value={loading ? "..." : `${metrics.fuelConsumption.total} L`}
            trend={
              !loading && metrics.fuelConsumption.changePercent !== 0
                ? {
                    value: metrics.fuelConsumption.changePercent,
                    isPositive: metrics.fuelConsumption.changePercent < 0,
                    label: metrics.fuelConsumption.changePercent < 0 ? "menos que ayer" : "más que ayer"
                  }
                : undefined
            }
            colorScheme="amber"
          />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full max-w-md mx-auto md:mx-0 grid grid-cols-3 bg-muted/60">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-card">
            <Package className="h-4 w-4 mr-2" />
            Vista General
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-white dark:data-[state=active]:bg-card">
            <BarChart2 className="h-4 w-4 mr-2" />
            Analítica
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-white dark:data-[state=active]:bg-card">
            <Activity className="h-4 w-4 mr-2" />
            Reportes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 animate-fade-in">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 overflow-hidden border bg-white">
              <CardHeader className="bg-white pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                    Estado de Entregas
                  </CardTitle>
                  <Badge variant="outline" className="bg-primary-50 text-primary-700">
                    Últimas 24h
                  </Badge>
                </div>
                <CardDescription>
                  Distribución de entregas por estado en las últimas 24 horas
                </CardDescription>
              </CardHeader>
              <Divider className="mx-6" />
              <CardContent className="pl-2 pt-4">
                <DeliveryStatusChart />
              </CardContent>
            </Card>

            <Card className="col-span-3 overflow-hidden border bg-white">
              <CardHeader className="bg-white pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Fuel className="h-5 w-5 mr-2 text-primary" />
                    Consumo de Combustible
                  </CardTitle>
                  <Badge variant="outline" className="bg-primary-50 text-primary-700">
                    Semanal
                  </Badge>
                </div>
                <CardDescription>
                  Consumo diario de combustible en la última semana
                </CardDescription>
              </CardHeader>
              <Divider className="mx-6" />
              <CardContent className="pt-4">
                <FuelConsumptionChart />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 overflow-hidden border bg-white">
              <CardHeader className="bg-white pb-2">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  Pedidos Recientes
                </CardTitle>
                <CardDescription>
                  Últimos pedidos registrados en el sistema
                </CardDescription>
              </CardHeader>
              <Divider className="mx-6" />
              <CardContent className="pt-4">
                <RecentOrders />
              </CardContent>
            </Card>

            <Card className="col-span-3 overflow-hidden border bg-white">
              <CardHeader className="bg-white pb-2">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-primary" />
                  Estado de Vehículos
                </CardTitle>
                <CardDescription>
                  Listado de vehículos y su estado actual
                </CardDescription>
              </CardHeader>
              <Divider className="mx-6" />
              <CardContent className="pt-4">
                <VehicleStatusList />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 animate-fade-in">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-primary" />
                Análisis de Rendimiento
              </CardTitle>
              <CardDescription>
                Métricas detalladas de rendimiento operativo
              </CardDescription>
            </CardHeader>
            <Divider className="mx-6" />
            <CardContent className="py-8">
              <div className="flex flex-col items-center justify-center text-center">
                <Activity className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Seleccione parámetros para visualizar análisis
                </p>
                <Button className="mt-4" variant="outline">
                  Configurar Análisis
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4 animate-fade-in">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                Reportes
              </CardTitle>
              <CardDescription>
                Generación de reportes personalizados
              </CardDescription>
            </CardHeader>
            <Divider className="mx-6" />
            <CardContent className="py-8">
              <div className="flex flex-col items-center justify-center text-center">
                <Activity className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Seleccione parámetros para generar reportes
                </p>
                <div className="flex gap-3 mt-4">
                  <Button variant="outline">
                    Diario
                  </Button>
                  <Button variant="outline">
                    Semanal
                  </Button>
                  <Button variant="outline">
                    Mensual
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
