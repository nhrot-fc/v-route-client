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
} from "@/generated";
import axios, { AxiosError } from "axios";

// Configure axios with base URL and default settings
const BASE_URL = import.meta.env.VITE_API_BASE_URL as string || "http://localhost:8080";

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
    return Promise.reject(error as Error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if ((error as AxiosError).response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error as Error);
  }
);

// Create API configuration
const configuration = new Configuration({
  basePath: BASE_URL,
});

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

export { axiosInstance };


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
} from "@/generated";

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
  ActionDTO,
  VehiclePlanDTO,
} from "@/generated";

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
  ActionDTOTypeEnum,
  SimulationCreateDTOTypeEnum,
} from "@/generated";
