# MaintenanceControllerApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createMaintenance**](#createmaintenance) | **POST** /api/maintenances | |
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

# **listActiveMaintenances**
> Array<MaintenanceDTO> listActiveMaintenances()


### Example

```typescript
import {
    MaintenanceControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MaintenanceControllerApi(configuration);

const { status, data } = await apiInstance.listActiveMaintenances();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<MaintenanceDTO>**

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
> Array<MaintenanceDTO> listMaintenances()


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

const { status, data } = await apiInstance.listMaintenances(
    vehicleId,
    date,
    startDate,
    endDate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **vehicleId** | [**string**] |  | (optional) defaults to undefined|
| **date** | [**string**] |  | (optional) defaults to undefined|
| **startDate** | [**string**] |  | (optional) defaults to undefined|
| **endDate** | [**string**] |  | (optional) defaults to undefined|


### Return type

**Array<MaintenanceDTO>**

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

