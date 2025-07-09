"use client";

import React, { useState, useMemo } from "react";
import {
  AlertCircle,
  CalendarClock,
  SlidersHorizontal,
  Car,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SectionContainer } from "@/components/ui/section-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { IncidentForm } from "@/components/incidents/incident-form";
import { useIncidents } from "@/hooks/use-incidents";
import { useVehicles } from "@/hooks/use-vehicles";
import { IncidentDTO, IncidentTypeEnum } from "@/lib/api-client";
import { PaginationFooter } from "@/components/ui/pagination-footer";

// Define an interface for the incident with any additional fields we need
interface ExtendedIncident extends IncidentDTO {
  // Add any additional fields needed for the UI
  date?: string; // For compatibility with our component
}

export default function IncidentesPage() {
  // Filter state
  const [activeTab, setActiveTab] = useState("todos");
  // Form sheet state
  const [isFormOpen, setIsFormOpen] = useState(false);
  // Filter sheet state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // Filter parameters
  const [selectedVehicleId, setSelectedVehicleId] = useState<
    string | undefined
  >(undefined);
  const [selectedType, setSelectedType] = useState<string | undefined>(
    undefined,
  );
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)), // 1 month ago
    to: new Date(),
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form dialog state
  const [editingIncident, setEditingIncident] =
    useState<ExtendedIncident | null>(null);

  // Get vehicles for filter dropdown
  const { vehicles } = useVehicles();

  // Determine filter based on active tab and selected filters
  const resolved =
    activeTab === "resueltos"
      ? true
      : activeTab === "pendientes"
        ? false
        : undefined;

  // Create filter object
  const filter = {
    vehicleId: selectedVehicleId,
    type: selectedType,
    resolved,
    startDate: dateRange?.from?.toISOString(),
    endDate: dateRange?.to?.toISOString(),
  };

  // Get incidents with pagination and filter
  const { incidents, loading, error, refetch, totalPages, totalItems } =
    useIncidents(filter, {
      page: currentPage - 1, // API uses 0-based index
      size: pageSize,
    });

  // Handle pagination changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize: number | string) => {
    setPageSize(typeof newSize === "string" ? parseInt(newSize, 10) : newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Handle form submission success
  const handleIncidentSaved = () => {
    setIsFormOpen(false);
    setEditingIncident(null);
    refetch();
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedVehicleId(undefined);
    setSelectedType(undefined);
    setDateRange({
      from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      to: new Date(),
    });
  };

  // Map incidents to include date field for compatibility
  const mappedIncidents: ExtendedIncident[] = incidents.map((incident) => ({
    ...incident,
    date: incident.occurrenceTime, // Map occurrenceTime to date for UI consistency
  }));

  // Count incidents by status for tabs
  const pendingCount = incidents.filter((i) => !i.resolved).length;
  const resolvedCount = incidents.filter((i) => i.resolved).length;
  const totalCount = incidents.length;

  // Define columns for the DataTable
  const columns = [
    {
      header: "ID",
      accessorKey: "id" as keyof ExtendedIncident,
      className: "font-medium",
    },
    {
      header: "Vehículo",
      accessorKey: "vehicleId" as keyof ExtendedIncident,
      cell: (incident: ExtendedIncident) => (
        <div className="flex items-center">
          <Car className="h-4 w-4 mr-1.5 text-primary" />
          {incident.vehicleId}
        </div>
      ),
    },
    {
      header: "Tipo",
      accessorKey: "type" as keyof ExtendedIncident,
      cell: (incident: ExtendedIncident) => {
        const type = incident.type;
        let status:
          | "warning"
          | "error"
          | "info"
          | "loading"
          | "success"
          | "pending" = "pending";
        let label = "Desconocido";

        switch (type) {
          case IncidentTypeEnum.Ti1:
            status = "warning";
            label = "Mecánico";
            break;
          case IncidentTypeEnum.Ti2:
            status = "error";
            label = "Tráfico";
            break;
          case IncidentTypeEnum.Ti3:
            status = "info";
            label = "Clima";
            break;
        }

        return <StatusBadge status={status} text={label} />;
      },
    },
    {
      header: "Descripción",
      accessorKey: "description" as keyof ExtendedIncident,
    },
    {
      header: "Fecha",
      accessorKey: "date" as keyof ExtendedIncident,
      cell: (incident: ExtendedIncident) => (
        <div className="flex items-center">
          <CalendarClock className="h-4 w-4 mr-1.5 text-gray-500" />
          {incident.date &&
            format(new Date(incident.date), "dd/MM/yyyy HH:mm", { locale: es })}
        </div>
      ),
    },
  ];

  // Define actions for the DataTable
  const actions = [
    {
      id: "edit",
      label: "Editar incidente",
      icon: <AlertCircle className="h-4 w-4" />,
      onClick: (incident: ExtendedIncident) => {
        setEditingIncident(incident);
        setIsFormOpen(true);
      },
    },
  ];

  // Filtrar datos según la pestaña activa
  const filteredData = useMemo(() => {
    if (activeTab === "todos") {
      return mappedIncidents;
    } else if (activeTab === "pendientes") {
      return mappedIncidents.filter((i) => !i.resolved);
    } else if (activeTab === "resueltos") {
      return mappedIncidents.filter((i) => i.resolved);
    }
    return mappedIncidents;
  }, [mappedIncidents, activeTab]);

  return (
    <PageContainer>
      <PageHeader
        title="Incidentes de Vehículos"
        description="Registro y seguimiento de incidentes de la flota de vehículos."
        actions={[
          {
            icon: <SlidersHorizontal className="h-4 w-4" />,
            label: "Filtros",
            variant: "outline",
            onClick: () => setIsFilterOpen(true),
          },
          {
            icon: <Plus className="h-4 w-4" />,
            label: "Nuevo Incidente",
            onClick: () => setIsFormOpen(true),
          },
        ]}
      />

      <SectionContainer>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="todos" className="flex gap-2">
                Todos
                <Badge variant="outline">{totalCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pendientes" className="flex gap-2">
                Pendientes
                <Badge variant="outline">{pendingCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="resueltos" className="flex gap-2">
                Resueltos
                <Badge variant="outline">{resolvedCount}</Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="todos">
            <Card>
              <CardHeader>
                <CardTitle>Todos los incidentes</CardTitle>
                <CardDescription>
                  Lista completa de todos los incidentes registrados en el
                  sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={filteredData}
                  columns={columns}
                  actions={actions}
                  isLoading={loading}
                  error={error}
                  noDataMessage="No se encontraron incidentes con los filtros seleccionados."
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

          <TabsContent value="pendientes">
            <Card>
              <CardHeader>
                <CardTitle>Incidentes pendientes</CardTitle>
                <CardDescription>
                  Incidentes que aún no han sido resueltos y requieren atención.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={mappedIncidents.filter((i) => !i.resolved)}
                  columns={columns}
                  actions={actions}
                  isLoading={loading}
                  error={error}
                  noDataMessage="No se encontraron incidentes pendientes."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resueltos">
            <Card>
              <CardHeader>
                <CardTitle>Incidentes resueltos</CardTitle>
                <CardDescription>
                  Historial de incidentes que ya han sido resueltos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={mappedIncidents.filter((i) => i.resolved)}
                  columns={columns}
                  actions={actions}
                  isLoading={loading}
                  error={error}
                  noDataMessage="No se encontraron incidentes resueltos."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SectionContainer>

      {/* New Incident Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Registrar nuevo incidente</SheetTitle>
            <SheetDescription>
              Complete el formulario para registrar un nuevo incidente de
              vehículo.
            </SheetDescription>
          </SheetHeader>
          <div className="py-6">
            <IncidentForm
              incident={editingIncident}
              onSaved={handleIncidentSaved}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Filters Sheet */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
            <SheetDescription>
              Configure los filtros para buscar incidentes específicos.
            </SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Vehículo</h3>
              <Select
                value={selectedVehicleId || ""}
                onValueChange={(value) =>
                  setSelectedVehicleId(value === "" ? undefined : value)
                }
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
              <h3 className="text-sm font-medium">Tipo de incidente</h3>
              <Select
                value={selectedType || ""}
                onValueChange={(value) =>
                  setSelectedType(value === "" ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los tipos</SelectItem>
                  <SelectItem value={IncidentTypeEnum.Ti1}>Mecánico</SelectItem>
                  <SelectItem value={IncidentTypeEnum.Ti2}>Tráfico</SelectItem>
                  <SelectItem value={IncidentTypeEnum.Ti3}>Clima</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Rango de fechas</h3>
              <DateRangePicker
                initialDateFrom={dateRange.from}
                initialDateTo={dateRange.to}
                onUpdate={(range: { from: Date; to: Date }) =>
                  setDateRange(range)
                }
                align="start"
              />
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={resetFilters}>
                Restablecer
              </Button>
              <Button
                onClick={() => {
                  setIsFilterOpen(false);
                  setCurrentPage(1); // Reset to first page when applying filters
                  refetch();
                }}
              >
                Aplicar filtros
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
