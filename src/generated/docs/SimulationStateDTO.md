# SimulationStateDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**simulationId** | **string** |  | [optional] [default to undefined]
**currentTime** | **string** |  | [optional] [default to undefined]
**status** | **string** |  | [optional] [default to undefined]
**vehicles** | [**Array&lt;VehicleDTO&gt;**](VehicleDTO.md) |  | [optional] [default to undefined]
**mainDepot** | [**DepotDTO**](DepotDTO.md) |  | [optional] [default to undefined]
**auxDepots** | [**Array&lt;DepotDTO&gt;**](DepotDTO.md) |  | [optional] [default to undefined]
**pendingOrders** | [**Array&lt;OrderDTO&gt;**](OrderDTO.md) |  | [optional] [default to undefined]
**activeBlockages** | [**Array&lt;Blockage&gt;**](Blockage.md) |  | [optional] [default to undefined]
**activeIncidents** | [**Array&lt;IncidentDTO&gt;**](IncidentDTO.md) |  | [optional] [default to undefined]
**scheduledMaintenances** | [**Array&lt;MaintenanceDTO&gt;**](MaintenanceDTO.md) |  | [optional] [default to undefined]
**pendingOrdersCount** | **number** |  | [optional] [default to undefined]
**deliveredOrdersCount** | **number** |  | [optional] [default to undefined]
**overdueOrdersCount** | **number** |  | [optional] [default to undefined]
**availableVehiclesCount** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { SimulationStateDTO } from './api';

const instance: SimulationStateDTO = {
    simulationId,
    currentTime,
    status,
    vehicles,
    mainDepot,
    auxDepots,
    pendingOrders,
    activeBlockages,
    activeIncidents,
    scheduledMaintenances,
    pendingOrdersCount,
    deliveredOrdersCount,
    overdueOrdersCount,
    availableVehiclesCount,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
