# PLG System - Sequence Diagrams

## Overview
The PLG (Propane Liquefied Gas) Distribution System is a comprehensive logistics management platform that handles order management, route optimization, vehicle tracking, maintenance scheduling, and real-time simulation.

## Main System Components

### Frontend Components
- **Dashboard**: Main overview with metrics and charts
- **Orders Management**: Order creation, upload, and tracking
- **Simulation**: Real-time route visualization and scenario planning
- **Maintenance**: Vehicle maintenance scheduling and tracking
- **Blockages**: Road blockage management

### Backend APIs
- **Orders API**: CRUD operations for orders
- **Vehicles API**: Vehicle management and tracking
- **Maintenance API**: Maintenance scheduling and records
- **Dashboard API**: System metrics and overview data
- **Depots API**: Warehouse and depot management

## Core Sequence Diagrams

### 1. Order Creation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant OF as OrderForm
    participant API as Backend API
    participant DB as Database
    participant OT as OrdersTable

    U->>OF: Fill order details (coordinates, volume, date)
    OF->>OF: Validate input (coordinates 0-70, 0-50)
    OF->>API: POST /api/orders
    API->>DB: INSERT order
    DB-->>API: Return created order with ID
    API-->>OF: Return success response
    OF->>OF: Reset form fields
    OF->>OT: Trigger refresh (onOrderAdded callback)
    OT->>API: GET /api/orders (with filter)
    API->>DB: SELECT orders
    DB-->>API: Return order list
    API-->>OT: Updated order list
    OT->>U: Display updated table