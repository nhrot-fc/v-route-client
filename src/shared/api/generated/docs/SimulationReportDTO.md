# SimulationReportDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**simulationId** | **string** |  | [optional] [default to undefined]
**simulationType** | **string** |  | [optional] [default to undefined]
**simulationName** | **string** |  | [optional] [default to undefined]
**startDateTime** | **string** |  | [optional] [default to undefined]
**endDateTime** | **string** |  | [optional] [default to undefined]
**totalDuration** | [**SimulationReportDTOTotalDuration**](SimulationReportDTOTotalDuration.md) |  | [optional] [default to undefined]
**realExecutionTimeMillis** | **number** |  | [optional] [default to undefined]
**totalOrders** | **number** |  | [optional] [default to undefined]
**deliveredOrders** | **number** |  | [optional] [default to undefined]
**pendingOrders** | **number** |  | [optional] [default to undefined]
**lateDeliveries** | **number** |  | [optional] [default to undefined]
**onTimeDeliveryRate** | **number** |  | [optional] [default to undefined]
**totalDistanceTraveled** | **number** |  | [optional] [default to undefined]
**totalFuelConsumed** | **number** |  | [optional] [default to undefined]
**averageFuelEfficiency** | **number** |  | [optional] [default to undefined]
**totalVehicleBreakdowns** | **number** |  | [optional] [default to undefined]
**totalMaintenanceEvents** | **number** |  | [optional] [default to undefined]
**totalBlockages** | **number** |  | [optional] [default to undefined]
**totalBlockageDuration** | [**SimulationReportDTOTotalDuration**](SimulationReportDTOTotalDuration.md) |  | [optional] [default to undefined]
**totalReplans** | **number** |  | [optional] [default to undefined]
**averagePlanningTimeMillis** | **number** |  | [optional] [default to undefined]
**totalVehicles** | **number** |  | [optional] [default to undefined]
**averageVehicleUtilization** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { SimulationReportDTO } from './api';

const instance: SimulationReportDTO = {
    simulationId,
    simulationType,
    simulationName,
    startDateTime,
    endDateTime,
    totalDuration,
    realExecutionTimeMillis,
    totalOrders,
    deliveredOrders,
    pendingOrders,
    lateDeliveries,
    onTimeDeliveryRate,
    totalDistanceTraveled,
    totalFuelConsumed,
    averageFuelEfficiency,
    totalVehicleBreakdowns,
    totalMaintenanceEvents,
    totalBlockages,
    totalBlockageDuration,
    totalReplans,
    averagePlanningTimeMillis,
    totalVehicles,
    averageVehicleUtilization,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
