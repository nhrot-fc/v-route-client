# OrderDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**arrivalTime** | **string** |  | [optional] [default to undefined]
**deadlineTime** | **string** |  | [optional] [default to undefined]
**glpRequestM3** | **number** |  | [optional] [default to undefined]
**remainingGlpM3** | **number** |  | [optional] [default to undefined]
**position** | [**Position**](Position.md) |  | [optional] [default to undefined]
**delivered** | **boolean** |  | [optional] [default to undefined]

## Example

```typescript
import { OrderDTO } from './api';

const instance: OrderDTO = {
    id,
    arrivalTime,
    deadlineTime,
    glpRequestM3,
    remainingGlpM3,
    position,
    delivered,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
