# VehicleControllerApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**_delete**](#_delete) | **DELETE** /api/vehicles/{id} | |
|[**create**](#create) | **POST** /api/vehicles | |
|[**getById**](#getbyid) | **GET** /api/vehicles/{id} | |
|[**list**](#list) | **GET** /api/vehicles | |
|[**moveVehicle**](#movevehicle) | **POST** /api/vehicles/{id}/move | |
|[**refillGlp**](#refillglp) | **POST** /api/vehicles/{id}/refill | |
|[**refuel**](#refuel) | **POST** /api/vehicles/{id}/refuel | |
|[**serveOrder**](#serveorder) | **POST** /api/vehicles/{id}/serve | |
|[**update**](#update) | **PUT** /api/vehicles/{id} | |

# **_delete**
> _delete()


### Example

```typescript
import {
    VehicleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VehicleControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance._delete(
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

# **create**
> VehicleDTO create(vehicleDTO)


### Example

```typescript
import {
    VehicleControllerApi,
    Configuration,
    VehicleDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new VehicleControllerApi(configuration);

let vehicleDTO: VehicleDTO; //

const { status, data } = await apiInstance.create(
    vehicleDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **vehicleDTO** | **VehicleDTO**|  | |


### Return type

**VehicleDTO**

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

# **getById**
> VehicleDTO getById()


### Example

```typescript
import {
    VehicleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VehicleControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.getById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**VehicleDTO**

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

# **list**
> Array<VehicleDTO> list()


### Example

```typescript
import {
    VehicleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VehicleControllerApi(configuration);

let type: 'TA' | 'TB' | 'TC' | 'TD'; // (optional) (default to undefined)
let status: 'AVAILABLE' | 'DRIVING' | 'MAINTENANCE' | 'REFUELING' | 'RELOADING' | 'SERVING' | 'INCIDENT' | 'IDLE'; // (optional) (default to undefined)
let minGlp: number; // (optional) (default to undefined)
let minFuel: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.list(
    type,
    status,
    minGlp,
    minFuel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **type** | [**&#39;TA&#39; | &#39;TB&#39; | &#39;TC&#39; | &#39;TD&#39;**]**Array<&#39;TA&#39; &#124; &#39;TB&#39; &#124; &#39;TC&#39; &#124; &#39;TD&#39;>** |  | (optional) defaults to undefined|
| **status** | [**&#39;AVAILABLE&#39; | &#39;DRIVING&#39; | &#39;MAINTENANCE&#39; | &#39;REFUELING&#39; | &#39;RELOADING&#39; | &#39;SERVING&#39; | &#39;INCIDENT&#39; | &#39;IDLE&#39;**]**Array<&#39;AVAILABLE&#39; &#124; &#39;DRIVING&#39; &#124; &#39;MAINTENANCE&#39; &#124; &#39;REFUELING&#39; &#124; &#39;RELOADING&#39; &#124; &#39;SERVING&#39; &#124; &#39;INCIDENT&#39; &#124; &#39;IDLE&#39;>** |  | (optional) defaults to undefined|
| **minGlp** | [**number**] |  | (optional) defaults to undefined|
| **minFuel** | [**number**] |  | (optional) defaults to undefined|


### Return type

**Array<VehicleDTO>**

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

# **moveVehicle**
> VehicleDTO moveVehicle()


### Example

```typescript
import {
    VehicleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VehicleControllerApi(configuration);

let id: string; // (default to undefined)
let distanceKm: number; // (default to undefined)

const { status, data } = await apiInstance.moveVehicle(
    id,
    distanceKm
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **distanceKm** | [**number**] |  | defaults to undefined|


### Return type

**VehicleDTO**

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

# **refillGlp**
> VehicleDTO refillGlp()


### Example

```typescript
import {
    VehicleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VehicleControllerApi(configuration);

let id: string; // (default to undefined)
let volumeM3: number; // (default to undefined)

const { status, data } = await apiInstance.refillGlp(
    id,
    volumeM3
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **volumeM3** | [**number**] |  | defaults to undefined|


### Return type

**VehicleDTO**

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

# **refuel**
> VehicleDTO refuel()


### Example

```typescript
import {
    VehicleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VehicleControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.refuel(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**VehicleDTO**

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

# **serveOrder**
> ServeRecordDTO serveOrder(deliveryRecordDTO)


### Example

```typescript
import {
    VehicleControllerApi,
    Configuration,
    DeliveryRecordDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new VehicleControllerApi(configuration);

let id: string; // (default to undefined)
let orderId: string; // (default to undefined)
let deliveryRecordDTO: DeliveryRecordDTO; //

const { status, data } = await apiInstance.serveOrder(
    id,
    orderId,
    deliveryRecordDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **deliveryRecordDTO** | **DeliveryRecordDTO**|  | |
| **id** | [**string**] |  | defaults to undefined|
| **orderId** | [**string**] |  | defaults to undefined|


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

# **update**
> VehicleDTO update(vehicleDTO)


### Example

```typescript
import {
    VehicleControllerApi,
    Configuration,
    VehicleDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new VehicleControllerApi(configuration);

let id: string; // (default to undefined)
let vehicleDTO: VehicleDTO; //

const { status, data } = await apiInstance.update(
    id,
    vehicleDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **vehicleDTO** | **VehicleDTO**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**VehicleDTO**

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

