"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePicker } from "@/components/ui/date-picker"
import simulationApi, { SimulationScenarioType, DailyOperationsConfig, WeeklySimulationConfig, CollapseSimulationConfig } from "@/lib/simulation-api"
import { AlertCircle, Check, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SimulationConfigProps {
  onConfigSaved?: (simulationId: string) => void;
}

export function SimulationConfig({ onConfigSaved }: SimulationConfigProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("daily")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Configuración de operaciones diarias
  const [dailyName, setDailyName] = useState("Operaciones diarias")
  const [dailyDescription, setDailyDescription] = useState("Simulación de operaciones diarias con datos actuales")
  const [useRealtime, setUseRealtime] = useState(true)
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [startTime, setStartTime] = useState("08:00")

  // Configuración de simulación semanal
  const [weeklyName, setWeeklyName] = useState("Simulación semanal")
  const [weeklyDescription, setWeeklyDescription] = useState("Simulación semanal con datos históricos")
  const [weeklyStartDate, setWeeklyStartDate] = useState<Date | undefined>(new Date())
  const [ordersFile, setOrdersFile] = useState<File | null>(null)
  const [vehiclesFile, setVehiclesFile] = useState<File | null>(null)
  const [blockagesFile, setBlockagesFile] = useState<File | null>(null)

  // Configuración de simulación hasta el colapso
  const [collapseName, setCollapseName] = useState("Simulación hasta colapso")
  const [collapseDescription, setCollapseDescription] = useState("Simulación hasta el colapso del sistema")
  const [collapseStartDate, setCollapseStartDate] = useState<Date | undefined>(new Date())
  const [collapseOrdersFile, setCollapseOrdersFile] = useState<File | null>(null)
  const [collapseVehiclesFile, setCollapseVehiclesFile] = useState<File | null>(null)
  const [collapseBlockagesFile, setCollapseBlockagesFile] = useState<File | null>(null)
  const [maxDays, setMaxDays] = useState(30)

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const formatDateForAPI = (date?: Date): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const createDailyOperationsSimulation = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      if (!dailyName) {
        setError("El nombre de la simulación es obligatorio");
        setLoading(false);
        return;
      }

      const simulationConfig: DailyOperationsConfig = {
        name: dailyName,
        description: dailyDescription,
        scenarioType: SimulationScenarioType.DAILY_OPERATIONS,
        useRealtime: useRealtime,
        startDate: formatDateForAPI(startDate),
        startTime: startTime
      };

      const simulationId = await simulationApi.createSimulation(simulationConfig);
      
      setSuccess(true);
      toast({
        title: "Simulación creada",
        description: "La simulación de operaciones diarias se ha creado correctamente",
      });
      
      if (onConfigSaved) {
        onConfigSaved(simulationId);
      }

    } catch (err) {
      console.error("Error al crear simulación:", err);
      setError(err instanceof Error ? err.message : "Error al crear la simulación");
    } finally {
      setLoading(false);
    }
  };

  const createWeeklySimulation = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      if (!weeklyName) {
        setError("El nombre de la simulación es obligatorio");
        setLoading(false);
        return;
      }

      if (!ordersFile) {
        setError("El archivo de órdenes es obligatorio");
        setLoading(false);
        return;
      }

      const simulationConfig: WeeklySimulationConfig = {
        name: weeklyName,
        description: weeklyDescription,
        scenarioType: SimulationScenarioType.WEEKLY_SIMULATION,
        startDate: formatDateForAPI(weeklyStartDate),
        ordersFile,
        vehiclesFile,
        blockagesFile
      };

      const simulationId = await simulationApi.createSimulationWithFiles(simulationConfig);
      
      setSuccess(true);
      toast({
        title: "Simulación creada",
        description: "La simulación semanal se ha creado correctamente",
      });
      
      if (onConfigSaved) {
        onConfigSaved(simulationId);
      }

    } catch (err) {
      console.error("Error al crear simulación semanal:", err);
      setError(err instanceof Error ? err.message : "Error al crear la simulación semanal");
    } finally {
      setLoading(false);
    }
  };

  const createCollapseSimulation = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      if (!collapseName) {
        setError("El nombre de la simulación es obligatorio");
        setLoading(false);
        return;
      }

      if (!collapseOrdersFile) {
        setError("El archivo de órdenes es obligatorio");
        setLoading(false);
        return;
      }

      const simulationConfig: CollapseSimulationConfig = {
        name: collapseName,
        description: collapseDescription,
        scenarioType: SimulationScenarioType.COLLAPSE_SIMULATION,
        startDate: formatDateForAPI(collapseStartDate),
        ordersFile: collapseOrdersFile,
        vehiclesFile: collapseVehiclesFile,
        blockagesFile: collapseBlockagesFile,
        maxDays: maxDays
      };

      const simulationId = await simulationApi.createSimulationWithFiles(simulationConfig);
      
      setSuccess(true);
      toast({
        title: "Simulación creada",
        description: "La simulación hasta el colapso se ha creado correctamente",
      });
      
      if (onConfigSaved) {
        onConfigSaved(simulationId);
      }

    } catch (err) {
      console.error("Error al crear simulación hasta el colapso:", err);
      setError(err instanceof Error ? err.message : "Error al crear la simulación hasta el colapso");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setError(null);
    setSuccess(false);
  };

  // Componente de carga de archivos personalizado
  const FileUpload = ({ 
    accept, 
    onChange, 
    label, 
    file 
  }: { 
    accept: string; 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    label: string;
    file: File | null;
  }) => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById(label)?.click()}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </div>
      <input
        id={label}
        type="file"
        accept={accept}
        onChange={onChange}
        className="hidden"
      />
      {file && (
        <div className="text-sm text-muted-foreground truncate max-w-full">
          {file.name}
        </div>
      )}
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Configuración de Simulación</CardTitle>
        <CardDescription>
          Configure los parámetros para crear una nueva simulación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Operaciones Diarias</TabsTrigger>
            <TabsTrigger value="weekly">Simulación Semanal</TabsTrigger>
            <TabsTrigger value="collapse">Simulación Colapso</TabsTrigger>
          </TabsList>
          
          {/* Configuración de operaciones diarias */}
          <TabsContent value="daily" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="daily-name">Nombre</Label>
                <Input
                  id="daily-name"
                  value={dailyName}
                  onChange={(e) => setDailyName(e.target.value)}
                  placeholder="Nombre de la simulación"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="daily-description">Descripción</Label>
                <Input
                  id="daily-description"
                  value={dailyDescription}
                  onChange={(e) => setDailyDescription(e.target.value)}
                  placeholder="Descripción de la simulación"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="use-realtime">Usar tiempo real</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="use-realtime"
                    checked={useRealtime}
                    onCheckedChange={setUseRealtime}
                  />
                  <Label htmlFor="use-realtime">
                    {useRealtime ? "Usar fecha y hora actual" : "Especificar fecha y hora"}
                  </Label>
                </div>
              </div>
              
              {!useRealtime && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="start-date">Fecha de inicio</Label>
                    <DatePicker
                      date={startDate}
                      setDate={setStartDate}
                      placeholder="Seleccionar fecha de inicio"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="start-time">Hora de inicio</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </TabsContent>
          
          {/* Configuración de simulación semanal */}
          <TabsContent value="weekly" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="weekly-name">Nombre</Label>
                <Input
                  id="weekly-name"
                  value={weeklyName}
                  onChange={(e) => setWeeklyName(e.target.value)}
                  placeholder="Nombre de la simulación"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="weekly-description">Descripción</Label>
                <Input
                  id="weekly-description"
                  value={weeklyDescription}
                  onChange={(e) => setWeeklyDescription(e.target.value)}
                  placeholder="Descripción de la simulación"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="weekly-start-date">Fecha de inicio</Label>
                <DatePicker
                  date={weeklyStartDate}
                  setDate={setWeeklyStartDate}
                  placeholder="Seleccionar fecha de inicio"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="orders-file">Archivo de órdenes (obligatorio)</Label>
                <FileUpload
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, setOrdersFile)}
                  label="Seleccionar archivo de órdenes"
                  file={ordersFile}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="vehicles-file">Archivo de vehículos (opcional)</Label>
                <FileUpload
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, setVehiclesFile)}
                  label="Seleccionar archivo de vehículos"
                  file={vehiclesFile}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="blockages-file">Archivo de bloqueos (opcional)</Label>
                <FileUpload
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, setBlockagesFile)}
                  label="Seleccionar archivo de bloqueos"
                  file={blockagesFile}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Configuración de simulación hasta el colapso */}
          <TabsContent value="collapse" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="collapse-name">Nombre</Label>
                <Input
                  id="collapse-name"
                  value={collapseName}
                  onChange={(e) => setCollapseName(e.target.value)}
                  placeholder="Nombre de la simulación"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="collapse-description">Descripción</Label>
                <Input
                  id="collapse-description"
                  value={collapseDescription}
                  onChange={(e) => setCollapseDescription(e.target.value)}
                  placeholder="Descripción de la simulación"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="collapse-start-date">Fecha de inicio</Label>
                <DatePicker
                  date={collapseStartDate}
                  setDate={setCollapseStartDate}
                  placeholder="Seleccionar fecha de inicio"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="max-days">Máximo de días</Label>
                <Input
                  id="max-days"
                  type="number"
                  min={1}
                  max={365}
                  value={maxDays}
                  onChange={(e) => setMaxDays(parseInt(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Número máximo de días para la simulación (0 = sin límite)
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="collapse-orders-file">Archivo de órdenes (obligatorio)</Label>
                <FileUpload
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, setCollapseOrdersFile)}
                  label="Seleccionar archivo de órdenes"
                  file={collapseOrdersFile}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="collapse-vehicles-file">Archivo de vehículos (opcional)</Label>
                <FileUpload
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, setCollapseVehiclesFile)}
                  label="Seleccionar archivo de vehículos"
                  file={collapseVehiclesFile}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="collapse-blockages-file">Archivo de bloqueos (opcional)</Label>
                <FileUpload
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, setCollapseBlockagesFile)}
                  label="Seleccionar archivo de bloqueos"
                  file={collapseBlockagesFile}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-700">
            <Check className="h-4 w-4" />
            <p className="text-sm">Simulación creada correctamente</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={
            activeTab === "daily" 
              ? createDailyOperationsSimulation 
              : activeTab === "weekly" 
                ? createWeeklySimulation 
                : createCollapseSimulation
          }
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Creando simulación...
            </>
          ) : (
            "Crear simulación"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
