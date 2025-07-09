import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MaintenanceUploadForm } from "@/components/maintenance/maintenance-upload-form";
import { MaintenanceForm } from "@/components/maintenance/maintenance-form";
import { PageLayout } from "@/components/ui/page-layout";
import { DataTable } from "@/components/ui/data-table";
import { SectionContainer } from "@/components/ui/section-container";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Divider } from "@/components/ui/divider";
import {
  Wrench,
  FileUp,
  Plus,
  ClipboardList,
  Timer,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useMaintenance } from "@/hooks/use-maintenance";
import { type MaintenanceDTO } from "@/lib/api-client";
import { PaginationFooter } from "@/components/ui/pagination-footer";
import { TableFilterTabs } from "@/components/ui/table-filter-tabs";

export default function MantenimientosPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [newOpen, setNewOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Use pagination parameters in the hook
  const { maintenance, loading, error, totalItems, totalPages } =
    useMaintenance(undefined, {
      page: currentPage - 1,
      size: pageSize,
    });

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Count maintenance by status
  const pendingCount = maintenance.filter(
    (item) => !item.active && !item.realEnd
  ).length;
  const activeCount = maintenance.filter((item) => item.active).length;
  const completedCount = maintenance.filter(
    (item) => !item.active && item.realEnd
  ).length;
  const totalCount = maintenance.length;

  // Define maintenance status function
  const getMaintenanceStatus = (item: MaintenanceDTO) => {
    if (item.active === false && item.realEnd) {
      return <StatusBadge status="success" text="Completado" />;
    } else if (item.active === true) {
      return <StatusBadge status="info" text="En Proceso" />;
    } else {
      return <StatusBadge status="warning" text="Pendiente" />;
    }
  };

  // Define table columns
  const columns = [
    {
      header: "ID",
      accessorKey: "id" as keyof MaintenanceDTO,
      className: "font-medium",
    },
    {
      header: "Vehículo",
      accessorKey: "vehicleId" as keyof MaintenanceDTO,
    },
    {
      header: "Fecha Asignada",
      accessorKey: "assignedDate" as keyof MaintenanceDTO,
      cell: (item: MaintenanceDTO) =>
        item.assignedDate
          ? new Date(item.assignedDate).toLocaleDateString()
          : "N/A",
    },
    {
      header: "Inicio Real",
      accessorKey: "realStart" as keyof MaintenanceDTO,
      cell: (item: MaintenanceDTO) =>
        item.realStart
          ? new Date(item.realStart).toLocaleDateString()
          : "Pendiente",
    },
    {
      header: "Fin Real",
      accessorKey: "realEnd" as keyof MaintenanceDTO,
      cell: (item: MaintenanceDTO) =>
        item.realEnd
          ? new Date(item.realEnd).toLocaleDateString()
          : "Pendiente",
    },
    {
      header: "Duración (horas)",
      accessorKey: "durationHours" as keyof MaintenanceDTO,
      cell: (item: MaintenanceDTO) => item.durationHours || "N/A",
    },
    {
      header: "Estado",
      accessorKey: "status" as keyof MaintenanceDTO,
      cell: (item: MaintenanceDTO) => getMaintenanceStatus(item),
    },
  ];

  // Define filter tabs
  const filterTabs = useMemo(
    () => [
      {
        id: "activo",
        label: "En Proceso",
        icon: <Timer className="h-4 w-4" />,
        count: activeCount,
        filter: (item: MaintenanceDTO) => item.active === true,
      },
      {
        id: "pendiente",
        label: "Pendientes",
        icon: <AlertTriangle className="h-4 w-4" />,
        count: pendingCount,
        filter: (item: MaintenanceDTO) =>
          item.active === false && !item.realEnd,
      },
      {
        id: "completado",
        label: "Completados",
        icon: <CheckCircle className="h-4 w-4" />,
        count: completedCount,
        filter: (item: MaintenanceDTO) =>
          item.active === false && !!item.realEnd,
      },
    ],
    [activeCount, completedCount, pendingCount]
  );

  // Filtrar datos según la pestaña activa
  const filteredData = useMemo(() => {
    if (activeTab === "list" || !activeTab) {
      return maintenance;
    }
    const tabFilter = filterTabs.find((tab) => tab.id === activeTab);
    return tabFilter ? maintenance.filter(tabFilter.filter) : maintenance;
  }, [maintenance, activeTab, filterTabs]);

  return (
    <PageLayout
      title="Gestión de Mantenimientos"
      description="Administre los mantenimientos programados y repare los vehículos para mantener la flota operativa"
      actions={[
        {
          icon: <FileUp className="h-4 w-4" />,
          label: "Importar",
          variant: "outline",
          onClick: () => setImportOpen(true),
        },
        {
          icon: <Plus className="h-4 w-4" />,
          label: "Nuevo Mantenimiento",
          onClick: () => setNewOpen(true),
        },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border">
          <CardContent className="p-4 flex items-center">
            <div className="bg-primary-50 p-3 rounded-md mr-3">
              <ClipboardList className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-2xl font-semibold">{totalCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border">
          <CardContent className="p-4 flex items-center">
            <div className="bg-blue-50 p-3 rounded-md mr-3">
              <Timer className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">En Proceso</div>
              <div className="text-2xl font-semibold">{activeCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border">
          <CardContent className="p-4 flex items-center">
            <div className="bg-amber-50 p-3 rounded-md mr-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Pendientes</div>
              <div className="text-2xl font-semibold">{pendingCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border">
          <CardContent className="p-4 flex items-center">
            <div className="bg-green-50 p-3 rounded-md mr-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Completados</div>
              <div className="text-2xl font-semibold">{completedCount}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <SectionContainer
        title="Mantenimientos de Flota"
        description="Gestione los mantenimientos programados para los vehículos"
        icon={<Wrench className="h-5 w-5" />}
        variant="card"
        className="p-4"
      >
        <TableFilterTabs
          filterTabs={filterTabs}
          data={maintenance}
          activeFilter={activeTab}
          onFilterChange={setActiveTab}
        />

        <DataTable
          data={filteredData}
          columns={columns}
          isLoading={loading}
          error={error}
          noDataMessage="No se encontraron registros de mantenimiento con los filtros seleccionados."
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
      </SectionContainer>

      {/* Modal de nuevo mantenimiento */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2 text-primary" />
              <span>Registro de Mantenimiento</span>
            </DialogTitle>
            <DialogDescription>
              Añade un nuevo mantenimiento programado
            </DialogDescription>
          </DialogHeader>
          <Divider className="my-2" />
          <MaintenanceForm />
        </DialogContent>
      </Dialog>

      {/* Modal de importación de mantenimientos */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileUp className="h-5 w-5 mr-2 text-primary" />
              <span>Carga Masiva de Mantenimientos</span>
            </DialogTitle>
            <DialogDescription>
              Sube un archivo de texto con mantenimientos
            </DialogDescription>
          </DialogHeader>
          <Divider className="my-2" />
          <MaintenanceUploadForm />
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
