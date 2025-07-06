# Simulation Map Component Cleanup

This document identifies variables and functions that are used or unused in the `simulation-map.tsx` component.

## Used Variables and State

| Variable/State | Used In | Purpose |
|---------------|---------|---------|
| `canvasRef` | Canvas rendering | Reference to the canvas element |
| `containerRef` | Fullscreen toggle | Reference to the container element |
| `selectedElement` | Breakdown/repair functions | Tracks the currently selected map element |
| `environmentData` | Data rendering | Stores the current environment state |
| `mapElements` | Rendering | List of elements to render on the map |
| `blockedRoads` | Rendering | List of blocked roads |
| `simulationTime` | UI display | Current simulation time |
| `isLoading` | UI state | Loading indicator |
| `dataError` | Error handling | Display error messages |
| `simulationRunning` | Simulation control | Track if simulation is running |
| `breakdownDialogOpen` | UI state | Controls dialog visibility |
| `breakdownReason` | Form state | Reason for vehicle breakdown |
| `repairHours` | Form state | Hours needed for repair |
| `isBreakdownLoading` | UI state | Loading state for breakdown action |
| `isRepairLoading` | UI state | Loading state for repair action |
| `breakdownError` | Error handling | Error message for breakdown action |
| `repairError` | Error handling | Error message for repair action |
| `operationSuccess` | UI feedback | Success message after operation |
| `isFullscreen` | UI state | Tracks fullscreen state |
| `slideVehicles` | Slide panel | Vehicle data for slide panel |

## Potentially Unused Variables

| Variable/State | Reason for Potential Removal |
|---------------|--------------------------|
| `zoom` | May not be used if zoom functionality is not implemented |
| `pan` | May not be used if pan functionality is not implemented |
| `hoveredElement` | May not be used if hover effects are not implemented |
| `isDragging` | May not be used if drag functionality is not implemented |
| `dragStart` | May not be used if drag functionality is not implemented |
| `canvasSize` | May be redundant if canvas size is determined by container |
| `routes` | May not be used if routes are not rendered |
| `slideMinimized` | May not be used if slide minimization is not implemented |

## Functions to Review

| Function | Status | Notes |
|---------|--------|-------|
| `toggleSimulation` | Used | Controls simulation state |
| `handleToggleFullscreen` | Used | Toggles fullscreen mode |
| `fetchEnvironmentData` | Used | Fetches data from API |
| `transformDataToMapElements` | Used | Transforms API data to map elements |
| `transformDataToSlideElements` | Used | Transforms API data to slide elements |
| `determineDirection` | Used | Determines vehicle direction |
| `handleBreakdownVehicle` | Used | Handles vehicle breakdown |
| `submitBreakdownVehicle` | Used | Submits vehicle breakdown |
| `handleRepairVehicle` | Used | Handles vehicle repair |

## Recommended Actions

1. Review the potentially unused variables and remove them if they're not used in the component
2. Ensure all functions have proper error handling
3. Consider refactoring the component into smaller components for better maintainability
4. Add proper TypeScript types for all function parameters and return values
5. Fix the remaining linter errors related to null/undefined checking 