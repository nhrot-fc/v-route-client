import {
  Configuration,
  BlockageControllerApi,
  DashboardApi,
  DepotControllerApi,
  IncidentControllerApi,
  MaintenanceControllerApi,
  OrderControllerApi,
  VehicleControllerApi,
  SimulationApi,
  ServeRecordControllerApi,
} from "@/src/shared/api/generated";
import axios from "axios";

// Configure axios with base URL and default settings
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

// Create axios instance with common configuration
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for authentication if needed
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Create API configuration
const configuration = new Configuration({
  basePath: BASE_URL,
});

// Custom file uploader functions for multipart/form-data requests
export const uploadFileToSimulation = async (endpoint: string, id: string, year: number, month: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/api/simulation/${id}/${endpoint}?year=${year}&month=${month}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error uploading ${endpoint}:`, error);
    throw error;
  }
};

// Export API instances
export const vehiclesApi = new VehicleControllerApi(
  configuration,
  BASE_URL,
  axiosInstance
);

export const ordersApi = new OrderControllerApi(
  configuration,
  BASE_URL,
  axiosInstance
);
export const maintenanceApi = new MaintenanceControllerApi(
  configuration,
  BASE_URL,
  axiosInstance
);
export const incidentsApi = new IncidentControllerApi(
  configuration,
  BASE_URL,
  axiosInstance
);
export const blockagesApi = new BlockageControllerApi(
  configuration,
  BASE_URL,
  axiosInstance
);
export const depotsApi = new DepotControllerApi(
  configuration,
  BASE_URL,
  axiosInstance
);
export const dashboardApi = new DashboardApi(
  configuration,
  BASE_URL,
  axiosInstance
);
export const simulationApi = new SimulationApi(
  configuration,
  BASE_URL,
  axiosInstance
);
export const serveRecordApi = new ServeRecordControllerApi(
  configuration,
  BASE_URL,
  axiosInstance
);

// Export types for use in components
export type {
  Vehicle,
  Order,
  Blockage,
  Incident,
  Depot,
  Maintenance,
  Position,
  ServeRecord,
  LoadOrdersRequest,
} from "@/src/shared/api/generated";

// Export DTO for use in components
export type {
  DepotDTO,
  OrderDTO,
  VehicleDTO,
  BlockageDTO,
  IncidentDTO,
  SimulationDTO,
  MaintenanceDTO,
  ServeRecordDTO,
  SimulationStateDTO,
  SimulationCreateDTO,
  DeliveryRecordDTO,
  IncidentCreateDTO,
  MaintenanceCreateDTO,
} from "@/src/shared/api/generated";

// Export enums
export {
  VehicleTypeEnum,
  VehicleStatusEnum,
  IncidentTypeEnum,
  IncidentShiftEnum,
  ListStatusEnum,
  ListTypeEnum,
  DepotTypeEnum,
  List3TypeEnum,
  List4TypeEnum,
  List3ShiftEnum,
  DepotDTOTypeEnum,
  VehicleDTOTypeEnum,
  VehicleDTOStatusEnum,
  IncidentDTOTypeEnum,
  IncidentDTOShiftEnum,
  IncidentCreateDTOTypeEnum,
  IncidentCreateDTOShiftEnum,
  SimulationDTOTypeEnum,
  SimulationDTOStatusEnum,
  SimulationStateDTOStatusEnum,
} from "@/src/shared/api/generated";
