# MaintenanceControllerApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createMaintenance**](#createmaintenance) | **POST** /api/maintenances | |
|[**getMaintenanceById**](#getmaintenancebyid) | **GET** /api/maintenances/{id} | |
|[**listActiveMaintenances**](#listactivemaintenances) | **GET** /api/maintenances/active | |
|[**listMaintenances**](#listmaintenances) | **GET** /api/maintenances | |

# **createMaintenance**
> MaintenanceDTO createMaintenance(maintenanceCreateDTO)


### Example

```typescript
import {
    MaintenanceControllerApi,
    Configuration,
    MaintenanceCreateDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new MaintenanceControllerApi(configuration);

let maintenanceCreateDTO: MaintenanceCreateDTO; //

const { status, data } = await apiInstance.createMaintenance(
    maintenanceCreateDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **maintenanceCreateDTO** | **MaintenanceCreateDTO**|  | |


### Return type

**MaintenanceDTO**

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

# **getMaintenanceById**
> Maintenance getMaintenanceById()


### Example

```typescript
import {
    MaintenanceControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MaintenanceControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.getMaintenanceById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**Maintenance**

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

# **listActiveMaintenances**
> object listActiveMaintenances()


### Example

```typescript
import {
    MaintenanceControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MaintenanceControllerApi(configuration);

let paginated: boolean; // (optional) (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 10)
let sortBy: string; // (optional) (default to 'realStart')
let direction: string; // (optional) (default to 'desc')

const { status, data } = await apiInstance.listActiveMaintenances(
    paginated,
    page,
    size,
    sortBy,
    direction
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paginated** | [**boolean**] |  | (optional) defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 10|
| **sortBy** | [**string**] |  | (optional) defaults to 'realStart'|
| **direction** | [**string**] |  | (optional) defaults to 'desc'|


### Return type

**object**

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

# **listMaintenances**
> object listMaintenances()


### Example

```typescript
import {
    MaintenanceControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MaintenanceControllerApi(configuration);

let vehicleId: string; // (optional) (default to undefined)
let date: string; // (optional) (default to undefined)
let startDate: string; // (optional) (default to undefined)
let endDate: string; // (optional) (default to undefined)
let paginated: boolean; // (optional) (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 10)
let sortBy: string; // (optional) (default to 'assignedDate')
let direction: string; // (optional) (default to 'asc')

const { status, data } = await apiInstance.listMaintenances(
    vehicleId,
    date,
    startDate,
    endDate,
    paginated,
    page,
    size,
    sortBy,
    direction
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **vehicleId** | [**string**] |  | (optional) defaults to undefined|
| **date** | [**string**] |  | (optional) defaults to undefined|
| **startDate** | [**string**] |  | (optional) defaults to undefined|
| **endDate** | [**string**] |  | (optional) defaults to undefined|
| **paginated** | [**boolean**] |  | (optional) defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 10|
| **sortBy** | [**string**] |  | (optional) defaults to 'assignedDate'|
| **direction** | [**string**] |  | (optional) defaults to 'asc'|


### Return type

**object**

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

