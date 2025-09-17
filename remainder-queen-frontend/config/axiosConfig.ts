// src/utils/axiosConfig.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { router } from "expo-router";
import * as secureStore from "expo-secure-store";

// Prefer EXPO public env for easy configuration in CI/Render
const publicApi = process.env.EXPO_PUBLIC_API_URL;
// let url = publicApi || "http://192.168.1.7:5000"; // Default to LAN dev
// if (!publicApi && process.env.NODE_ENV === "production") {
//   url = "https://remainder-queen-backend.onrender.com";
// }
  let url = "https://testapp-4x8g.onrender.com/";


const apiClient: AxiosInstance = axios.create({
  baseURL: `${url}/api/v1`,
  // timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

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
