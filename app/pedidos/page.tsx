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
import { 
  Plus, 
  Upload, 
  Search, 
  FileSpreadsheet, 
  PackageOpen,
  PackageCheck,
  Truck, 
  CheckCircle, 
  ClipboardList 
} from "lucide-react";
import { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function PedidosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  // Key to trigger re-fetching/re-rendering of OrdersTable
  const [ordersUpdateKey, setOrdersUpdateKey] = useState(0);
  // Key to reset OrderForm instance
  const [orderFormInstanceKey, setOrderFormInstanceKey] = useState(0);

  const handleSearch = () => {
    // Implementar búsqueda cuando sea necesario
    console.log("Buscando:", searchTerm.trim());
  };

  // This function should be called by OrderForm after a new order is successfully created.
  const handleOrderAdded = () => {
    setOrdersUpdateKey((prevKey) => prevKey + 1); // Refresh the orders table
  };

  const handleNewPedidoClick = () => {
    // Explicitly reset the OrderForm by changing its key, forcing a re-mount
    setOrderFormInstanceKey((prevKey) => prevKey + 1);
    // Scroll to form
    document.getElementById('order-form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "todos": return <ClipboardList className="h-4 w-4 mr-2" />;
      case "pendiente": return <PackageOpen className="h-4 w-4 mr-2" />;
      case "en-ruta": return <Truck className="h-4 w-4 mr-2" />;
      case "entregados": return <CheckCircle className="h-4 w-4 mr-2" />;
      default: return null;
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Gestión de Pedidos" 
        description="Administre las órdenes de distribución de GLP"
        actions={[
          { 
            icon: <Upload className="h-4 w-4" />, 
            label: "Importar", 
            variant: "outline" 
          },
          { 
            icon: <Plus className="h-4 w-4" />, 
            label: "Nuevo Pedido", 
            onClick: handleNewPedidoClick 
          }
        ]}
      />

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                <CardTitle>Registro de Pedidos</CardTitle>
              </div>
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar pedidos..."
                  className="h-9"
                />
                <Button onClick={handleSearch} variant="secondary" size="sm" className="h-9">
                  <Search className="h-4 w-4 mr-1" />
                  Buscar
                </Button>
              </div>
            </div>
            <CardDescription className="pt-1">
              Listado de pedidos de GLP registrados en el sistema
            </CardDescription>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="px-6">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="todos">
                {getTabIcon("todos")}
                <span>Todos</span>
              </TabsTrigger>
              <TabsTrigger value="pendiente">
                {getTabIcon("pendiente")}
                <span>Pendientes</span>
                <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800">8</Badge>
              </TabsTrigger>
              <TabsTrigger value="en-ruta">
                {getTabIcon("en-ruta")}
                <span>En Ruta</span>
                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">3</Badge>
              </TabsTrigger>
              <TabsTrigger value="entregados">
                {getTabIcon("entregados")}
                <span>Entregados</span>
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">12</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="todos">
              <OrdersTable key={`todos-${ordersUpdateKey}`} />
            </TabsContent>
            <TabsContent value="pendiente">
              <OrdersTable key={`pendiente-${ordersUpdateKey}`} filter="pendiente" />
            </TabsContent>
            <TabsContent value="en-ruta">
              <OrdersTable key={`en-ruta-${ordersUpdateKey}`} filter="en-ruta" />
            </TabsContent>
            <TabsContent value="entregados">
              <OrdersTable key={`entregados-${ordersUpdateKey}`} filter="entregado" />
            </TabsContent>
          </Tabs>
        </Card>

        <div className="grid gap-6 md:grid-cols-2" id="order-form-section">
          <Card className="border-border overflow-hidden">
            <CardHeader className="bg-card pb-3">
              <div className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-blue-600" />
                <CardTitle>Registro de Pedido</CardTitle>
              </div>
              <CardDescription>
                Añade un nuevo pedido al sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <OrderForm
                key={orderFormInstanceKey}
                onOrderAdded={handleOrderAdded}
              />
            </CardContent>
          </Card>

          <Card className="border-border overflow-hidden">
            <CardHeader className="bg-card pb-3">
              <div className="flex items-center space-x-2">
                <Upload className="h-5 w-5 text-blue-600" />
                <CardTitle>Carga Masiva</CardTitle>
              </div>
              <CardDescription>
                Importa múltiples pedidos desde un archivo CSV
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <OrderUploadForm onOrdersUploaded={handleOrderAdded} />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
