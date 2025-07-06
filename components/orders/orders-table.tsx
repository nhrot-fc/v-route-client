"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, FileEdit, Trash2, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useOrders } from "@/hooks/use-orders";
import { OrderDTO } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

export function OrdersTable() {
  const { orders, loading, error, deleteOrder } = useOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOrder, setDeleteDialogOrder] = useState<OrderDTO | null>(null);

  // Filter orders based on search term
  const filteredOrders = orders.filter(
    (order) =>
      (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.position?.x !== undefined && 
        order.position.x.toString().includes(searchTerm.toLowerCase())) ||
      (order.position?.y !== undefined && 
        order.position.y.toString().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteClick = (order: OrderDTO) => {
    setDeleteDialogOrder(order);
  };

  const handleDelete = async (id: string) => {
    await deleteOrder(id);
    setDeleteDialogOrder(null);
  };

  if (loading) {
    return <div>Cargando pedidos...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID o coordenadas..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Hora Llegada</TableHead>
                <TableHead>Fecha Límite</TableHead>
                <TableHead>GLP Solicitado</TableHead>
                <TableHead>GLP Restante</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.arriveTime ? formatDate(new Date(order.arriveTime)) : 'N/A'}</TableCell>
                  <TableCell>{order.dueTime ? formatDate(new Date(order.dueTime)) : 'N/A'}</TableCell>
                  <TableCell>{order.glpRequestM3?.toFixed(2) || '0'} m³</TableCell>
                  <TableCell>{order.remainingGlpM3?.toFixed(2) || '0'} m³</TableCell>
                  <TableCell>
                    {order.position
                      ? `(${order.position.x}, ${order.position.y})`
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {order.delivered ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                        Entregado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
                        Pendiente
                      </Badge>
                    )}
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
                        <DropdownMenuItem className="cursor-pointer flex items-center">
                          <Truck className="h-4 w-4 mr-2" />
                          <span>Asignar vehículo</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer flex items-center">
                          <FileEdit className="h-4 w-4 mr-2" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 cursor-pointer flex items-center"
                          onClick={() => handleDeleteClick(order)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No se encontraron pedidos.
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={!!deleteDialogOrder}
        onOpenChange={(isOpen) => !isOpen && setDeleteDialogOrder(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el pedido{" "}
              {deleteDialogOrder?.id} y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() =>
                deleteDialogOrder && handleDelete(deleteDialogOrder.id || "")
              }
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
