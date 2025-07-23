

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageLayout } from "@/components/ui/page-layout";
import { Divider } from "@/components/ui/divider";
import { DataTable } from "@/components/ui/data-table";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { VehicleUploadForm } from "@/components/vehicles/vehicle-upload-form";
import { useVehicles, type VehicleFilterParams } from "@/hooks/use-vehicles";
import { StatusBadge } from "@/components/ui/status-badge";
import { type VehicleDTO, VehicleStatusEnum, ListTypeEnum } from "@/lib/api-client";
import { PaginationFooter } from "@/components/ui/pagination-footer";
import { TableFilterControls } from "@/components/ui/table-filter-controls";
import { TableFilterTabs } from "@/components/ui/table-filter-tabs";
import { TableSearch } from "@/components/ui/table-search";

import {
  Plus,
  Upload,
  CheckCircle,
  Truck,
  TruckIcon,
  AlertTriangle,
  Wrench,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SectionContainer } from "@/components/ui/section-container";

export default function VehiculosPage() {
  const [newOpen, setNewOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Add filter state
  const [filterType, setFilterType] = useState<ListTypeEnum | undefined>(undefined);
  const [minGlp, setMinGlp] = useState<number | undefined>(undefined);
  const [minFuel, setMinFuel] = useState<number | undefined>(undefined);

  // Use pagination parameters in the hook
  const {
    vehicles,
    loading,
    error,
    updateVehicleStatus,
    deleteVehicle,
    totalItems,
    totalPages,
    refetch,
  } = useVehicles(
    activeTab !== "todos" ? activeTab : undefined,
    {
      page: currentPage - 1,
      size: pageSize,
    },
    {
      type: filterType,
      minGlp: minGlp,
      minFuel: minFuel,
    } as VehicleFilterParams
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Count vehicles by status
  const availableCount = vehicles.filter(
    (v) => v.status === VehicleStatusEnum.Available,
  ).length;
  const inRouteCount = vehicles.filter(
    (v) => v.status === VehicleStatusEnum.Driving,
  ).length;
  const maintenanceCount = vehicles.filter(
    (v) => v.status === VehicleStatusEnum.Maintenance,
  ).length;
  const incidentCount = vehicles.filter(
    (v) => v.status === VehicleStatusEnum.Incident,
  ).length;

  // Format vehicle position
  const formatPosition = (vehicle: VehicleDTO) => {
    if (!vehicle.currentPosition) return "N/A";
    const x = vehicle.currentPosition.x ?? 0;
    const y = vehicle.currentPosition.y ?? 0;
    return `(${x.toFixed(2)}, ${y.toFixed(2)})`;
  };

  // Define status display function
  const getVehicleStatus = (status: string | undefined) => {
    switch (status) {
      case VehicleStatusEnum.Available:
        return <StatusBadge status="success" text="Disponible" />;
      case VehicleStatusEnum.Driving:
        return <StatusBadge status="info" text="En Ruta" />;
      case VehicleStatusEnum.Maintenance:
        return <StatusBadge status="warning" text="Mantenimiento" />;
      case VehicleStatusEnum.Incident:
        return <StatusBadge status="error" text="Averiado" />;
      case VehicleStatusEnum.Idle:
        return <StatusBadge status="pending" text="Inactivo" />;
      case VehicleStatusEnum.Refueling:
        return <StatusBadge status="pending" text="Abasteciendo" />;
      case VehicleStatusEnum.Reloading:
        return <StatusBadge status="pending" text="Recargando" />;
      default:
        return <StatusBadge status="pending" text="Desconocido" />;
    }
  };

  // Define table columns
  const columns = [
    {
      header: "ID",
      accessorKey: "id" as keyof VehicleDTO,
      className: "font-medium",
    },
    {
      header: "Tipo",
      accessorKey: "type" as keyof VehicleDTO,
      cell: (vehicle: VehicleDTO) => {
        const type = vehicle.type || "";
        return <span>Tipo {type.toUpperCase()}</span>;
      },
    },
    {
      header: "Capacidad GLP",
      accessorKey: "glpCapacityM3" as keyof VehicleDTO,
      cell: (vehicle: VehicleDTO) =>
        `${vehicle.glpCapacityM3?.toFixed(2) || "0"} m³`,
    },
    {
      header: "GLP Actual",
      accessorKey: "currentGlpM3" as keyof VehicleDTO,
      cell: (vehicle: VehicleDTO) =>
        `${vehicle.currentGlpM3?.toFixed(2) || "0"} m³`,
    },
    {
      header: "Combustible",
      accessorKey: "currentFuelGal" as keyof VehicleDTO,
      cell: (vehicle: VehicleDTO) => (
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
            <div
              className="bg-primary h-2.5 rounded-full"
              style={{
                width: `${vehicle.fuelCapacityGal ? ((vehicle.currentFuelGal || 0) / vehicle.fuelCapacityGal) * 100 : 0}%`,
              }}
            />
          </div>
          <span className="text-xs">
            {vehicle.currentFuelGal?.toFixed(1) || "0"}/
            {vehicle.fuelCapacityGal?.toFixed(1) || "0"} gal
          </span>
        </div>
      ),
    },
    {
      header: "Posición",
      accessorKey: (vehicle: VehicleDTO) => formatPosition(vehicle),
    },
    {
      header: "Estado",
      accessorKey: "status" as keyof VehicleDTO,
      cell: (vehicle: VehicleDTO) => getVehicleStatus(vehicle.status),
    },
  ];

  // Define filter tabs
  const filterTabs = useMemo(() => [
    {
      id: "disponibles",
      label: "Disponibles",
      icon: <Truck className="h-4 w-4" />,
      count: availableCount,
      filter: (vehicle: VehicleDTO) =>
        vehicle.status === VehicleStatusEnum.Available,
    },
    {
      id: "en-ruta",
      label: "En Ruta",
      icon: <TruckIcon className="h-4 w-4" />,
      count: inRouteCount,
      filter: (vehicle: VehicleDTO) =>
        vehicle.status === VehicleStatusEnum.Driving,
    },
    {
      id: "mantenimiento",
      label: "Mantenimiento",
      icon: <Wrench className="h-4 w-4" />,
      count: maintenanceCount,
      filter: (vehicle: VehicleDTO) =>
        vehicle.status === VehicleStatusEnum.Maintenance,
    },
    {
      id: "averiados",
      label: "Averiados",
      icon: <AlertTriangle className="h-4 w-4" />,
      count: incidentCount,
      filter: (vehicle: VehicleDTO) =>
        vehicle.status === VehicleStatusEnum.Incident,
    },
  ], [availableCount, inRouteCount, maintenanceCount, incidentCount]);

  // Define actions
  const actions = [
    {
      id: "service",
      label: "Enviar a mantenimiento",
      icon: <Wrench className="h-4 w-4" />,
      onClick: (vehicle: VehicleDTO) =>
        void updateVehicleStatus(vehicle.id || "", VehicleStatusEnum.Maintenance),
      hidden: (vehicle: VehicleDTO) =>
        vehicle.status === VehicleStatusEnum.Maintenance,
    },
    {
      id: "report",
      label: "Reportar avería",
      icon: <AlertTriangle className="h-4 w-4" />,
      onClick: (vehicle: VehicleDTO) =>
        void updateVehicleStatus(vehicle.id || "", VehicleStatusEnum.Incident),
      hidden: (vehicle: VehicleDTO) =>
        vehicle.status === VehicleStatusEnum.Incident,
    },
    {
      id: "available",
      label: "Marcar como disponible",
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (vehicle: VehicleDTO) =>
        void updateVehicleStatus(vehicle.id || "", VehicleStatusEnum.Available),
      hidden: (vehicle: VehicleDTO) =>
        vehicle.status === VehicleStatusEnum.Available ||
        vehicle.status === VehicleStatusEnum.Driving,
    },
    {
      id: "delete",
      label: "Eliminar vehículo",
      icon: <Plus className="h-4 w-4 rotate-45" />,
      onClick: (vehicle: VehicleDTO) => {
        if (vehicle.id) {
          void deleteVehicle(vehicle.id);
        }
      },
    },
  ];

  // Filtrar datos según la pestaña activa y búsqueda
  const filteredData = useMemo(() => {
    let result = [...vehicles];

    // Filtrar por pestaña
    if (activeTab !== "todos") {
      const tabFilter = filterTabs.find((tab) => tab.id === activeTab);
      if (tabFilter) {
        result = result.filter(tabFilter.filter);
      }
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      result = result.filter(
        (vehicle) =>
          vehicle.id
            ?.toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (vehicle.type &&
            vehicle.type.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

    return result;
  }, [vehicles, activeTab, filterTabs, searchTerm]);

  // Reset filters handler
  const handleResetFilters = () => {
    setFilterType(undefined);
    setMinGlp(undefined);
    setMinFuel(undefined);
    // Refresh data with cleared filters
    void refetch();
  };

  // Manejar cambio de pestaña
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when changing tab
  };

  return (
    <PageLayout
      title="Gestión de Vehículos"
      description="Administración de la flota de vehículos para distribución"
      actions={[
        {
          icon: <Upload className="h-4 w-4" />,
          label: "Importar",
          variant: "outline",
          onClick: () => setImportOpen(true),
        },
        {
          icon: <Plus className="h-4 w-4" />,
          label: "Nuevo Vehículo",
          onClick: () => setNewOpen(true),
        },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border">
          <CardContent className="p-4 flex items-center">
            <div className="bg-green-50 p-3 rounded-md mr-3">
              <Truck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Disponibles</div>
              <div className="text-2xl font-semibold">{availableCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border">
          <CardContent className="p-4 flex items-center">
            <div className="bg-blue-50 p-3 rounded-md mr-3">
              <TruckIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">En Ruta</div>
              <div className="text-2xl font-semibold">{inRouteCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border">
          <CardContent className="p-4 flex items-center">
            <div className="bg-amber-50 p-3 rounded-md mr-3">
              <Wrench className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Mantenimiento</div>
              <div className="text-2xl font-semibold">{maintenanceCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border">
          <CardContent className="p-4 flex items-center">
            <div className="bg-red-50 p-3 rounded-md mr-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Averiados</div>
              <div className="text-2xl font-semibold">{incidentCount}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <SectionContainer
        title="Flota de Vehículos"
        description="Gestione el estado y la información de su flota de distribución"
        icon={<Truck className="h-5 w-5" />}
        variant="card"
        className="p-4"
      >
        {/* Add filter controls */}
        <div className="mb-4">
          <TableFilterControls
            filters={[
              {
                id: "type",
                label: "Tipo",
                type: "select",
                options: [
                  { value: "TA", label: "Tipo TA" },
                  { value: "TB", label: "Tipo TB" },
                  { value: "TC", label: "Tipo TC" },
                  { value: "TD", label: "Tipo TD" },
                ],
                value: filterType,
                onChange: (value: string | number | undefined) => {
                  setFilterType(value as ListTypeEnum);
                  setCurrentPage(1); // Reset to first page when changing filter
                  void refetch();
                },
              },
              {
                id: "minGlp",
                label: "GLP (m³)",
                type: "number",
                value: minGlp,
                onChange: (value: string | number | undefined) => {
                  setMinGlp(value as number);
                  setCurrentPage(1); // Reset to first page when changing filter
                  void refetch();
                },
              },
              {
                id: "minFuel",
                label: "Combustible (gal)",
                type: "number",
                value: minFuel,
                onChange: (value: string | number | undefined) => {
                  setMinFuel(value as number);
                  setCurrentPage(1); // Reset to first page when changing filter
                  void refetch();
                },
              },
            ]}
            onReset={handleResetFilters}
          />
        </div>

        {/* Search and Filter Tabs */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <TableSearch
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por ID o tipo..."
            />
          </div>

          <TableFilterTabs
            filterTabs={filterTabs}
            data={vehicles}
            activeFilter={activeTab}
            onFilterChange={handleTabChange}
          />

          <DataTable
            data={filteredData}
            columns={columns}
            actions={actions}
            isLoading={loading}
            error={error}
            noDataMessage="No se encontraron vehículos con los filtros seleccionados."
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
        </div>
      </SectionContainer>

      {/* Modal de registro de vehículo */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2 text-primary" />
              <span>Registro de Vehículo</span>
            </DialogTitle>
            <DialogDescription>
              Añade un nuevo vehículo a la flota
            </DialogDescription>
          </DialogHeader>
          <Divider className="my-2" />
          <VehicleForm onClose={() => setNewOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Modal de importación de vehículos */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2 text-primary" />
              <span>Carga Masiva de Vehículos</span>
            </DialogTitle>
            <DialogDescription>
              Sube un archivo CSV con vehículos
            </DialogDescription>
          </DialogHeader>
          <Divider className="my-2" />
          <VehicleUploadForm onClose={() => setImportOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmación</DialogTitle>
            <DialogDescription>{confirmMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setConfirmOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de éxito */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Éxito</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-6">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="text-lg font-semibold">Registro correcto</p>
            <Button onClick={() => setSuccessOpen(false)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
