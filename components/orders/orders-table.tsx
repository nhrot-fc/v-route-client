"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, MoreHorizontal, Pencil, Trash2, TruckIcon } from "lucide-react";
import { useOrders } from "@/hooks/use-orders";
import { Order } from "@/lib/api-client";
import { useMemo } from "react";

interface OrdersTableProps {
  filter?: string;
  search?: string; // ← nueva prop
}

export function OrdersTable({ filter, search }: OrdersTableProps) {
  const { orders, loading, error, deleteOrder, recordDelivery } = useOrders(filter);
  const q = search?.trim().toLowerCase() ?? "";

  const filtered = useMemo(() => {
    if (!q) return orders;
    return orders.filter((order) => order.id?.toLowerCase().includes(q));
  }, [orders, q]);

  const getOrderStatus = (order: Order) => {
    if (order.deliveryDate) return "entregado";
    if (order.remainingGLP === 0) return "en-ruta";
    return "pendiente";
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "entregado":
        return "default";
      case "en-ruta":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta orden?")) {
      await deleteOrder(id);
    }
  };

  const handleRecordDelivery = async (id: string, amount: number) => {
    await recordDelivery(id, amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando órdenes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600">
        <AlertTriangle className="h-8 w-8 mr-2" />
        <span>Error al cargar órdenes: {error}</span>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Volumen Solicitado</TableHead>
          <TableHead>Volumen Restante</TableHead>
          <TableHead>Fecha Llegada</TableHead>
          <TableHead>Fecha Límite</TableHead>
          <TableHead>Ubicación</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-gray-500 py-6">
              No se encontraron órdenes
            </TableCell>
          </TableRow>
        ) : (
          filtered.map((order) => {
            const status = getOrderStatus(order);
            return (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.glpRequest} L</TableCell>
                <TableCell>{order.remainingGLP} L</TableCell>
                <TableCell>
                  {order.arriveDate
                    ? new Date(order.arriveDate).toLocaleString("es-ES")
                    : "-"}
                </TableCell>
                <TableCell>
                  {order.dueDate
                    ? new Date(order.dueDate).toLocaleString("es-ES")
                    : "-"}
                </TableCell>
                <TableCell>
                  {order.position
                    ? `(${order.position.x}, ${order.position.y})`
                    : "-"}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(status)}>
                    {status === "entregado"
                      ? "Entregado"
                      : status === "en-ruta"
                      ? "En Ruta"
                      : "Pendiente"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Ver detalles</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          handleRecordDelivery(
                            order.id!,
                            order.remainingGLP || 0
                          )
                        }
                        disabled={status === "entregado"}
                      >
                        <TruckIcon className="mr-2 h-4 w-4" />
                        <span>Registrar entrega</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(order.id!)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Eliminar</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
