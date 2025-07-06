# BlockageControllerApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**create5**](#create5) | **POST** /api/blockages | |
|[**delete4**](#delete4) | **DELETE** /api/blockages/{id} | |
|[**getById5**](#getbyid5) | **GET** /api/blockages/{id} | |
|[**list5**](#list5) | **GET** /api/blockages | |
|[**update3**](#update3) | **PUT** /api/blockages/{id} | |

# **create5**
> Blockage create5(blockage)


### Example

```typescript
import {
    BlockageControllerApi,
    Configuration,
    Blockage
} from './api';

const configuration = new Configuration();
const apiInstance = new BlockageControllerApi(configuration);

let blockage: Blockage; //

const { status, data } = await apiInstance.create5(
    blockage
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **blockage** | **Blockage**|  | |


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

let id: number; // (default to undefined)

const { status, data } = await apiInstance.delete4(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


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

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getById5(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


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
> Array<Blockage> list5()


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

const { status, data } = await apiInstance.list5(
    activeAt,
    startTime,
    endTime
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **activeAt** | [**string**] |  | (optional) defaults to undefined|
| **startTime** | [**string**] |  | (optional) defaults to undefined|
| **endTime** | [**string**] |  | (optional) defaults to undefined|


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

let id: number; // (default to undefined)
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
| **id** | [**number**] |  | defaults to undefined|


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

