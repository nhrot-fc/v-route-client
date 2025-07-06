# SimulationApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createSimulation**](#createsimulation) | **POST** /api/simulation | Crear nueva simulación|
|[**deleteSimulation**](#deletesimulation) | **DELETE** /api/simulation/{id} | Eliminar simulación|
|[**getAllReports**](#getallreports) | **GET** /api/simulation/reports | Listar todos los reportes de simulación|
|[**getAllSimulations**](#getallsimulations) | **GET** /api/simulation | Listar todas las simulaciones|
|[**getBlockages**](#getblockages) | **GET** /api/simulation/{id}/blockages | Listar bloqueos|
|[**getEnvironment**](#getenvironment) | **GET** /api/simulation/{id}/environment | Obtener detalles del entorno|
|[**getOrders**](#getorders) | **GET** /api/simulation/{id}/orders | Listar órdenes|
|[**getSimulationReport**](#getsimulationreport) | **GET** /api/simulation/{id}/report | Obtener reporte de simulación|
|[**getSimulationStatus**](#getsimulationstatus) | **GET** /api/simulation/{id}/status | Obtener estado de una simulación|
|[**getVehicles**](#getvehicles) | **GET** /api/simulation/{id}/vehicles | Listar vehículos|
|[**pauseSimulation**](#pausesimulation) | **POST** /api/simulation/{id}/pause | Pausar simulación|
|[**repairVehicle**](#repairvehicle) | **POST** /api/simulation/{id}/vehicle/{vehicleId}/repair | Reparar vehículo|
|[**setSimulationSpeed**](#setsimulationspeed) | **POST** /api/simulation/{id}/speed | Ajustar velocidad de simulación|
|[**simulateVehicleBreakdown**](#simulatevehiclebreakdown) | **POST** /api/simulation/{id}/vehicle/{vehicleId}/breakdown | Simular avería de vehículo|
|[**startSimulation**](#startsimulation) | **POST** /api/simulation/{id}/start | Iniciar simulación|

# **createSimulation**
> { [key: string]: object; } createSimulation()

Crea una nueva instancia de simulación según el tipo especificado

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let simulationType: string; // (default to undefined)
let name: string; // (optional) (default to undefined)
let description: string; // (optional) (default to undefined)
let startDate: string; // (optional) (default to undefined)
let dataSource: string; // (optional) (default to undefined)
let durationDays: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.createSimulation(
    simulationType,
    name,
    description,
    startDate,
    dataSource,
    durationDays
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **simulationType** | [**string**] |  | defaults to undefined|
| **name** | [**string**] |  | (optional) defaults to undefined|
| **description** | [**string**] |  | (optional) defaults to undefined|
| **startDate** | [**string**] |  | (optional) defaults to undefined|
| **dataSource** | [**string**] |  | (optional) defaults to undefined|
| **durationDays** | [**number**] |  | (optional) defaults to undefined|


### Return type

**{ [key: string]: object; }**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteSimulation**
> deleteSimulation()

Elimina una simulación existente

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let id: string; //ID de la simulación (default to undefined)

const { status, data } = await apiInstance.deleteSimulation(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | ID de la simulación | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAllReports**
> Array<SimulationReportDTO> getAllReports()

Obtiene todos los reportes de simulaciones finalizadas

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

const { status, data } = await apiInstance.getAllReports();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<SimulationReportDTO>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAllSimulations**
> Array<{ [key: string]: object; }> getAllSimulations()

Obtiene una lista de todas las simulaciones disponibles

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

const { status, data } = await apiInstance.getAllSimulations();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<{ [key: string]: object; }>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getBlockages**
> Array<Blockage> getBlockages()

Obtiene la lista de bloqueos activos en la simulación

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let id: string; //ID de la simulación (default to undefined)
let activeOnly: boolean; // (optional) (default to true)

const { status, data } = await apiInstance.getBlockages(
    id,
    activeOnly
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | ID de la simulación | defaults to undefined|
| **activeOnly** | [**boolean**] |  | (optional) defaults to true|


### Return type

**Array<Blockage>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getEnvironment**
> SimulationStateDTO getEnvironment()

Obtiene información detallada del entorno de simulación

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let id: string; //ID de la simulación (default to undefined)

const { status, data } = await apiInstance.getEnvironment(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | ID de la simulación | defaults to undefined|


### Return type

**SimulationStateDTO**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getOrders**
> Array<Order> getOrders()

Obtiene la lista de órdenes en la simulación

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let id: string; //ID de la simulación (default to undefined)
let pendingOnly: boolean; // (optional) (default to false)
let overdueOnly: boolean; // (optional) (default to false)

const { status, data } = await apiInstance.getOrders(
    id,
    pendingOnly,
    overdueOnly
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | ID de la simulación | defaults to undefined|
| **pendingOnly** | [**boolean**] |  | (optional) defaults to false|
| **overdueOnly** | [**boolean**] |  | (optional) defaults to false|


### Return type

**Array<Order>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSimulationReport**
> SimulationReportDTO getSimulationReport()

Obtiene el reporte de una simulación finalizada

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let id: string; //ID de la simulación (default to undefined)

const { status, data } = await apiInstance.getSimulationReport(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | ID de la simulación | defaults to undefined|


### Return type

**SimulationReportDTO**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSimulationStatus**
> SimulationStateDTO getSimulationStatus()

Obtiene el estado actual de una simulación específica

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let id: string; //ID de la simulación (default to undefined)

const { status, data } = await apiInstance.getSimulationStatus(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | ID de la simulación | defaults to undefined|


### Return type

**SimulationStateDTO**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getVehicles**
> Array<Vehicle> getVehicles()

Obtiene la lista de vehículos en la simulación

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let id: string; //ID de la simulación (default to undefined)
let status: 'AVAILABLE' | 'DRIVING' | 'MAINTENANCE' | 'REFUELING' | 'RELOADING' | 'SERVING' | 'INCIDENT' | 'IDLE'; // (optional) (default to undefined)

const { status, data } = await apiInstance.getVehicles(
    id,
    status
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | ID de la simulación | defaults to undefined|
| **status** | [**&#39;AVAILABLE&#39; | &#39;DRIVING&#39; | &#39;MAINTENANCE&#39; | &#39;REFUELING&#39; | &#39;RELOADING&#39; | &#39;SERVING&#39; | &#39;INCIDENT&#39; | &#39;IDLE&#39;**]**Array<&#39;AVAILABLE&#39; &#124; &#39;DRIVING&#39; &#124; &#39;MAINTENANCE&#39; &#124; &#39;REFUELING&#39; &#124; &#39;RELOADING&#39; &#124; &#39;SERVING&#39; &#124; &#39;INCIDENT&#39; &#124; &#39;IDLE&#39;>** |  | (optional) defaults to undefined|


### Return type

**Array<Vehicle>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **pauseSimulation**
> { [key: string]: object; } pauseSimulation()

Pausa la ejecución de una simulación

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let id: string; //ID de la simulación (default to undefined)

const { status, data } = await apiInstance.pauseSimulation(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | ID de la simulación | defaults to undefined|


### Return type

**{ [key: string]: object; }**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **repairVehicle**
> { [key: string]: object; } repairVehicle()

Simula la reparación de un vehículo averiado

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let id: string; //ID de la simulación (default to undefined)
let vehicleId: string; //ID del vehículo (default to undefined)

const { status, data } = await apiInstance.repairVehicle(
    id,
    vehicleId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | ID de la simulación | defaults to undefined|
| **vehicleId** | [**string**] | ID del vehículo | defaults to undefined|


### Return type

**{ [key: string]: object; }**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **setSimulationSpeed**
> { [key: string]: object; } setSimulationSpeed()

Ajusta la velocidad de ejecución de la simulación

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let id: string; //ID de la simulación (default to undefined)
let speedFactor: number; // (default to undefined)

const { status, data } = await apiInstance.setSimulationSpeed(
    id,
    speedFactor
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | ID de la simulación | defaults to undefined|
| **speedFactor** | [**number**] |  | defaults to undefined|


### Return type

**{ [key: string]: object; }**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **simulateVehicleBreakdown**
> { [key: string]: object; } simulateVehicleBreakdown()

Simula una avería en un vehículo específico

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let id: string; //ID de la simulación (default to undefined)
let vehicleId: string; //ID del vehículo (default to undefined)

const { status, data } = await apiInstance.simulateVehicleBreakdown(
    id,
    vehicleId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | ID de la simulación | defaults to undefined|
| **vehicleId** | [**string**] | ID del vehículo | defaults to undefined|


### Return type

**{ [key: string]: object; }**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **startSimulation**
> { [key: string]: object; } startSimulation()

Inicia o reanuda la ejecución de una simulación

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let id: string; //ID de la simulación (default to undefined)

const { status, data } = await apiInstance.startSimulation(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | ID de la simulación | defaults to undefined|


### Return type

**{ [key: string]: object; }**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

