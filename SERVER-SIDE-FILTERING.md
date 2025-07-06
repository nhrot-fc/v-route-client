# Server-Side Filtering Implementation

This document explains how server-side filtering has been implemented in the V-Route Client application.

## Overview

Server-side filtering allows the application to send filter parameters to the backend API, reducing the amount of data transferred and improving performance. Instead of fetching all data and filtering it on the client side, we now send filter parameters to the API and only receive the filtered data.

## Implementation Details

### 1. Data Hooks

We've updated the data hooks (`useVehicles`, `useOrders`, etc.) to support server-side filtering:

- Added filter parameter interfaces
- Modified the hooks to accept filter parameters
- Updated the API calls to include these filter parameters
- Added a `refetch` function to allow manual refreshing of data

Example from `useVehicles.ts`:

```typescript
// Define filter parameters
interface VehicleFilterParams {
  status?: VehicleStatusEnum;
  type?: string;
  minGlp?: number;
  minFuel?: number;
}

export function useVehicles(
  filterTab?: string, 
  paginationParams?: PaginationParams,
  filterParams?: VehicleFilterParams
) {
  // ...

  // Extract filter values
  const status = filterParams?.status || (filterTab ? mapFilterTabToStatus(filterTab) : undefined);
  const type = filterParams?.type;
  const minGlp = filterParams?.minGlp;
  const minFuel = filterParams?.minFuel;

  // ...

  // Call API with parameters
  const response = await vehiclesApi.list(
    params.status as any,
    params.type as any,
    params.minGlp,
    params.minFuel,
    params.paginated,
    params.page,
    params.size,
    params.sortBy,
    params.direction
  );

  // ...
}
```

### 2. Filter Controls Component

We've created a reusable `TableFilterControls` component that provides a consistent UI for filters:

```typescript
interface TableFilterControlsProps {
  filters: {
    id: string;
    label: string;
    type: "text" | "number" | "select";
    options?: { value: string; label: string }[];
    value: string | number | undefined;
    onChange: (value: any) => void;
  }[];
  onReset: () => void;
}
```

This component supports different types of filters:
- Text filters
- Number filters
- Select filters with options

### 3. Page Integration

We've updated the pages to use the filter controls and pass filter parameters to the hooks:

```typescript
// Add filter state
const [filterType, setFilterType] = useState<string | undefined>(undefined);
const [minGlp, setMinGlp] = useState<number | undefined>(undefined);
const [minFuel, setMinFuel] = useState<number | undefined>(undefined);

// Use pagination parameters in the hook
const { vehicles, loading, error, updateVehicleStatus, deleteVehicle, totalItems, totalPages, refetch } = useVehicles(
  activeTab !== "todos" ? activeTab : undefined, 
  {
    page: currentPage - 1,
    size: pageSize,
    sortBy,
    direction: sortDirection
  },
  {
    type: filterType,
    minGlp,
    minFuel
  }
);
```

And added the filter controls to the UI:

```tsx
<TableFilterControls
  filters={[
    {
      id: "type",
      label: "Tipo",
      type: "select",
      options: [
        { value: "TA", label: "Tipo TA" },
        { value: "TB", label: "Tipo TB" },
        // ...
      ],
      value: filterType,
      onChange: (value) => {
        setFilterType(value);
        setCurrentPage(1); // Reset to first page when changing filter
        refetch();
      },
    },
    // ...
  ]}
  onReset={handleResetFilters}
/>
```

### 4. Filter Tabs Integration

We've updated the filter tabs to trigger server-side filtering:

```typescript
const handleTabChange = (value: string) => {
  setActiveTab(value);
  // Reset to first page when changing tabs
  setCurrentPage(1);
  
  // Update the pending filter based on the tab
  if (value === "pendiente") {
    setIsPending(true);
  } else if (value === "entregado") {
    setIsPending(false);
  } else {
    setIsPending(undefined);
  }
};
```

## Benefits

1. **Reduced Network Traffic**: Only the necessary data is transferred over the network
2. **Improved Performance**: The server can optimize database queries for filtering
3. **Better User Experience**: Faster response times, especially with large datasets
4. **Reduced Client-Side Processing**: Less work for the browser to do

## Future Improvements

1. **Debouncing**: Add debouncing to filter inputs to prevent excessive API calls
2. **Filter Persistence**: Save filter state in URL or local storage
3. **Advanced Filters**: Support more complex filtering operations (date ranges, multi-select, etc.)
4. **Filter Presets**: Allow users to save and reuse filter combinations 