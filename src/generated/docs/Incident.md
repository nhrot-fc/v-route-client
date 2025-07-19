# Incident


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**vehicle** | [**Vehicle**](Vehicle.md) |  | [optional] [default to undefined]
**type** | **string** |  | [optional] [default to undefined]
**shift** | **string** |  | [optional] [default to undefined]
**occurrenceTime** | **string** |  | [optional] [default to undefined]
**resolved** | **boolean** |  | [optional] [default to undefined]
**immobilizationEndTime** | **string** |  | [optional] [default to undefined]
**availabilityTime** | **string** |  | [optional] [default to undefined]
**returnToDepotRequired** | **boolean** |  | [optional] [default to undefined]

## Example

```typescript
import { Incident } from './api';

const instance: Incident = {
    id,
    vehicle,
    type,
    shift,
    occurrenceTime,
    resolved,
    immobilizationEndTime,
    availabilityTime,
    returnToDepotRequired,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
