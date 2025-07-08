# ServeRecordControllerApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**create1**](#create1) | **POST** /api/serve-records | |
|[**delete1**](#delete1) | **DELETE** /api/serve-records/{id} | |
|[**getById1**](#getbyid1) | **GET** /api/serve-records/{id} | |
|[**list1**](#list1) | **GET** /api/serve-records | |

# **create1**
> ServeRecordDTO create1(serveRecordDTO)


### Example

```typescript
import {
    ServeRecordControllerApi,
    Configuration,
    ServeRecordDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new ServeRecordControllerApi(configuration);

let serveRecordDTO: ServeRecordDTO; //

const { status, data } = await apiInstance.create1(
    serveRecordDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **serveRecordDTO** | **ServeRecordDTO**|  | |


### Return type

**ServeRecordDTO**

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

# **delete1**
> delete1()


### Example

```typescript
import {
    ServeRecordControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ServeRecordControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.delete1(
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

# **getById1**
> ServeRecordDTO getById1()


### Example

```typescript
import {
    ServeRecordControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ServeRecordControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.getById1(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ServeRecordDTO**

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

# **list1**
> object list1()


### Example

```typescript
import {
    ServeRecordControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ServeRecordControllerApi(configuration);

let orderId: string; // (optional) (default to undefined)
let vehicleId: string; // (optional) (default to undefined)
let startDate: string; // (optional) (default to undefined)
let endDate: string; // (optional) (default to undefined)
let paginated: boolean; // (optional) (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 10)
let sortBy: string; // (optional) (default to 'serveDate')
let direction: string; // (optional) (default to 'desc')

const { status, data } = await apiInstance.list1(
    orderId,
    vehicleId,
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
| **orderId** | [**string**] |  | (optional) defaults to undefined|
| **vehicleId** | [**string**] |  | (optional) defaults to undefined|
| **startDate** | [**string**] |  | (optional) defaults to undefined|
| **endDate** | [**string**] |  | (optional) defaults to undefined|
| **paginated** | [**boolean**] |  | (optional) defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 10|
| **sortBy** | [**string**] |  | (optional) defaults to 'serveDate'|
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

