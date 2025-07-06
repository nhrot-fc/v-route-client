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
  AlertTriangle,
  CheckCircle2,
  Clock,
  Fuel,
  BarChart2,
  TrendingDown,
  TrendingUp,
  Truck,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { DeliveryStatusChart } from "@/components/dashboard/delivery-status-chart";
import { FuelConsumptionChart } from "@/components/dashboard/fuel-consumption-chart";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { VehicleStatusList } from "@/components/dashboard/vehicle-status-list";
import { useDashboardMetrics } from "@/hooks/use-dashboard";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
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
    <PageContainer>
      <PageHeader 
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
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full max-w-md mx-auto md:mx-0 grid grid-cols-3">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="analytics">Analítica</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 animate-fade-in">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Pedidos Pendientes"
              value={loading ? null : metrics.pendingOrders.count}
              icon={<Clock className="h-5 w-5 text-blue-600" />}
              change={metrics.pendingOrders.changePercent}
              changeDescription={metrics.pendingOrders.changePercent < 0 ? "menos que ayer" : "más que ayer"}
              changeBetter={metrics.pendingOrders.changePercent < 0}
            />

            <StatCard 
              title="Entregas Completadas"
              value={loading ? null : metrics.completedOrders.count}
              icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
              change={metrics.completedOrders.changePercent}
              changeDescription={metrics.completedOrders.changePercent > 0 ? "más que ayer" : "menos que ayer"}
              changeBetter={metrics.completedOrders.changePercent > 0}
            />

            <StatCard 
              title="Vehículos Activos"
              value={loading ? null : `${metrics.activeVehicles.active}/${metrics.activeVehicles.total}`}
              icon={<Truck className="h-5 w-5 text-blue-600" />}
              secondaryText={metrics.activeVehicles.inMaintenance > 0 ? (
                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 mt-1">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  <span>{metrics.activeVehicles.inMaintenance} en mantenimiento</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 mt-1">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  <span>Todos operativos</span>
                </Badge>
              )}
            />

            <StatCard 
              title="Consumo de Combustible"
              value={loading ? null : `${metrics.fuelConsumption.total} L`}
              icon={<Fuel className="h-5 w-5 text-blue-600" />}
              change={metrics.fuelConsumption.changePercent}
              changeDescription={metrics.fuelConsumption.changePercent < 0 ? "menos que ayer" : "más que ayer"}
              changeBetter={metrics.fuelConsumption.changePercent < 0}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 overflow-hidden border-border">
              <CardHeader className="bg-card pb-2">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2 text-blue-600" />
                  Estado de Entregas
                </CardTitle>
                <CardDescription>
                  Distribución de entregas por estado en las últimas 24 horas
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2 pt-4">
                <DeliveryStatusChart />
              </CardContent>
            </Card>

            <Card className="col-span-3 overflow-hidden border-border">
              <CardHeader className="bg-card pb-2">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Fuel className="h-5 w-5 mr-2 text-blue-600" />
                  Consumo de Combustible
                </CardTitle>
                <CardDescription>
                  Consumo diario de combustible en la última semana
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <FuelConsumptionChart />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 overflow-hidden border-border">
              <CardHeader className="bg-card pb-2">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  Pedidos Recientes
                </CardTitle>
                <CardDescription>
                  Últimos pedidos registrados en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <RecentOrders />
              </CardContent>
            </Card>

            <Card className="col-span-3 overflow-hidden border-border">
              <CardHeader className="bg-card pb-2">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-blue-600" />
                  Estado de Vehículos
                </CardTitle>
                <CardDescription>
                  Listado de vehículos y su estado actual
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <VehicleStatusList />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Análisis de Rendimiento
              </CardTitle>
              <CardDescription>
                Métricas detalladas de rendimiento operativo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40">
                <Activity className="h-16 w-16 text-muted-foreground" />
                <p className="ml-4 text-muted-foreground">
                  Seleccione parámetros para visualizar análisis
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-blue-600" />
                Reportes
              </CardTitle>
              <CardDescription>
                Generación de reportes personalizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40">
                <Activity className="h-16 w-16 text-muted-foreground" />
                <p className="ml-4 text-muted-foreground">
                  Seleccione parámetros para generar reportes
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

interface StatCardProps {
  title: string;
  value: string | number | null;
  icon: React.ReactNode;
  change?: number;
  changeDescription?: string;
  changeBetter?: boolean;
  secondaryText?: React.ReactNode;
}

function StatCard({ title, value, icon, change, changeDescription, changeBetter, secondaryText }: StatCardProps) {
  return (
    <Card className="overflow-hidden border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-card">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="pt-4">
        {value === null ? (
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-16 rounded mb-2"></div>
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {(change !== undefined && changeDescription) ? (
          <p className="text-xs text-muted-foreground flex items-center">
            {changeBetter ? (
              <TrendingDown className={cn("mr-1 h-4 w-4", changeBetter ? "text-green-600" : "text-amber-500")} />
            ) : (
              <TrendingUp className={cn("mr-1 h-4 w-4", changeBetter ? "text-green-600" : "text-amber-500")} />
            )}
            <span>
              {Math.abs(change)}% {changeDescription}
            </span>
          </p>
        ) : secondaryText ? (
          secondaryText
        ) : null}
      </CardContent>
    </Card>
  );
}
