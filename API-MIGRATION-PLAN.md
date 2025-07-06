# API Migration Plan

## Completed Tasks

1. ✅ Created `hooks/use-simulation.ts` to replace `lib/simulation-api.ts`
2. ✅ Updated `lib/api-client.ts` to export all necessary types and APIs
3. ✅ Updated `components/simulation/simulation-controller.tsx` to use the new hook
4. ✅ Updated `components/simulation/simulation-config.tsx` to use the new hook
5. ✅ Created `components/simulation/simulation-map-types.ts` for type definitions

## Remaining Tasks

### 1. Fix Linter Errors in `hooks/use-simulation.ts`

- Fix the createSimulation function to properly handle the response data
- Add proper type assertions for API responses

### 2. Clean Up `components/simulation/simulation-map.tsx`

- Remove unused variables as identified in SIMULATION-MAP-CLEANUP.md
- Fix remaining linter errors related to null/undefined checking
- Refactor the component into smaller, more maintainable components

### 3. Create Additional Domain-Specific Hooks

- Create `hooks/use-vehicles.ts`
- Create `hooks/use-orders.ts`
- Create `hooks/use-maintenance.ts`
- Create `hooks/use-blockages.ts`

### 4. Update Other Components to Use the New Hooks

- Update vehicle-related components to use `use-vehicles.ts`
- Update order-related components to use `use-orders.ts`
- Update maintenance-related components to use `use-maintenance.ts`
- Update blockage-related components to use `use-blockages.ts`

### 5. Improve Type Definitions

- Create extended interfaces for all API types that need additional properties
- Add proper TypeScript types for all function parameters and return values
- Ensure all optional properties are properly marked

### 6. Add Testing

- Add unit tests for hooks
- Add integration tests for components using the hooks

### 7. Documentation

- Update API documentation to reflect the new structure
- Add JSDoc comments to all hooks and functions
- Create usage examples for each hook

## Implementation Priority

1. Fix remaining linter errors (High)
2. Clean up simulation-map.tsx (High)
3. Create additional domain-specific hooks (Medium)
4. Update other components (Medium)
5. Improve type definitions (Medium)
6. Add testing (Low)
7. Documentation (Low) 