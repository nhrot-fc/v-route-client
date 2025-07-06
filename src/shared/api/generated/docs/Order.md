# Order


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**arriveTime** | **string** |  | [optional] [default to undefined]
**dueTime** | **string** |  | [optional] [default to undefined]
**glpRequestM3** | **number** |  | [optional] [default to undefined]
**position** | [**Position**](Position.md) |  | [optional] [default to undefined]
**remainingGlpM3** | **number** |  | [optional] [default to undefined]
**serveRecords** | [**Array&lt;ServeRecord&gt;**](ServeRecord.md) |  | [optional] [default to undefined]
**delivered** | **boolean** |  | [optional] [default to undefined]

## Example

```typescript
import { Order } from './api';

const instance: Order = {
    id,
    arriveTime,
    dueTime,
    glpRequestM3,
    position,
    remainingGlpM3,
    serveRecords,
    delivered,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
