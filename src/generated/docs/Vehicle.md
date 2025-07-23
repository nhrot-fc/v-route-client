# Vehicle


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**type** | **string** |  | [optional] [default to undefined]
**glpCapacityM3** | **number** |  | [optional] [default to undefined]
**fuelCapacityGal** | **number** |  | [optional] [default to undefined]
**currentPosition** | [**Position**](Position.md) |  | [optional] [default to undefined]
**currentGlpM3** | **number** |  | [optional] [default to undefined]
**currentFuelGal** | **number** |  | [optional] [default to undefined]
**status** | **string** |  | [optional] [default to undefined]
**incidents** | [**Array&lt;Incident&gt;**](Incident.md) |  | [optional] [default to undefined]
**serveRecords** | [**Array&lt;ServeRecord&gt;**](ServeRecord.md) |  | [optional] [default to undefined]
**maintenances** | [**Array&lt;Maintenance&gt;**](Maintenance.md) |  | [optional] [default to undefined]
**currentAction** | [**Action**](Action.md) |  | [optional] [default to undefined]
**performingAction** | **boolean** |  | [optional] [default to undefined]
**currentActionEndTime** | **string** |  | [optional] [default to undefined]
**available** | **boolean** |  | [optional] [default to undefined]

## Example

```typescript
import { Vehicle } from './api';

const instance: Vehicle = {
    id,
    type,
    glpCapacityM3,
    fuelCapacityGal,
    currentPosition,
    currentGlpM3,
    currentFuelGal,
    status,
    incidents,
    serveRecords,
    maintenances,
    currentAction,
    performingAction,
    currentActionEndTime,
    available,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
