# BlockageControllerApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**create5**](#create5) | **POST** /api/blockages | |
|[**createBulk1**](#createbulk1) | **POST** /api/blockages/bulk | |
|[**delete4**](#delete4) | **DELETE** /api/blockages/{id} | |
|[**getById5**](#getbyid5) | **GET** /api/blockages/{id} | |
|[**list5**](#list5) | **GET** /api/blockages | |
|[**update3**](#update3) | **PUT** /api/blockages/{id} | |

# **create5**
> Blockage create5(blockageDTO)


### Example

```typescript
import {
    BlockageControllerApi,
    Configuration,
    BlockageDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new BlockageControllerApi(configuration);

let blockageDTO: BlockageDTO; //

const { status, data } = await apiInstance.create5(
    blockageDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **blockageDTO** | **BlockageDTO**|  | |


### Return type

**Blockage**

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

# **createBulk1**
> string createBulk1(blockageDTO)


### Example

```typescript
import {
    BlockageControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlockageControllerApi(configuration);

let blockageDTO: Array<BlockageDTO>; //

const { status, data } = await apiInstance.createBulk1(
    blockageDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **blockageDTO** | **Array<BlockageDTO>**|  | |


### Return type

**string**

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

# **delete4**
> delete4()


### Example

```typescript
import {
    BlockageControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlockageControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.delete4(
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

# **getById5**
> Blockage getById5()


### Example

```typescript
import {
    BlockageControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlockageControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.getById5(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**Blockage**

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

# **list5**
> object list5()


### Example

```typescript
import {
    BlockageControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlockageControllerApi(configuration);

let activeAt: string; // (optional) (default to undefined)
let startTime: string; // (optional) (default to undefined)
let endTime: string; // (optional) (default to undefined)
let paginated: boolean; // (optional) (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 10)
let sortBy: string; // (optional) (default to 'id')
let direction: string; // (optional) (default to 'asc')

const { status, data } = await apiInstance.list5(
    activeAt,
    startTime,
    endTime,
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
| **activeAt** | [**string**] |  | (optional) defaults to undefined|
| **startTime** | [**string**] |  | (optional) defaults to undefined|
| **endTime** | [**string**] |  | (optional) defaults to undefined|
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

# **update3**
> Blockage update3(blockage)


### Example

```typescript
import {
    BlockageControllerApi,
    Configuration,
    Blockage
} from './api';

const configuration = new Configuration();
const apiInstance = new BlockageControllerApi(configuration);

let id: string; // (default to undefined)
let blockage: Blockage; //

const { status, data } = await apiInstance.update3(
    id,
    blockage
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **blockage** | **Blockage**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**Blockage**

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

