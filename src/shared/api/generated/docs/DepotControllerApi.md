# DepotControllerApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**create4**](#create4) | **POST** /api/depots | |
|[**delete3**](#delete3) | **DELETE** /api/depots/{id} | |
|[**getById4**](#getbyid4) | **GET** /api/depots/{id} | |
|[**list4**](#list4) | **GET** /api/depots | |
|[**update2**](#update2) | **PUT** /api/depots/{id} | |

# **create4**
> Depot create4(depot)


### Example

```typescript
import {
    DepotControllerApi,
    Configuration,
    Depot
} from './api';

const configuration = new Configuration();
const apiInstance = new DepotControllerApi(configuration);

let depot: Depot; //

const { status, data } = await apiInstance.create4(
    depot
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **depot** | **Depot**|  | |


### Return type

**Depot**

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

# **delete3**
> delete3()


### Example

```typescript
import {
    DepotControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DepotControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.delete3(
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

# **getById4**
> Depot getById4()


### Example

```typescript
import {
    DepotControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DepotControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.getById4(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**Depot**

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

# **list4**
> object list4()


### Example

```typescript
import {
    DepotControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DepotControllerApi(configuration);

let type: 'MAIN' | 'AUXILIARY'; // (optional) (default to undefined)
let isMain: boolean; // (optional) (default to undefined)
let minGlpCapacity: number; // (optional) (default to undefined)
let minCurrentGlp: number; // (optional) (default to undefined)
let paginated: boolean; // (optional) (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 10)
let sortBy: string; // (optional) (default to 'id')
let direction: string; // (optional) (default to 'asc')

const { status, data } = await apiInstance.list4(
    type,
    isMain,
    minGlpCapacity,
    minCurrentGlp,
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
| **type** | [**&#39;MAIN&#39; | &#39;AUXILIARY&#39;**]**Array<&#39;MAIN&#39; &#124; &#39;AUXILIARY&#39;>** |  | (optional) defaults to undefined|
| **isMain** | [**boolean**] |  | (optional) defaults to undefined|
| **minGlpCapacity** | [**number**] |  | (optional) defaults to undefined|
| **minCurrentGlp** | [**number**] |  | (optional) defaults to undefined|
| **paginated** | [**boolean**] |  | (optional) defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 10|
| **sortBy** | [**string**] |  | (optional) defaults to 'id'|
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

# **update2**
> Depot update2(depot)


### Example

```typescript
import {
    DepotControllerApi,
    Configuration,
    Depot
} from './api';

const configuration = new Configuration();
const apiInstance = new DepotControllerApi(configuration);

let id: string; // (default to undefined)
let depot: Depot; //

const { status, data } = await apiInstance.update2(
    id,
    depot
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **depot** | **Depot**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**Depot**

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

