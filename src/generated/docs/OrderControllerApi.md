# OrderControllerApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**create2**](#create2) | **POST** /api/orders | |
|[**createBulk**](#createbulk) | **POST** /api/orders/bulk | |
|[**delete2**](#delete2) | **DELETE** /api/orders/{id} | |
|[**getById2**](#getbyid2) | **GET** /api/orders/{id} | |
|[**list2**](#list2) | **GET** /api/orders | |
|[**recordDelivery**](#recorddelivery) | **POST** /api/orders/{id}/deliver | |
|[**update1**](#update1) | **PUT** /api/orders/{id} | |

# **create2**
> OrderDTO create2(orderDTO)


### Example

```typescript
import {
    OrderControllerApi,
    Configuration,
    OrderDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderControllerApi(configuration);

let orderDTO: OrderDTO; //

const { status, data } = await apiInstance.create2(
    orderDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **orderDTO** | **OrderDTO**|  | |


### Return type

**OrderDTO**

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

# **createBulk**
> Array<OrderDTO> createBulk(orderDTO)


### Example

```typescript
import {
    OrderControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderControllerApi(configuration);

let orderDTO: Array<OrderDTO>; //

const { status, data } = await apiInstance.createBulk(
    orderDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **orderDTO** | **Array<OrderDTO>**|  | |


### Return type

**Array<OrderDTO>**

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

# **delete2**
> delete2()


### Example

```typescript
import {
    OrderControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.delete2(
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

# **getById2**
> OrderDTO getById2()


### Example

```typescript
import {
    OrderControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.getById2(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**OrderDTO**

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

# **list2**
> object list2()


### Example

```typescript
import {
    OrderControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderControllerApi(configuration);

let pending: boolean; // (optional) (default to undefined)
let overdueAt: string; // (optional) (default to undefined)
let availableAt: string; // (optional) (default to undefined)
let paginated: boolean; // (optional) (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 10)
let sortBy: string; // (optional) (default to 'id')
let direction: string; // (optional) (default to 'asc')

const { status, data } = await apiInstance.list2(
    pending,
    overdueAt,
    availableAt,
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
| **pending** | [**boolean**] |  | (optional) defaults to undefined|
| **overdueAt** | [**string**] |  | (optional) defaults to undefined|
| **availableAt** | [**string**] |  | (optional) defaults to undefined|
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

# **recordDelivery**
> ServeRecordDTO recordDelivery(deliveryRecordDTO)


### Example

```typescript
import {
    OrderControllerApi,
    Configuration,
    DeliveryRecordDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderControllerApi(configuration);

let id: string; // (default to undefined)
let deliveryRecordDTO: DeliveryRecordDTO; //

const { status, data } = await apiInstance.recordDelivery(
    id,
    deliveryRecordDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **deliveryRecordDTO** | **DeliveryRecordDTO**|  | |
| **id** | [**string**] |  | defaults to undefined|


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

# **update1**
> OrderDTO update1(orderDTO)


### Example

```typescript
import {
    OrderControllerApi,
    Configuration,
    OrderDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderControllerApi(configuration);

let id: string; // (default to undefined)
let orderDTO: OrderDTO; //

const { status, data } = await apiInstance.update1(
    id,
    orderDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **orderDTO** | **OrderDTO**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**OrderDTO**

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

