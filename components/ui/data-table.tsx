"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, Loader2, Download, MoreHorizontal, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DataTableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessorKey: keyof T | ((item: T) => React.ReactNode);
    className?: string;
    enableSorting?: boolean;
    cell?: (item: T) => React.ReactNode;
  }[];
  searchable?: {
    field: keyof T;
    placeholder?: string;
  };
  filterTabs?: {
    id: string;
    label: string;
    icon?: React.ReactNode;
    count?: number;
    filter: (item: T) => boolean;
  }[];
  actions?: {
    id: string;
    label: string;
    icon?: React.ReactNode;
    onClick: (item: T) => void;
    hidden?: (item: T) => boolean;
  }[];
  noDataMessage?: string;
  isLoading?: boolean;
  error?: string | null;
  onDownload?: () => void;
  className?: string;
  activeFilter?: string;
  onFilterChange?: (id: string) => void;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  pagination?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  searchable,
  filterTabs,
  actions,
  noDataMessage = "No hay datos disponibles",
  isLoading,
  error,
  onDownload,
  className,
  activeFilter = "all",
  onFilterChange,
  headerContent,
  footerContent,
  pagination = true,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Apply filters and search
  const filteredData = React.useMemo(() => {
    let result = [...data];

    // Apply active filter tab
    if (filterTabs && activeFilter !== "all") {
      const activeTabFilter = filterTabs.find((tab) => tab.id === activeFilter);
      if (activeTabFilter) {
        result = result.filter(activeTabFilter.filter);
      }
    }

    // Apply search
    if (searchable && searchTerm) {
      result = result.filter((item) => {
        const value = item[searchable.field];
        if (typeof value === "string") {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (typeof value === "number") {
          return value.toString().includes(searchTerm);
        }
        return false;
      });
    }

    return result;
  }, [data, searchTerm, filterTabs, activeFilter, searchable]);

  // Apply pagination
  const paginatedData = React.useMemo(() => {
    if (!pagination) return filteredData;
    
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize, pagination]);

  // Calculate total pages
  const totalPages = React.useMemo(() => {
    if (!pagination) return 1;
    return Math.max(1, Math.ceil(filteredData.length / pageSize));
  }, [filteredData.length, pageSize, pagination]);

  // Reset to first page when filters change or page size changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter, pageSize]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are less than maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of middle pages
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the beginning
      if (currentPage <= 3) {
        startPage = 2;
        endPage = Math.min(4, totalPages - 1);
      }
      
      // Adjust if at the end
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3);
        endPage = totalPages - 1;
      }
      
      // Add ellipsis before middle pages if needed
      if (startPage > 2) {
        pages.push(-1); // -1 represents ellipsis
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis after middle pages if needed
      if (endPage < totalPages - 1) {
        pages.push(-2); // -2 represents ellipsis
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Cargando datos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4 flex items-center text-red-800">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Error: {error}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with search and filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          {searchable && (
            <div className="relative flex-grow max-w-lg">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchable.placeholder || "Buscar..."}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {headerContent}
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
                className="h-9"
              >
                <Download className="h-4 w-4 mr-1" />
                Exportar
              </Button>
            )}
          </div>
        </div>

        {filterTabs && filterTabs.length > 0 && (
          <Tabs
            value={activeFilter}
            onValueChange={onFilterChange}
            className="w-full"
          >
            <TabsList className="bg-muted/60">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-card"
              >
                Todos
              </TabsTrigger>
              {filterTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-card flex items-center gap-1"
                >
                  {tab.icon && <span>{tab.icon}</span>}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="ml-1 rounded-full bg-primary-50 text-primary-800 px-2 py-0.5 text-xs font-medium">
                      {tab.count}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>

      {filteredData.length > 0 ? (
        <Card className="bg-white overflow-hidden">
          <div className="rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  {columns.map((column, i) => (
                    <TableHead
                      key={i}
                      className={cn("font-medium", column.className)}
                    >
                      {column.header}
                    </TableHead>
                  ))}
                  {actions && actions.length > 0 && (
                    <TableHead className="w-[100px] text-right">Acciones</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((column, colIndex) => (
                      <TableCell
                        key={colIndex}
                        className={cn(column.className)}
                      >
                        {column.cell
                          ? column.cell(row)
                          : typeof column.accessorKey === "function"
                          ? column.accessorKey(row)
                          : String(row[column.accessorKey] || "")}
                      </TableCell>
                    ))}
                    {actions && actions.length > 0 && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {actions
                            .filter((action) => !action.hidden || !action.hidden(row))
                            .map((action) => (
                              <Button
                                key={action.id}
                                variant="ghost"
                                size="icon"
                                onClick={() => action.onClick(row)}
                                title={action.label}
                              >
                                {action.icon || <MoreHorizontal className="h-4 w-4" />}
                                <span className="sr-only">{action.label}</span>
                              </Button>
                            ))}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {pagination && filteredData.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Mostrar</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => setPageSize(Number(value))}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                  </SelectContent>
                </Select>
                <span>por página</span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, filteredData.length)} de{" "}
                {filteredData.length} registros
              </div>
              
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                    />
                  </PaginationItem>
                  
                  {getPageNumbers().map((pageNumber, i) => {
                    if (pageNumber < 0) {
                      // Render ellipsis
                      return (
                        <PaginationItem key={`ellipsis-${i}`}>
                          <span className="flex h-9 w-9 items-center justify-center">...</span>
                        </PaginationItem>
                      );
                    }
                    
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          isActive={pageNumber === currentPage}
                          onClick={() => setCurrentPage(pageNumber)}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </Card>
      ) : (
        <Card className="bg-white">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">{noDataMessage}</p>
          </CardContent>
        </Card>
      )}

      {footerContent && (
        <div className="pt-2">{footerContent}</div>
      )}
    </div>
  );
} 