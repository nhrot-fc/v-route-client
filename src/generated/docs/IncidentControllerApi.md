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

let id: string; // (default to undefined)

const { status, data } = await apiInstance.getById3(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


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
> object list3()


### Example

```typescript
import {
    IncidentControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new IncidentControllerApi(configuration);

let vehicleId: string; // (optional) (default to undefined)
let type: 'TI1' | 'TI2' | 'TI3'; // (optional) (default to undefined)
let shift: 'T1' | 'T2' | 'T3'; // (optional) (default to undefined)
let startDate: string; // (optional) (default to undefined)
let endDate: string; // (optional) (default to undefined)
let resolved: boolean; // (optional) (default to undefined)
let paginated: boolean; // (optional) (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 10)
let sortBy: string; // (optional) (default to 'occurrenceTime')
let direction: string; // (optional) (default to 'desc')

const { status, data } = await apiInstance.list3(
    vehicleId,
    type,
    shift,
    startDate,
    endDate,
    resolved,
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
| **type** | [**&#39;TI1&#39; | &#39;TI2&#39; | &#39;TI3&#39;**]**Array<&#39;TI1&#39; &#124; &#39;TI2&#39; &#124; &#39;TI3&#39;>** |  | (optional) defaults to undefined|
| **shift** | [**&#39;T1&#39; | &#39;T2&#39; | &#39;T3&#39;**]**Array<&#39;T1&#39; &#124; &#39;T2&#39; &#124; &#39;T3&#39;>** |  | (optional) defaults to undefined|
| **startDate** | [**string**] |  | (optional) defaults to undefined|
| **endDate** | [**string**] |  | (optional) defaults to undefined|
| **resolved** | [**boolean**] |  | (optional) defaults to undefined|
| **paginated** | [**boolean**] |  | (optional) defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 10|
| **sortBy** | [**string**] |  | (optional) defaults to 'occurrenceTime'|
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

# **resolveIncident**
> Incident resolveIncident()


### Example

```typescript
import {
    IncidentControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new IncidentControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.resolveIncident(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**Incident**

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

