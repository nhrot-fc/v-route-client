"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BlockageUploadForm } from "@/components/blockages/blockage-upload-form";
import { BlockageForm } from "@/components/blockages/blockage-form";
import { PageLayout } from "@/components/ui/page-layout";
import { DataTable } from "@/components/ui/data-table";
import { SectionContainer } from "@/components/ui/section-container";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Divider } from "@/components/ui/divider";
import { StatusBadge } from "@/components/ui/status-badge";
import { useBlockages } from "@/hooks/use-blockages";
import { AlertTriangle, FileUp, Plus, List, Map, MapPin, Calendar, Clock, X } from "lucide-react";
import { Blockage } from "@/lib/api-client";
import { PaginationFooter } from "@/components/ui/pagination-footer";
import { TableFilterTabs } from "@/components/ui/table-filter-tabs";

export default function BlockagesPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [newOpen, setNewOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Use pagination parameters in the hook
  const { blockages, loading, error, deleteBlockage, totalItems, totalPages } = useBlockages({
    page: currentPage - 1, // API uses 0-based index
    size: pageSize
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
  
  // Count blockages by status
  const activeBlockages = blockages.filter(blockage => {
    const now = new Date();
    const start = blockage.startTime ? new Date(blockage.startTime) : null;
    const end = blockage.endTime ? new Date(blockage.endTime) : null;
    return start && end && start <= now && end >= now;
  }).length;
  
  const upcomingBlockages = blockages.filter(blockage => {
    const now = new Date();
    const start = blockage.startTime ? new Date(blockage.startTime) : null;
    return start && start > now;
  }).length;
  
  const expiredBlockages = blockages.filter(blockage => {
    const now = new Date();
    const end = blockage.endTime ? new Date(blockage.endTime) : null;
    return end && end < now;
  }).length;
  
  const totalBlockages = blockages.length;
  
  // Format date and time
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("es-ES", { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatLinePoints = (linePoints?: string) => {
    if (!linePoints) return "-";
    
    // Split by commas to get all coordinates
    const coords = linePoints.split(',').map(Number);
    
    // Check if we have valid coordinates (must be even number)
    if (coords.length < 2 || coords.length % 2 !== 0) return linePoints;
    
    // Create pairs of coordinates and format them
    const points = [];
    for (let i = 0; i < coords.length; i += 2) {
      points.push(`(${coords[i]}, ${coords[i+1]})`);
    }
    
    // Join with arrows
    return points.join(' → ');
  };
  
  // Define blockage status function
  const getBlockageStatus = (blockage: Blockage) => {
    const now = new Date();
    const start = blockage.startTime ? new Date(blockage.startTime) : null;
    const end = blockage.endTime ? new Date(blockage.endTime) : null;
    
    if (start && end) {
      if (now < start) {
        return <StatusBadge status="pending" text="Programado" />;
      } else if (now >= start && now <= end) {
        return <StatusBadge status="error" text="Activo" />;
      } else {
        return <StatusBadge status="success" text="Finalizado" />;
      }
    }
    
    return <StatusBadge status="warning" text="Sin fecha" />;
  };

  // Define table columns
  const columns = [
    {
      header: "Fecha Inicio",
      accessorKey: "startTime" as keyof Blockage,
      cell: (blockage: Blockage) => (
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-primary-600" />
          {formatDate(blockage.startTime)}
        </div>
      ),
    },
    {
      header: "Hora Inicio",
      accessorKey: "startTimeHour" as keyof Blockage,
      cell: (blockage: Blockage) => (
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4 text-primary-600" />
          {formatTime(blockage.startTime)}
        </div>
      ),
    },
    {
      header: "Fecha Fin",
      accessorKey: "endTime" as keyof Blockage,
      cell: (blockage: Blockage) => (
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-primary-600" />
          {formatDate(blockage.endTime)}
        </div>
      ),
    },
    {
      header: "Hora Fin",
      accessorKey: "endTimeHour" as keyof Blockage,
      cell: (blockage: Blockage) => (
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4 text-primary-600" />
          {formatTime(blockage.endTime)}
        </div>
      ),
    },
    {
      header: "Nodos",
      accessorKey: "linePoints" as keyof Blockage,
      cell: (blockage: Blockage) => (
        <div className="flex items-center">
          <MapPin className="mr-2 h-4 w-4 text-primary-600" />
          <div className="max-w-xs truncate" title={formatLinePoints(blockage.linePoints)}>
            {formatLinePoints(blockage.linePoints)}
          </div>
        </div>
      ),
    },
    {
      header: "Estado",
      accessorKey: "status" as keyof Blockage,
      cell: (blockage: Blockage) => getBlockageStatus(blockage),
    },
  ];

  // Define filter tabs
  const filterTabs = [
    {
      id: "activos",
      label: "Activos",
      icon: <AlertTriangle className="h-4 w-4" />,
      count: activeBlockages,
      filter: (blockage: Blockage) => {
        const now = new Date();
        const start = blockage.startTime ? new Date(blockage.startTime) : null;
        const end = blockage.endTime ? new Date(blockage.endTime) : null;
        return !!(start && end && start <= now && end >= now);
      },
    },
    {
      id: "programados",
      label: "Programados",
      icon: <Calendar className="h-4 w-4" />,
      count: upcomingBlockages,
      filter: (blockage: Blockage) => {
        const now = new Date();
        const start = blockage.startTime ? new Date(blockage.startTime) : null;
        return !!(start && start > now);
      },
    },
    {
      id: "finalizados",
      label: "Finalizados",
      icon: <Clock className="h-4 w-4" />,
      count: expiredBlockages,
      filter: (blockage: Blockage) => {
        const now = new Date();
        const end = blockage.endTime ? new Date(blockage.endTime) : null;
        return !!(end && end < now);
      },
    },
  ];
  
  // Define actions
  const actions = [
    {
      id: "delete",
      label: "Eliminar bloqueo",
      icon: <X className="h-4 w-4" />,
      onClick: (blockage: Blockage) => {
        if (blockage.id) {
          deleteBlockage(blockage.id);
        }
      },
    },
  ];

  // Filtrar datos según la pestaña activa
  const filteredData = React.useMemo(() => {
    if (activeTab === "list" || !activeTab) {
      return blockages;
    }
    const tabFilter = filterTabs.find(tab => tab.id === activeTab);
    return tabFilter ? blockages.filter(tabFilter.filter) : blockages;
  }, [blockages, activeTab, filterTabs]);

  return (
    <PageLayout
      title="Gestión de Bloqueos" 
      description="Administre los bloqueos programados en las calles y configure restricciones de rutas"
      actions={[
        { 
          icon: <FileUp className="h-4 w-4" />, 
          label: "Importar", 
          variant: "outline",
          onClick: () => setImportOpen(true)
        },
        { 
          icon: <Plus className="h-4 w-4" />, 
          label: "Nuevo Bloqueo", 
          onClick: () => setNewOpen(true)
        }
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border">
          <CardContent className="p-4 flex items-center">
            <div className="bg-primary-50 p-3 rounded-md mr-3">
              <List className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-2xl font-semibold">{totalBlockages}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border">
          <CardContent className="p-4 flex items-center">
            <div className="bg-red-50 p-3 rounded-md mr-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Activos</div>
              <div className="text-2xl font-semibold">{activeBlockages}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border">
          <CardContent className="p-4 flex items-center">
            <div className="bg-amber-50 p-3 rounded-md mr-3">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Programados</div>
              <div className="text-2xl font-semibold">{upcomingBlockages}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border">
          <CardContent className="p-4 flex items-center">
            <div className="bg-green-50 p-3 rounded-md mr-3">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Finalizados</div>
              <div className="text-2xl font-semibold">{expiredBlockages}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <SectionContainer
        title="Bloqueos de Calles"
        description="Lista de bloqueos programados en las calles"
        icon={<Map className="h-5 w-5" />}
        variant="card"
        className="p-4"
      >
        <TableFilterTabs
          filterTabs={filterTabs}
          data={blockages}
          activeFilter={activeTab}
          onFilterChange={setActiveTab}
        />

        <DataTable
          data={filteredData}
          columns={columns}
          actions={actions}
          isLoading={loading}
          error={error}
          noDataMessage="No se encontraron bloqueos con los filtros seleccionados."
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

      {/* Modal de nuevo bloqueo */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2 text-primary" />
              <span>Registro de Bloqueo</span>
            </DialogTitle>
            <DialogDescription>Añade un nuevo bloqueo programado</DialogDescription>
          </DialogHeader>
          <Divider className="my-2" />
          <BlockageForm />
        </DialogContent>
      </Dialog>

      {/* Modal de importación de bloqueos */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileUp className="h-5 w-5 mr-2 text-primary" />
              <span>Carga Masiva de Bloqueos</span>
            </DialogTitle>
            <DialogDescription>Sube un archivo de texto con bloqueos</DialogDescription>
          </DialogHeader>
          <Divider className="my-2" />
          <BlockageUploadForm />
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
} 