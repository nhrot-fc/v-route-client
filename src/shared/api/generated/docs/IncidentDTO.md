# IncidentDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [optional] [default to undefined]
**vehicleId** | **string** |  | [optional] [default to undefined]
**type** | **string** |  | [optional] [default to undefined]
**shift** | **string** |  | [optional] [default to undefined]
**occurrenceTime** | **string** |  | [optional] [default to undefined]
**location** | [**Position**](Position.md) |  | [optional] [default to undefined]
**resolved** | **boolean** |  | [optional] [default to undefined]
**transferableGlp** | **number** |  | [optional] [default to undefined]
**availabilityTime** | **string** |  | [optional] [default to undefined]
**requiresReturnToDepot** | **boolean** |  | [optional] [default to undefined]

## Example

```typescript
import { IncidentDTO } from './api';

const instance: IncidentDTO = {
    id,
    vehicleId,
    type,
    shift,
    occurrenceTime,
    location,
    resolved,
    transferableGlp,
    availabilityTime,
    requiresReturnToDepot,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
