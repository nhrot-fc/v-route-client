"use client";

import React, { useState } from "react";
import {
  Truck,
  Package,
  DropletIcon,
  CalendarClock,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { PageContainer } from "@/components/ui/page-container";
import { PageHeader, type PageAction } from "@/components/ui/page-header";
import { SectionContainer } from "@/components/ui/section-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useServeRecords } from "@/hooks/use-serve-records";
import { useVehicles } from "@/hooks/use-vehicles";
import { ServeRecordDTO } from "@/lib/api-client";
import { DataTable } from "@/components/ui/data-table";
import { PaginationFooter } from "@/components/ui/pagination-footer";




export default function EntregasPage() {
  // Filter state
  const [activeTab, setActiveTab] = useState("todos");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(undefined);
  const [selectedStartDate, setSelectedStartDate] = useState<string | undefined>(undefined);
  const [selectedEndDate, setSelectedEndDate] = useState<string | undefined>(undefined);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Get vehicles for filter dropdown
  const { vehicles } = useVehicles();
  
  // Create filter object
  const filter = {
    vehicleId: selectedVehicleId,
    startDate: selectedStartDate,
    endDate: selectedEndDate,
  };
  
  // Get serve records with pagination and filter
  const {
    serveRecords,
    loading,
    error,
    refetch,
    totalPages,
    totalItems,
  } = useServeRecords(filter, {
    page: currentPage - 1, // API uses 0-based index
    size: pageSize
  });
  
  // Handle pagination changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Handle page size change
  const handlePageSizeChange = (newSize: number | string) => {
    setPageSize(typeof newSize === 'string' ? parseInt(newSize, 10) : newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };
  
  // Reset filters
  const resetFilters = () => {
    setSelectedVehicleId(undefined);
    setSelectedStartDate(undefined);
    setSelectedEndDate(undefined);
  };
  
  // Define columns for the DataTable
  const columns = [
    {
      header: "ID",
      accessorKey: "id" as keyof ServeRecordDTO,
      className: "font-medium",
    },
    {
      header: "Vehículo",
      accessorKey: "vehicleId" as keyof ServeRecordDTO,
      cell: (record: ServeRecordDTO) => (
        <div className="flex items-center">
          <Truck className="h-4 w-4 mr-1.5 text-primary" />
          {record.vehicleId}
        </div>
      ),
    },
    {
      header: "Pedido",
      accessorKey: "orderId" as keyof ServeRecordDTO,
      cell: (record: ServeRecordDTO) => (
        <div className="flex items-center">
          <Package className="h-4 w-4 mr-1.5 text-primary" />
          {record.orderId}
        </div>
      ),
    },
    {
      header: "Volumen (m³)",
      accessorKey: "glpVolumeM3" as keyof ServeRecordDTO,
      cell: (record: ServeRecordDTO) => (
        <div className="flex items-center">
          <DropletIcon className="h-4 w-4 mr-1.5 text-blue-500" />
          {record.glpVolumeM3?.toFixed(2)}
        </div>
      ),
    },
    {
      header: "Fecha",
      accessorKey: "serveDate" as keyof ServeRecordDTO,
      cell: (record: ServeRecordDTO) => (
        <div className="flex items-center">
          <CalendarClock className="h-4 w-4 mr-1.5 text-gray-500" />
          {record.serveDate && 
            format(new Date(record.serveDate), "dd/MM/yyyy HH:mm", { locale: es })}
        </div>
      ),
    },
  ];
  
  // Define actions for the DataTable
  const actions = [
    {
      id: "view",
      label: "Ver detalles",
      icon: <AlertCircle className="h-4 w-4" />,
      onClick: (record: ServeRecordDTO) => {
        console.log("View details for record:", record);
        // Implement view details functionality
      },
    },
  ];

  // Define header actions
  const headerActions: PageAction[] = [
    {
      icon: <SlidersHorizontal className="h-4 w-4" />,
      label: "Filtros",
      variant: "outline",
      onClick: () => setIsFilterOpen(true),
    },
  ];

  // Filter records for tabs
  const last7DaysRecords = serveRecords.filter((r: ServeRecordDTO) => {
    if (!r.serveDate) return false;
    const date = new Date(r.serveDate);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return date >= sevenDaysAgo;
  });

  const last30DaysRecords = serveRecords.filter((r: ServeRecordDTO) => {
    if (!r.serveDate) return false;
    const date = new Date(r.serveDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date >= thirtyDaysAgo;
  });

  return (
    <PageContainer>
      <PageHeader
        title="Registro de Entregas"
        description="Historial de entregas realizadas por los vehículos"
        actions={headerActions}
      />

      <SectionContainer>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="todos" className="flex gap-2">
                Todos
                <Badge variant="outline">{serveRecords.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="ultimos7dias" className="flex gap-2">
                Últimos 7 días
                <Badge variant="outline">{last7DaysRecords.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="ultimos30dias" className="flex gap-2">
                Últimos 30 días
                <Badge variant="outline">{last30DaysRecords.length}</Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="todos">
            <Card>
              <CardHeader>
                <CardTitle>Todas las entregas</CardTitle>
                <CardDescription>
                  Lista completa de todas las entregas registradas en el sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={serveRecords}
                  columns={columns}
                  actions={actions}
                  isLoading={loading}
                  error={error}
                  noDataMessage="No se encontraron entregas con los filtros seleccionados."
                  footerContent={
                    <PaginationFooter
                      currentPage={currentPage}
                      pageSize={pageSize}
                      totalItems={totalItems}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                    />
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ultimos7dias">
            <Card>
              <CardHeader>
                <CardTitle>Entregas de los últimos 7 días</CardTitle>
                <CardDescription>
                  Entregas realizadas en la última semana.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={last7DaysRecords}
                  columns={columns}
                  actions={actions}
                  isLoading={loading}
                  error={error}
                  noDataMessage="No se encontraron entregas en los últimos 7 días."
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ultimos30dias">
            <Card>
              <CardHeader>
                <CardTitle>Entregas de los últimos 30 días</CardTitle>
                <CardDescription>
                  Entregas realizadas en el último mes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={last30DaysRecords}
                  columns={columns}
                  actions={actions}
                  isLoading={loading}
                  error={error}
                  noDataMessage="No se encontraron entregas en los últimos 30 días."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SectionContainer>
      
      {/* Filters Sheet */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
            <SheetDescription>
              Configure los filtros para buscar entregas específicas.
            </SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Vehículo</h3>
              <Select
                value={selectedVehicleId || ""}
                onValueChange={(value) => setSelectedVehicleId(value === "" ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los vehículos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los vehículos</SelectItem>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id || ""}>
                      {vehicle.id} - {vehicle.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Fecha de inicio</h3>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedStartDate || ""}
                onChange={(e) => setSelectedStartDate(e.target.value || undefined)}
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Fecha de fin</h3>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedEndDate || ""}
                onChange={(e) => setSelectedEndDate(e.target.value || undefined)}
              />
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={resetFilters}>
                Restablecer
              </Button>
              <Button onClick={() => {
                setIsFilterOpen(false);
                setCurrentPage(1); // Reset to first page when applying filters
                refetch();
              }}>
                Aplicar filtros
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
} 