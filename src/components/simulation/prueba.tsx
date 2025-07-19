import { useWebSocket } from "@/lib/websocket-context";
import { useState, useEffect } from "react";

interface SimulationMapProps {
    simulationId: string;
}

export function Prueba({ simulationId }: SimulationMapProps) {
    const { simulationState } = useWebSocket();
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

    // Set the first vehicle as selected when simulation state changes
    useEffect(() => {
        if (simulationState?.vehicles?.length && !selectedVehicleId) {
            setSelectedVehicleId(simulationState.vehicles[0].id || "");
        }
    }, [simulationState, selectedVehicleId]);

    // Get the currently selected vehicle
    const selectedVehicle = simulationState?.vehicles?.find(
        (vehicle) => vehicle.id === selectedVehicleId
    );

    // Get the current plan for selected vehicle
    const currentPlan = simulationState?.currentVehiclePlans?.find(
        (plan) => plan.vehicleId === selectedVehicleId
    );

    // Get the current action for the selected vehicle
    const currentAction = currentPlan?.actions?.[currentPlan.currentActionIndex || 0];

    return (
        <div className="p-4 bg-slate-50 rounded-lg shadow">
            <p className="text-sm text-gray-500 mb-2">
                Simulation ID: {simulationId || "N/A"}
            </p>
            <h2 className="text-lg font-bold mb-4">Vehicle Debug View</h2>

            {/* Vehicle selector */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Vehicle:
                </label>
                <select
                    value={selectedVehicleId || ''}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                    {simulationState?.vehicles?.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.id} - {vehicle.type} - {vehicle.status}
                        </option>
                    ))}
                </select>
            </div>

            {/* Vehicle position and status */}
            {selectedVehicle && (
                <div className="mb-4 p-3 bg-white rounded border border-gray-200">
                    <h3 className="font-bold text-sm mb-2">Current Position & Status</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <span className="font-medium">Position: </span>
                            <span>
                                [{selectedVehicle.currentPosition?.x?.toFixed(2)},
                                {selectedVehicle.currentPosition?.y?.toFixed(2)}]
                            </span>
                        </div>
                        <div>
                            <span className="font-medium">Status: {selectedVehicle.status}</span>
                        </div>
                        <div>
                            <span className="font-medium">GLP: </span>
                            <span>{selectedVehicle.currentGlpM3?.toFixed(2)}/{selectedVehicle.glpCapacityM3?.toFixed(2)} m³</span>
                        </div>
                        <div>
                            <span className="font-medium">Fuel: </span>
                            <span>{selectedVehicle.currentFuelGal?.toFixed(2)}/{selectedVehicle.fuelCapacityGal?.toFixed(2)} gal</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Current Action */}
            {currentAction && (
                <div className="mb-4 p-3 bg-white rounded border border-blue-200">
                    <h3 className="font-bold text-sm mb-2">Current Action</h3>
                    <div className="text-xs space-y-1">
                        <div><span className="font-medium">Type: </span>{currentAction.type}</div>
                        <div><span className="font-medium">Progress: </span>{(currentAction.progress || 0) * 100}%</div>
                        {currentAction.orderId && <div><span className="font-medium">Order ID: </span>{currentAction.orderId}</div>}
                        {currentAction.depotId && <div><span className="font-medium">Depot ID: </span>{currentAction.depotId}</div>}
                        {currentAction.path && (
                            <div className="mt-2">
                                <span className="font-medium block mb-1">Path: </span>
                                <div className="max-h-24 overflow-y-auto text-xs">
                                    {currentAction.path.map((pos, idx) => (
                                        <div key={idx} className="py-0.5">
                                            Point {idx + 1}: [{pos.x?.toFixed(2)}, {pos.y?.toFixed(2)}]
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* All Actions in Plan */}
            {currentPlan?.actions && currentPlan.actions.length > 0 && (
                <div className="p-3 bg-white rounded border border-gray-200">
                    <h3 className="font-bold text-sm mb-2">Plan Actions ({currentPlan.actions.length})</h3>
                    <div className="max-h-60 overflow-y-auto">
                        {currentPlan.actions.map((action, idx) => (
                            <div
                                key={idx}
                                className={`text-xs p-2 mb-2 rounded ${idx === currentPlan.currentActionIndex
                                    ? 'bg-blue-100 border border-blue-300'
                                    : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                                    }`}
                            >
                                {/* Action header with type and progress */}
                                <div className="flex justify-between font-medium border-b border-gray-200 pb-1 mb-1">
                                    <span>{idx + 1}. {action.type}</span>
                                    {action.progress !== undefined && (
                                        <span className="text-blue-600">{(action.progress * 100).toFixed(0)}%</span>
                                    )}
                                </div>

                                {/* Action details in grid layout */}
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 text-gray-600">
                                    {action.startTime && (
                                        <div className="col-span-2">
                                            <span className="font-medium text-gray-700">Start: </span>
                                            {action.startTime}
                                        </div>
                                    )}
                                    {action.endTime && (
                                        <div className="col-span-2">
                                            <span className="font-medium text-gray-700">End: </span>
                                            {action.endTime}
                                        </div>
                                    )}
                                    {action.orderId && (
                                        <div>
                                            <span className="font-medium text-gray-700">Order: </span>
                                            {action.orderId}
                                        </div>
                                    )}
                                    {action.depotId && (
                                        <div>
                                            <span className="font-medium text-gray-700">Depot: </span>
                                            {action.depotId}
                                        </div>
                                    )}
                                    {action.glpDelivered !== undefined && action.glpDelivered > 0 && (
                                        <div>
                                            <span className="font-medium text-gray-700">GLP Entregado: </span>
                                            {action.glpDelivered.toFixed(2)} m³
                                        </div>
                                    )}
                                    {action.glpLoaded !== undefined && action.glpLoaded > 0 && (
                                        <div>
                                            <span className="font-medium text-gray-700">GLP Cargado: </span>
                                            {action.glpLoaded.toFixed(2)} m³
                                        </div>
                                    )}
                                    {action.fuelConsumedGal !== undefined && action.fuelConsumedGal > 0 && (
                                        <div>
                                            <span className="font-medium text-gray-700">Combustible: </span>
                                            {action.fuelConsumedGal.toFixed(2)} gal
                                        </div>
                                    )}
                                    {action.fuelRefueledGal !== undefined && action.fuelRefueledGal > 0 && (
                                        <div>
                                            <span className="font-medium text-gray-700">Recarga: </span>
                                            {action.fuelRefueledGal.toFixed(2)} gal
                                        </div>
                                    )}
                                </div>

                                {/* Path visualization if exists */}
                                {action.path && action.path.length > 0 && (
                                    <div className="mt-2 pt-1 border-t border-gray-200">
                                        <details className="text-xs">
                                            <summary className="font-medium text-gray-700 cursor-pointer">
                                                Path ({action.path.length} points)
                                            </summary>
                                            <div className="mt-1 pl-2 max-h-20 overflow-y-auto">
                                                {action.path.map((pos, pidx) => (
                                                    <div key={pidx} className="py-0.5">
                                                        {pidx + 1}: [{pos.x?.toFixed(2)}, {pos.y?.toFixed(2)}]
                                                    </div>
                                                ))}
                                            </div>
                                        </details>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!selectedVehicle && <div className="text-sm text-gray-500">No vehicle selected or available in simulation</div>}
        </div>
    );
}