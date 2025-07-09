"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageLayout } from "@/components/ui/page-layout";
import { Divider } from "@/components/ui/divider";
import { SectionContainer } from "@/components/ui/section-container";
import { OrderUploadForm } from "@/components/orders/order-upload-form";
import OrderForm from "@/components/orders/order-form";
import { useOrders } from "@/hooks/use-orders";
import { StatusBadge } from "@/components/ui/status-badge";
import { OrderDTO } from "@/lib/api-client";
import { PaginationFooter } from "@/components/ui/pagination-footer";
import { DataTable } from "@/components/ui/data-table";
import { TableFilterTabs } from "@/components/ui/table-filter-tabs";
import { TableSearch } from "@/components/ui/table-search";
import { TableFilterControls } from "@/components/ui/table-filter-controls";

import {
  Plus,
  Upload,
  Truck,
  CheckCircle,
  ClipboardList,
  MapPin,
  Timer,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Extend the OrderDTO type to handle our custom fields
interface OrderWithStatus extends OrderDTO {
  isInRoute?: boolean;
}

export default function PedidosPage() {
  const [activeTab, setActiveTab] = useState("todos");
  // Key to reset OrderForm instance
  const [orderFormInstanceKey, setOrderFormInstanceKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Add filter state
  const [overdueAt, setOverdueAt] = useState<string | undefined>(undefined);

  // Use pagination parameters in the hook
  const { orders, loading, error, totalItems, totalPages, refetch } = useOrders(
    undefined,
    {
      page: currentPage - 1, // API uses 0-based index
      size: pageSize,
    },
    {
      pending:
        activeTab === "pendiente"
          ? true
          : activeTab === "entregado"
            ? false
            : undefined,
      overdueAt: overdueAt,
    },
  );

  // This function should be called by OrderForm after a new order is successfully created.
  const handleOrderAdded = () => {
    // Refresh the orders table by triggering a re-fetch in the useOrders hook
    refetch();
  };

  const handleNewPedidoClick = () => {
    // Explicitly reset the OrderForm by changing its key, forcing a re-mount
    setOrderFormInstanceKey((prevKey) => prevKey + 1);
    // Scroll to form
    document
      .getElementById("order-form-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Reset to first page when changing tabs
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Prepare orders data with additional status information
  const ordersWithStatus = orders.map((order) => {
    // In this app, we consider an order to be "in route" if it's not delivered and was assigned to something
    // Since the API doesn't directly provide a routeId field, we'll infer the status
    const isInRoute =
      !order.delivered && order.remainingGlpM3 !== order.glpRequestM3;
    return {
      ...order,
      isInRoute,
    };
  });

  // Count orders by status - this will be updated with API counts once available
  const pendingCount = ordersWithStatus.filter(
    (order) => !order.delivered && !order.isInRoute,
  ).length;
  const inRouteCount = ordersWithStatus.filter(
    (order) => !order.delivered && order.isInRoute,
  ).length;
  const deliveredCount = ordersWithStatus.filter(
    (order) => order.delivered,
  ).length;

  // Define table columns
  const columns = [
    {
      header: "ID",
      accessorKey: "id" as keyof OrderWithStatus,
      className: "font-medium",
    },
    {
      header: "Hora Llegada",
      accessorKey: "arrivalTime" as keyof OrderWithStatus,
      cell: (order: OrderWithStatus) =>
        order.arrivalTime
          ? new Date(order.arrivalTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
    },
    {
      header: "Fecha Límite",
      accessorKey: "deadlineTime" as keyof OrderWithStatus,
      cell: (order: OrderWithStatus) =>
        order.deadlineTime
          ? new Date(order.deadlineTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
    },
    {
      header: "GLP Solicitado",
      accessorKey: "glpRequestM3" as keyof OrderWithStatus,
      cell: (order: OrderWithStatus) =>
        `${order.glpRequestM3?.toFixed(2) || "0"} m³`,
    },
    {
      header: "GLP Restante",
      accessorKey: "remainingGlpM3" as keyof OrderWithStatus,
      cell: (order: OrderWithStatus) =>
        `${order.remainingGlpM3?.toFixed(2) || "0"} m³`,
    },
    {
      header: "Ubicación",
      accessorKey: (order: OrderWithStatus) =>
        order.position ? `(${order.position.x}, ${order.position.y})` : "N/A",
      cell: (order: OrderWithStatus) => (
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-1.5 text-primary-600" />
          {order.position
            ? `(${order.position.x}, ${order.position.y})`
            : "N/A"}
        </div>
      ),
    },
    {
      header: "Estado",
      accessorKey: "status" as keyof OrderWithStatus,
      cell: (order: OrderWithStatus) => {
        if (order.delivered) {
          return <StatusBadge status="success" text="Entregado" />;
        } else if (order.isInRoute) {
          return <StatusBadge status="info" text="En Ruta" />;
        } else {
          return <StatusBadge status="warning" text="Pendiente" />;
        }
      },
    },
  ];

  // Define filter tabs
  const filterTabs = [
    {
      id: "pendiente",
      label: "Pendientes",
      icon: <Timer className="h-4 w-4" />,
      count: pendingCount,
      filter: (order: OrderWithStatus) => !order.delivered && !order.isInRoute,
    },
    {
      id: "en-ruta",
      label: "En Ruta",
      icon: <Truck className="h-4 w-4" />,
      count: inRouteCount,
      filter: (order: OrderWithStatus) => !order.delivered && !!order.isInRoute,
    },
    {
      id: "entregado",
      label: "Entregados",
      icon: <CheckCircle className="h-4 w-4" />,
      count: deliveredCount,
      filter: (order: OrderWithStatus) => !!order.delivered,
    },
  ];

  // Define actions
  const actions = [
    {
      id: "assign",
      label: "Asignar vehículo",
      icon: <Truck className="h-4 w-4" />,
      onClick: (order: OrderWithStatus) =>
        console.log("Asignar vehículo a:", order.id),
      hidden: (order: OrderWithStatus) =>
        !!order.isInRoute || !!order.delivered,
    },
    {
      id: "edit",
      label: "Editar pedido",
      icon: <Plus className="h-4 w-4 rotate-45" />,
      onClick: (order: OrderWithStatus) => console.log("Editar:", order.id),
    },
    {
      id: "delete",
      label: "Eliminar pedido",
      icon: <Plus className="h-4 w-4 rotate-45" />,
      onClick: (order: OrderWithStatus) => console.log("Eliminar:", order.id),
    },
  ];

  // Filter data based on active tab and search term
  const filteredData = useMemo(() => {
    let result = [...ordersWithStatus];

    // Apply tab filter
    if (activeTab !== "todos") {
      const activeTabFilter = filterTabs.find((tab) => tab.id === activeTab);
      if (activeTabFilter) {
        result = result.filter(activeTabFilter.filter);
      }
    }

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (order) =>
          order.id
            ?.toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (order.position &&
            `(${order.position.x}, ${order.position.y})`
              .toLowerCase()
              .includes(searchTerm.toLowerCase())),
      );
    }

    return result;
  }, [ordersWithStatus, activeTab, searchTerm, filterTabs]);

  // Reset filters handler
  const handleResetFilters = () => {
    setOverdueAt(undefined);
    // Refresh data with cleared filters
    refetch();
  };

  return (
    <PageLayout
      title="Gestión de Pedidos"
      description="Administre las órdenes de distribución de GLP"
      actions={[
        {
          icon: <Upload className="h-4 w-4" />,
          label: "Importar",
          variant: "outline",
        },
        {
          icon: <Plus className="h-4 w-4" />,
          label: "Nuevo Pedido",
          onClick: handleNewPedidoClick,
        },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border">
          <CardContent className="p-4 flex items-center">
            <div className="bg-primary-50 p-3 rounded-md mr-3">
              <ClipboardList className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Pedidos</div>
              <div className="text-2xl font-semibold">{orders.length}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border">
          <CardContent className="p-4 flex items-center">
            <div className="bg-amber-50 p-3 rounded-md mr-3">
              <Timer className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Pendientes</div>
              <div className="text-2xl font-semibold">{pendingCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border">
          <CardContent className="p-4 flex items-center">
            <div className="bg-blue-50 p-3 rounded-md mr-3">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">En Ruta</div>
              <div className="text-2xl font-semibold">{inRouteCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border">
          <CardContent className="p-4 flex items-center">
            <div className="bg-green-50 p-3 rounded-md mr-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Entregados</div>
              <div className="text-2xl font-semibold">{deliveredCount}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <SectionContainer
        title="Registro de Pedidos"
        description="Listado de pedidos de GLP registrados en el sistema"
        icon={<ClipboardList className="h-5 w-5" />}
        variant="card"
        className="p-4"
      >
        <div className="space-y-4">
          {/* Table header with search and filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <TableSearch
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por ID o coordenadas..."
            />

            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => console.log("Exportando pedidos...")}
              >
                <Download className="h-4 w-4 mr-1.5" />
                Descargar
              </Button>
            </div>
          </div>

          {/* Filter controls */}
          <div className="mb-4">
            <TableFilterControls
              filters={[
                {
                  id: "overdueAt",
                  label: "Vencimiento",
                  type: "text",
                  value: overdueAt || "",
                  onChange: (value: string | number | undefined) => {
                    setOverdueAt(value as string);
                    setCurrentPage(1); // Reset to first page when changing filter
                    refetch();
                  },
                },
              ]}
              onReset={handleResetFilters}
            />
          </div>

          {/* Filter tabs */}
          <TableFilterTabs
            filterTabs={filterTabs}
            data={ordersWithStatus}
            activeFilter={activeTab}
            onFilterChange={handleTabChange}
          />

          {/* Data table */}
          <DataTable
            data={filteredData}
            columns={columns}
            actions={actions}
            isLoading={loading}
            error={error}
            noDataMessage="No se encontraron pedidos con los filtros seleccionados."
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

      <div className="grid gap-6 md:grid-cols-2 mt-6" id="order-form-section">
        <Card className="bg-white border overflow-hidden">
          <CardHeader className="bg-white pb-2">
            <div className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-primary" />
              <CardTitle>Registro de Pedido</CardTitle>
            </div>
            <CardDescription>Añade un nuevo pedido al sistema</CardDescription>
          </CardHeader>
          <Divider className="mx-6" />
          <CardContent className="pt-6">
            <OrderForm
              key={orderFormInstanceKey}
              onOrderAdded={handleOrderAdded}
            />
          </CardContent>
        </Card>

        <Card className="bg-white border overflow-hidden">
          <CardHeader className="bg-white pb-2">
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-primary" />
              <CardTitle>Carga Masiva</CardTitle>
            </div>
            <CardDescription>
              Importa múltiples pedidos desde archivos de texto
            </CardDescription>
          </CardHeader>
          <Divider className="mx-6" />
          <CardContent className="pt-6">
            <OrderUploadForm onOrdersUploaded={handleOrderAdded} />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
