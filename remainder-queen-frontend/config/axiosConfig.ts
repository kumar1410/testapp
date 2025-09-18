// src/utils/axiosConfig.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { router } from "expo-router";
import * as secureStore from "expo-secure-store";

// Base URL for the backend API
const API_URL = "https://testapp-4x8g.onrender.com";

const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Error handling interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Request interceptor
apiClient.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> => {
    const token = await secureStore.getItemAsync("jwtToken");
    if (token && config.headers) {
      (
        config.headers as Record<string, string>
      ).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError) => {
    if (error.response) {
      if (error.response.status === 401) {
        console.error("Unauthorized, redirecting to login...");
        await secureStore.deleteItemAsync("jwtToken");
        router.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
