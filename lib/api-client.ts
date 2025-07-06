import {
  Configuration,
  BlockageControllerApi,
  DashboardApi,
  DepotControllerApi,
  IncidentControllerApi,
  MaintenanceControllerApi,
  OrderControllerApi,
  VehicleControllerApi,
} from "@/src/shared/api/generated";
import axios from "axios";

// Configure axios with base URL and default settings
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

// Create axios instance with common configuration
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
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

// Extend OrderControllerApi to add importCsv method
class ExtendedOrderControllerApi extends OrderControllerApi {
  public async importCsv(formData: FormData) {
    return axiosInstance.post(`${BASE_URL}/orders/import-csv`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

// Export API instances
export const vehiclesApi = new VehicleControllerApi(
  configuration,
  BASE_URL,
  axiosInstance
);
export const ordersApi = new ExtendedOrderControllerApi(configuration, BASE_URL, axiosInstance);
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
export const depotsApi = new DepotControllerApi(configuration, BASE_URL, axiosInstance);
export const dashboardApi = new DashboardApi(
  configuration,
  BASE_URL,
  axiosInstance
);

// Export types for use in components
export type {
  Vehicle,
  Order,
  MaintenanceDTO,
  IncidentDTO,
  Blockage,
  Depot,
  Position,
  OrderDTO,
  DeliveryRecordDTO,
  VehicleDTO,
} from "@/src/shared/api/generated";

// Export enums
export {
  VehicleTypeEnum,
  VehicleStatusEnum,
  IncidentDTOTypeEnum,
  ListStatusEnum,
  ListTypeEnum,
} from "@/src/shared/api/generated";