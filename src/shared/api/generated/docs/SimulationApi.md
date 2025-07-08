# SimulationApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createSimulation**](#createsimulation) | **POST** /api/simulation | Create a new simplified simulation|
|[**getDailyOperations**](#getdailyoperations) | **GET** /api/simulation/daily | Get daily operations simulation|
|[**getDailyOperationsState**](#getdailyoperationsstate) | **GET** /api/simulation/daily/state | Get daily operations state|
|[**getSimulationState**](#getsimulationstate) | **GET** /api/simulation/{id}/state | Get simulation state|
|[**getSimulationStatus**](#getsimulationstatus) | **GET** /api/simulation/{id} | Get simulation status|
|[**listSimulations**](#listsimulations) | **GET** /api/simulation | List all simulations|
|[**pauseSimulation**](#pausesimulation) | **POST** /api/simulation/{id}/pause | Pause a simulation|
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

# **getDailyOperations**
> SimulationDTO getDailyOperations()

Returns the current status of the daily operations simulation

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

const { status, data } = await apiInstance.getDailyOperations();
```

### Parameters
This endpoint does not have any parameters.


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

# **getDailyOperationsState**
> SimulationStateDTO getDailyOperationsState()

Returns the current detailed state of the daily operations simulation

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

const { status, data } = await apiInstance.getDailyOperationsState();
```

### Parameters
This endpoint does not have any parameters.


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

# **getSimulationState**
> SimulationStateDTO getSimulationState()

Returns the current detailed state of a specific simulation

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.getSimulationState(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


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

# **getSimulationStatus**
> SimulationDTO getSimulationStatus()

Returns the current status of a specific simulation

### Example

```typescript
import {
    SimulationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SimulationApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.getSimulationStatus(
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

