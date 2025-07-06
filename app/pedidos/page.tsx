"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrdersTable } from "@/components/orders/orders-table";
import { OrderUploadForm } from "@/components/orders/order-upload-form";
import OrderForm from "@/components/orders/order-form";
import { Plus, Upload } from "lucide-react";
import { useState } from "react";

export default function PedidosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  // Key to trigger re-fetching/re-rendering of OrdersTable
  const [ordersUpdateKey, setOrdersUpdateKey] = useState(0);
  // Key to reset OrderForm instance
  const [orderFormInstanceKey, setOrderFormInstanceKey] = useState(0);

  const handleSearch = () => {
    setSearchQuery(searchTerm.trim());
  };

  // This function should be called by OrderForm after a new order is successfully created.
  // OrderForm will need to be modified to accept and call an onOrderAdded prop.
  const handleOrderAdded = () => {
    setOrdersUpdateKey((prevKey) => prevKey + 1); // Refresh the orders table
    // Optionally, reset the form to its initial state after successful submission
    // setOrderFormInstanceKey((prevKey) => prevKey + 1);
  };

  const handleNewPedidoClick = () => {
    // Explicitly reset the OrderForm by changing its key, forcing a re-mount
    setOrderFormInstanceKey((prevKey) => prevKey + 1);
    // You could add other logic here, like scrolling to the form
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Gestión de Pedidos
        </h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button onClick={handleNewPedidoClick}>
            {" "}
            {/* Attach handler */}
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Pedido
          </Button>
        </div>
      </div>

      <Tabs defaultValue="todos" className="space-y-4">
        <div className="flex justify-between">
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="pendiente">Pendientes</TabsTrigger>
            <TabsTrigger value="en-ruta">En Ruta</TabsTrigger>
            <TabsTrigger value="entregados">Entregados</TabsTrigger>
          </TabsList>
          <div className="flex w-full max-w-sm items-center space-x-2 ml-auto">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar pedidos..."
            />
            <Button onClick={handleSearch} variant="secondary">
              Buscar
            </Button>
          </div>
        </div>

        {[
          {
            key: "todos",
            title: "Todos los Pedidos",
            desc: "Listado completo de pedidos registrados en el sistema",
            filter: undefined,
          },
          {
            key: "pendiente",
            title: "Pedidos Pendientes",
            desc: "Pedidos que aún no han sido asignados a una ruta",
            filter: "pendientes",
          },
          {
            key: "en-ruta",
            title: "Pedidos En Ruta",
            desc: "Pedidos que están actualmente en proceso de entrega",
            filter: "en-ruta",
          },
          {
            key: "entregados",
            title: "Pedidos Entregados",
            desc: "Pedidos que han sido entregados satisfactoriamente",
            filter: "entregados",
          },
        ].map(({ key, title, desc, filter }) => (
          <TabsContent key={key} value={key} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{desc}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Add ordersUpdateKey as a React key to OrdersTable.
                    This will cause OrdersTable to re-mount and re-fetch its data when the key changes.
                    Ensure OrdersTable fetches data on mount or when its props (like this key) change.
                */}
                <OrdersTable key={ordersUpdateKey} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Registro de Pedido</CardTitle>
            <CardDescription>Añade un nuevo pedido al sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Pass the key to reset the form and the callback for when an order is added.
                OrderForm must be adapted to accept and call onOrderAdded.
            */}
            <OrderForm
              key={orderFormInstanceKey}
              onOrderAdded={handleOrderAdded}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Carga Masiva</CardTitle>
            <CardDescription>
              Importa múltiples pedidos desde un archivo CSV
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrderUploadForm onOrdersUploaded={handleOrderAdded} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
