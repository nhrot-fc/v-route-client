# IncidentControllerApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**create3**](#create3) | **POST** /api/incidents | |
|[**getById3**](#getbyid3) | **GET** /api/incidents/{id} | |
|[**list3**](#list3) | **GET** /api/incidents | |
|[**resolveIncident**](#resolveincident) | **PATCH** /api/incidents/{id}/resolve | |

# **create3**
> IncidentDTO create3(incidentCreateDTO)


### Example

```typescript
import {
    IncidentControllerApi,
    Configuration,
    IncidentCreateDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new IncidentControllerApi(configuration);

let incidentCreateDTO: IncidentCreateDTO; //

const { status, data } = await apiInstance.create3(
    incidentCreateDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **incidentCreateDTO** | **IncidentCreateDTO**|  | |


### Return type

**IncidentDTO**

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

# **getById3**
> IncidentDTO getById3()


### Example

```typescript
import {
    IncidentControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new IncidentControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getById3(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**IncidentDTO**

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

# **list3**
> Array<IncidentDTO> list3()


### Example

```typescript
import {
    IncidentControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new IncidentControllerApi(configuration);

let vehicleId: string; // (optional) (default to undefined)
let startDate: string; // (optional) (default to undefined)
let endDate: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.list3(
    vehicleId,
    startDate,
    endDate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **vehicleId** | [**string**] |  | (optional) defaults to undefined|
| **startDate** | [**string**] |  | (optional) defaults to undefined|
| **endDate** | [**string**] |  | (optional) defaults to undefined|


### Return type

**Array<IncidentDTO>**

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

# **resolveIncident**
> IncidentDTO resolveIncident()


### Example

```typescript
import {
    IncidentControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new IncidentControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.resolveIncident(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**IncidentDTO**

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

