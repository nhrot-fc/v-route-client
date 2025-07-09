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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DataTableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessorKey: keyof T | ((item: T) => React.ReactNode);
    className?: string;
    cell?: (item: T) => React.ReactNode;
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
  className?: string;
  footerContent?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  actions,
  noDataMessage = "No hay datos disponibles",
  isLoading,
  error,
  className,
  footerContent,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 min-h-[300px]">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium">Error al cargar los datos</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Intentar nuevamente
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Table */}
      {data.length > 0 ? (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, i) => (
                  <TableHead key={i} className={cn(column.className)}>
                    {column.header}
                  </TableHead>
                ))}
                {actions && actions.length > 0 && (
                  <TableHead className="w-[80px]">Acciones</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column, colIndex) => {
                    // Handle both simple accessorKey and function accessorKey
                    const cell =
                      typeof column.accessorKey === "function"
                        ? column.accessorKey(row)
                        : column.cell
                          ? column.cell(row)
                          : String(row[column.accessorKey as keyof T] || "");

                    return (
                      <TableCell
                        key={colIndex}
                        className={cn(column.className)}
                      >
                        {cell}
                      </TableCell>
                    );
                  })}
                  {actions && actions.length > 0 && (
                    <TableCell className="p-2">
                      <div className="flex justify-end gap-2">
                        {actions.map(
                          (action) =>
                            (!action.hidden || !action.hidden(row)) && (
                              <Button
                                key={action.id}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => action.onClick(row)}
                                title={action.label}
                              >
                                {action.icon || (
                                  <MoreHorizontal className="h-4 w-4" />
                                )}
                                <span className="sr-only">{action.label}</span>
                              </Button>
                            ),
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4 min-h-[200px]">
            <p className="text-sm text-muted-foreground">{noDataMessage}</p>
          </CardContent>
        </Card>
      )}

      {/* Custom footer content */}
      {footerContent && <div>{footerContent}</div>}
    </div>
  );
}
