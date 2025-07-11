# ActionDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type** | **string** |  | [optional] [default to undefined]
**startTime** | **string** |  | [optional] [default to undefined]
**endTime** | **string** |  | [optional] [default to undefined]
**path** | [**Array&lt;Position&gt;**](Position.md) |  | [optional] [default to undefined]
**glpDelivered** | **number** |  | [optional] [default to undefined]
**glpLoaded** | **number** |  | [optional] [default to undefined]
**fuelConsumedGal** | **number** |  | [optional] [default to undefined]
**fuelRefueledGal** | **number** |  | [optional] [default to undefined]
**orderId** | **string** |  | [optional] [default to undefined]
**depotId** | **string** |  | [optional] [default to undefined]
**progress** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { ActionDTO } from './api';

const instance: ActionDTO = {
    type,
    startTime,
    endTime,
    path,
    glpDelivered,
    glpLoaded,
    fuelConsumedGal,
    fuelRefueledGal,
    orderId,
    depotId,
    progress,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
