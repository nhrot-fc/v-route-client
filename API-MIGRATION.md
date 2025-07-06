# API Migration Documentation

## Overview

This document describes the migration from the separate API client files to a centralized approach using the OpenAPI-generated client.

## Changes Made

1. **Centralized API Client**
   - Created `lib/api-client.ts` that exports all API instances and types
   - Configured axios with interceptors for authentication and error handling
   - Added custom methods for file uploads and other operations not covered by the generated client

2. **Domain-Specific Hooks**
   - Created `hooks/use-simulation.ts` to replace `lib/simulation-api.ts`
   - Implemented proper error handling and loading states
   - Added type extensions for missing properties in the generated types

3. **Component Updates**
   - Updated `components/simulation/simulation-controller.tsx` to use the new hook
   - Updated `components/simulation/simulation-config.tsx` to use the new hook
   - Updated `components/simulation/simulation-map.tsx` to use the new hook
   - Updated `app/simulacion/page.tsx` to use the new hook
   - Created `components/simulation/simulation-map-types.ts` for type definitions

4. **Type Improvements**
   - Extended `SimulationStateDTO` to include missing properties like `elapsedTime`
   - Added proper type assertions for API responses
   - Fixed null/undefined checking in component code
   - Fixed component return types to ensure proper JSX rendering

5. **Bug Fixes**
   - Fixed the `SimulationMap` component to properly return JSX
   - Fixed the parentheses in the blockage position calculation to properly handle undefined values
   - Fixed the `createSimulation` and `createSimulationWithFiles` functions to properly handle response data
   - Removed unused variables and imports

## Benefits of the New Approach

1. **Centralized Configuration**
   - Single point for API configuration
   - Consistent error handling and authentication
   - Easier to maintain and update

2. **Type Safety**
   - Using generated types from OpenAPI spec
   - Extended types for frontend-specific needs
   - Better IDE support and compile-time checking

3. **Separation of Concerns**
   - API client handles communication
   - Hooks handle state management and business logic
   - Components handle UI rendering

4. **Better Error Handling**
   - Consistent error handling across the application
   - Loading states for better user experience
   - Proper error messages with toast notifications

## Future Improvements

1. **Additional Domain-Specific Hooks**
   - Create hooks for vehicles, orders, maintenance, and blockages
   - Implement proper caching and state management

2. **Testing**
   - Add unit tests for hooks
   - Add integration tests for components

3. **Documentation**
   - Add JSDoc comments to all hooks and functions
   - Create usage examples

4. **Performance Optimization**
   - Implement request batching
   - Add request caching
   - Optimize re-renders in components

## Migration Guide for Developers

1. **Using the API Client**
   ```typescript
   import { vehiclesApi, VehicleDTO } from '@/lib/api-client';
   
   // Example usage
   const response = await vehiclesApi.list();
   const vehicles = response.data;
   ```

2. **Using Domain-Specific Hooks**
   ```typescript
   import { useSimulation } from '@/hooks/use-simulation';
   
   function MyComponent() {
     const simulation = useSimulation();
     
     const handleStartSimulation = async () => {
       await simulation.startSimulation();
     };
     
     // ...
   }
   ```

3. **Extending Types**
   ```typescript
   import { SimulationStateDTO as BaseSimulationStateDTO } from '@/lib/api-client';
   
   export interface SimulationStateDTO extends BaseSimulationStateDTO {
     elapsedTime?: string | number;
     // Add any other missing properties here
   }
   ``` 