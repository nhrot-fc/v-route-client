# SimulationApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createSimulation**](#createsimulation) | **POST** /api/simulation | Create a new simplified simulation|
|[**createVehicleBreakdown**](#createvehiclebreakdown) | **POST** /api/simulation/{simulationId}/vehicle/{vehicleId}/breakdown | Crear avería de vehículo|
|[**deleteSimulation**](#deletesimulation) | **DELETE** /api/simulation/{id} | Eliminar una simulación|
|[**getSimulation**](#getsimulation) | **GET** /api/simulation/{id} | Get simulation by ID|
|[**listSimulations**](#listsimulations) | **GET** /api/simulation | List all simulations|
|[**loadBlockages**](#loadblockages) | **POST** /api/simulation/{id}/load-blockages | Cargar bloqueos para una simulación|
|[**loadOrders**](#loadorders) | **POST** /api/simulation/{id}/load-orders | Cargar órdenes para una simulación|
|[**pauseSimulation**](#pausesimulation) | **POST** /api/simulation/{id}/pause | Pause a simulation|
|[**setSimulationSpeed**](#setsimulationspeed) | **POST** /api/simulation/speed/{factor} | Configurar velocidad de simulación|
|[**startSimulation**](#startsimulation) | **POST** /api/simulation/{id}/start | Start a simulation|
|[**stopSimulation**](#stopsimulation) | **POST** /api/simulation/{id}/stop | Stop a simulation|

# **createSimulation**
> SimulationDTO createSimulation(simulationCreateDTO)

Creates a new simulation with the specified parameters. For WEEKLY type, end date is automatically set to one week after start date. For INFINITE, no end date is used.

### Example

```typescript
import {
    SimulationApi,
    Configuration,
    SimulationCreateDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let simulationCreateDTO: SimulationCreateDTO; //

const { status, data } = await apiInstance.createSimulation(
    simulationCreateDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **simulationCreateDTO** | **SimulationCreateDTO**|  | |


### Return type

**SimulationDTO**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Simulation created successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createVehicleBreakdown**
> object createVehicleBreakdown()

Crea un evento de avería para un vehículo en la simulación

### Example

```typescript
import {
    SimulationApi,
    Configuration,
    IncidentCreateDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let simulationId: string; // (default to undefined)
let vehicleId: string; // (default to undefined)
let incidentCreateDTO: IncidentCreateDTO; // (optional)

const { status, data } = await apiInstance.createVehicleBreakdown(
    simulationId,
    vehicleId,
    incidentCreateDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **incidentCreateDTO** | **IncidentCreateDTO**|  | |
| **simulationId** | [**string**] |  | defaults to undefined|
| **vehicleId** | [**string**] |  | defaults to undefined|


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteSimulation**
> deleteSimulation()

Elimina una simulación por su ID

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deleteSimulation(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


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

# **getSimulation**
> SimulationDTO getSimulation()

Returns a specific simulation by its ID

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.getSimulation(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**SimulationDTO**

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

# **listSimulations**
> { [key: string]: SimulationDTO; } listSimulations()

Returns a list of all active simulations

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

const { status, data } = await apiInstance.listSimulations();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: SimulationDTO; }**

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

# **loadBlockages**
> string loadBlockages()

Carga un archivo de bloqueos para un año y mes específico en una simulación

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let id: string; // (default to undefined)
let year: number; // (default to undefined)
let month: number; // (default to undefined)
let file: File; // (default to undefined)

const { status, data } = await apiInstance.loadBlockages(
    id,
    year,
    month,
    file
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **year** | [**number**] |  | defaults to undefined|
| **month** | [**number**] |  | defaults to undefined|
| **file** | [**File**] |  | defaults to undefined|


### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **loadOrders**
> string loadOrders()

Carga un archivo de órdenes para un año y mes específico en una simulación

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let id: string; // (default to undefined)
let year: number; // (default to undefined)
let month: number; // (default to undefined)
let file: File; // (default to undefined)

const { status, data } = await apiInstance.loadOrders(
    id,
    year,
    month,
    file
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **year** | [**number**] |  | defaults to undefined|
| **month** | [**number**] |  | defaults to undefined|
| **file** | [**File**] |  | defaults to undefined|


### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **pauseSimulation**
> SimulationDTO pauseSimulation()

Pauses a running simulation

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.pauseSimulation(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**SimulationDTO**

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

Configura la velocidad de todas las simulaciones (1 = normal, 5 = 5x más rápido)

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let factor: number; // (default to undefined)

const { status, data } = await apiInstance.setSimulationSpeed(
    factor
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **factor** | [**number**] |  | defaults to undefined|


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
> SimulationDTO startSimulation()

Starts or resumes a paused simulation

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.startSimulation(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**SimulationDTO**

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

# **stopSimulation**
> SimulationDTO stopSimulation()

Permanently stops a simulation

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.stopSimulation(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**SimulationDTO**

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

